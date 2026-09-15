import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { construirPrograma } from './programa.ts'
import { evaluarItinerario, avisosAlAgregar } from './reglas-itinerario.ts'
import type { ProgramaCrudo } from './tipos.ts'

const crudo: ProgramaCrudo = JSON.parse(readFileSync(new URL('../data/programa.json', import.meta.url), 'utf8'))
const programa = construirPrograma(crudo)

function tipoDe(resultado: ReturnType<typeof evaluarItinerario>, a: string, b: string): string | null {
  const aviso = resultado.avisos.find(
    (av) =>
      (av.tipo === 'tope' || av.tipo === 'noAlcanza' || av.tipo === 'conversatorio') &&
      ((av.a === a && av.b === b) || (av.a === b && av.b === a))
  )
  return aviso?.tipo ?? null
}

// --- 8.2 Topes ---

test('T1: f05+f06 tope', () => {
  const r = evaluarItinerario(['f05', 'f06'], programa)
  assert.equal(tipoDe(r, 'f05', 'f06'), 'tope')
})

test('T2: f02+f04 tope por 1 minuto', () => {
  const r = evaluarItinerario(['f02', 'f04'], programa)
  const aviso = r.avisos.find((a) => a.tipo === 'tope')
  assert.ok(aviso && aviso.tipo === 'tope')
  assert.equal((aviso as { solapeMin: number }).solapeMin, 1)
})

test('T3: f09+f10 tope (cruzan medianoche, comparación de minutos absolutos)', () => {
  const r = evaluarItinerario(['f09', 'f10'], programa)
  assert.equal(tipoDe(r, 'f09', 'f10'), 'tope')
})

test('T4: f21+f22 tope', () => {
  const r = evaluarItinerario(['f21', 'f22'], programa)
  assert.equal(tipoDe(r, 'f21', 'f22'), 'tope')
})

test('T5: f05+f06+f08 tres topes', () => {
  const r = evaluarItinerario(['f05', 'f06', 'f08'], programa)
  const topes = r.avisos.filter((a) => a.tipo === 'tope')
  assert.equal(topes.length, 3)
  assert.equal(r.problemas, 3)
  assert.equal(r.avisos.some((a) => a.tipo === 'noAlcanza'), false)
})

test('T6: f20+f22 tope por 2 minutos', () => {
  const r = evaluarItinerario(['f20', 'f22'], programa)
  const aviso = r.avisos.find((a) => a.tipo === 'tope')
  assert.ok(aviso)
  assert.equal((aviso as { solapeMin: number }).solapeMin, 2)
})

// --- 8.3 No alcanza ---

test('N1: f03+f05 no alcanza, sin aviso de conversatorio aparte', () => {
  const r = evaluarItinerario(['f03', 'f05'], programa)
  assert.equal(tipoDe(r, 'f03', 'f05'), 'noAlcanza')
  assert.equal(
    r.avisos.filter((a) => a.tipo !== 'agotada' && a.tipo !== 'peliculaRepetida' && a.a === 'f03' && a.b === 'f05').length,
    1
  )
})

test('N2: f07+f09 no alcanza por 1 minuto', () => {
  const r = evaluarItinerario(['f07', 'f09'], programa)
  const aviso = r.avisos.find((a) => a.tipo === 'noAlcanza')
  assert.ok(aviso && aviso.tipo === 'noAlcanza')
  assert.equal(aviso.faltanMin, 1)
})

test('N3: f19+f21 no alcanza', () => {
  const r = evaluarItinerario(['f19', 'f21'], programa)
  assert.equal(tipoDe(r, 'f19', 'f21'), 'noAlcanza')
})

test('N4: f25+f27 no alcanza (aunque f25 tiene conversatorio, un solo aviso)', () => {
  const r = evaluarItinerario(['f25', 'f27'], programa)
  assert.equal(tipoDe(r, 'f25', 'f27'), 'noAlcanza')
  const aviso = r.avisos.find((a) => a.tipo === 'noAlcanza')
  assert.ok(aviso && aviso.tipo === 'noAlcanza')
  assert.equal(aviso.faltanMin, 1)
})

test('N5: f35+f38 no alcanza', () => {
  const r = evaluarItinerario(['f35', 'f38'], programa)
  assert.equal(tipoDe(r, 'f35', 'f38'), 'noAlcanza')
})

// --- 8.4 Conversatorio ---

