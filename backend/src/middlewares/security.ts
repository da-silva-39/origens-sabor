import { NextFunction, Request, Response } from 'express';

export function securityHeaders(_req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  res.removeHeader('X-Powered-By');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  }

  next();
}

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const inicio = Date.now();
  res.on('finish', () => {
    if (req.path === '/health' || req.path === '/api/health') return;
    console.log(
      JSON.stringify({
        nivel: 'info',
        metodo: req.method,
        rota: req.originalUrl.split('?')[0],
        status: res.statusCode,
        duracaoMs: Date.now() - inicio,
        ip: req.ip,
      })
    );
  });
  next();
}
