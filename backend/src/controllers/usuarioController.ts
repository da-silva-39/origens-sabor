import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const alterarSenha = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { senhaAtual, novaSenha } = req.body;
  const user = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  const valid = await bcrypt.compare(senhaAtual, user.senha);
  if (!valid) return res.status(401).json({ error: 'Senha actual incorreta' });
  const hashed = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({ where: { id: userId }, data: { senha: hashed } });
  res.json({ success: true });
};