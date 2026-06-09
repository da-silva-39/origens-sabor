// backend/src/controllers/produtoController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Listar todos os produtos (público)
export const listarProdutos = async (req: Request, res: Response) => {
  try {
    const produtos = await prisma.produto.findMany();
    res.json(produtos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar produtos' });
  }
};

// Criar produto (admin)
export const criarProduto = async (req: Request, res: Response) => {
  try {
    const { nome, descricao, preco, categoria } = req.body;
    let imagemUrl = null;
    if (req.file) {
      imagemUrl = `/uploads/produtos/${req.file.filename}`;
    }
    const produto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        categoria,
        imagemUrl,
      },
    });
    res.status(201).json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar produto' });
  }
};

// Atualizar produto (admin)
export const atualizarProduto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, categoria } = req.body;
    let imagemUrl: string | undefined = undefined;

    if (req.file) {
      imagemUrl = `/uploads/produtos/${req.file.filename}`;
      // Remover imagem antiga se existir
      const produtoAntigo = await prisma.produto.findUnique({ where: { id: Number(id) } });
      if (produtoAntigo?.imagemUrl) {
        const oldPath = path.join(__dirname, '../../', produtoAntigo.imagemUrl);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    }

    const produto = await prisma.produto.update({
      where: { id: Number(id) },
      data: {
        nome,
        descricao,
        preco: parseFloat(preco),
        categoria,
        ...(imagemUrl && { imagemUrl }),
      },
    });
    res.json(produto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
};

// Deletar produto (admin)
export const deletarProduto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const produto = await prisma.produto.findUnique({ where: { id: Number(id) } });
    if (produto?.imagemUrl) {
      const imagePath = path.join(__dirname, '../../', produto.imagemUrl);
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    await prisma.produto.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};