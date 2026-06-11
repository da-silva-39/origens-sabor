// backend/src/controllers/produtoController.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

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
      // Cloudinary devolve o URL completo em req.file.path
      imagemUrl = req.file.path;
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
      imagemUrl = req.file.path;
      // (Opcional) Se quiser apagar a imagem antiga do Cloudinary, pode implementar depois.
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
    // (Opcional) Remover imagem do Cloudinary se desejar – por simplicidade, não estamos a remover.
    await prisma.produto.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
};