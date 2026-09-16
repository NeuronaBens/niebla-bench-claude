// Conversión y formato de horas y días.
//
// Regla de oro (ver docs/DETALLE.md, 1.3): nunca pasar las horas del JSON a `new Date(...)`
// ni usar `toLocaleString`/`toLocaleDateString`/`toLocaleTimeString`: dependen de la zona
// horaria del entorno que ejecuta el código. Todo se trabaja como minutos absolutos del
// festival mediante aritmética de texto. `Date.UTC` solo se usa para restar fechas de
// calendario y para el día de la semana, algo que no depende de ninguna zona horaria.

import type { DiaId } from './tipos'

const NOMBRES_DIA_SEMANA = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const

const NOMBRES_MES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const

interface FechaCalendario {
  anio: number
  mes: number
  dia: number
}

interface FechaHora extends FechaCalendario {
  hora: number
  minuto: number
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/** Parsea "2026-10-15" o "2026-10-15T16:00" sin usar `Date`. */
function parsearFecha(texto: string): FechaCalendario {
  const [fecha] = texto.split('T')
  const [anio, mes, dia] = fecha.split('-').map(Number)
  return { anio, mes, dia }
}

function parsearFechaHora(texto: string): FechaHora {
  const [fecha, hora] = texto.split('T')
  const { anio, mes, dia } = parsearFecha(fecha)
  const [h, m] = (hora ?? '00:00').split(':').map(Number)
  return { anio, mes, dia, hora: h, minuto: m }
}

/** Diferencia en días de calendario entre dos fechas "YYYY-MM-DD" (o con hora, se ignora). */
export function diferenciaDias(fechaA: string, fechaB: string): number {
  const a = parsearFecha(fechaA)
  const b = parsearFecha(fechaB)
  const msA = Date.UTC(a.anio, a.mes - 1, a.dia)
  const msB = Date.UTC(b.anio, b.mes - 1, b.dia)
  return Math.round((msA - msB) / 86_400_000)
}

/** Nombre de día de semana en español a partir de una fecha "YYYY-MM-DD". */
export function nombreDiaSemana(fecha: string): string {
  const { anio, mes, dia } = parsearFecha(fecha)
  const indice = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()
  return NOMBRES_DIA_SEMANA[indice]
}

/** Suma (o resta) días de calendario a una fecha "YYYY-MM-DD" y devuelve el mismo formato. */
export function sumarDias(fecha: string, dias: number): string {
  const { anio, mes, dia } = parsearFecha(fecha)
  const ms = Date.UTC(anio, mes - 1, dia) + dias * 86_400_000
  const d = new Date(ms)
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`
}

/**
 * Convierte una fecha-hora de texto ("2026-10-15T16:00") en minutos absolutos del festival,
 * relativos a `fechaInicio` ("2026-10-15"): días transcurridos por 1440 más horas y minutos.
 */
export function aMinutosAbsolutos(fechaHoraTexto: string, fechaInicio: string): number {
  const { anio, mes, dia, hora, minuto } = parsearFechaHora(fechaHoraTexto)
  const fecha = `${anio}-${pad2(mes)}-${pad2(dia)}`
  const dias = diferenciaDias(fecha, fechaInicio)
  return dias * 1440 + hora * 60 + minuto
}

/** Índice de día de festival (0 = fechaInicio, 1 = fechaInicio+1, ...) para unos minutos absolutos. */
export function indiceDia(minutosAbsolutos: number): number {
  return Math.floor(minutosAbsolutos / 1440)
}

/** Hora del día "HH:MM" (00:00 a 23:59) para unos minutos absolutos, sin importar el día. */
export function horaTexto(minutosAbsolutos: number): string {
  const minutoDelDia = ((minutosAbsolutos % 1440) + 1440) % 1440
  const h = Math.floor(minutoDelDia / 60)
  const m = minutoDelDia % 60
  return `${pad2(h)}:${pad2(m)}`
}

/** Fecha calendario "YYYY-MM-DD" para unos minutos absolutos, relativos a `fechaInicio`. */
export function fechaDeMinutos(minutosAbsolutos: number, fechaInicio: string): string {
  return sumarDias(fechaInicio, indiceDia(minutosAbsolutos))
}

/**
 * Día de festival ("jueves" | "viernes" | "sabado") al que pertenece una función según su
 * hora de inicio. Defensa para el futuro: una función que empezara antes de las 05:00
 * pertenecería al día anterior (hoy no hay casos así en los datos).
 */
export function diaFestivalDeInicio(
  inicioMin: number,
  horaInicio: number,
  dias: readonly { id: DiaId }[]
): DiaId {
  let indice = indiceDia(inicioMin)
  if (horaInicio < 5) indice -= 1
  const dia = dias[indice]
  return dia ? dia.id : dias[0].id
}

export function nombreMes(mes: number): string {
  return NOMBRES_MES[mes - 1]
}

/** "22:15 a 00:13" y, si termina otro día, se puede anteponer una aclaración con `diaTermino`. */
export function formatearRango(horaInicio: string, horaTermino: string): string {
  return `${horaInicio} a ${horaTermino}`
}

/**
 * Hora actual en America/Santiago como minutos absolutos del festival. Solo debe llamarse en
 * el cliente. Usa `Intl.DateTimeFormat` con `formatToParts`, que no depende de la hora local
 * del sistema porque se le pide explícitamente la zona horaria de Chile.
 */
export function ahoraEnSantiago(fechaInicio: string): number {
  const partes = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date())

  const obtener = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '0'
  const anio = Number(obtener('year'))
  const mes = Number(obtener('month'))
  const dia = Number(obtener('day'))
  let hora = Number(obtener('hour'))
  const minuto = Number(obtener('minute'))
  if (hora === 24) hora = 0

  const fecha = `${anio}-${pad2(mes)}-${pad2(dia)}`
  const dias = diferenciaDias(fecha, fechaInicio)
  return dias * 1440 + hora * 60 + minuto
}
