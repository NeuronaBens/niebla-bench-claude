// Carga, enriquecimiento y consultas sobre `data/programa.json`.
// Única puerta de entrada a los datos: el resto del sitio importa desde aquí, nunca el JSON
// directamente. El archivo de datos no se modifica (ver BRIEF.md).
import datosCrudos from '../data/programa.json'
import type {
  Dia,
  DiaId,
  Festival,
  Funcion,
  FuncionDatos,
  Pelicula,
  Sala,
  SalaId,
  Seccion,
  SeccionId,
  Traslados,
} from './tipos'
import { aMinutosAbsolutos, diaFestivalDeInicio, fechaDeMinutos, horaTexto, nombreDiaSemana, nombreMes, sumarDias } from './tiempo'

interface DatosProgramaJson {
  festival: Festival
  salas: Sala[]
  trasladosMin: { descripcion: string } & Record<string, Record<string, number>>
  secciones: Seccion[]
  peliculas: Pelicula[]
  funciones: FuncionDatos[]
}

const datos = datosCrudos as unknown as DatosProgramaJson

export const festival: Festival = datos.festival
export const salas: Sala[] = datos.salas
export const secciones: Seccion[] = datos.secciones
export const peliculas: Pelicula[] = datos.peliculas

export const traslados: Traslados = (() => {
  const resultado = {} as Traslados
  for (const sala of salas) {
    const fila = {} as Record<SalaId, number>
    for (const otra of salas) {
      fila[otra.id] = datos.trasladosMin[sala.id]?.[otra.id] ?? 0
    }
    resultado[sala.id] = fila
  }
  return resultado
})()

const NOMBRES_DIA_LARGO: Record<DiaId, string> = {
  jueves: 'jueves',
  viernes: 'viernes',
  sabado: 'sábado',
}

const NOMBRES_DIA_CORTO: Record<DiaId, string> = {
  jueves: 'Jue',
  viernes: 'Vie',
  sabado: 'Sáb',
}

const ORDEN_DIAS: DiaId[] = ['jueves', 'viernes', 'sabado']

export const dias: Dia[] = ORDEN_DIAS.map((id, indice) => {
  const fecha = sumarDias(festival.fechaInicio, indice)
  const [, mesTexto, diaTexto] = fecha.split('-')
  return {
    id,
    fecha,
    nombreLargo: NOMBRES_DIA_LARGO[id],
    nombreCorto: NOMBRES_DIA_CORTO[id],
    numero: Number(diaTexto),
    mes: nombreMes(Number(mesTexto)),
  }
})

const salasPorId = new Map<SalaId, Sala>(salas.map((s) => [s.id, s]))
const peliculasPorId = new Map<string, Pelicula>(peliculas.map((p) => [p.id, p]))
const seccionesPorId = new Map<SeccionId, Seccion>(secciones.map((s) => [s.id, s]))
const diasPorId = new Map<DiaId, Dia>(dias.map((d) => [d.id, d]))

function enriquecer(datosFuncion: FuncionDatos): Funcion {
  const pelicula = peliculasPorId.get(datosFuncion.peliculaId)
  const sala = salasPorId.get(datosFuncion.salaId)
  if (!pelicula) {
    throw new Error(`Función ${datosFuncion.id} apunta a una película inexistente: ${datosFuncion.peliculaId}`)
  }
  if (!sala) {
    throw new Error(`Función ${datosFuncion.id} apunta a una sala inexistente: ${datosFuncion.salaId}`)
  }

  const inicioMin = aMinutosAbsolutos(datosFuncion.inicio, festival.fechaInicio)
  const terminoMin = inicioMin + pelicula.duracionMin
  const minutoDelDiaInicio = ((inicioMin % 1440) + 1440) % 1440
  const horaInicioNum = Math.floor(minutoDelDiaInicio / 60)
  const dia = diaFestivalDeInicio(inicioMin, horaInicioNum, dias)

  const fechaInicioFuncion = fechaDeMinutos(inicioMin, festival.fechaInicio)
  const fechaTerminoFuncion = fechaDeMinutos(terminoMin, festival.fechaInicio)
  const terminaOtroDia = fechaInicioFuncion !== fechaTerminoFuncion
  const diaTermino = nombreDiaSemana(fechaTerminoFuncion)

  return {
    id: datosFuncion.id,
    pelicula,
    sala,
    inicioMin,
    terminoMin,
    dia,
    horaInicio: horaTexto(inicioMin),
    horaTermino: horaTexto(terminoMin),
    terminaOtroDia,
    diaTermino,
    conversatorioMin: datosFuncion.conversatorioMin ?? 0,
    agotada: datosFuncion.agotada ?? false,
    nota: datosFuncion.nota,
    aireLibre: sala.aireLibre,
    precio: sala.aireLibre ? festival.entradas.aireLibre : festival.entradas.general,
  }
}

export const funciones: Funcion[] = datos.funciones
  .map(enriquecer)
  .sort((a, b) => a.inicioMin - b.inicioMin || a.sala.nombre.localeCompare(b.sala.nombre, 'es'))

export const funcionesPorId = new Map<string, Funcion>(funciones.map((f) => [f.id, f]))

// --- Consultas ---

export function peliculaPorId(id: string): Pelicula | undefined {
  return peliculasPorId.get(id)
}

export function salaPorId(id: SalaId): Sala | undefined {
  return salasPorId.get(id)
}

export function seccionPorId(id: SeccionId): Seccion | undefined {
  return seccionesPorId.get(id)
}

export function diaPorId(id: DiaId): Dia | undefined {
  return diasPorId.get(id)
}

export function funcionesDePelicula(peliculaId: string): Funcion[] {
  return funciones.filter((f) => f.pelicula.id === peliculaId)
}

export function funcionesPorDia(dia: DiaId): Funcion[] {
  return funciones.filter((f) => f.dia === dia)
}

export function peliculasPorSeccion(seccion: SeccionId): Pelicula[] {
  return peliculas.filter((p) => p.seccion === seccion)
}

export function minutosTraslado(salaA: SalaId, salaB: SalaId): number {
  return traslados[salaA][salaB]
}

export function conteoPorSeccion(seccion: SeccionId): number {
  return peliculas.filter((p) => p.seccion === seccion).length
}

export function conteoFuncionesPorDia(dia: DiaId): number {
  return funciones.filter((f) => f.dia === dia).length
}

export interface ResumenDia {
  dia: Dia
  cantidad: number
  primeraHora: string
  ultimoTermino: string
}

export function resumenDia(diaId: DiaId): ResumenDia {
  const dia = diasPorId.get(diaId)!
  const deEseDia = funcionesPorDia(diaId)
  const primeraHora = deEseDia.reduce((min, f) => Math.min(min, f.inicioMin), Infinity)
  const ultimoTermino = deEseDia.reduce((max, f) => Math.max(max, f.terminoMin), -Infinity)
  return {
    dia,
    cantidad: deEseDia.length,
    primeraHora: horaTexto(primeraHora),
    ultimoTermino: horaTexto(ultimoTermino),
  }
}

/** "Jueves 15, viernes 16 y sábado 17 de octubre de 2026", calculado desde `dias`. */
export function textoFechasFestival(): string {
  const [anio] = festival.fechaInicio.split('-')
  const partes = dias.map((d, i) => {
    const nombre = i === 0 ? `${d.nombreLargo.charAt(0).toUpperCase()}${d.nombreLargo.slice(1)}` : d.nombreLargo
    return `${nombre} ${d.numero}`
  })
  const listado =
    partes.length > 1 ? `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}` : partes[0]
  return `${listado} de ${dias[0].mes} de ${anio}`
}
