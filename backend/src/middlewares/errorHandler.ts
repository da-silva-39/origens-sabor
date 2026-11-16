import { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors';

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ error: 'Recurso não encontrado', code: 'NAO_ENCONTRADO' });
}

export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.message,
      ...(error.code ? { code: error.code } : {}),
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe um registo com estes dados', code: 'CONFLITO' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Registo não encontrado', code: 'NAO_ENCONTRADO' });
    }
    if (error.code === 'P2003') {
      return res.status(409).json({
        error: 'Operação bloqueada por registos associados',
        code: 'DEPENDENCIA',
      });
    }
    if (error.code === 'P2034') {
      return res.status(409).json({
        error: 'O pedido entrou em conflito com outra operação. Tente novamente.',
        code: 'CONFLITO_TRANSACAO',
      });
    }
  }

  const expressError = error as { type?: string; message?: string };
  if (expressError?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Pedido demasiado grande', code: 'PEDIDO_GRANDE' });
  }

  if (expressError?.message?.startsWith('CORS:')) {
    return res.status(403).json({ error: 'Origem não autorizada', code: 'CORS' });
  }

  console.error('[erro]', {
    method: req.method,
    path: req.originalUrl,
    message: expressError?.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : (error as Error)?.stack,
  });

  return res.status(500).json({
    error: 'Ocorreu um erro interno. Tente novamente mais tarde.',
    code: 'ERRO_INTERNO',
  });
}
