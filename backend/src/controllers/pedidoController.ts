import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendPedidoEmail } from '../services/emailService';
import { enviarWhatsApp } from '../services/whatsappService';
import { AppError, asyncHandler, parseId } from '../utils/errors';
import {
  exigirTexto,
  formatarTelefone,
  texto,
  validarInteiro,
  validarTelefoneMocambique,
} from '../utils/validators';

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

const STATUS_PEDIDO = [
  'PENDENTE',
  'PREPARANDO',
  'SAIU_ENTREGA',
  'ENTREGUE',
  'CANCELADO',
] as const;

type StatusPedido = (typeof STATUS_PEDIDO)[number];

function validarStatus(value: unknown): StatusPedido {
  const status = texto(value).toUpperCase();
  if (!STATUS_PEDIDO.includes(status as StatusPedido)) {
    throw new AppError(400, 'Estado do pedido inválido', 'STATUS_INVALIDO');
  }
  return status as StatusPedido;
}

interface ItemEntrada {
  produtoId: number;
  quantidade: number;
}

function normalizarItens(value: unknown): ItemEntrada[] {
  if (!Array.isArray(value) || value.length === 0 || value.length > 50) {
    throw new AppError(400, 'O pedido deve conter entre 1 e 50 artigos', 'ITENS_INVALIDOS');
  }

  const agregados = new Map<number, number>();

  for (const item of value) {
    const produtoId = Number((item as { produtoId?: unknown })?.produtoId);
    const quantidade = Number((item as { quantidade?: unknown })?.quantidade);

    if (!Number.isInteger(produtoId) || produtoId <= 0) {
      throw new AppError(400, 'Produto inválido no pedido', 'ITENS_INVALIDOS');
    }
    if (!Number.isInteger(quantidade) || quantidade <= 0 || quantidade > 50) {
      throw new AppError(400, 'Quantidade inválida no pedido', 'ITENS_INVALIDOS');
    }

    agregados.set(produtoId, (agregados.get(produtoId) || 0) + quantidade);
  }

  return [...agregados.entries()].map(([produtoId, quantidade]) => ({
    produtoId,
    quantidade,
  }));
}

function mensagemItens(itens: Array<{ quantidade: number; produtoNome: string; precoUnitario: number }>) {
  return itens
    .map(
      (item) =>
        `${item.quantidade}x ${item.produtoNome} – ${(item.quantidade * item.precoUnitario).toFixed(2)} MT`
    )
    .join('\n');
}

async function notificarPedido(pedido: {
  id: number;
  subtotal: number;
  frete: number;
  total: number;
  status: string;
  itens: Array<{ quantidade: number; produtoNome: string; precoUnitario: number }>;
}, dados: {
  clienteNome: string;
  clienteEmail: string;
  telefone: string | null;
  endereco: string;
  bairro: string;
  tempoEntrega?: string;
}) {
  const adminWhats = process.env.NOTIFICATION_WHATSAPP_TO;
  const resumo = mensagemItens(pedido.itens);
  const tarefas: Promise<unknown>[] = [];

  if (adminWhats) {
    const mensagem = [
      `Novo pedido #${pedido.id}`,
      '',
      `Cliente: ${dados.clienteNome}`,
      `Telefone: ${dados.telefone || 'não informado'}`,
      `E-mail: ${dados.clienteEmail}`,
      `Endereço: ${dados.endereco}`,
      `Bairro: ${dados.bairro}`,
      '',
      'Itens:',
      resumo,
      '',
      `Subtotal: ${pedido.subtotal.toFixed(2)} MT`,
      `Frete: ${pedido.frete.toFixed(2)} MT`,
      `Total: ${pedido.total.toFixed(2)} MT`,
      `Estado: ${pedido.status}`,
    ].join('\n');
    tarefas.push(enviarWhatsApp(adminWhats, mensagem));
  }

  if (dados.telefone) {
    const mensagem = [
      `Pedido #${pedido.id} recebido`,
      '',
      `Olá ${dados.clienteNome}, recebemos o seu pedido.`,
      '',
      resumo,
      '',
      `Total: ${pedido.total.toFixed(2)} MT`,
      `Tempo estimado: ${dados.tempoEntrega || 'a confirmar'}`,
      '',
      'Obrigado por escolher o Origens do Sabor.',
    ].join('\n');
    tarefas.push(enviarWhatsApp(dados.telefone, mensagem));
  }

  tarefas.push(
    sendPedidoEmail({
      id: pedido.id,
      clienteNome: dados.clienteNome,
      endereco: dados.endereco,
      bairro: dados.bairro,
      subtotal: pedido.subtotal,
      frete: pedido.frete,
      total: pedido.total,
      status: pedido.status,
      itens: pedido.itens.map((item) => ({
        nome: item.produtoNome,
        quantidade: item.quantidade,
        precoUnitario: item.precoUnitario,
      })),
    })
  );

  await Promise.allSettled(tarefas);
}

