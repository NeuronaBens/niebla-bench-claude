import type { Clasificacion, Estreno, SalaId, SeccionId } from './tipos.ts'

export function precio(n: number): string {
  if (n === 0) return 'Gratis'
  const texto = String(Math.round(n))
  let conPuntos = ''
  for (let i = 0; i < texto.length; i++) {
    const posDesdeElFinal = texto.length - i
    conPuntos += texto[i]
    if (posDesdeElFinal > 1 && (posDesdeElFinal - 1) % 3 === 0) conPuntos += '.'
  }
  return `$${conPuntos}`
}

export function clasificacionLarga(c: Clasificacion): string {
  switch (c) {
    case 'TE':
      return 'Todo espectador'
    case '+14':
      return 'Mayores de 14 años'
    case '+18':
      return 'Mayores de 18 años'
  }
}

export function clasificacionCorta(c: Clasificacion): string {
  return c
}

export function estrenoTexto(e: Estreno): string {
  switch (e) {
    case 'mundial':
      return 'Estreno mundial'
    case 'latinoamericano':
      return 'Estreno latinoamericano'
    case 'nacional':
      return 'Estreno nacional'
  }
}

export function plural(n: number, singular: string, pluralForma: string): string {
  return `${n} ${n === 1 ? singular : pluralForma}`
}

export function listaEs(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  if (items.length === 2) return `${items[0]} y ${items[1]}`
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

const NOMBRES_CORTOS_SECCION: Record<SeccionId, string> = {
  competencia: 'Competencia',
  panorama: 'Panorama',
  nocturna: 'Nocturna',
  costa: 'Costa',
}

export function nombreCortoSeccion(id: SeccionId): string {
  return NOMBRES_CORTOS_SECCION[id]
}

const NOMBRES_CORTOS_SALA: Record<SalaId, string> = {
  teatro: 'Teatro Municipal',
  muelle: 'El Muelle',
  galpon: 'Galpón 7',
  terraza: 'Terraza Faro',
}

export function nombreCortoSala(id: SalaId): string {
  return NOMBRES_CORTOS_SALA[id]
}

export function instagramUrl(handle: string): string {
  const usuario = handle.startsWith('@') ? handle.slice(1) : handle
  return `https://www.instagram.com/${usuario}/`
}
