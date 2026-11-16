import test from 'node:test';
import assert from 'node:assert/strict';
import {
  escaparHtml,
  formatarTelefone,
  normalizarEmail,
  validarBooleano,
  validarEmail,
  validarPreco,
  validarTelefoneMocambique,
} from '../src/utils/validators';
import { AppError } from '../src/utils/errors';

test('normaliza e valida e-mail', () => {
  assert.equal(normalizarEmail('  Cliente@Example.COM '), 'cliente@example.com');
  assert.equal(validarEmail('cliente@example.com'), true);
  assert.equal(validarEmail('cliente@example'), false);
});

test('valida e formata telefones moçambicanos', () => {
  assert.equal(validarTelefoneMocambique('841234567'), true);
  assert.equal(validarTelefoneMocambique('+258841234567'), true);
  assert.equal(validarTelefoneMocambique('123'), false);
  assert.equal(formatarTelefone('841234567'), '+258841234567');
  assert.equal(formatarTelefone('+258841234567'), '+258841234567');
});

test('valida preços e booleanos', () => {
  assert.equal(validarPreco('450.50'), 450.5);
  assert.throws(() => validarPreco('-1'), AppError);
  assert.throws(() => validarPreco('abc'), AppError);

  assert.equal(validarBooleano('true'), true);
  assert.equal(validarBooleano('0'), false);
  assert.throws(() => validarBooleano('talvez'), AppError);
});

test('escapa HTML em conteúdos de e-mail', () => {
  const entrada = '<script>alert("x")</script>';
  const saida = escaparHtml(entrada);
  assert.equal(
    saida,
    '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
  );
});
