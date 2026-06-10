import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import jwt from 'jsonwebtoken';
import './config/passport';
import authRoutes from './routes/authRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import produtoRoutes from './routes/produtoRoutes';
import freteRoutes from './routes/freteRoutes';

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// Configuração CORS aprimorada
const allowedOrigins = [
  'http://localhost:5173',
  'https://origens-sabor.vercel.app',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origin (ex: Postman) ou se a origin está na lista
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false },
}));
app.use(passport.initialize());
app.use(passport.session());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/frete', freteRoutes);

app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/api/auth/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login' }), (req, res) => {
  const user = req.user as any;
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
  const userData = encodeURIComponent(JSON.stringify({
    id: user.id, nome: user.nome, email: user.email, role: user.role,
    telefone: user.telefone, endereco: user.endereco, fotoUrl: user.fotoUrl, isOAuth: user.isOAuth
  }));
  res.redirect(`http://localhost:5173/auth/google/callback?token=${token}&user=${userData}`);
});

app.get('/', (req, res) => res.send('API OK'));
app.listen(port, () => console.log(`Servidor na porta ${port}`));