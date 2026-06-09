import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

const prisma = new PrismaClient();

// Configuração do Twilio (usa variáveis de ambiente)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';
const toNumber = process.env.NOTIFICATION_WHATSAPP_TO; // +258855712857

let twilioClient: twilio.Twilio | null = null;
if (accountSid && authToken && fromNumber && toNumber) {
  twilioClient = twilio(accountSid, authToken);
} else {
  console.warn('⚠️ Twilio credentials missing. WhatsApp notifications disabled.');
}

// ==================== CLIENTE ====================
export const listarPedidosCliente = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const pedidos = await prisma.pedido.findMany({
      where: { clienteId: userId },
      orderBy: { dataPedido: 'desc' },
    });
    res.json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar pedidos' });
  }
};

export const criarPedido = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { clienteNome, telefone, endereco, bairro, subtotal, frete, total, itens } = req.body;

  if (!clienteNome || !telefone || !endereco || !bairro || !itens || itens.length === 0) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    // Cria o pedido no banco
    const pedido = await prisma.pedido.create({
      data: {
        clienteId: userId,
        endereco,
        bairro,
        subtotal,
        frete,
        total,
        status: 'PENDENTE',
        itens: {
          create: itens.map((item: any) => ({
            produtoId: item.produtoId,
            produtoNome: item.produtoNome,
            precoUnitario: item.precoUnitario,
            quantidade: item.quantidade,
            subtotal: item.subtotal,
          })),
        },
      },
      include: { itens: true },
    });

    // --- Notificação WhatsApp (apenas se o Twilio estiver configurado) ---
    if (twilioClient && toNumber) {
      const itensLista = pedido.itens
        .map(item => `• ${item.quantidade}x ${item.produtoNome} – ${(item.quantidade * item.precoUnitario).toFixed(2)} MT`)
        .join('\n');

      const mensagem = `🍽️ *NOVO PEDIDO #${pedido.id}*\n\n` +
        `*Cliente:* ${clienteNome}\n` +
        `*Endereço:* ${endereco}\n` +
        `*Bairro:* ${bairro}\n\n` +
        `*Itens:*\n${itensLista}\n\n` +
        `*Subtotal:* ${subtotal.toFixed(2)} MT\n` +
        `*Frete:* ${frete.toFixed(2)} MT\n` +
        `*Total:* ${total.toFixed(2)} MT\n\n` +
        `*Status:* PENDENTE\n` +
        `*Data/Hora:* ${new Date().toLocaleString('pt-PT')}`;

      // Envio assíncrono (não bloqueia a resposta)
      twilioClient.messages
        .create({
          body: mensagem,
          from: `whatsapp:${fromNumber}`,
          to: `whatsapp:${toNumber}`,
        })
        .then(msg => console.log(`✅ WhatsApp enviado para pedido ${pedido.id}, SID: ${msg.sid}`))
        .catch(err => console.error(`❌ Erro WhatsApp pedido ${pedido.id}:`, err));
    } else {
      console.warn('⚠️ WhatsApp não configurado – notificação ignorada.');
    }

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
    console.log(`📦 Pedido #${pedido.id} atribuído ao agente ${agenteId}`);
    res.json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atribuir agente' });
  }
};