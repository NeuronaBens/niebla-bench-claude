import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { construirPrograma } from './programa.ts'
import { horaDe, describirFin } from './tiempo.ts'
import type { ProgramaCrudo } from './tipos.ts'

const crudo: ProgramaCrudo = JSON.parse(readFileSync(new URL('../data/programa.json', import.meta.url), 'utf8'))
const programa = construirPrograma(crudo)

test('conteos generales de la sección 5 del backlog', () => {
  assert.equal(programa.dias.length, 3)
  assert.equal(programa.peliculas.length, 24)
  assert.equal(programa.funciones.length, 39)
  assert.equal(programa.salas.length, 4)
  assert.equal(programa.secciones.length, 4)
})

test('funciones por día', () => {
  assert.equal(programa.funcionesDelDia('jueves').length, 10)
  assert.equal(programa.funcionesDelDia('viernes').length, 12)
  assert.equal(programa.funcionesDelDia('sabado').length, 17)
})

test('funciones por sección', () => {
  const porSeccion = (id: string) => programa.funciones.filter((f) => f.seccion.id === id).length
  assert.equal(porSeccion('competencia'), 16)
  assert.equal(porSeccion('panorama'), 9)
  assert.equal(porSeccion('nocturna'), 8)
  assert.equal(porSeccion('costa'), 6)
})

test('funciones por día y sección', () => {
  const n = (dia: string, seccion: string) =>
    programa.funciones.filter((f) => f.dia.slug === dia && f.seccion.id === seccion).length
  assert.equal(n('jueves', 'competencia'), 4)
  assert.equal(n('jueves', 'panorama'), 3)
  assert.equal(n('jueves', 'nocturna'), 1)
  assert.equal(n('jueves', 'costa'), 2)
  assert.equal(n('viernes', 'competencia'), 4)
  assert.equal(n('viernes', 'panorama'), 3)
  assert.equal(n('viernes', 'nocturna'), 3)
  assert.equal(n('viernes', 'costa'), 2)
  assert.equal(n('sabado', 'competencia'), 8)
  assert.equal(n('sabado', 'panorama'), 3)
  assert.equal(n('sabado', 'nocturna'), 4)
  assert.equal(n('sabado', 'costa'), 2)
})

test('películas por sección', () => {
  assert.equal(programa.peliculasDeSeccion('competencia').length, 8)
  assert.equal(programa.peliculasDeSeccion('panorama').length, 6)
  assert.equal(programa.peliculasDeSeccion('nocturna').length, 5)
  assert.equal(programa.peliculasDeSeccion('costa').length, 5)
})

test('estrenos', () => {
  const n = (e: string) => programa.peliculas.filter((p) => p.estreno === e).length
  assert.equal(n('mundial'), 9)
  assert.equal(n('latinoamericano'), 8)
  assert.equal(n('nacional'), 7)
})

test('películas con una sola función (9) y con dos (15)', () => {
  const conUna = programa.peliculas.filter((p) => programa.funcionesDePelicula(p.id).length === 1)
  const conDos = programa.peliculas.filter((p) => programa.funcionesDePelicula(p.id).length === 2)
  assert.equal(conUna.length, 9)
  assert.equal(conDos.length, 15)
})

test('funciones con conversatorio', () => {
  const con = programa.funciones.filter((f) => f.conversatorioMin > 0).map((f) => f.id)
  assert.deepEqual(con.sort(), ['f03', 'f13', 'f25', 'f31'])
  assert.equal(programa.funcionPorId('f03')!.conversatorioMin, 20)
  assert.equal(programa.funcionPorId('f13')!.conversatorioMin, 25)
  assert.equal(programa.funcionPorId('f25')!.conversatorioMin, 30)
  assert.equal(programa.funcionPorId('f31')!.conversatorioMin, 30)
})

test('funciones agotadas', () => {
  const agotadas = programa.funciones.filter((f) => f.agotada).map((f) => f.id)
  assert.deepEqual(agotadas.sort(), ['f22', 'f31'])
})

test('funciones al aire libre', () => {
  const aireLibre = programa.funciones.filter((f) => f.sala.aireLibre).map((f) => f.id)
  assert.deepEqual(aireLibre.sort(), ['f07', 'f17', 'f21', 'f33', 'f37'])
  for (const f of aireLibre) assert.equal(programa.funcionPorId(f)!.precio, 0)
})

