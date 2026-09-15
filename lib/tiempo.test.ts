import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  aMinutos,
  fechaDe,
  horaDe,
  diaSemana,
  nombreMes,
  fechaLarga,
  fechaLargaConAnio,
  describirFin,
  duracionTexto,
  duracionLarga,
  ahoraEnChile,
} from './tiempo.ts'

test('aMinutos difiere 480 minutos entre 16:00 y el día siguiente 00:00', () => {
  const a = aMinutos('2026-10-15T16:00')
  const b = aMinutos('2026-10-16T00:00')
  assert.equal(b - a, 480)
})

test('aMinutos lanza con formato inválido', () => {
  assert.throws(() => aMinutos('2026-10-15 16:00'))
  assert.throws(() => aMinutos('15/10/2026T16:00'))
})

test('fechaDe calcula correctamente cruzando medianoche', () => {
  const m = aMinutos('2026-10-16T23:30') + 105
  assert.equal(fechaDe(m), '2026-10-17')
})

test('horaDe con cero a la izquierda', () => {
  assert.equal(horaDe(aMinutos('2026-10-15T22:30') + 94), '00:04')
  assert.equal(horaDe(aMinutos('2026-10-16T23:30') + 105), '01:15')
  assert.equal(horaDe(aMinutos('2026-10-17T23:45') + 82), '01:07')
})

test('diaSemana en español, minúscula', () => {
  assert.equal(diaSemana('2026-10-15'), 'jueves')
  assert.equal(diaSemana('2026-10-18'), 'domingo')
})

test('nombreMes', () => {
  assert.equal(nombreMes('2026-10-15'), 'octubre')
})

test('fechaLarga y fechaLargaConAnio', () => {
  assert.equal(fechaLarga('2026-10-17'), 'sábado 17 de octubre')
  assert.equal(fechaLargaConAnio('2026-10-17'), 'sábado 17 de octubre de 2026')
})

test('describirFin sin cruce de medianoche', () => {
  const inicio = aMinutos('2026-10-15T19:30')
  const fin = inicio + 98
  const dia = { fecha: '2026-10-15' } as never
  const r = describirFin({ fin, dia, cruzaMedianoche: false })
  assert.deepEqual(r, { hora: '21:08', sufijo: null })
})

test('describirFin con cruce de medianoche (f39, termina domingo)', () => {
  const inicio = aMinutos('2026-10-17T23:45')
  const fin = inicio + 82
  const r = describirFin({ fin, dia: {} as never, cruzaMedianoche: true })
  assert.equal(r.hora, '01:07')
  assert.equal(r.sufijo, 'del domingo')
})

test('describirFin f10 termina viernes', () => {
  const inicio = aMinutos('2026-10-15T22:30')
  const fin = inicio + 94
  const r = describirFin({ fin, dia: {} as never, cruzaMedianoche: true })
  assert.equal(r.hora, '00:04')
  assert.equal(r.sufijo, 'del viernes')
})

test('duracionTexto y duracionLarga', () => {
  assert.equal(duracionTexto(98), '98 min')
  assert.equal(duracionLarga(98), '1 h 38 min')
  assert.equal(duracionLarga(60), '1 h')
  assert.equal(duracionLarga(45), '45 min')
})

test('ahoraEnChile convierte un instante UTC a minutos de pared en Chile', () => {
  const instante = new Date('2026-10-17T20:00:00Z')
  assert.equal(ahoraEnChile(instante), aMinutos('2026-10-17T17:00'))
})

test('ahoraEnChile con otros dos instantes', () => {
  assert.equal(ahoraEnChile(new Date('2026-10-16T03:00:00Z')), aMinutos('2026-10-16T00:00'))
  assert.equal(ahoraEnChile(new Date('2026-10-15T00:00:00Z')), aMinutos('2026-10-14T21:00'))
})