export const listarPedidosCliente = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const pedidos = await prisma.pedido.findMany({
    where: { clienteId: userId },
    include: { itens: true },
    orderBy: { dataPedido: 'desc' },
  });
  res.json(pedidos);
});

export const criarPedido = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user;

  const endereco = exigirTexto(req.body?.endereco, 'Endereço', { min: 5, max: 300 });
  const bairro = exigirTexto(req.body?.bairro, 'Bairro', { min: 2, max: 80 });
  const itens = normalizarItens(req.body?.itens);
  const tempoEntrega = texto(req.body?.tempoEntrega).slice(0, 60);

  const telefoneInformado = texto(req.body?.telefone);
  if (telefoneInformado && !validarTelefoneMocambique(telefoneInformado)) {
    throw new AppError(400, 'Telefone inválido', 'TELEFONE_INVALIDO');
  }
  const telefone = telefoneInformado
    ? formatarTelefone(telefoneInformado)
    : user.telefone || null;

  if (!telefone) {
    throw new AppError(
      400,
      'Indique um telefone de contacto para a entrega',
      'TELEFONE_OBRIGATORIO'
    );
  }

  const produtoIds = itens.map((item) => item.produtoId);

  const pedido = await prisma.$transaction(async (tx) => {
    const produtos = await tx.produto.findMany({
      where: { id: { in: produtoIds } },
    });

    if (produtos.length !== produtoIds.length) {
      throw new AppError(
        400,
        'Um ou mais produtos já não estão disponíveis',
        'PRODUTO_INDISPONIVEL'
      );
    }

    const porId = new Map(produtos.map((produto) => [produto.id, produto]));
    const linhas = itens.map((item) => {
      const produto = porId.get(item.produtoId)!;
      if (!produto.disponivel) {
        throw new AppError(
          400,
          `O prato "${produto.nome}" está temporariamente indisponível`,
          'PRODUTO_INDISPONIVEL'
        );
      }
      return {
        produtoId: produto.id,
        produtoNome: produto.nome,
        precoUnitario: produto.preco,
        quantidade: item.quantidade,
        subtotal: round2(produto.preco * item.quantidade),
      };
    });

    const taxaFrete = await tx.taxaFrete.findFirst({
      where: { bairro: { equals: bairro, mode: 'insensitive' } },
    });
    if (!taxaFrete) {
      throw new AppError(
        400,
        `Taxa de entrega não disponível para o bairro ${bairro}`,
        'FRETE_INDISPONIVEL'
      );
    }

    const subtotal = round2(linhas.reduce((acc, linha) => acc + linha.subtotal, 0));
    const frete = taxaFrete.valor;
    const total = round2(subtotal + frete);

    return tx.pedido.create({
      data: {
        clienteId: user.id,
        endereco,
        bairro: taxaFrete.bairro,
        subtotal,
        frete,
        total,
        status: 'PENDENTE',
        itens: { create: linhas },
      },
      include: { itens: true },
    });
  });

  void notificarPedido(pedido, {
    clienteNome: user.nome,
    clienteEmail: user.email,
    telefone,
    endereco,
    bairro: pedido.bairro,
    tempoEntrega,
  }).catch((error) => console.error('Erro ao notificar pedido:', error));

  res.status(201).json(pedido);
});

