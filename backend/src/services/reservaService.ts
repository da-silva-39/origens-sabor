import { prisma } from '../config/prisma';
import { janelaConflito, REGRAS_RESERVA } from '../utils/datetime';
import { Prisma } from '@prisma/client';

export const RESERVA_STATUS = {
  PENDENTE: 'PENDENTE',
  CONFIRMADA: 'CONFIRMADA',
  CANCELADA: 'CANCELADA',
} as const;

export const STATUS_RESERVA_ATIVA = [
  RESERVA_STATUS.PENDENTE,
  RESERVA_STATUS.CONFIRMADA,
] as const;

export { REGRAS_RESERVA };

type ClientePrisma = Prisma.TransactionClient | typeof prisma;

export async function encontrarConflito(
  db: ClientePrisma,
  mesaId: number,
  dataHora: Date,
  ignorarReservaId?: number
) {
  const { inicio, fim } = janelaConflito(dataHora);

  return db.reserva.findFirst({
    where: {
      mesaId,
      status: { in: [...STATUS_RESERVA_ATIVA] },
      dataHora: { gte: inicio, lte: fim },
      ...(ignorarReservaId ? { id: { not: ignorarReservaId } } : {}),
    },
    select: { id: true, dataHora: true },
  });
}

export async function encontrarConflitoCliente(
  db: ClientePrisma,
  clienteId: number,
  dataHora: Date
) {
  const { inicio, fim } = janelaConflito(dataHora);

  return db.reserva.findFirst({
    where: {
      clienteId,
      status: { in: [...STATUS_RESERVA_ATIVA] },
      dataHora: { gte: inicio, lte: fim },
    },
    select: { id: true, dataHora: true },
  });
}
