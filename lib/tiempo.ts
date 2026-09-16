import type { DiaFestival } from './tipos'

// Toda la aritmética de fechas y horas del sitio vive acá. Esta es la ÚNICA
// ocurrencia permitida de `Date` en el repo: se usa `Date.UTC` como un
// calendario neutro para obtener "minutos flotantes" que no dependen de la
// zona horaria del navegador ni del servidor. Las horas del JSON son hora
// local de Chile y se muestran tal cual, sin ninguna conversión: nunca se usa
// `new Date("2026-10-15T16:00")`, `toLocaleTimeString`, `toLocaleDateString`
// ni `Intl.DateTimeFormat` para horas o días.

const NOMBRES_DIA = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
] as const

const NOMBRES_DIA_CORTOS: Record<string, string> = {
  domingo: 'Dom',
  lunes: 'Lun',
  martes: 'Mar',
  miércoles: 'Mié',
  jueves: 'Jue',
  viernes: 'Vie',
  sábado: 'Sáb',
}

const RE_INICIO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
const RE_FECHA = /^(\d{4})-(\d{2})-(\d{2})$/

function quitarTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function dosDigitos(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/**
 * Convierte un texto de fecha-hora sin zona ("2026-10-15T16:00") en minutos
 * flotantes desde una época neutra, calculados con `Date.UTC`. El mismo
 * texto produce siempre el mismo número, sin importar dónde corra el código.
 * Lanza un error descriptivo si el texto no calza con el formato esperado.
 */
export function parsearInicio(texto: string, idParaError?: string): number {
  const m = RE_INICIO.exec(texto)
  if (!m) {
    const contexto = idParaError ? ` (función ${idParaError})` : ''
    throw new Error(`Hora inválida "${texto}"${contexto}: se esperaba el formato AAAA-MM-DDTHH:MM.`)
  }
  const [, a, mes, d, h, min] = m
  return Date.UTC(Number(a), Number(mes) - 1, Number(d), Number(h), Number(min)) / 60000
}

function parsearFecha(fecha: string): number {
  const m = RE_FECHA.exec(fecha)
  if (!m) throw new Error(`Fecha inválida "${fecha}": se esperaba el formato AAAA-MM-DD.`)
  const [, a, mes, d] = m
  return Date.UTC(Number(a), Number(mes) - 1, Number(d), 0, 0) / 60000
}

/** 'YYYY-MM-DD' a partir de minutos flotantes. */
export function fechaDe(min: number): string {
  const fecha = new Date(Math.round(min) * 60000)
  return `${fecha.getUTCFullYear()}-${dosDigitos(fecha.getUTCMonth() + 1)}-${dosDigitos(fecha.getUTCDate())}`
}

/** 'HH:MM' a partir de minutos flotantes, en 24 h con ceros a la izquierda. */
export function horaDe(min: number): string {
  const totalMin = Math.round(min)
  const h = ((Math.floor(totalMin / 60) % 24) + 24) % 24
  const m = ((totalMin % 60) + 60) % 60
  return `${dosDigitos(h)}:${dosDigitos(m)}`
}

/** 'YYYY-MM-DDTHH:MM', para usar tal cual en `<time dateTime>`. */
export function isoSinZona(min: number): string {
  return `${fechaDe(min)}T${horaDe(min)}`
}

/** 0 = domingo, vía `getUTCDay` sobre una fecha 'YYYY-MM-DD'. */
export function diaSemana(fecha: string): number {
  return new Date(parsearFecha(fecha) * 60000).getUTCDay()
}

/** Nombre del día con mayúscula inicial, por ejemplo 'Jueves'. */
export function nombreDia(fecha: string): string {
  const nombre = NOMBRES_DIA[diaSemana(fecha)]
  return nombre.charAt(0).toUpperCase() + nombre.slice(1)
}

/** Forma corta con tilde, por ejemplo 'Jue' o 'Sáb'. */
export function nombreDiaCorto(fecha: string): string {
  return NOMBRES_DIA_CORTOS[NOMBRES_DIA[diaSemana(fecha)]]
}

function numeroDeFecha(fecha: string): number {
  const m = RE_FECHA.exec(fecha)
  if (!m) throw new Error(`Fecha inválida "${fecha}".`)
  return Number(m[3])
}

/** Trunca minutos flotantes hacia abajo, a la hora exacta. */
export function truncarHora(min: number): number {
  return Math.floor(min / 60) * 60
}

/** Redondea minutos flotantes hacia arriba, a la hora exacta. */
export function redondearHoraArriba(min: number): number {
  return Math.ceil(min / 60) * 60
}

/**
 * Construye un `DiaFestival` a partir de su fecha. `ejeInicioMin` y
 * `ejeFinMin` deben salir del cálculo sobre las funciones reales de ese día
 * (ver `lib/datos.ts`); si no se entregan, el eje por defecto cubre el día
 * completo (00:00 a 24:00).
 */
export function crearDia(fecha: string, ejeInicioMin?: number, ejeFinMin?: number): DiaFestival {
  const inicioDiaMin = parsearFecha(fecha)
  const nombre = nombreDia(fecha)
  const numero = numeroDeFecha(fecha)
  const slug = quitarTildes(nombre).toLowerCase()
  return {
    fecha,
    slug,
    nombre,
    numero,
    etiqueta: `${nombre} ${numero}`,
    corta: `${nombreDiaCorto(fecha)} ${numero}`,
    inicioDiaMin,
    ejeInicioMin: ejeInicioMin ?? inicioDiaMin,
    ejeFinMin: ejeFinMin ?? inicioDiaMin + 1440,
  }
}

/** El día de una función es siempre el de su inicio, nunca el de su fin. */
export function terminaDiaSiguienteDe(finMin: number, dia: DiaFestival): boolean {
  return finMin >= dia.inicioDiaMin + 1440
}

export interface EtiquetaFinCompacta {
  hora: string
  terminaDiaSiguiente: boolean
}

/** Para el formato compacto "23:45 – 01:07 +1" de tarjetas y listas. */
export function etiquetaFinCompacta(finMin: number, dia: DiaFestival): EtiquetaFinCompacta {
  return { hora: horaDe(finMin), terminaDiaSiguiente: terminaDiaSiguienteDe(finMin, dia) }
}

/** "01:07" o, si cruza medianoche, "01:07 del domingo 18". */
export function etiquetaFinLarga(finMin: number, dia: DiaFestival): string {
  const hora = horaDe(finMin)
  if (!terminaDiaSiguienteDe(finMin, dia)) return hora
  const fechaSiguiente = fechaDe(finMin)
  return `${hora} del ${nombreDia(fechaSiguiente).toLowerCase()} ${numeroDeFecha(fechaSiguiente)}`
}

/** "a la" para la 01:xx, "a las" para el resto (concuerda con "la 01:07"). */
export function preposicionHora(min: number): 'a la' | 'a las' {
  const h = ((Math.floor(Math.round(min) / 60) % 24) + 24) % 24
  return h === 1 ? 'a la' : 'a las'
}