export const listarPedidosAgente = asyncHandler(async (req: Request, res: Response) => {
  const agenteId = (req as any).user.id;
  const pedidos = await prisma.pedido.findMany({
    where: {
      agenteId,
      status: { notIn: ['ENTREGUE', 'CANCELADO'] },
    },
    orderBy: { dataPedido: 'asc' },
    include: { cliente: { select: { nome: true } }, itens: true },
  });

  res.json(
    pedidos.map((pedido) => ({
      id: pedido.id,
      clienteNome: pedido.cliente.nome,
      endereco: pedido.endereco,
      total: pedido.total,
      status: pedido.status,
      itens: pedido.itens,
      bairro: pedido.bairro,
    }))
  );
});

export const marcarEntregue = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const user = (req as any).user;

  const pedido = await prisma.pedido.findUnique({ where: { id } });
  if (!pedido) throw new AppError(404, 'Pedido não encontrado', 'NAO_ENCONTRADO');
  if (pedido.status === 'ENTREGUE') return res.json({ success: true });
  if (pedido.status === 'CANCELADO') {
    throw new AppError(409, 'O pedido está cancelado', 'ESTADO_INVALIDO');
  }
  if (user.role !== 'ADMIN' && pedido.agenteId !== user.id) {
    throw new AppError(403, 'Este pedido não está atribuído a si', 'NAO_AUTORIZADO');
  }

  await prisma.pedido.update({
    where: { id },
    data: { status: 'ENTREGUE' },
  });

  res.json({ success: true });
});

export const listarTodosPedidos = asyncHandler(async (_req: Request, res: Response) => {
  const pedidos = await prisma.pedido.findMany({
    include: {
      cliente: { select: { nome: true } },
      agente: { select: { id: true, nome: true } },
      itens: true,
    },
    orderBy: { dataPedido: 'desc' },
    take: 500,
  });
  res.json(pedidos);
});

export const atualizarStatusPedido = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const status = validarStatus(req.body?.status);

  const pedido = await prisma.pedido.findUnique({ where: { id } });
  if (!pedido) throw new AppError(404, 'Pedido não encontrado', 'NAO_ENCONTRADO');
  if (['ENTREGUE', 'CANCELADO'].includes(pedido.status) && pedido.status !== status) {
    throw new AppError(
      409,
      'Não é possível alterar um pedido já concluído ou cancelado',
      'ESTADO_INVALIDO'
    );
  }

  const atualizado = await prisma.pedido.update({
    where: { id },
    data: { status },
  });

  res.json(atualizado);
});

export const listarAgentes = asyncHandler(async (_req: Request, res: Response) => {
  const agentes = await prisma.usuario.findMany({
    where: { role: 'AGENTE', ativo: true },
    select: { id: true, nome: true, telefone: true, email: true },
    orderBy: { nome: 'asc' },
  });
  res.json(agentes);
});

export const atribuirAgente = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const agenteId = validarInteiro(req.body?.agenteId, 'Agente', { min: 1 });

  const pedido = await prisma.pedido.findUnique({ where: { id } });
  if (!pedido) throw new AppError(404, 'Pedido não encontrado', 'NAO_ENCONTRADO');
  if (['ENTREGUE', 'CANCELADO'].includes(pedido.status)) {
    throw new AppError(
      409,
      'Não é possível atribuir um agente a um pedido concluído ou cancelado',
      'ESTADO_INVALIDO'
    );
  }

  const agente = await prisma.usuario.findFirst({
    where: { id: agenteId, role: 'AGENTE', ativo: true },
    select: { id: true },
  });
  if (!agente) {
    throw new AppError(400, 'Agente inválido ou inativo', 'AGENTE_INVALIDO');
  }

  const atualizado = await prisma.pedido.update({
    where: { id },
    data: { agenteId },
    include: { cliente: true, itens: true },
  });

  res.json(atualizado);
});
