import { Request, Response } from 'express';
import { randomBytes } from 'crypto';
import { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma';
import { enviarWhatsApp } from '../services/whatsappService';
import { AppError, asyncHandler, parseId } from '../utils/errors';
import {
  exigirTexto,
  formatarTelefone,
  normalizarEmail,
  texto,
  textoOuNull,
  validarEmail,
  validarInteiro,
  validarTelefoneMocambique,
} from '../utils/validators';
import {
  formatarDataHoraMaputo,
  parseDataHoraMaputo,
  validarHorarioReserva,
  REGRAS_RESERVA,
} from '../utils/datetime';
import {
  encontrarConflito,
  encontrarConflitoCliente,
  RESERVA_STATUS,
  STATUS_RESERVA_ATIVA,
} from '../services/reservaService';

const inclusaoReserva = {
  cliente: { select: { id: true, nome: true, email: true, telefone: true } },
  mesa: true,
} as const;

type ReservaCompleta = Prisma.ReservaGetPayload<{ include: typeof inclusaoReserva }>;

function gerarCodigoRecibo(): string {
  return randomBytes(8).toString('hex').toUpperCase();
}

function serializarReserva(reserva: ReservaCompleta) {
  return {
    ...reserva,
    cliente: reserva.cliente
      ? {
          id: reserva.cliente.id,
          nome: reserva.cliente.nome,
          email: reserva.cliente.email,
          telefone: reserva.cliente.telefone,
        }
      : {
          id: null,
          nome: reserva.nomeContacto || 'Cliente',
          email: reserva.emailContacto || '',
          telefone: reserva.telefoneContacto || null,
        },
  };
}

function contactoReserva(reserva: ReservaCompleta) {
  return {
    nome: reserva.nomeContacto || reserva.cliente?.nome || 'Cliente',
    email: reserva.emailContacto || reserva.cliente?.email || '',
    telefone: reserva.telefoneContacto || reserva.cliente?.telefone || null,
  };
}

async function notificarNovaReserva(reserva: ReservaCompleta) {
  const adminWhats = process.env.NOTIFICATION_WHATSAPP_TO;
  const frontendUrl = (process.env.FRONTEND_URL || 'https://origens-sabor.vercel.app').replace(/\/$/, '');
  const contacto = contactoReserva(reserva);

  const tarefas: Promise<void>[] = [];

  if (adminWhats) {
    const mensagem = [
      `Nova reserva #${reserva.id}`,
      '',
      `Cliente: ${contacto.nome}`,
      `E-mail: ${contacto.email || 'não informado'}`,
      `Telefone: ${contacto.telefone || 'não informado'}`,
      `Mesa: ${reserva.mesa.numero}`,
      `Data/Hora: ${formatarDataHoraMaputo(reserva.dataHora)}`,
      `Pessoas: ${reserva.quantidadePessoas}`,
      `Observações: ${reserva.observacoes || 'nenhuma'}`,
      '',
      `Gerir: ${frontendUrl}/admin/reservas`,
    ].join('\n');
    tarefas.push(enviarWhatsApp(adminWhats, mensagem));
  }

  if (contacto.telefone) {
    const mensagem = [
      `Reserva #${reserva.id} solicitada`,
      '',
      `Olá ${contacto.nome}, recebemos o seu pedido de reserva para a mesa ${reserva.mesa.numero}.`,
      `Data: ${formatarDataHoraMaputo(reserva.dataHora)}`,
      `Pessoas: ${reserva.quantidadePessoas}`,
      'Estado: pendente de confirmação.',
      '',
      'Obrigado por escolher o Origens do Sabor.',
    ].join('\n');
    tarefas.push(enviarWhatsApp(contacto.telefone, mensagem));
  }

  await Promise.allSettled(tarefas);
}

async function notificarConfirmacao(reserva: ReservaCompleta) {
  const contacto = contactoReserva(reserva);
  if (!contacto.telefone) return;

  const mensagem = [
    `Reserva #${reserva.id} confirmada`,
    '',
    `Olá ${contacto.nome}, a sua reserva para a mesa ${reserva.mesa.numero} está confirmada.`,
    `Data: ${formatarDataHoraMaputo(reserva.dataHora)}`,
    `Pessoas: ${reserva.quantidadePessoas}`,
    '',
    'Apresente-se no restaurante no horário indicado. Obrigado!',
  ].join('\n');

  await enviarWhatsApp(contacto.telefone, mensagem);
}

export const criarReserva = asyncHandler(async (req: Request, res: Response) => {
  const user = (req as any).user as
    | { id: number; nome: string; email: string; telefone: string | null }
    | undefined;

  const mesaId = validarInteiro(req.body?.mesaId, 'Mesa', { min: 1 });
  const dataHora = parseDataHoraMaputo(req.body?.dataHora);
  if (!dataHora) {
    throw new AppError(400, 'Data/hora inválida', 'DATA_INVALIDA');
  }

  const horario = validarHorarioReserva(dataHora);
  if (!horario.valido) {
    throw new AppError(400, horario.motivo || 'Horário inválido', 'HORARIO_INVALIDO');
  }

  const quantidadePessoas = validarInteiro(req.body?.quantidadePessoas, 'Número de pessoas', {
    min: 1,
    max: REGRAS_RESERVA.maxPessoas,
  });
  const observacoes = textoOuNull(req.body?.observacoes);

  if (observacoes && observacoes.length > 500) {
    throw new AppError(400, 'As observações não podem exceder 500 caracteres', 'VALIDACAO');
  }

  let nomeContacto: string;
  let emailContacto: string | null;
  let telefoneContacto: string | null;
  let clienteId: number | null = null;

  if (user) {
    clienteId = user.id;
    nomeContacto = user.nome;
    emailContacto = user.email;
    const telefoneInformado = texto(req.body?.telefone);
    telefoneContacto = telefoneInformado
      ? formatarTelefone(telefoneInformado)
      : user.telefone;
    if (telefoneInformado && !validarTelefoneMocambique(telefoneInformado)) {
      throw new AppError(400, 'Telefone inválido', 'TELEFONE_INVALIDO');
    }
  } else {
    nomeContacto = exigirTexto(req.body?.nome, 'Nome', { min: 2, max: 80 });
    const telefone = exigirTexto(req.body?.telefone, 'Telefone', { max: 20 });
    if (!validarTelefoneMocambique(telefone)) {
      throw new AppError(400, 'Telefone inválido', 'TELEFONE_INVALIDO');
    }
    telefoneContacto = formatarTelefone(telefone);
    const emailInformado = texto(req.body?.email);
    if (emailInformado && !validarEmail(normalizarEmail(emailInformado))) {
      throw new AppError(400, 'E-mail inválido', 'EMAIL_INVALIDO');
    }
    emailContacto = emailInformado ? normalizarEmail(emailInformado) : null;
  }

  const criar = async () => {
    return prisma.$transaction(
      async (tx) => {
        const mesa = await tx.mesa.findUnique({ where: { id: mesaId } });
        if (!mesa) throw new AppError(404, 'Mesa não encontrada', 'MESA_INEXISTENTE');

        const conflito = await encontrarConflito(tx, mesaId, dataHora);
        if (conflito) {
          throw new AppError(
            409,
            'Esta mesa já está reservada para o horário selecionado. Escolha outro horário.',
            'MESA_OCUPADA'
          );
        }

        if (clienteId) {
          const conflitoCliente = await encontrarConflitoCliente(tx, clienteId, dataHora);
          if (conflitoCliente) {
            throw new AppError(
              409,
              'Já tem uma reserva ativa neste horário. Consulte as suas reservas.',
              'RESERVA_DUPLICADA'
            );
          }
        }

        return tx.reserva.create({
          data: {
            clienteId,
            mesaId,
            dataHora,
            quantidadePessoas,
            observacoes,
            nomeContacto,
            emailContacto,
            telefoneContacto,
            status: RESERVA_STATUS.PENDENTE,
            codigoRecibo: gerarCodigoRecibo(),
          },
          include: inclusaoReserva,
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );
  };

  let reserva: ReservaCompleta;
  try {
    reserva = await criar();
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2034'
    ) {
      throw new AppError(
        409,
        'O horário acabou de ser reservado por outra pessoa. Tente novamente.',
        'CONFLITO_TRANSACAO'
      );
    }
    throw error;
  }

  void notificarNovaReserva(reserva).catch((error) =>
    console.error('Erro ao enviar notificações de reserva:', error)
  );

  res.status(201).json({
    mensagem: 'Pedido de reserva recebido. Aguarde a confirmação do restaurante.',
    reserva: serializarReserva(reserva),
  });
});

export const minhasReservas = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const reservas = await prisma.reserva.findMany({
    where: { clienteId: userId },
    include: inclusaoReserva,
    orderBy: { dataHora: 'desc' },
  });
  res.json(reservas.map(serializarReserva));
});

export const cancelarReserva = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const id = parseId(req.params.id);

  const reserva = await prisma.reserva.findFirst({
    where: { id, clienteId: userId },
  });
  if (!reserva) throw new AppError(404, 'Reserva não encontrada', 'NAO_ENCONTRADA');
  if (reserva.status === RESERVA_STATUS.CANCELADA) {
    throw new AppError(409, 'Esta reserva já está cancelada', 'RESERVA_CANCELADA');
  }
  if (reserva.dataHora < new Date()) {
    throw new AppError(400, 'Não é possível cancelar uma reserva já passada', 'RESERVA_PASSADA');
  }

  const atualizada = await prisma.reserva.update({
    where: { id },
    data: { status: RESERVA_STATUS.CANCELADA },
    include: inclusaoReserva,
  });

  res.json(serializarReserva(atualizada));
});

