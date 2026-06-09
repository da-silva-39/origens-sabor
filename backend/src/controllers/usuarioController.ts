import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

// backend/src/controllers/usuarioController.ts (apenas a parte relevante)
export const listarUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, email: true, telefone: true, role: true, ativo: true, endereco: true, fotoUrl: true, isOAuth: true },
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar utilizadores' });
  }
};

export const criarUsuario = async (req: Request, res: Response) => {
  const { nome, email, telefone, senha, role } = req.body;
  const hashed = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuario.create({
    data: { nome, email, telefone, senha: hashed, role, ativo: true, isOAuth: false }
  });
  res.status(201).json({ id: usuario.id, nome: usuario.nome, email: usuario.email, role: usuario.role });
};

export const toggleUsuarioAtivo = async (req: Request, res: Response) => {
  const { id } = req.params;
  const usuario = await prisma.usuario.findUnique({ where: { id: Number(id) } });
  if (!usuario) return res.status(404).json({ error: 'Utilizador não encontrado' });
  const updated = await prisma.usuario.update({ where: { id: Number(id) }, data: { ativo: !usuario.ativo } });
  res.json({ ativo: updated.ativo });
};

export const atualizarPerfil = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { nome, email, telefone, endereco, dataNascimento } = req.body;
  const usuario = await prisma.usuario.update({
    where: { id: userId },
    data: { nome, email, telefone, endereco, dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined }
  });
  res.json({ id: usuario.id, nome: usuario.nome, email: usuario.email, telefone: usuario.telefone, endereco: usuario.endereco, fotoUrl: usuario.fotoUrl, isOAuth: usuario.isOAuth });
};

export const alterarSenha = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { senhaAtual, novaSenha } = req.body;
  const user = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Utilizador não encontrado' });
  if (user.isOAuth) return res.status(400).json({ error: 'Contas Google não permitem alterar senha' });
  const valid = await bcrypt.compare(senhaAtual, user.senha);
  if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' });
  const hashed = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({ where: { id: userId }, data: { senha: hashed } });
  res.json({ success: true });
};

export const uploadFoto = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
  const fotoUrl = `/uploads/${req.file.filename}`;
  await prisma.usuario.update({ where: { id: userId }, data: { fotoUrl } });
  res.json({ fotoUrl });
};

export const listarUsuariosPorRole = async (req: Request, res: Response) => {
  const { role } = req.query;
  try {
    const usuarios = await prisma.usuario.findMany({
      where: { role: role as any, ativo: true },
      select: { id: true, nome: true, email: true, telefone: true, role: true },
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
};