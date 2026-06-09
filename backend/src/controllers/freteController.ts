import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const listarBairros = async (req: Request, res: Response) => {
  try {
    const taxas = await prisma.taxaFrete.findMany({
      select: { bairro: true, valor: true, tempoEstimado: true },
      orderBy: { bairro: 'asc' },
    });
    res.json(taxas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao carregar bairros' });
  }
};