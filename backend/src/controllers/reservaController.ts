import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

function gerarCodigoRecibo(): string {
  return randomBytes(8).toString('hex').toUpperCase();
}

// Criar reserva (cliente)
export const criarReserva = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { mesaId, dataHora, quantidadePessoas, observacoes } = req.body;

  if (!mesaId || !dataHora || !quantidadePessoas) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const dataHoraObj = new Date(dataHora);
  if (isNaN(dataHoraObj.getTime())) {
    return res.status(400).json({ error: 'Data/hora inválida' });
  }

  // Verificar se a mesa está livre no horário
  const reservaConflito = await prisma.reserva.findFirst({
    where: {
      mesaId,
      dataHora: dataHoraObj,
      status: { in: ['PENDENTE', 'CONFIRMADA'] },
    },
  });
  if (reservaConflito) {
    return res.status(409).json({ error: 'Mesa já reservada para este horário' });
  }

  const mesa = await prisma.mesa.findUnique({ where: { id: mesaId } });
  if (!mesa) return res.status(404).json({ error: 'Mesa não encontrada' });

  const codigoRecibo = gerarCodigoRecibo();

  try {
    const reserva = await prisma.reserva.create({
      data: {
        clienteId: userId,
        mesaId,
        dataHora: dataHoraObj,
        quantidadePessoas,
        status: 'PENDENTE',
        codigoRecibo,
        observacoes,
      },
      include: { cliente: { select: { nome: true, email: true, telefone: true } }, mesa: true },
    });
    res.status(201).json(reserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar reserva' });
  }
};

// Listar minhas reservas (cliente)
export const minhasReservas = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  try {
    const reservas = await prisma.reserva.findMany({
      where: { clienteId: userId },
      include: { mesa: true },
      orderBy: { dataHora: 'asc' },
    });
    res.json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar reservas' });
  }
};

// Cancelar reserva (cliente)
export const cancelarReserva = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { id } = req.params;

  try {
    const reserva = await prisma.reserva.findFirst({
      where: { id: Number(id), clienteId: userId },
    });
    if (!reserva) return res.status(404).json({ error: 'Reserva não encontrada' });

    if (new Date(reserva.dataHora) < new Date()) {
      return res.status(400).json({ error: 'Não é possível cancelar uma reserva com data/hora já passada' });
    }

    const updated = await prisma.reserva.update({
      where: { id: Number(id) },
      data: { status: 'CANCELADA' },
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  }
};

// ADMIN: listar todas reservas
export const listarTodasReservas = async (req: Request, res: Response) => {
  try {
    const reservas = await prisma.reserva.findMany({
      include: { cliente: { select: { nome: true, email: true, telefone: true } }, mesa: true },
      orderBy: { dataHora: 'asc' },
    });
    res.json(reservas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar reservas' });
  }
};

// ADMIN: confirmar reserva
export const confirmarReserva = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const reserva = await prisma.reserva.update({
      where: { id: Number(id) },
      data: { status: 'CONFIRMADA' },
      include: { cliente: { select: { nome: true, email: true, telefone: true } }, mesa: true },
    });
    res.json(reserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao confirmar reserva' });
  }
};

// ADMIN: cancelar reserva
export const adminCancelarReserva = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const reserva = await prisma.reserva.update({
      where: { id: Number(id) },
      data: { status: 'CANCELADA' },
    });
    res.json(reserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao cancelar reserva' });
  }
};

// Obter reserva (para gerar PDF)
export const obterReserva = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).user.id;
  const isAdmin = (req as any).user.role === 'ADMIN';

  try {
    const reserva = await prisma.reserva.findFirst({
      where: isAdmin ? { id: Number(id) } : { id: Number(id), clienteId: userId },
      include: { cliente: { select: { nome: true, email: true, telefone: true } }, mesa: true },
    });
    if (!reserva) return res.status(404).json({ error: 'Reserva não encontrada' });
    res.json(reserva);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao obter reserva' });
  }
};