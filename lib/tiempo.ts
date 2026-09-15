// Manejo de horas y fechas del festival.
//
// Las horas de data/programa.json son "hora de pared" en Chile (America/Santiago).
// Se representan como minutos absolutos con Date.UTC(...) / 60000, tratando esa
// hora de pared como si fuera UTC. Esto nunca depende de la zona horaria del
// servidor ni del dispositivo (RN1). Chile está en horario de verano (UTC-3)
// durante todo el festival, así que no hay cambio de hora que manejar.
//
// Prohibido para horas del programa: construir un Date con un string ISO sin
// zona horaria explícita (se interpreta en la zona local del dispositivo),
// los formateadores de fecha/hora "locale" del navegador, o
// Intl.DateTimeFormat sin la opción timeZone.

import type { Funcion, Minutos } from './tipos.ts'

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

export function aMinutos(iso: string): Minutos {
  const m = ISO_RE.exec(iso)
  if (!m) {
    throw new Error(`Fecha/hora con formato inválido: "${iso}"`)
  }
  const [, anio, mes, dia, hora, minuto] = m
  return Date.UTC(Number(anio), Number(mes) - 1, Number(dia), Number(hora), Number(minuto)) / 60000
}

export function fechaDe(m: Minutos): string {
  const d = new Date(m * 60000)
  const anio = d.getUTCFullYear()
  const mes = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dia = String(d.getUTCDate()).padStart(2, '0')
  return `${anio}-${mes}-${dia}`
}

export function horaDe(m: Minutos): string {
  const d = new Date(m * 60000)
  const horas = String(d.getUTCHours()).padStart(2, '0')
  const minutos = String(d.getUTCMinutes()).padStart(2, '0')
  return `${horas}:${minutos}`
}

const DIAS_SEMANA = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = [
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
]

export function diaSemana(fecha: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha)
  if (!m) throw new Error(`Fecha con formato inválido: "${fecha}"`)
  const [, anio, mes, dia] = m
  const d = new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia)))
  return DIAS_SEMANA[d.getUTCDay()]
}

export function nombreMes(fecha: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha)
  if (!m) throw new Error(`Fecha con formato inválido: "${fecha}"`)
  return MESES[Number(m[2]) - 1]
}

function numeroDia(fecha: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha)
  if (!m) throw new Error(`Fecha con formato inválido: "${fecha}"`)
  return Number(m[3])
}

export function fechaLarga(fecha: string): string {
  return `${diaSemana(fecha)} ${numeroDia(fecha)} de ${nombreMes(fecha)}`
}

export function fechaLargaConAnio(fecha: string): string {
  const anio = fecha.slice(0, 4)
  return `${fechaLarga(fecha)} de ${anio}`
}

export interface FinDescrito {
  hora: string
  sufijo: string | null
}

export function describirFin(funcion: Pick<Funcion, 'fin' | 'dia' | 'cruzaMedianoche'>): FinDescrito {
  const hora = horaDe(funcion.fin)
  if (!funcion.cruzaMedianoche) {
    return { hora, sufijo: null }
  }
  const fechaFin = fechaDe(funcion.fin)
  return { hora, sufijo: `del ${diaSemana(fechaFin)}` }
}

export function duracionTexto(min: number): string {
  return `${min} min`
}

export function duracionLarga(min: number): string {
  const horas = Math.floor(min / 60)
  const resto = min % 60
  if (horas === 0) return `${resto} min`
  if (resto === 0) return `${horas} h`
  return `${horas} h ${resto} min`
}

export function ahoraEnChile(ahora: Date = new Date()): Minutos {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(ahora)

  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '0'
  const anio = Number(valor('year'))
  const mes = Number(valor('month'))
  const dia = Number(valor('day'))
  const hora = Number(valor('hour'))
  const minuto = Number(valor('minute'))
  return Date.UTC(anio, mes - 1, dia, hora, minuto) / 60000
}
