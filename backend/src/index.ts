import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import jwt from 'jsonwebtoken';
import { googleOAuthConfigured } from './config/passport';
import authRoutes from './routes/authRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import produtoRoutes from './routes/produtoRoutes';
import freteRoutes from './routes/freteRoutes';
import reservaRoutes from './routes/reservaRoutes';
import mesaRoutes from './routes/mesaRoutes';
import adminMesaRoutes from './routes/adminMesaRoutes';

const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Variaveis de ambiente em falta: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 5000;

app.set('trust proxy', 1);

const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const allowedOrigins = [
  'http://localhost:5173',
  FRONTEND_URL,
  'https://origens-sabor.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(passport.initialize());
app.use('/api/admin/mesas', adminMesaRoutes);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/frete', freteRoutes);
app.use('/api/reservas', reservaRoutes);
app.use('/api/mesas', mesaRoutes);


if (googleOAuthConfigured) {
  app.get('/api/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: `${FRONTEND_URL}/login` }),
    (req, res) => {
      const user = req.user as any;
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
      );
      const userData = encodeURIComponent(JSON.stringify({
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        telefone: user.telefone,
        endereco: user.endereco,
        dataNascimento: user.dataNascimento,
        fotoUrl: user.fotoUrl,
        isOAuth: user.isOAuth
      }));
      res.redirect(`${FRONTEND_URL}/auth/google/callback?token=${token}&user=${userData}`);
    }
  );
} else {
  app.get(['/api/auth/google', '/api/auth/google/callback'], (req, res) => {
    res.status(503).json({ error: 'Login com Google não configurado' });
  });
}

app.get('/', (req, res) => res.send('API OK'));

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.listen(port, () => console.log(`Servidor na porta ${port}`));