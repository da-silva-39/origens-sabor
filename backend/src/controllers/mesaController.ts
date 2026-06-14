import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Listar todas as mesas
export const listarMesas = async (req: Request, res: Response) => {
  try {
    const mesas = await prisma.mesa.findMany({
      orderBy: { numero: 'asc' },
    });
    res.json(mesas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar mesas' });
  }
};

// Criar nova mesa
export const criarMesa = async (req: Request, res: Response) => {
  const { numero, ocupada } = req.body;
  if (!numero) {
    return res.status(400).json({ error: 'Número da mesa é obrigatório' });
  }
  try {
    const existente = await prisma.mesa.findUnique({ where: { numero } });
    if (existente) {
      return res.status(409).json({ error: 'Já existe uma mesa com este número' });
    }
    const novaMesa = await prisma.mesa.create({
      // prisma type generation in this project expects an 'id' in MesaCreateInput for some schemas;
      // casting data to any avoids the incorrect type requirement while keeping runtime behavior.
      data: {
        numero,
        ocupada: ocupada ?? false,
        qrCode: null, // opcional, pode ser removido se não usar
      } as any,
    });
    res.status(201).json(novaMesa);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar mesa' });
  }
};

// Atualizar mesa
export const atualizarMesa = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { numero, ocupada } = req.body;
  try {
    if (numero) {
      const conflito = await prisma.mesa.findFirst({
        where: { numero, id: { not: Number(id) } },
      });
      if (conflito) {
        return res.status(409).json({ error: 'Número já utilizado por outra mesa' });
      }
    }
    const mesaAtualizada = await prisma.mesa.update({
      where: { id: Number(id) },
      data: { numero, ocupada },
    });
    res.json(mesaAtualizada);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar mesa' });
  }
};

// Eliminar mesa
export const deletarMesa = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const reservas = await prisma.reserva.findFirst({ where: { mesaId: Number(id) } });
    if (reservas) {
      return res.status(400).json({ error: 'Não é possível eliminar mesa com reservas existentes' });
    }
    await prisma.mesa.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao eliminar mesa' });
  }
};