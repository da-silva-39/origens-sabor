import { NextFunction, Request, Response } from 'express';
import { carregarUtilizador } from './optionalAuth';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Autenticação necessária', code: 'NAO_AUTENTICADO' });
  }

  try {
    const user = await carregarUtilizador(authHeader.slice(7));
    if (!user) {
      return res.status(401).json({ error: 'Sessão inválida', code: 'TOKEN_INVALIDO' });
    }
    if (!user.ativo) {
      return res.status(403).json({ error: 'Conta desativada', code: 'CONTA_DESATIVADA' });
    }
    (req as any).user = user;
    return next();
  } catch {
    return res.status(401).json({ error: 'Sessão inválida', code: 'TOKEN_INVALIDO' });
  }
}
