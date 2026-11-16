import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError, asyncHandler, parseId } from '../utils/errors';
import { validarBooleano, validarInteiro } from '../utils/validators';

export const listarMesas = asyncHandler(async (_req: Request, res: Response) => {
  const mesas = await prisma.mesa.findMany({
    select: { id: true, numero: true, ocupada: true },
    orderBy: { numero: 'asc' },
  });
  res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=20');
  res.json(mesas);
});

export const criarMesa = asyncHandler(async (req: Request, res: Response) => {
  const numero = validarInteiro(req.body?.numero, 'Número da mesa', { min: 1, max: 999 });
  const ocupada = validarBooleano(req.body?.ocupada, false);

  const existente = await prisma.mesa.findUnique({ where: { numero } });
  if (existente) {
    throw new AppError(409, 'Já existe uma mesa com este número', 'MESA_DUPLICADA');
  }

  const novaMesa = await prisma.mesa.create({ data: { numero, ocupada } });
  res.status(201).json(novaMesa);
});

export const atualizarMesa = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const existente = await prisma.mesa.findUnique({ where: { id } });
  if (!existente) throw new AppError(404, 'Mesa não encontrada', 'NAO_ENCONTRADA');

  const numero =
    req.body?.numero !== undefined
      ? validarInteiro(req.body.numero, 'Número da mesa', { min: 1, max: 999 })
      : undefined;
  const ocupada =
    req.body?.ocupada !== undefined ? validarBooleano(req.body.ocupada) : undefined;

  if (numero !== undefined) {
    const conflito = await prisma.mesa.findFirst({
      where: { numero, id: { not: id } },
    });
    if (conflito) {
      throw new AppError(409, 'Número já utilizado por outra mesa', 'MESA_DUPLICADA');
    }
  }

  const mesaAtualizada = await prisma.mesa.update({
    where: { id },
    data: { ...(numero !== undefined ? { numero } : {}), ...(ocupada !== undefined ? { ocupada } : {}) },
  });

  res.json(mesaAtualizada);
});

export const deletarMesa = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  const reservas = await prisma.reserva.count({ where: { mesaId: id } });
  if (reservas > 0) {
    throw new AppError(
      409,
      'Não é possível eliminar uma mesa com reservas associadas',
      'DEPENDENCIA'
    );
  }

  await prisma.mesa.delete({ where: { id } });
  res.status(204).send();
});
