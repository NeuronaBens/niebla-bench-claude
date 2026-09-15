import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  precio,
  clasificacionLarga,
  estrenoTexto,
  plural,
  listaEs,
  nombreCortoSeccion,
  nombreCortoSala,
  instagramUrl,
} from './formato.ts'

test('precio', () => {
  assert.equal(precio(0), 'Gratis')
  assert.equal(precio(4000), '$4.000')
  assert.equal(precio(28000), '$28.000')
  assert.equal(precio(8000), '$8.000')
})

test('clasificacionLarga', () => {
  assert.equal(clasificacionLarga('TE'), 'Todo espectador')
  assert.equal(clasificacionLarga('+14'), 'Mayores de 14 años')
  assert.equal(clasificacionLarga('+18'), 'Mayores de 18 años')
})

test('estrenoTexto', () => {
  assert.equal(estrenoTexto('mundial'), 'Estreno mundial')
  assert.equal(estrenoTexto('latinoamericano'), 'Estreno latinoamericano')
  assert.equal(estrenoTexto('nacional'), 'Estreno nacional')
})

test('plural', () => {
  assert.equal(plural(1, 'función', 'funciones'), '1 función')
  assert.equal(plural(3, 'función', 'funciones'), '3 funciones')
})

test('listaEs', () => {
  assert.equal(listaEs(['a']), 'a')
  assert.equal(listaEs(['a', 'b']), 'a y b')
  assert.equal(listaEs(['a', 'b', 'c']), 'a, b y c')
})

test('nombreCortoSeccion y nombreCortoSala', () => {
  assert.equal(nombreCortoSeccion('nocturna'), 'Nocturna')
  assert.equal(nombreCortoSala('galpon'), 'Galpón 7')
})

test('instagramUrl', () => {
  assert.equal(instagramUrl('@festivalniebla'), 'https://www.instagram.com/festivalniebla/')
})
