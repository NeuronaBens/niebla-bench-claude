// Formato de duración, precio, clasificación, estreno y plurales.
import type { Clasificacion, TipoEstreno } from './tipos'

/** "1 h 38 min" (63 -> "1 h 3 min"; 60 -> "1 h"; 45 -> "45 min"). */
export function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (horas === 0) return `${resto} min`
  if (resto === 0) return `${horas} h`
  return `${horas} h ${resto} min`
}

/** "$4.000" con punto de miles a mano; "Gratis" cuando es 0. */
export function formatearPrecio(valor: number): string {
  if (valor <= 0) return 'Gratis'
  const texto = String(Math.round(valor))
  let agrupado = ''
  for (let i = 0; i < texto.length; i++) {
    const posicionDesdeElFinal = texto.length - i
    agrupado += texto[i]
    if (posicionDesdeElFinal > 1 && posicionDesdeElFinal % 3 === 1) agrupado += '.'
  }
  return `$${agrupado}`
}

export function textoClasificacion(clasificacion: Clasificacion): string {
  return clasificacion === 'TE' ? 'Todo espectador' : clasificacion
}

const TEXTOS_ESTRENO: Record<TipoEstreno, string> = {
  mundial: 'Estreno mundial',
  latinoamericano: 'Estreno latinoamericano',
  nacional: 'Estreno nacional',
}

export function textoEstreno(estreno: TipoEstreno): string {
  return TEXTOS_ESTRENO[estreno]
}

/** Plural correcto simple: "1 minuto", "2 minutos". */
export function plural(cantidad: number, singular: string, plural: string): string {
  return cantidad === 1 ? singular : plural
}

export function textoMinutos(cantidad: number): string {
  return `${cantidad} ${plural(cantidad, 'minuto', 'min')}`
}

export function textoFunciones(cantidad: number): string {
  return `${cantidad} ${plural(cantidad, 'función', 'funciones')}`
}

export function textoPeliculas(cantidad: number): string {
  return `${cantidad} ${plural(cantidad, 'película', 'películas')}`
}