export const listarTodasReservas = asyncHandler(async (req: Request, res: Response) => {
  const status = texto(req.query.status).toUpperCase();
  const filtroStatus =
    status && Object.values(RESERVA_STATUS).includes(status as (typeof RESERVA_STATUS)[keyof typeof RESERVA_STATUS])
      ? { status }
      : {};

  const reservas = await prisma.reserva.findMany({
    where: filtroStatus,
    include: inclusaoReserva,
    orderBy: { dataHora: 'asc' },
    take: 500,
  });

  res.json(reservas.map(serializarReserva));
});

export const confirmarReserva = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  const resultado = await prisma.reserva.updateMany({
    where: { id, status: RESERVA_STATUS.PENDENTE },
    data: { status: RESERVA_STATUS.CONFIRMADA },
  });

  if (resultado.count === 0) {
    const existente = await prisma.reserva.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, 'Reserva não encontrada', 'NAO_ENCONTRADA');
    throw new AppError(
      409,
      `Não é possível confirmar uma reserva com estado ${existente.status}`,
      'ESTADO_INVALIDO'
    );
  }

  const reserva = await prisma.reserva.findUniqueOrThrow({
    where: { id },
    include: inclusaoReserva,
  });

  void notificarConfirmacao(reserva).catch((error) =>
    console.error('Erro ao notificar confirmação:', error)
  );

  res.json(serializarReserva(reserva));
});