test('C1: f13+f16 te perderías el conversatorio, 0 problemas', () => {
  const r = evaluarItinerario(['f13', 'f16'], programa)
  assert.equal(tipoDe(r, 'f13', 'f16'), 'conversatorio')
  assert.equal(r.problemas, 0)
  const aviso = r.avisos.find((a) => a.tipo === 'conversatorio')
  assert.ok(aviso && aviso.tipo === 'conversatorio')
  assert.equal(aviso.salidaMax, programa.funcionPorId('f16')!.inicio - programa.traslado('teatro', 'muelle'))
})

test('C2: f13+f17 te perderías el conversatorio, 0 problemas', () => {
  const r = evaluarItinerario(['f13', 'f17'], programa)
  assert.equal(tipoDe(r, 'f13', 'f17'), 'conversatorio')
  assert.equal(r.problemas, 0)
})

test('C3: f31+f34 te perderías el conversatorio; f31 agotada', () => {
  const r = evaluarItinerario(['f31', 'f34'], programa)
  assert.equal(tipoDe(r, 'f31', 'f34'), 'conversatorio')
  assert.equal(r.problemas, 0)
  assert.ok(r.avisos.some((a) => a.tipo === 'agotada' && a.funcion === 'f31'))
})

// --- 8.5 Sin aviso ---

test('OK1: f14+f16 misma sala, termina justo cuando empieza: sin aviso', () => {
  const r = evaluarItinerario(['f14', 'f16'], programa)
  assert.equal(tipoDe(r, 'f14', 'f16'), null)
})

test('OK2: f14+f17 sin aviso', () => {
  const r = evaluarItinerario(['f14', 'f17'], programa)
  assert.equal(tipoDe(r, 'f14', 'f17'), null)
})

test('OK3: f16+f19 sin aviso', () => {
  const r = evaluarItinerario(['f16', 'f19'], programa)
  assert.equal(tipoDe(r, 'f16', 'f19'), null)
})

test('OK4: f38+f39 misma sala, sin aviso', () => {
  const r = evaluarItinerario(['f38', 'f39'], programa)
  assert.equal(tipoDe(r, 'f38', 'f39'), null)
})

test('OK5: f03+f06 sin aviso (conversatorio de f03 termina justo cuando empieza f06)', () => {
  const r = evaluarItinerario(['f03', 'f06'], programa)
  assert.equal(tipoDe(r, 'f03', 'f06'), null)
})

test('OK6: f25+f28 sin aviso', () => {
  const r = evaluarItinerario(['f25', 'f28'], programa)
  assert.equal(tipoDe(r, 'f25', 'f28'), null)
})

test('OK7: f10+f11 sin aviso (f10 termina 00:04 viernes, f11 es viernes 16:30)', () => {
  const r = evaluarItinerario(['f10', 'f11'], programa)
  assert.equal(tipoDe(r, 'f10', 'f11'), null)
})

test('OK8: f22+f23 sin aviso de tope ni traslado (sí agotada en f22)', () => {
  const r = evaluarItinerario(['f22', 'f23'], programa)
  assert.equal(tipoDe(r, 'f22', 'f23'), null)
  assert.ok(r.avisos.some((a) => a.tipo === 'agotada' && a.funcion === 'f22'))
})

// --- 8.6 Itinerario combinado (sábado largo) ---

test('8.6: itinerario combinado del sábado', () => {
  const ids = ['f23', 'f25', 'f28', 'f31', 'f34', 'f38', 'f39']
  const r = evaluarItinerario(ids, programa)
  assert.equal(tipoDe(r, 'f23', 'f25'), 'tope')
  assert.equal(tipoDe(r, 'f25', 'f28'), null)
  assert.equal(tipoDe(r, 'f28', 'f31'), null)
  assert.equal(tipoDe(r, 'f31', 'f34'), 'conversatorio')
  assert.equal(tipoDe(r, 'f34', 'f38'), null)
  assert.equal(tipoDe(r, 'f38', 'f39'), null)
  assert.ok(r.avisos.some((a) => a.tipo === 'agotada' && a.funcion === 'f31'))
  assert.equal(r.problemas, 1)

  const total = r.funciones.reduce((acc, f) => acc + f.precio, 0)
  assert.equal(total, 7 * 4000)
})

// --- Extra: casos P1-P6, S1-S2 (docs/DETALLE.md 14.1) ---

