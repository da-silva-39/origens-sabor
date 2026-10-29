import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

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