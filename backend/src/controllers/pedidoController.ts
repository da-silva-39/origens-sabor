import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const listarPedidosAgente = async (req: Request, res: Response) => {
  const agenteId = (req as any).user.id;
  const pedidos = await prisma.pedido.findMany({
    where: { agenteId, status: { not: 'ENTREGUE' } },
    include: { cliente: { select: { nome: true } } }
  });
  const formatted = pedidos.map(p => ({
    id: p.id, clienteNome: p.cliente.nome, endereco: p.endereco, total: p.total, status: p.status
  }));
  res.json(formatted);
};

export const marcarEntregue = async (req: Request, res: Response) => {
  const { id } = req.params;
  const agenteId = (req as any).user.id;
  const pedido = await prisma.pedido.findUnique({ where: { id: Number(id) } });
  if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });
  if (pedido.agenteId !== agenteId) return res.status(403).json({ error: 'Não autorizado' });
  await prisma.pedido.update({ where: { id: Number(id) }, data: { status: 'ENTREGUE' } });
  res.json({ success: true });
};