test('P1: {f13,f16,f17} -> tope f16-f17, conversatorio f13->f16 y f13->f17, problemas 1', () => {
  const r = evaluarItinerario(['f13', 'f16', 'f17'], programa)
  assert.equal(tipoDe(r, 'f16', 'f17'), 'tope')
  assert.equal(tipoDe(r, 'f13', 'f16'), 'conversatorio')
  assert.equal(tipoDe(r, 'f13', 'f17'), 'conversatorio')
  assert.equal(r.problemas, 1)

  const salida16 = r.avisos.find((a) => a.tipo === 'conversatorio' && a.b === 'f16')
  assert.ok(salida16 && salida16.tipo === 'conversatorio')
  assert.equal(salida16.salidaMax, programa.funcionPorId('f16')!.inicio - programa.traslado('teatro', 'muelle'))

  const salida17 = r.avisos.find((a) => a.tipo === 'conversatorio' && a.b === 'f17')
  assert.ok(salida17 && salida17.tipo === 'conversatorio')
  assert.equal(salida17.salidaMax, programa.funcionPorId('f17')!.inicio - programa.traslado('teatro', 'terraza'))
})

test('P2: {f05,f06,f08} -> 3 topes, problemas 3, sin noAlcanza', () => {
  const r = evaluarItinerario(['f05', 'f06', 'f08'], programa)
  assert.equal(r.avisos.filter((a) => a.tipo === 'tope').length, 3)
  assert.equal(r.problemas, 3)
  assert.equal(r.avisos.some((a) => a.tipo === 'noAlcanza'), false)
})

test('P3: {f01,f25} -> peliculaRepetida, problemas 0', () => {
  const r = evaluarItinerario(['f01', 'f25'], programa)
  const aviso = r.avisos.find((a) => a.tipo === 'peliculaRepetida')
  assert.ok(aviso && aviso.tipo === 'peliculaRepetida')
  assert.equal(aviso.peliculaId, 'el-canto-de-las-redes')
  assert.deepEqual(aviso.funciones.sort(), ['f01', 'f25'])
  assert.equal(r.problemas, 0)
})

test('P4: avisosAlAgregar con {f05} para las funciones del jueves', () => {
  const seleccion = ['f05']
  const esperado: Record<string, string | null> = {
    f01: null,
    f02: null,
    f03: 'noAlcanza',
    f04: 'tope',
    f06: 'tope',
    f07: 'tope',
    f08: 'tope',
    f09: null,
    f10: null,
  }
  for (const [id, tipo] of Object.entries(esperado)) {
    const avisos = avisosAlAgregar(seleccion, id, programa)
    if (tipo === null) {
      assert.equal(avisos.length, 0, `esperaba sin aviso para ${id}`)
    } else {
      assert.ok(
        avisos.some((a) => a.tipo === tipo),
        `esperaba ${tipo} para ${id}`
      )
    }
  }
})

test('P4b: avisosAlAgregar con {f13} no previsualiza el conversatorio en f16', () => {
  const avisos = avisosAlAgregar(['f13'], 'f16', programa)
  assert.equal(avisos.length, 0)
})

test('P5: ids inválidos y repetidos se ignoran', () => {
  const r = evaluarItinerario(['f05', 'f99', 'f05', 'no-existe'], programa)
  assert.equal(r.funciones.length, 1)
  assert.equal(r.funciones[0].id, 'f05')
})

test('P6: el orden de entrada no altera el resultado', () => {
  const a = evaluarItinerario(['f23', 'f25', 'f28', 'f31', 'f34', 'f38', 'f39'], programa)
  const b = evaluarItinerario(['f39', 'f23', 'f34', 'f31', 'f38', 'f28', 'f25'], programa)
  assert.deepEqual(
    a.funciones.map((f) => f.id),
    b.funciones.map((f) => f.id)
  )
  assert.equal(a.problemas, b.problemas)
  assert.equal(a.avisos.length, b.avisos.length)
})

// --- Programa sintético para casos límite exactos (S1, S2) ---

