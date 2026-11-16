const TIMEZONE = 'Africa/Maputo';
const OFFSET_UTC_HORAS = 2;

const LOCAL_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/;

const DIAS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

interface PartesDataHora {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  weekday: string;
}

const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: TIMEZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  weekday: 'short',
  hourCycle: 'h23',
});

export function partesMaputo(data: Date): PartesDataHora {
  const partes = formatter.formatToParts(data);
  const obter = (tipo: string) => partes.find((parte) => parte.type === tipo)?.value ?? '';
  return {
    year: Number(obter('year')),
    month: Number(obter('month')),
    day: Number(obter('day')),
    hour: Number(obter('hour')),
    minute: Number(obter('minute')),
    second: Number(obter('second')),
    weekday: obter('weekday'),
  };
}

/**
 * Interpreta "YYYY-MM-DDTHH:mm" como hora de Maputo (UTC+2, sem horário de verão).
 * Strings com fuso explícito (Z ou ±hh:mm) são respeitadas.
 */
export function parseDataHoraMaputo(value: unknown): Date | null {
  if (typeof value !== 'string' || value.trim() === '') return null;

  const entrada = value.trim();
  const local = LOCAL_DATE_RE.exec(entrada);

  if (!local) {
    const data = new Date(entrada);
    return Number.isNaN(data.getTime()) ? null : data;
  }

  const [, ano, mes, dia, hora, minuto, segundo = '0'] = local;
  const data = new Date(
    Date.UTC(
      Number(ano),
      Number(mes) - 1,
      Number(dia),
      Number(hora) - OFFSET_UTC_HORAS,
      Number(minuto),
      Number(segundo)
    )
  );

  const partes = partesMaputo(data);
  const corresponde =
    partes.year === Number(ano) &&
    partes.month === Number(mes) &&
    partes.day === Number(dia) &&
    partes.hour === Number(hora) &&
    partes.minute === Number(minuto);

  return corresponde ? data : null;
}

export function minutosDoDia(hora: number, minuto: number): number {
  return hora * 60 + minuto;
}

export function lerInteiroEnv(nome: string, padrao: number): number {
  const valor = Number.parseInt(process.env[nome] ?? '', 10);
  return Number.isFinite(valor) && valor > 0 ? valor : padrao;
}

export interface RegrasReserva {
  antecedenciaMinimaMin: number;
  duracaoMin: number;
  maxDias: number;
  maxPessoas: number;
  ultimaEntradaMin: number;
}

export const REGRAS_RESERVA: RegrasReserva = {
  antecedenciaMinimaMin: lerInteiroEnv('RESERVA_MIN_ANTECEDENCIA_MIN', 60),
  duracaoMin: lerInteiroEnv('RESERVA_DURACAO_MINUTOS', 120),
  maxDias: lerInteiroEnv('RESERVA_MAX_DIAS', 90),
  maxPessoas: lerInteiroEnv('RESERVA_MAX_PESSOAS', 20),
  ultimaEntradaMin: lerInteiroEnv('RESERVA_ULTIMA_ENTRADA_MINUTOS', 30),
};

export interface ResultadoValidacaoHorario {
  valido: boolean;
  motivo?: string;
}

export function validarHorarioReserva(
  dataHora: Date,
  agora: Date = new Date()
): ResultadoValidacaoHorario {
  const diffMs = dataHora.getTime() - agora.getTime();
  const minMs = 60_000;

  if (diffMs < REGRAS_RESERVA.antecedenciaMinimaMin * minMs) {
    return {
      valido: false,
      motivo: `A reserva deve ser feita com pelo menos ${REGRAS_RESERVA.antecedenciaMinimaMin} minutos de antecedência.`,
    };
  }

  if (diffMs > REGRAS_RESERVA.maxDias * 24 * 60 * minMs) {
    return {
      valido: false,
      motivo: `Só é possível reservar com até ${REGRAS_RESERVA.maxDias} dias de antecedência.`,
    };
  }

  const { weekday, hour, minute } = partesMaputo(dataHora);
  const indiceDia = DIAS.indexOf(weekday as (typeof DIAS)[number]);
  if (indiceDia === -1) {
    return { valido: false, motivo: 'Data/hora inválida.' };
  }

  const domingo = indiceDia === 0;
  const abertura = domingo ? minutosDoDia(9, 0) : minutosDoDia(7, 30);
  const fecho = minutosDoDia(22, 0);
  const ultimaEntrada = fecho - REGRAS_RESERVA.ultimaEntradaMin;
  const atual = minutosDoDia(hour, minute);

  if (atual < abertura || atual > ultimaEntrada) {
    const horario = domingo ? '09:00 às 22:00' : '07:30 às 22:00';
    return {
      valido: false,
      motivo: `Reservas fora do horário de funcionamento (${horario}). A última entrada é ${REGRAS_RESERVA.ultimaEntradaMin} minutos antes do fecho.`,
    };
  }

  return { valido: true };
}

export function janelaConflito(dataHora: Date): { inicio: Date; fim: Date } {
  const duracaoMs = REGRAS_RESERVA.duracaoMin * 60_000;
  return {
    inicio: new Date(dataHora.getTime() - duracaoMs),
    fim: new Date(dataHora.getTime() + duracaoMs),
  };
}

const formatterDataHora = new Intl.DateTimeFormat('pt-PT', {
  timeZone: TIMEZONE,
  dateStyle: 'short',
  timeStyle: 'short',
});

export function formatarDataHoraMaputo(data: Date): string {
  return formatterDataHora.format(data);
}
