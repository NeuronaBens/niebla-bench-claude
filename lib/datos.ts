import programaJson from '@/data/programa.json'
import type {
  Clasificacion,
  DiaFestival,
  Estreno,
  Funcion,
  FuncionDatos,
  Pelicula,
  Programa,
  Sala,
  SalaId,
  Seccion,
  SeccionId,
} from './tipos'
import { crearDia, fechaDe, parsearInicio, redondearHoraArriba, terminaDiaSiguienteDe, truncarHora } from './tiempo'

// Carga y valida `data/programa.json`. Ningún componente importa el JSON
// directamente: siempre pasa por este módulo, que corre al evaluarse (en
// build, en servidor y en cliente) y lanza un error descriptivo si los datos
// no son consistentes.

const SALA_IDS: SalaId[] = ['teatro', 'muelle', 'galpon', 'terraza']
const SECCION_IDS: SeccionId[] = ['competencia', 'panorama', 'nocturna', 'costa']
const ESTRENOS: Estreno[] = ['mundial', 'nacional', 'latinoamericano']
const CLASIFICACIONES: Clasificacion[] = ['TE', '+14', '+18']
const RE_ID_FUNCION = /^[a-z0-9]+$/

function comprobarIdsUnicos(items: { id: string }[], nombre: string): void {
  const vistos = new Set<string>()
  for (const item of items) {
    if (vistos.has(item.id)) throw new Error(`data/programa.json: id duplicado "${item.id}" en ${nombre}.`)
    vistos.add(item.id)
  }
}

function validarPrograma(data: unknown): void {
  const p = data as {
    salas: Sala[]
    secciones: Seccion[]
    peliculas: Pelicula[]
    funciones: FuncionDatos[]
    trasladosMin: Record<string, Record<string, number> | string>
  }
  if (!p || typeof p !== 'object') throw new Error('data/programa.json: estructura inválida.')

  comprobarIdsUnicos(p.salas, 'salas')
  comprobarIdsUnicos(p.secciones, 'secciones')
  comprobarIdsUnicos(p.peliculas, 'peliculas')
  comprobarIdsUnicos(p.funciones, 'funciones')

  const idsSalas = new Set(p.salas.map((s) => s.id))
  const idsSecciones = new Set(p.secciones.map((s) => s.id))
  const idsPeliculas = new Set(p.peliculas.map((pe) => pe.id))

  for (const s of p.salas) {
    if (!SALA_IDS.includes(s.id as SalaId)) throw new Error(`data/programa.json: sala con id desconocido "${s.id}".`)
  }
  for (const s of p.secciones) {
    if (!SECCION_IDS.includes(s.id as SeccionId)) {
      throw new Error(`data/programa.json: sección con id desconocido "${s.id}".`)
    }
  }
  for (const pe of p.peliculas) {
    if (!idsSecciones.has(pe.seccion)) {
      throw new Error(`data/programa.json: la película "${pe.id}" referencia una sección inexistente "${pe.seccion}".`)
    }
    if (!ESTRENOS.includes(pe.estreno)) {
      throw new Error(`data/programa.json: la película "${pe.id}" tiene un estreno inválido "${pe.estreno}".`)
    }
    if (!CLASIFICACIONES.includes(pe.clasificacion)) {
      throw new Error(`data/programa.json: la película "${pe.id}" tiene una clasificación inválida "${pe.clasificacion}".`)
    }
  }
  for (const f of p.funciones) {
    if (!RE_ID_FUNCION.test(f.id)) {
      throw new Error(`data/programa.json: el id de función "${f.id}" no calza con ^[a-z0-9]+$.`)
    }
    if (!idsPeliculas.has(f.peliculaId)) {
      throw new Error(`data/programa.json: la función "${f.id}" referencia una película inexistente "${f.peliculaId}".`)
    }
    if (!idsSalas.has(f.salaId)) {
      throw new Error(`data/programa.json: la función "${f.id}" referencia una sala inexistente "${f.salaId}".`)
    }
    parsearInicio(f.inicio, f.id)
  }
  for (const a of SALA_IDS) {
    for (const b of SALA_IDS) {
      const fila = p.trasladosMin[a]
      const directo = typeof fila === 'object' ? fila[b] : undefined
      const filaInversa = p.trasladosMin[b]
      const inverso = typeof filaInversa === 'object' ? filaInversa[a] : undefined
      if (directo === undefined && inverso === undefined) {
        throw new Error(`data/programa.json: falta el traslado entre "${a}" y "${b}".`)
      }
    }
  }
}

