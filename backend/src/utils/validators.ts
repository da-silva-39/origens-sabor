import { AppError } from './errors';

const EMAIL_RE = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
const TELEFONE_COMPLETO_RE = /^\+258[8][2-7]\d{7}$/;
const TELEFONE_LOCAL_RE = /^[8][2-7]\d{7}$/;

export function texto(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function textoOuNull(value: unknown): string | null {
  const resultado = texto(value);
  return resultado.length > 0 ? resultado : null;
}

export function validarEmail(email: string): boolean {
  return EMAIL_RE.test(email);
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validarTelefoneMocambique(telefone: string): boolean {
  return TELEFONE_COMPLETO_RE.test(telefone) || TELEFONE_LOCAL_RE.test(telefone);
}

export function formatarTelefone(telefone: string): string {
  if (TELEFONE_COMPLETO_RE.test(telefone)) return telefone;
  if (TELEFONE_LOCAL_RE.test(telefone)) return `+258${telefone}`;
  return telefone;
}

export function exigirTexto(
  value: unknown,
  campo: string,
  opcoes: { min?: number; max?: number } = {}
): string {
  const resultado = texto(value);
  const min = opcoes.min ?? 1;
  const max = opcoes.max ?? 255;
  if (resultado.length < min || resultado.length > max) {
    throw new AppError(
      400,
      `${campo} deve ter entre ${min} e ${max} caracteres`,
      'VALIDACAO'
    );
  }
  return resultado;
}

export function validarSenha(senha: unknown): string {
  if (typeof senha !== 'string' || senha.length < 8 || senha.length > 128) {
    throw new AppError(400, 'A palavra-passe deve ter entre 8 e 128 caracteres', 'SENHA_INVALIDA');
  }
  return senha;
}

export function validarPreco(value: unknown): number {
  const preco = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''));
  if (!Number.isFinite(preco) || preco <= 0 || preco > 1_000_000) {
    throw new AppError(400, 'Preço inválido', 'PRECO_INVALIDO');
  }
  return Math.round((preco + Number.EPSILON) * 100) / 100;
}

export function validarInteiro(
  value: unknown,
  campo: string,
  opcoes: { min?: number; max?: number } = {}
): number {
  const numero = typeof value === 'number' ? value : Number(value);
  const min = opcoes.min ?? Number.MIN_SAFE_INTEGER;
  const max = opcoes.max ?? Number.MAX_SAFE_INTEGER;
  if (!Number.isInteger(numero) || numero < min || numero > max) {
    throw new AppError(400, `${campo} inválido`, 'VALIDACAO');
  }
  return numero;
}

export function validarBooleano(value: unknown, padrao = false): boolean {
  if (value === undefined || value === null || value === '') return padrao;
  if (typeof value === 'boolean') return value;
  if (value === 'true' || value === '1' || value === 1) return true;
  if (value === 'false' || value === '0' || value === 0) return false;
  throw new AppError(400, 'Valor booleano inválido', 'VALIDACAO');
}

export function escaparHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function formatarMT(value: number): string {
  return `${value.toFixed(2)} MT`;
}
