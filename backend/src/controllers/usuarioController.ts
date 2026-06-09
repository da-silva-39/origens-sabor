import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const atualizarPerfil = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { nome, email, telefone, endereco, dataNascimento } = req.body;
  try {
    const usuario = await prisma.usuario.update({
      where: { id: userId },
      data: {
        nome,
        email,
        telefone,
        endereco,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
      },
    });
    res.json({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      endereco: usuario.endereco,
      dataNascimento: usuario.dataNascimento,
      fotoUrl: usuario.fotoUrl,
      isOAuth: usuario.isOAuth,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao actualizar perfil' });
  }
};

export const alterarSenha = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { senhaAtual, novaSenha } = req.body;
  try {
    const user = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
    if (user.isOAuth) return res.status(400).json({ error: 'Contas Google não permitem alterar senha' });
    const valid = await bcrypt.compare(senhaAtual, user.senha);
    if (!valid) return res.status(401).json({ error: 'Senha actual incorrecta' });
    const hashed = await bcrypt.hash(novaSenha, 10);
    await prisma.usuario.update({ where: { id: userId }, data: { senha: hashed } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao alterar senha' });
  }
};

export const uploadFoto = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  if (!req.file) return res.status(400).json({ error: 'Nenhum ficheiro enviado' });
  const fotoUrl = `/uploads/${req.file.filename}`;
  try {
    await prisma.usuario.update({ where: { id: userId }, data: { fotoUrl } });
    res.json({ fotoUrl });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao guardar foto' });
  }
};