validarPrograma(programaJson)

const programa = programaJson as unknown as Programa

export const festival = programa.festival
export const salas = programa.salas
export const secciones = programa.secciones
export const peliculas = programa.peliculas
const trasladosMin = programa.trasladosMin

export const salaPorId = new Map(salas.map((s) => [s.id, s]))
export const seccionPorId = new Map(secciones.map((s) => [s.id, s]))
export const peliculaPorId = new Map(peliculas.map((p) => [p.id, p]))

/** Minutos caminando entre dos salas. Simétrico; 0 dentro de la misma sala. */
export function traslado(a: SalaId, b: SalaId): number {
  const directo = trasladosMin[a]?.[b]
  return directo !== undefined ? directo : trasladosMin[b][a]
}

// --- Enriquecer funciones ---

interface FuncionCruda {
  datos: FuncionDatos
  inicioMin: number
  finMin: number
  finConversatorioMin: number | null
}

const crudos: FuncionCruda[] = programa.funciones.map((f) => {
  const pelicula = peliculaPorId.get(f.peliculaId)!
  const inicioMin = parsearInicio(f.inicio, f.id)
  const finMin = inicioMin + pelicula.duracionMin
  const finConversatorioMin = f.conversatorioMin != null ? finMin + f.conversatorioMin : null
  return { datos: f, inicioMin, finMin, finConversatorioMin }
})

const fechasUnicas = Array.from(new Set(crudos.map((c) => fechaDe(c.inicioMin)))).sort()

const diasPorFecha = new Map<string, DiaFestival>()
for (const fecha of fechasUnicas) {
  const deEseDia = crudos.filter((c) => fechaDe(c.inicioMin) === fecha)
  const ejeInicioMin = truncarHora(Math.min(...deEseDia.map((c) => c.inicioMin)))
  const ejeFinMin = redondearHoraArriba(Math.max(...deEseDia.map((c) => c.finConversatorioMin ?? c.finMin)))
  diasPorFecha.set(fecha, crearDia(fecha, ejeInicioMin, ejeFinMin))
}

/** Fechas únicas de inicio de funciones, ordenadas: jueves, viernes, sábado. */
export const dias: DiaFestival[] = fechasUnicas.map((fecha) => diasPorFecha.get(fecha)!)
export const diaPorSlug = new Map(dias.map((d) => [d.slug, d]))

/** Funciones enriquecidas, ordenadas por inicio y luego por id. */
export const funciones: Funcion[] = crudos
  .map(({ datos, inicioMin, finMin, finConversatorioMin }): Funcion => {
    const pelicula = peliculaPorId.get(datos.peliculaId)!
    const sala = salaPorId.get(datos.salaId)!
    const seccion = seccionPorId.get(pelicula.seccion)!
    const dia = diasPorFecha.get(fechaDe(inicioMin))!
    const aireLibre = sala.aireLibre
    return {
      ...datos,
      pelicula,
      sala,
      seccion,
      dia,
      inicioMin,
      finMin,
      finConversatorioMin,
      terminaDiaSiguiente: terminaDiaSiguienteDe(finMin, dia),
      conversatorioTerminaDiaSiguiente:
        finConversatorioMin != null ? terminaDiaSiguienteDe(finConversatorioMin, dia) : false,
      agotada: datos.agotada ?? false,
      aireLibre,
      precio: aireLibre ? festival.entradas.aireLibre : festival.entradas.general,
    }
  })
  .sort((a, b) => a.inicioMin - b.inicioMin || a.id.localeCompare(b.id))

export const funcionPorId = new Map(funciones.map((f) => [f.id, f]))

export function funcionesDePelicula(peliculaId: string): Funcion[] {
  return funciones.filter((f) => f.peliculaId === peliculaId)
}

export function funcionesDelDia(fecha: string): Funcion[] {
  return funciones.filter((f) => f.dia.fecha === fecha)
}

export function peliculasDeSeccion(seccionId: SeccionId): Pelicula[] {
  return peliculas.filter((p) => p.seccion === seccionId)
}

export const totalPeliculas = peliculas.length
export const totalSalas = salas.length
export const totalDias = dias.length
export const totalFunciones = funciones.length
