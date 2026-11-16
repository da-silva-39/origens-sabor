import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AppError, asyncHandler, parseId } from '../utils/errors';
import {
  exigirTexto,
  texto,
  textoOuNull,
  validarBooleano,
  validarPreco,
} from '../utils/validators';

function validarCamposProduto(body: Record<string, unknown>, criar: boolean) {
  const dados: Record<string, unknown> = {};

  if (criar || body.nome !== undefined) {
    dados.nome = exigirTexto(body.nome, 'Nome do prato', { min: 2, max: 120 });
  }
  if (criar || body.descricao !== undefined) {
    const descricao = textoOuNull(body.descricao);
    if (descricao && descricao.length > 500) {
      throw new AppError(400, 'A descrição não pode exceder 500 caracteres', 'VALIDACAO');
    }
    dados.descricao = descricao;
  }
  if (criar || body.preco !== undefined) {
    dados.preco = validarPreco(body.preco);
  }
  if (criar || body.categoria !== undefined) {
    dados.categoria = exigirTexto(body.categoria, 'Categoria', { min: 2, max: 60 });
  }
  if (body.alergenios !== undefined) {
    const alergenios = textoOuNull(body.alergenios);
    if (alergenios && alergenios.length > 300) {
      throw new AppError(400, 'Os alergénios não podem exceder 300 caracteres', 'VALIDACAO');
    }
    dados.alergenios = alergenios;
  }
  if (body.disponivel !== undefined) {
    dados.disponivel = validarBooleano(body.disponivel, true);
  } else if (criar) {
    dados.disponivel = true;
  }
  if (body.destaque !== undefined) {
    dados.destaque = validarBooleano(body.destaque, false);
  } else if (criar) {
    dados.destaque = false;
  }

  return dados;
}

export const listarProdutos = asyncHandler(async (req: Request, res: Response) => {
  const categoria = texto(req.query.categoria);
  const destaque = texto(req.query.destaque);
  const disponivel = texto(req.query.disponivel);

  const where: Record<string, unknown> = {};
  if (categoria) where.categoria = categoria;
  if (destaque === 'true') where.destaque = true;
  if (disponivel === 'true') where.disponivel = true;
  if (disponivel === 'false') where.disponivel = false;

  const produtos = await prisma.produto.findMany({
    where,
    orderBy: [{ categoria: 'asc' }, { nome: 'asc' }],
  });

  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  res.json(produtos);
});

export const criarProduto = asyncHandler(async (req: Request, res: Response) => {
  const dados = validarCamposProduto(req.body as Record<string, unknown>, true);
  const imagemUrl = req.file?.path;

  const produto = await prisma.produto.create({
    data: {
      ...(dados as any),
      imagemUrl: imagemUrl ?? null,
    },
  });

  res.status(201).json(produto);
});

export const atualizarProduto = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const existente = await prisma.produto.findUnique({ where: { id } });
  if (!existente) throw new AppError(404, 'Produto não encontrado', 'NAO_ENCONTRADO');

  const dados = validarCamposProduto(req.body as Record<string, unknown>, false);
  const imagemUrl = req.file?.path;

  const produto = await prisma.produto.update({
    where: { id },
    data: {
      ...(dados as any),
      ...(imagemUrl ? { imagemUrl } : {}),
    },
  });

  res.json(produto);
});

export const deletarProduto = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  await prisma.produto.delete({ where: { id } });
  res.status(204).send();
});
