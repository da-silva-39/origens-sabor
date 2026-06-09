// backend/src/controllers/pedidoController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    const pedido = await prisma.pedido.create({
      data: {
        clienteId: userId,
        endereco,
        bairro,
        subtotal,
        frete,
        total,
        status: 'PENDENTE',
        itens: { create: itens.map((item: any) => ({ ...item })) },
      },
      include: { itens: true },
    });
    res.status(201).json(pedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar pedido' });
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
    // Notificação para o agente (pode ser WhatsApp, email, ou toast simulada)
    // Aqui apenas logamos; pode integrar com Twilio ou Nodemailer
    console.log(`Pedido #${pedido.id} atribuído ao agente ${agenteId}`);
    res.json(pedido);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atribuir agente' });
  }
};