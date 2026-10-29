// backend/src/controllers/pedidoController.ts
import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { sendPedidoEmail } from '../services/emailService';
import { enviarWhatsApp } from '../services/whatsappService';

const round2 = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

// ==================== Validações ====================
function validarEmail(email: string): boolean {
  const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return re.test(email);
}

function validarTelefoneMocambique(telefone: string): boolean {
  const regexCompleto = /^\+258[8][2-7]\d{7}$/;
  const regexLocal = /^[8][2-7]\d{7}$/;
  return regexCompleto.test(telefone) || regexLocal.test(telefone);
}

function formatarTelefone(telefone: string): string {
  if (telefone.startsWith('+258')) return telefone;
  if (telefone.match(/^[8][2-7]\d{7}$/)) return '+258' + telefone;
  return telefone;
}

// ==================== CLIENTE ====================
export const listarPedidosCliente = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { clienteId: userId },
      include: { itens: true },
      orderBy: { dataPedido: 'desc' },
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
};

// ==================== CRIAR PEDIDO ====================
export const criarPedido = async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { clienteNome, clienteEmail, telefone, endereco, bairro, itens, tempoEntrega } = req.body;

  if (!clienteNome || !clienteEmail || !telefone || !endereco || !bairro || !Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  if (!validarEmail(clienteEmail)) {
    return res.status(400).json({ error: 'E-mail inválido' });
  }
  const telefoneValido = validarTelefoneMocambique(telefone);
  if (!telefoneValido) {
    return res.status(400).json({ error: 'Número de telefone inválido. Use formato +25882XXXXXXX ou 82XXXXXXX' });
  }
  const telefoneFormatado = formatarTelefone(telefone);

  try {
    const produtoIds = [...new Set(itens.map((item: any) => Number(item.produtoId)))];
    if (produtoIds.some((id) => !Number.isInteger(id) || id <= 0)) {
      return res.status(400).json({ error: 'Produto inválido no pedido' });
    }

    const produtos = await prisma.produto.findMany({ where: { id: { in: produtoIds } } });
    if (produtos.length !== produtoIds.length) {
      return res.status(400).json({ error: 'Um ou mais produtos já não estão disponíveis' });
    }

    const produtosPorId = new Map(produtos.map((produto) => [produto.id, produto]));
    const itensCalculados = [];
    for (const item of itens) {
      const quantidade = Number(item.quantidade);
      if (!Number.isInteger(quantidade) || quantidade <= 0) {
        return res.status(400).json({ error: 'Quantidade inválida no pedido' });
      }
      const produto = produtosPorId.get(Number(item.produtoId))!;
      itensCalculados.push({
        produtoId: produto.id,
        produtoNome: produto.nome,
        precoUnitario: produto.preco,
        quantidade,
        subtotal: round2(produto.preco * quantidade),
      });
    }

    const taxaFrete = await prisma.taxaFrete.findUnique({ where: { bairro } });
    if (!taxaFrete) {
      return res.status(400).json({ error: `Taxa de frete não disponível para o bairro ${bairro}` });
    }

    const subtotal = round2(itensCalculados.reduce((acc, item) => acc + item.subtotal, 0));
    const frete = taxaFrete.valor;
    const total = round2(subtotal + frete);

    const pedido = await prisma.pedido.create({
      data: {
        clienteId: user.id,
        endereco,
        bairro,
        subtotal,
        frete,
        total,
        status: 'PENDENTE',
        itens: { create: itensCalculados },
      },
      include: { itens: true },
    });

    // Preparar conteúdo das notificações
    const itensResumo = pedido.itens
      .map(i => `${i.quantidade}x ${i.produtoNome} – ${(i.quantidade * i.precoUnitario).toFixed(2)} MT`)
      .join('\n');
    const dataHora = new Date().toLocaleString('pt-PT');

    // Notificações WhatsApp em segundo plano
    const notificacoes = async () => {
      try {
        const adminWhats = process.env.NOTIFICATION_WHATSAPP_TO;
        const promises = [];

        // Mensagem para o administrador (detalhada)
        if (adminWhats) {
          const msgAdmin = 
`Novo Pedido #${pedido.id}

Cliente: ${clienteNome}
Telefone: ${telefoneFormatado}
E-mail: ${clienteEmail}
Endereço: ${endereco}
Bairro: ${bairro}

Itens:
${itensResumo}

Subtotal: ${pedido.subtotal.toFixed(2)} MT
Frete: ${pedido.frete.toFixed(2)} MT
Total: ${pedido.total.toFixed(2)} MT

Status: ${pedido.status}
Data/Hora: ${dataHora}`;
          promises.push(enviarWhatsApp(adminWhats, msgAdmin));
        }

        // Mensagem para o cliente (resumida, sem emojis)
        if (telefoneFormatado) {
          const msgCliente = 
`Pedido #${pedido.id} confirmado

Olá ${clienteNome}, recebemos o seu pedido.

Itens:
${itensResumo}

Total: ${pedido.total.toFixed(2)} MT
Tempo estimado: ${tempoEntrega || 'a definir'}

Obrigado por escolher o Origens do Sabor.`;
          promises.push(enviarWhatsApp(telefoneFormatado, msgCliente));
        }

        promises.push(sendPedidoEmail({
          id: pedido.id,
          clienteNome,
          endereco,
          bairro,
          subtotal: pedido.subtotal,
          frete: pedido.frete,
          total: pedido.total,
          status: pedido.status,
          itens: pedido.itens.map((item) => ({
            nome: item.produtoNome,
            quantidade: item.quantidade,
            precoUnitario: item.precoUnitario,
          })),
        }));

        await Promise.allSettled(promises);
        console.log(`Notificações do pedido #${pedido.id} processadas em segundo plano.`);
      } catch (err) {
        console.error(`Erro ao processar notificações do pedido #${pedido.id}:`, err);
      }
    };

    notificacoes();

    res.status(201).json(pedido);
  } catch (error) {
    console.error('Erro ao criar pedido:', error);
    res.status(500).json({ error: 'Erro interno ao criar pedido' });
  }
};

