import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET!;

export const register = async (req: Request, res: Response) => {
  const { nome, email, telefone, senha } = req.body;
  try {
    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'Email já registado' });

    const hashedPassword = await bcrypt.hash(senha, 10);
    const user = await prisma.usuario.create({
      data: { nome, email, telefone, senha: hashedPassword, role: 'CLIENTE' },
    });
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, senha } = req.body;
  try {
    const user = await prisma.usuario.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const valid = await bcrypt.compare(senha, user.senha);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Erro interno' });
  }
};