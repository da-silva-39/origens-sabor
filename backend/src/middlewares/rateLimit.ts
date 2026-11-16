import { NextFunction, Request, Response } from 'express';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface Registo {
  count: number;
  resetAt: number;
}

export function rateLimit({ windowMs, max, message }: RateLimitOptions) {
  const registos = new Map<string, Registo>();

  const limpar = (agora: number) => {
    if (registos.size < 5000) return;
    for (const [chave, registo] of registos) {
      if (registo.resetAt <= agora) registos.delete(chave);
    }
  };

  return (req: Request, res: Response, next: NextFunction) => {
    const agora = Date.now();
    limpar(agora);

    const chave = req.ip || req.socket.remoteAddress || 'desconhecido';
    const registo = registos.get(chave);

    if (!registo || registo.resetAt <= agora) {
      registos.set(chave, { count: 1, resetAt: agora + windowMs });
      res.setHeader('RateLimit-Limit', String(max));
      res.setHeader('RateLimit-Remaining', String(max - 1));
      return next();
    }

    registo.count += 1;
    const restante = Math.max(0, max - registo.count);
    res.setHeader('RateLimit-Limit', String(max));
    res.setHeader('RateLimit-Remaining', String(restante));
    res.setHeader('RateLimit-Reset', String(Math.ceil(registo.resetAt / 1000)));

    if (registo.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((registo.resetAt - agora) / 1000)));
      return res.status(429).json({
        error: message || 'Demasiados pedidos. Tente novamente mais tarde.',
        code: 'RATE_LIMIT',
      });
    }

    return next();
  };
}
