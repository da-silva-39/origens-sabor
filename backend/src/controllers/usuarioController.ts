import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/prisma';
import { AppError, asyncHandler, parseId } from '../utils/errors';
import {
  exigirTexto,
  formatarTelefone,
  normalizarEmail,
  texto,
  textoOuNull,
  validarEmail,
  validarInteiro,
  validarSenha,
  validarTelefoneMocambique,
} from '../utils/validators';

const ROLES = ['ADMIN', 'CLIENTE', 'AGENTE'] as const;

export const listarUsuarios = asyncHandler(async (_req: Request, res: Response) => {
  const usuarios = await prisma.usuario.findMany({
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      role: true,
      ativo: true,
      endereco: true,
      fotoUrl: true,
      isOAuth: true,
      createdAt: true,
    },
    orderBy: { nome: 'asc' },
    take: 500,
  });
  res.json(usuarios);
});

export const criarUsuario = asyncHandler(async (req: Request, res: Response) => {
  const nome = exigirTexto(req.body?.nome, 'Nome', { min: 2, max: 80 });
  const email = normalizarEmail(exigirTexto(req.body?.email, 'E-mail', { max: 160 }));
  const senha = validarSenha(req.body?.senha);
  const role = texto(req.body?.role).toUpperCase();

  if (!validarEmail(email)) throw new AppError(400, 'E-mail inválido', 'EMAIL_INVALIDO');
  if (!ROLES.includes(role as (typeof ROLES)[number])) {
    throw new AppError(400, 'Tipo de utilizador inválido', 'ROLE_INVALIDA');
  }

  const telefone = textoOuNull(req.body?.telefone);
  if (telefone && !validarTelefoneMocambique(telefone)) {
    throw new AppError(400, 'Telefone inválido', 'TELEFONE_INVALIDO');
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) throw new AppError(409, 'Já existe um utilizador com este e-mail', 'EMAIL_EM_USO');

  const hashed = await bcrypt.hash(senha, 10);
  const usuario = await prisma.usuario.create({
    data: {
      nome,
      email,
      telefone: telefone ? formatarTelefone(telefone) : null,
      senha: hashed,
      role: role as (typeof ROLES)[number],
      ativo: true,
      isOAuth: false,
    },
  });

  res.status(201).json({
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    role: usuario.role,
  });
});

export const toggleUsuarioAtivo = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const atual = (req as any).user;

  if (atual.id === id) {
    throw new AppError(400, 'Não pode desativar a sua própria conta', 'OPERACAO_INVALIDA');
  }

  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) throw new AppError(404, 'Utilizador não encontrado', 'NAO_ENCONTRADO');

  const updated = await prisma.usuario.update({
    where: { id },
    data: { ativo: !usuario.ativo },
  });

  res.json({ ativo: updated.ativo });
});

export const atualizarPerfil = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const dados: Record<string, unknown> = {};

  if (req.body?.nome !== undefined) {
    dados.nome = exigirTexto(req.body.nome, 'Nome', { min: 2, max: 80 });
  }

  if (req.body?.email !== undefined) {
    const email = normalizarEmail(exigirTexto(req.body.email, 'E-mail', { max: 160 }));
    if (!validarEmail(email)) throw new AppError(400, 'E-mail inválido', 'EMAIL_INVALIDO');
    const emUso = await prisma.usuario.findFirst({
      where: { email, id: { not: userId } },
    });
    if (emUso) throw new AppError(409, 'Este e-mail já está em uso', 'EMAIL_EM_USO');
    dados.email = email;
  }

  if (req.body?.telefone !== undefined) {
    const telefone = textoOuNull(req.body.telefone);
    if (telefone && !validarTelefoneMocambique(telefone)) {
      throw new AppError(400, 'Telefone inválido', 'TELEFONE_INVALIDO');
    }
    dados.telefone = telefone ? formatarTelefone(telefone) : null;
  }

  if (req.body?.endereco !== undefined) {
    const endereco = textoOuNull(req.body.endereco);
    if (endereco && endereco.length > 300) {
      throw new AppError(400, 'Endereço demasiado longo', 'VALIDACAO');
    }
    dados.endereco = endereco;
  }

  if (req.body?.dataNascimento !== undefined) {
    const valor = textoOuNull(req.body.dataNascimento);
    if (!valor) {
      dados.dataNascimento = null;
    } else {
      const data = new Date(valor);
      if (Number.isNaN(data.getTime()) || data > new Date()) {
        throw new AppError(400, 'Data de nascimento inválida', 'DATA_INVALIDA');
      }
      dados.dataNascimento = data;
    }
  }

  const usuario = await prisma.usuario.update({
    where: { id: userId },
    data: dados,
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
});

export const alterarSenha = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const senhaAtual = texto(req.body?.senhaAtual);
  const novaSenha = validarSenha(req.body?.novaSenha);

  const user = await prisma.usuario.findUnique({ where: { id: userId } });
  if (!user) throw new AppError(404, 'Utilizador não encontrado', 'NAO_ENCONTRADO');
  if (user.isOAuth) {
    throw new AppError(
      400,
      'Contas Google não permitem alterar a palavra-passe',
      'CONTA_OAUTH'
    );
  }
  if (!senhaAtual) throw new AppError(400, 'Palavra-passe atual em falta', 'VALIDACAO');

  const valida = await bcrypt.compare(senhaAtual, user.senha);
  if (!valida) {
    throw new AppError(401, 'Palavra-passe atual incorreta', 'CREDENCIAIS_INVALIDAS');
  }

  const hashed = await bcrypt.hash(novaSenha, 10);
  await prisma.usuario.update({ where: { id: userId }, data: { senha: hashed } });

  res.json({ success: true });
});

export const uploadFoto = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  if (!req.file) throw new AppError(400, 'Nenhum ficheiro enviado', 'FICHEIRO_EM_FALTA');

  const fotoUrl = req.file.path;
  await prisma.usuario.update({ where: { id: userId }, data: { fotoUrl } });
  res.json({ fotoUrl });
});

export const guardarLocalizacaoAgente = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = (req as any).user.id;
    const latitude = Number(req.body?.latitude);
    const longitude = Number(req.body?.longitude);
    const endereco = textoOuNull(req.body?.endereco);

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new AppError(400, 'Latitude inválida', 'COORDENADAS_INVALIDAS');
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new AppError(400, 'Longitude inválida', 'COORDENADAS_INVALIDAS');
    }
    if (endereco && endereco.length > 300) {
      throw new AppError(400, 'Endereço demasiado longo', 'VALIDACAO');
    }

    const localizacao = await prisma.localizacaoAgente.create({
      data: { agenteId: userId, latitude, longitude, endereco },
    });

    res.status(201).json({
      message: 'Localização guardada',
      id: localizacao.id,
    });
  }
);

export const obterUltimaLocalizacaoAgente = asyncHandler(
  async (req: Request, res: Response) => {
    const id = validarInteiro(req.params.id, 'Agente', { min: 1 });

    const localizacao = await prisma.localizacaoAgente.findFirst({
      where: { agenteId: id },
      orderBy: { createdAt: 'desc' },
    });

    if (!localizacao) {
      throw new AppError(404, 'Nenhuma localização encontrada para este agente', 'NAO_ENCONTRADA');
    }
    res.json(localizacao);
  }
);