export const adminCancelarReserva = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);

  const resultado = await prisma.reserva.updateMany({
    where: { id, status: { in: [...STATUS_RESERVA_ATIVA] } },
    data: { status: RESERVA_STATUS.CANCELADA },
  });

  if (resultado.count === 0) {
    const existente = await prisma.reserva.findUnique({ where: { id } });
    if (!existente) throw new AppError(404, 'Reserva não encontrada', 'NAO_ENCONTRADA');
    throw new AppError(
      409,
      `Não é possível cancelar uma reserva com estado ${existente.status}`,
      'ESTADO_INVALIDO'
    );
  }

  const reserva = await prisma.reserva.findUniqueOrThrow({
    where: { id },
    include: inclusaoReserva,
  });
  res.json(serializarReserva(reserva));
});

export const obterReserva = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const user = (req as any).user;
  const isAdmin = user.role === 'ADMIN';

  const reserva = await prisma.reserva.findFirst({
    where: isAdmin ? { id } : { id, clienteId: user.id },
    include: inclusaoReserva,
  });

  if (!reserva) throw new AppError(404, 'Reserva não encontrada', 'NAO_ENCONTRADA');
  res.json(serializarReserva(reserva));
});

export const validarReservaQR = asyncHandler(async (req: Request, res: Response) => {
  const id = parseId(req.params.id);
  const codigo = texto(req.query.codigo);
  if (!codigo) throw new AppError(400, 'Código em falta', 'VALIDACAO');

  const reserva = await prisma.reserva.findFirst({
    where: { id, codigoRecibo: codigo },
    include: inclusaoReserva,
  });

  if (!reserva) {
    return res.json({ valida: false, motivo: 'Reserva não encontrada ou código inválido.' });
  }
  if (reserva.status !== RESERVA_STATUS.CONFIRMADA) {
    return res.json({
      valida: false,
      motivo: 'Reserva ainda não confirmada. Aguarde a aprovação do restaurante.',
    });
  }
  if (reserva.dataHora < new Date()) {
    return res.json({ valida: false, motivo: 'Esta reserva já expirou.' });
  }

  const contacto = contactoReserva(reserva);
  return res.json({
    valida: true,
    reserva: {
      id: reserva.id,
      mesa: reserva.mesa.numero,
      dataHora: reserva.dataHora,
      cliente: contacto.nome,
      quantidadePessoas: reserva.quantidadePessoas,
    },
  });
});

export const verificarDisponibilidade = asyncHandler(
  async (req: Request, res: Response) => {
    const mesaId = validarInteiro(req.query.mesaId, 'Mesa', { min: 1 });
    const dataHora = parseDataHoraMaputo(req.query.dataHora);
    if (!dataHora) throw new AppError(400, 'Data/hora inválida', 'DATA_INVALIDA');

    const horario = validarHorarioReserva(dataHora);
    if (!horario.valido) {
      return res.json({ disponivel: false, motivo: horario.motivo });
    }

    const mesa = await prisma.mesa.findUnique({ where: { id: mesaId } });
    if (!mesa) throw new AppError(404, 'Mesa não encontrada', 'MESA_INEXISTENTE');

    const conflito = await encontrarConflito(prisma, mesaId, dataHora);
    return res.json({
      disponivel: !conflito,
      ...(conflito ? { motivo: 'Esta mesa já tem uma reserva neste horário.' } : {}),
    });
  }
);
