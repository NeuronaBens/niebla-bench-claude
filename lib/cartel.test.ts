import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { construirPrograma } from './programa.ts'
import { parametrosCartel, motivoDe, MOTIVO_POR_DEFECTO } from './cartel.ts'
import type { ProgramaCrudo } from './tipos.ts'

const crudo: ProgramaCrudo = JSON.parse(readFileSync(new URL('../data/programa.json', import.meta.url), 'utf8'))
const programa = construirPrograma(crudo)

test('determinismo: dos llamadas dan los mismos parámetros', () => {
  const pelicula = programa.peliculaPorId('vidrio')!
  const a = parametrosCartel(pelicula)
  const b = parametrosCartel(pelicula)
  assert.deepEqual(a.luz, b.luz)
  assert.equal(a.yHorizonte, b.yHorizonte)
  assert.deepEqual(a.bandas, b.bandas)
  assert.equal(a.motivo, b.motivo)
})

test('las 24 películas tienen un motivo definido y distinto entre sí', () => {
  const motivos = programa.peliculas.map((p) => motivoDe(p.id))
  assert.equal(motivos.length, 24)
  assert.equal(new Set(motivos).size, 24)
  assert.ok(!motivos.includes(undefined as never))
})

test('película sin motivo en el mapa usa faro (respaldo)', () => {
  assert.equal(motivoDe('pelicula-inventada-para-test'), MOTIVO_POR_DEFECTO)
})

test('número de bandas de niebla según duración', () => {
  const brumaMil9k87 = programa.peliculaPorId('bruma-1987')!
  const vidrio = programa.peliculaPorId('vidrio')!
  assert.equal(brumaMil9k87.duracionMin, 63)
  assert.equal(vidrio.duracionMin, 121)
  assert.equal(parametrosCartel(brumaMil9k87).bandas.length, 3)
  assert.equal(parametrosCartel(vidrio).bandas.length, 7)
})

test('luces de horizonte = cantidad de países', () => {
  const cordillera = programa.peliculaPorId('cordillera-de-papel')!
  const vidrio = programa.peliculaPorId('vidrio')!
  assert.equal(cordillera.pais, 'Chile, Francia')
  assert.equal(parametrosCartel(cordillera).lucesHorizonte, 2)
  assert.equal(parametrosCartel(vidrio).lucesHorizonte, 1)
})

test('doble anillo solo en los estrenos mundiales', () => {
  const mundiales = programa.peliculas.filter((p) => p.estreno === 'mundial')
  assert.equal(mundiales.length, 9)
  for (const p of programa.peliculas) {
    const esperado = p.estreno === 'mundial'
    assert.equal(parametrosCartel(p).luz.doble, esperado, p.id)
  }
})

test('paleta corresponde a la sección de la película', () => {
  const p1 = programa.peliculaPorId('la-hora-azul-del-puerto')! // competencia
  const p2 = programa.peliculaPorId('mar-negro')! // panorama
  assert.equal(parametrosCartel(p1).paleta.luz, '#F2A33A')
  assert.equal(parametrosCartel(p2).paleta.luz, '#3DC47E')
})
