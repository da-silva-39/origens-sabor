import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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