function programaSintetico(inicioB: string, duracionB: number, conversatorioA: number, salaB: 'teatro' | 'muelle') {
  const sintetico: ProgramaCrudo = {
    festival: {
      nombre: 'Sintético',
      edicion: 1,
      ciudad: 'Test',
      region: 'Test',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-01-01',
      zonaHoraria: 'America/Santiago',
      entradas: { moneda: 'CLP', general: 4000, aireLibre: 0, venta: 'Test' },
      contacto: { correo: 'a@a.cl', instagram: '@a' },
    },
    salas: [
      { id: 'teatro', nombre: 'Teatro', direccion: 'X', capacidad: 100, aireLibre: false },
      { id: 'muelle', nombre: 'Muelle', direccion: 'Y', capacidad: 100, aireLibre: false },
      { id: 'galpon', nombre: 'Galpón', direccion: 'Z', capacidad: 100, aireLibre: false },
      { id: 'terraza', nombre: 'Terraza', direccion: 'W', capacidad: 100, aireLibre: true },
    ],
    trasladosMin: {
      descripcion: 'Test',
      teatro: { teatro: 0, muelle: 10, galpon: 5, terraza: 5 },
      muelle: { teatro: 10, muelle: 0, galpon: 5, terraza: 5 },
      galpon: { teatro: 5, muelle: 5, galpon: 0, terraza: 5 },
      terraza: { teatro: 5, muelle: 5, galpon: 5, terraza: 0 },
    },
    secciones: [{ id: 'competencia', nombre: 'Competencia', descripcion: 'Test' }],
    peliculas: [
      {
        id: 'pelicula-a',
        titulo: 'Película A',
        direccion: 'Dir',
        pais: 'Chile',
        anio: 2026,
        duracionMin: 120,
        seccion: 'competencia',
        clasificacion: 'TE',
        estreno: 'nacional',
        sinopsis: 'Test',
      },
      {
        id: 'pelicula-b',
        titulo: 'Película B',
        direccion: 'Dir',
        pais: 'Chile',
        anio: 2026,
        duracionMin: duracionB,
        seccion: 'competencia',
        clasificacion: 'TE',
        estreno: 'nacional',
        sinopsis: 'Test',
      },
    ],
    funciones: [
      {
        id: 'f01',
        peliculaId: 'pelicula-a',
        salaId: 'teatro',
        inicio: '2026-01-01T18:00',
        ...(conversatorioA > 0 ? { conversatorioMin: conversatorioA } : {}),
      },
      { id: 'f02', peliculaId: 'pelicula-b', salaId: salaB, inicio: inicioB },
    ],
  }
  return construirPrograma(sintetico)
}

test('S1: margen = traslado -> sin aviso; margen = traslado-1 -> noAlcanza', () => {
  const p1 = programaSintetico('2026-01-01T20:10', 60, 0, 'muelle')
  const r1 = evaluarItinerario(['f01', 'f02'], p1)
  assert.equal(r1.avisos.length, 0)

  const p2 = programaSintetico('2026-01-01T20:09', 60, 0, 'muelle')
  const r2 = evaluarItinerario(['f01', 'f02'], p2)
  const aviso = r2.avisos.find((a) => a.tipo === 'noAlcanza')
  assert.ok(aviso && aviso.tipo === 'noAlcanza')
  assert.equal(aviso.faltanMin, 1)
})

test('S2: conversatorio 20 en misma sala; margen=20 sin aviso, margen=19 con aviso', () => {
  const p1 = programaSintetico('2026-01-01T20:20', 60, 20, 'teatro')
  const r1 = evaluarItinerario(['f01', 'f02'], p1)
  assert.equal(r1.avisos.length, 0)

  const p2 = programaSintetico('2026-01-01T20:19', 60, 20, 'teatro')
  const r2 = evaluarItinerario(['f01', 'f02'], p2)
  const aviso = r2.avisos.find((a) => a.tipo === 'conversatorio')
  assert.ok(aviso && aviso.tipo === 'conversatorio')
  assert.equal(aviso.minutosDeConversatorio, 19)
})

// --- E6-H6 (Could): plan de lluvia ---

test('lluvia: f14+f17 alcanza normal, no alcanzaría en el Galpón 7', () => {
  const r = evaluarItinerario(['f14', 'f17'], programa, { lluvia: true })
  const aviso = r.avisos.find((a) => a.tipo === 'lluvia')
  assert.ok(aviso && aviso.tipo === 'lluvia')
  assert.equal(aviso.alcanzaNormal, true)
  assert.equal(aviso.alcanzaConLluvia, false)
  assert.equal(aviso.trasladoConLluvia, 15)
})

test('lluvia: sin terraza no aparece aviso', () => {
  const r = evaluarItinerario(['f16', 'f19'], programa, { lluvia: true })
  assert.equal(r.avisos.some((a) => a.tipo === 'lluvia'), false)
})

// --- Tramos ---

test('tramos solo entre funciones consecutivas del mismo día', () => {
  const r = evaluarItinerario(['f10', 'f11'], programa)
  assert.equal(r.tramos.length, 0)
})
