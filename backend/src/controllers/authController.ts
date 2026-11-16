import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { asyncHandler, AppError } from '../utils/errors';
import {
  exigirTexto,
  formatarTelefone,
  normalizarEmail,
  texto,
  validarEmail,
  validarSenha,
  validarTelefoneMocambique,
} from '../utils/validators';

function criarToken(user: { id: number; role: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new AppError(500, 'Configuração de autenticação indisponível');
  return jwt.sign({ id: user.id, role: user.role }, secret, {
    expiresIn: '7d',
    algorithm: 'HS256',
  });
}

function dadosPublicos(user: {
  id: number;
  nome: string;
  email: string;
  role: string;
  telefone: string | null;
  endereco: string | null;
  dataNascimento: Date | null;
  fotoUrl: string | null;
  isOAuth: boolean;
}) {
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    role: user.role,
    telefone: user.telefone,
    endereco: user.endereco,
    dataNascimento: user.dataNascimento,
    fotoUrl: user.fotoUrl,
    isOAuth: user.isOAuth,
  };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const nome = exigirTexto(req.body?.nome, 'Nome', { min: 2, max: 80 });
  const emailCru = exigirTexto(req.body?.email, 'E-mail', { max: 160 });
  const email = normalizarEmail(emailCru);
  const senha = validarSenha(req.body?.senha);
  const telefoneCru = texto(req.body?.telefone);

  if (!validarEmail(email)) {
    throw new AppError(400, 'E-mail inválido', 'EMAIL_INVALIDO');
  }
  if (telefoneCru && !validarTelefoneMocambique(telefoneCru)) {
    throw new AppError(400, 'Número de telefone inválido', 'TELEFONE_INVALIDO');
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    throw new AppError(409, 'Já existe uma conta com este e-mail', 'EMAIL_EM_USO');
  }

  const hashed = await bcrypt.hash(senha, 10);
  const user = await prisma.usuario.create({
    data: {
      nome,
      email,
      senha: hashed,
      telefone: telefoneCru ? formatarTelefone(telefoneCru) : null,
      role: 'CLIENTE',
      isOAuth: false,
      ativo: true,
    },
  });

  res.status(201).json({ token: criarToken(user), user: dadosPublicos(user) });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const email = normalizarEmail(texto(req.body?.email));
  const senha = texto(req.body?.senha);

  if (!email || !senha) {
    throw new AppError(400, 'E-mail e palavra-passe são obrigatórios', 'VALIDACAO');
  }

  const user = await prisma.usuario.findUnique({ where: { email } });
  const credenciaisInvalidas = new AppError(
    401,
    'E-mail ou palavra-passe incorretos',
    'CREDENCIAIS_INVALIDAS'
  );

  if (!user) throw credenciaisInvalidas;

  const valida = await bcrypt.compare(senha, user.senha);
  if (!valida) throw credenciaisInvalidas;
  if (!user.ativo) {
    throw new AppError(403, 'Conta desativada. Contacte o restaurante.', 'CONTA_DESATIVADA');
  }

  res.json({ token: criarToken(user), user: dadosPublicos(user) });
});