test('funciones con nota', () => {
  const conNota = programa.funciones.filter((f) => f.nota).map((f) => f.id)
  assert.deepEqual(conNota.sort(), ['f05', 'f36'])
})

test('títulos originales distintos (6)', () => {
  const conTitOriginal = programa.peliculas.filter((p) => p.tituloOriginal)
  assert.equal(conTitOriginal.length, 6)
})

test('horas de término de las 39 funciones contra la tabla 8.1 del backlog', () => {
  const esperado: Record<string, string> = {
    f01: '17:23',
    f02: '18:16',
    f03: '19:24',
    f04: '19:51',
    f05: '21:08',
    f06: '22:01',
    f07: '21:56',
    f08: '22:27',
    f09: '00:13',
    f10: '00:04',
    f11: '17:42',
    f12: '18:49',
    f13: '19:52',
    f14: '20:05',
    f15: '20:28',
    f16: '21:13',
    f17: '21:42',
    f18: '22:19',
    f19: '22:59',
    f20: '23:32',
    f21: '00:22',
    f22: '01:15',
    f23: '13:19',
    f24: '13:33',
    f25: '14:23',
    f26: '15:16',
    f27: '16:14',
    f28: '17:01',
    f29: '17:36',
    f30: '18:05',
    f31: '19:08',
    f32: '19:52',
    f33: '20:44',
    f34: '21:09',
    f35: '21:49',
    f36: '22:41',
    f37: '22:44',
    f38: '23:34',
    f39: '01:07',
  }
  for (const [id, horaEsperada] of Object.entries(esperado)) {
    const f = programa.funcionPorId(id)!
    assert.equal(horaDe(f.fin), horaEsperada, `término de ${id}`)
  }
})

test('cruces de medianoche (5)', () => {
  const cruzan = programa.funciones.filter((f) => f.cruzaMedianoche).map((f) => f.id)
  assert.deepEqual(cruzan.sort(), ['f09', 'f10', 'f21', 'f22', 'f39'])
})

test('f22 aparece en viernes y f39 en sábado aunque crucen medianoche', () => {
  assert.equal(programa.funcionPorId('f22')!.dia.slug, 'viernes')
  assert.equal(programa.funcionPorId('f39')!.dia.slug, 'sabado')
  assert.equal(describirFin(programa.funcionPorId('f22')!).sufijo, 'del sábado')
  assert.equal(describirFin(programa.funcionPorId('f39')!).sufijo, 'del domingo')
})

test('traslado es simétrico y 0 en la misma sala', () => {
  assert.equal(programa.traslado('teatro', 'muelle'), 12)
  assert.equal(programa.traslado('muelle', 'teatro'), 12)
  assert.equal(programa.traslado('galpon', 'galpon'), 0)
})

test('orden del programa: cronológico, luego por sala', () => {
  for (let i = 1; i < programa.funciones.length; i++) {
    const a = programa.funciones[i - 1]
    const b = programa.funciones[i]
    assert.ok(a.inicio <= b.inicio)
  }
})

test('construirPrograma lanza con datos alterados en memoria (nunca con el archivo)', () => {
  const alterado: ProgramaCrudo = JSON.parse(JSON.stringify(crudo))
  alterado.funciones[0].peliculaId = 'no-existe'
  assert.throws(() => construirPrograma(alterado))

  const alterado2: ProgramaCrudo = JSON.parse(JSON.stringify(crudo))
  alterado2.funciones[0].salaId = 'no-existe' as never
  assert.throws(() => construirPrograma(alterado2))

  const alterado3: ProgramaCrudo = JSON.parse(JSON.stringify(crudo))
  alterado3.peliculas[0].seccion = 'no-existe' as never
  assert.throws(() => construirPrograma(alterado3))

  const alterado4: ProgramaCrudo = JSON.parse(JSON.stringify(crudo))
  delete (alterado4.trasladosMin.teatro as Record<string, number>).muelle
  assert.throws(() => construirPrograma(alterado4))

  const alterado5: ProgramaCrudo = JSON.parse(JSON.stringify(crudo))
  alterado5.funciones[0].id = 'x1'
  assert.throws(() => construirPrograma(alterado5))
})