// ==================== AGENTE ====================
export const listarPedidosAgente = async (req: Request, res: Response) => {
  const agenteId = (req as any).user.id;
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { agenteId, status: { not: 'ENTREGUE' } },
      orderBy: { dataPedido: 'asc' },
      include: { cliente: { select: { nome: true } }, itens: true },
    });
    const formatted = pedidos.map(p => ({
      id: p.id,
      clienteNome: p.cliente.nome,
      endereco: p.endereco,
      total: p.total,
      status: p.status,
      itens: p.itens,
      bairro: p.bairro,
    }));
    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar pedidos do agente' });
  }
};

export const marcarEntregue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const agenteId = (req as any).user.id;
  try {
    const pedido = await prisma.pedido.findUnique({ where: { id: Number(id) } });
    if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
    if (pedido.agenteId !== agenteId) return res.status(403).json({ error: 'Não autorizado' });
    const updated = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { status: 'ENTREGUE' },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao marcar como entregue' });
  }
};

// ==================== ADMIN ====================
export const listarTodosPedidos = async (req: Request, res: Response) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: { cliente: { select: { nome: true } }, agente: { select: { nome: true } }, itens: true },
      orderBy: { dataPedido: 'desc' },
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
};

export const atualizarStatusPedido = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const pedido = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { status },
    });
    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar status' });
  }
};

export const listarAgentes = async (req: Request, res: Response) => {
  try {
    const agentes = await prisma.usuario.findMany({
      where: { role: 'AGENTE', ativo: true },
      select: { id: true, nome: true, telefone: true, email: true },
    });
    res.json(agentes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar agentes' });
  }
};

export const atribuirAgente = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { agenteId } = req.body;
  try {
    const pedido = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { agenteId: Number(agenteId) },
      include: { cliente: true, itens: true },
    });
    console.log(`Pedido #${pedido.id} atribuído ao agente ${agenteId}`);
    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atribuir agente' });
  }
};