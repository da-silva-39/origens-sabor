import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import jwt from 'jsonwebtoken';
import { googleOAuthConfigured } from './config/passport';
import { prisma } from './config/prisma';
import authRoutes from './routes/authRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import produtoRoutes from './routes/produtoRoutes';
import freteRoutes from './routes/freteRoutes';
import reservaRoutes from './routes/reservaRoutes';
import mesaRoutes from './routes/mesaRoutes';
import adminMesaRoutes from './routes/adminMesaRoutes';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { rateLimit } from './middlewares/rateLimit';
import { requestLogger, securityHeaders } from './middlewares/security';

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Variaveis de ambiente em falta: ${missingEnv.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32 && process.env.NODE_ENV === 'production') {
  console.warn('JWT_SECRET deve ter pelo menos 32 caracteres em produção.');
}

const app = express();
const port = Number(process.env.PORT) || 5000;

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(securityHeaders);

if (process.env.NODE_ENV !== 'test') {
  app.use(requestLogger);
}

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const allowedOrigins = new Set(
  [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://origens-sabor.vercel.app',
    FRONTEND_URL,
    ...(process.env.CORS_ORIGINS || '').split(','),
  ]
    .map((origem) => origem.trim().replace(/\/$/, ''))
    .filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error('CORS: origem não autorizada'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400,
  })
);

app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: false, limit: '100kb' }));
app.use(passport.initialize());

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.get('/api/health', (_req, res) => res.status(200).json({ status: 'ok' }));

app.use(
  '/api',
  rateLimit({
    windowMs: 60_000,
    max: 300,
    message: 'Demasiados pedidos. Aguarde um momento e tente novamente.',
  })
);

app.use('/api/admin/mesas', adminMesaRoutes);

app.use(
  '/uploads',
  express.static(path.join(__dirname, '../uploads'), {
    maxAge: '7d',
    immutable: true,
    index: false,
  })
);

app.use(
  '/api/auth',
  rateLimit({
    windowMs: 15 * 60_000,
    max: 10,
    message: 'Demasiadas tentativas de autenticação. Tente novamente mais tarde.',
  }),
  authRoutes
);
app.use('/api/usuarios', usuarioRoutes);
app.use(
  '/api/pedidos',
  rateLimit({
    windowMs: 10 * 60_000,
    max: 30,
    message: 'Demasiados pedidos. Aguarde antes de tentar novamente.',
  }),
  pedidoRoutes
);
app.use('/api/produtos', produtoRoutes);
app.use('/api/frete', freteRoutes);
app.use(
  '/api/reservas',
  rateLimit({
    windowMs: 10 * 60_000,
    max: 40,
    message: 'Demasiados pedidos de reserva. Aguarde antes de tentar novamente.',
  }),
  reservaRoutes
);
app.use('/api/mesas', mesaRoutes);

if (googleOAuthConfigured) {
  app.get(
    '/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get(
    '/api/auth/google/callback',
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${FRONTEND_URL}/login`,
    }),
    (req, res) => {
      const user = req.user as any;
      const secret = process.env.JWT_SECRET!;
      const token = jwt.sign(
        { id: user.id, role: user.role },
        secret,
        { expiresIn: '7d', algorithm: 'HS256' }
      );
      const userData = encodeURIComponent(
        JSON.stringify({
          id: user.id,
          nome: user.nome,
          email: user.email,
          role: user.role,
          telefone: user.telefone,
          endereco: user.endereco,
          dataNascimento: user.dataNascimento,
          fotoUrl: user.fotoUrl,
          isOAuth: user.isOAuth,
        })
      );
      res.redirect(
        `${FRONTEND_URL}/auth/google/callback?token=${token}&user=${userData}`
      );
    }
  );
} else {
  app.get(['/api/auth/google', '/api/auth/google/callback'], (_req, res) => {
    res.status(503).json({ error: 'Login com Google não configurado' });
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(port, () => {
  console.log(JSON.stringify({ nivel: 'info', mensagem: `Servidor iniciado na porta ${port}` }));
});

async function encerrar(sinal: string) {
  console.log(JSON.stringify({ nivel: 'info', mensagem: `A encerrar (${sinal})` }));
  server.close(async () => {
    await prisma.$disconnect().catch(() => undefined);
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => void encerrar('SIGTERM'));
process.on('SIGINT', () => void encerrar('SIGINT'));

export default app;
