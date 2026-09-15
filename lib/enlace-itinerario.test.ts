import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { construirPrograma } from './programa.ts'
import { codificarEnlace, decodificarEnlace } from './enlace-itinerario.ts'
import type { ProgramaCrudo } from './tipos.ts'

const crudo: ProgramaCrudo = JSON.parse(readFileSync(new URL('../data/programa.json', import.meta.url), 'utf8'))
const programa = construirPrograma(crudo)

test('codificarEnlace ordena por número', () => {
  assert.equal(codificarEnlace(['f05', 'f13', 'f09']), '/itinerario/compartido?f=05-09-13')
})

test('codificarEnlace con nombre', () => {
  assert.equal(
    codificarEnlace(['f05'], 'Carla'),
    '/itinerario/compartido?f=05&n=Carla'
  )
})

test('ida y vuelta', () => {
  const ids = ['f05', 'f13', 'f09', 'f22']
  const ruta = codificarEnlace(ids)
  const query = ruta.split('?')[1]
  const decoded = decodificarEnlace(new URLSearchParams(query), programa)
  assert.deepEqual(decoded.ids.slice().sort(), ids.slice().sort())
  assert.equal(decoded.invalidos, 0)
  assert.equal(decoded.malFormado, false)
})

test('f=05-05-09 da 2 ids sin duplicar', () => {
  const decoded = decodificarEnlace(new URLSearchParams('f=05-05-09'), programa)
  assert.equal(decoded.ids.length, 2)
})

test('f=05-99-xx da 1 id válido, 2 inválidos', () => {
  const decoded = decodificarEnlace(new URLSearchParams('f=05-99-xx'), programa)
  assert.deepEqual(decoded.ids, ['f05'])
  assert.equal(decoded.invalidos, 2)
})

test('f= vacío es mal formado', () => {
  const decoded = decodificarEnlace(new URLSearchParams('f='), programa)
  assert.equal(decoded.malFormado, true)
  assert.deepEqual(decoded.ids, [])
})

test('sin parámetro f es mal formado', () => {
  const decoded = decodificarEnlace(new URLSearchParams(''), programa)
  assert.equal(decoded.malFormado, true)
})

test('f=5 se interpreta como f05', () => {
  const decoded = decodificarEnlace(new URLSearchParams('f=5'), programa)
  assert.deepEqual(decoded.ids, ['f05'])
})

test('n=<b>hola</b> se conserva literal', () => {
  const decoded = decodificarEnlace(new URLSearchParams('f=05&n=%3Cb%3Ehola%3C%2Fb%3E'), programa)
  assert.equal(decoded.nombre, '<b>hola</b>')
})

test('longitud del parámetro con las 39 funciones', () => {
  const ruta = codificarEnlace(programa.funciones.map((f) => f.id))
  const paramF = ruta.split('?')[1].split('&')[0]
  const esperado = 'f=' + Array.from({ length: 39 }, (_, i) => String(i + 1).padStart(2, '0')).join('-')
  assert.equal(paramF.length, esperado.length)
  const origen = 'https://festivalniebla.cl'
  assert.ok((origen + ruta).length < 300)
})

test('nombre se recorta a 40 caracteres y colapsa espacios', () => {
  const largo = 'a'.repeat(60)
  const decoded = decodificarEnlace(new URLSearchParams(`f=05&n=${encodeURIComponent(largo)}`), programa)
  assert.equal(decoded.nombre?.length, 40)
})
