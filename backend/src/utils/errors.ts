import { NextFunction, Request, Response } from 'express';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const asyncHandler =
  (handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };

export function parseId(value: unknown): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(400, 'Identificador inválido', 'ID_INVALIDO');
  }
  return id;
}
