import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import passport from 'passport';
import './config/passport'; // importa a configuração
import authRoutes from './routes/authRoutes';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(
  session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Rotas públicas
app.use('/api/auth', authRoutes);

// Rota para iniciar o login com Google
app.get('/api/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback do Google após autenticação
app.get(
  '/api/auth/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    // Usuário autenticado com sucesso
    const user = req.user as any;
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });
    // Redireciona para o frontend com o token na URL (ou pode enviar via query string)
    res.redirect(`http://localhost:5173/auth/google/callback?token=${token}&user=${encodeURIComponent(JSON.stringify({ id: user.id, nome: user.nome, email: user.email, role: user.role }))}`);
  }
);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});