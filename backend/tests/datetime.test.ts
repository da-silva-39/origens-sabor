import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseDataHoraMaputo,
  validarHorarioReserva,
  janelaConflito,
  formatarDataHoraMaputo,
} from '../src/utils/datetime';

test('interpreta data local de Maputo como UTC+2', () => {
  const data = parseDataHoraMaputo('2026-11-20T19:00');
  assert.ok(data);
  assert.equal(data.toISOString(), '2026-11-20T17:00:00.000Z');
});

test('respeita datas com fuso explícito', () => {
  const data = parseDataHoraMaputo('2026-11-20T17:00:00.000Z');
  assert.ok(data);
  assert.equal(data.toISOString(), '2026-11-20T17:00:00.000Z');
});

test('rejeita datas inválidas', () => {
  assert.equal(parseDataHoraMaputo('2026-02-30T20:00'), null);
  assert.equal(parseDataHoraMaputo('ontem'), null);
  assert.equal(parseDataHoraMaputo(''), null);
});

test('valida antecedência mínima, horário e fecho', () => {
  const agora = new Date('2026-11-20T10:00:00.000Z');

  const cedoDemais = parseDataHoraMaputo('2026-11-20T11:30')!;
  assert.equal(validarHorarioReserva(cedoDemais, agora).valido, false);

  const valido = parseDataHoraMaputo('2026-11-20T19:00')!;
  assert.equal(validarHorarioReserva(valido, agora).valido, true);

  const aposFecho = parseDataHoraMaputo('2026-11-20T22:15')!;
  assert.equal(validarHorarioReserva(aposFecho, agora).valido, false);
});

test('aplica horário de domingo', () => {
  const agora = new Date('2026-11-20T10:00:00.000Z');
  const domingoAntes = parseDataHoraMaputo('2026-11-22T08:30')!;
  const domingoValido = parseDataHoraMaputo('2026-11-22T09:30')!;

  assert.equal(validarHorarioReserva(domingoAntes, agora).valido, false);
  assert.equal(validarHorarioReserva(domingoValido, agora).valido, true);
});

test('janela de conflito cobre a duração da reserva', () => {
  const { inicio, fim } = janelaConflito(new Date('2026-11-20T18:00:00.000Z'));
  assert.equal(fim.getTime() - inicio.getTime(), 2 * 120 * 60 * 1000);
});

test('formata data/hora no fuso de Maputo', () => {
  const data = new Date('2026-11-20T17:00:00.000Z');
  assert.match(formatarDataHoraMaputo(data), /20\/11\/\d{2,4}, 19:00/);
});
