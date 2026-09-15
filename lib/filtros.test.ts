import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { construirPrograma } from './programa.ts'
import { leerFiltros, escribirFiltros, filtrarFunciones } from './filtros.ts'
import type { ProgramaCrudo } from './tipos.ts'

const crudo: ProgramaCrudo = JSON.parse(readFileSync(new URL('../data/programa.json', import.meta.url), 'utf8'))
const programa = construirPrograma(crudo)

function idsPara(params: string): string[] {
  const f = leerFiltros(new URLSearchParams(params), programa)
  return filtrarFunciones(programa.funciones, f).map((x) => x.id)
}

test('sin filtros: 39 funciones', () => {
  assert.equal(idsPara('').length, 39)
})

test('filtro por día', () => {
  assert.equal(idsPara('dia=jueves').length, 10)
  assert.equal(idsPara('dia=viernes').length, 12)
  assert.equal(idsPara('dia=sabado').length, 17)
})

test('filtro por sección', () => {
  assert.equal(idsPara('seccion=competencia').length, 16)
  assert.equal(idsPara('seccion=panorama').length, 9)
  assert.equal(idsPara('seccion=nocturna').length, 8)
  assert.equal(idsPara('seccion=costa').length, 6)
})

test('combinaciones', () => {
  assert.deepEqual(idsPara('dia=viernes&seccion=nocturna'), ['f19', 'f21', 'f22'])
  assert.equal(idsPara('dia=sabado&seccion=competencia').length, 8)
  assert.deepEqual(idsPara('dia=jueves&seccion=nocturna'), ['f10'])
})

test('viernes no incluye f09 ni f10', () => {
  const viernes = idsPara('dia=viernes')
  assert.ok(!viernes.includes('f09'))
  assert.ok(!viernes.includes('f10'))
})

test('día inválido se ignora', () => {
  assert.equal(idsPara('dia=domingo').length, 39)
  assert.equal(idsPara('dia=Viernes').length, 12)
  assert.equal(idsPara('dia=').length, 39)
})

test('sección inválida se ignora, sábado con tilde es alias', () => {
  assert.equal(idsPara('seccion=xyz').length, 39)
  assert.equal(idsPara('dia=s%C3%A1bado').length, 17)
})

test('escribirFiltros', () => {
  assert.equal(escribirFiltros({ dia: null, seccion: null }), '')
  assert.equal(escribirFiltros({ dia: 'viernes', seccion: 'nocturna' }), '?dia=viernes&seccion=nocturna')
  assert.equal(escribirFiltros({ dia: null, seccion: 'nocturna' }), '?seccion=nocturna')
})

test('leerFiltros con params nulos', () => {
  assert.deepEqual(leerFiltros(null, programa), { dia: null, seccion: null })
})
