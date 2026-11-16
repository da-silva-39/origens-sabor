import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';

interface TokenPayload {
  id: number;
  role: string;
}

async function carregarUtilizador(token: string) {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!, {
    algorithms: ['HS256'],
  }) as TokenPayload;

  if (!decoded?.id) return null;

  return prisma.usuario.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      role: true,
      ativo: true,
      endereco: true,
      fotoUrl: true,
      isOAuth: true,
      dataNascimento: true,
    },
  });
}

export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return next();

  try {
    const user = await carregarUtilizador(authHeader.slice(7));
    if (user?.ativo) (req as any).user = user;
  } catch {
    // Token inválido não impede operações públicas.
  }

  return next();
}

export { carregarUtilizador };
