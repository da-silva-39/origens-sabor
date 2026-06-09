import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import path from 'path';
import jwt from 'jsonwebtoken';

// Configuração do Passport (Google Strategy)
import './config/passport';

// Importação das rotas
import authRoutes from './routes/authRoutes';
import produtoRoutes from './routes/produtoRoutes';
import pedidoRoutes from './routes/pedidoRoutes';
import usuarioRoutes from './routes/usuarioRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // true apenas em produção com HTTPS
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Servir ficheiros estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas públicas
app.use('/api/auth', authRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Rota para iniciar login com Google
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback do Google após autenticação
app.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    const user = req.user as any;
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, { expiresIn: '7d' });
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
    res.redirect(`http://localhost:5173/auth/google/callback?token=${token}&user=${userData}`);
  }
);

// Rota de teste (opcional)
app.get('/', (req, res) => {
  res.send('API do Origens do Sabor está funcionando!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});