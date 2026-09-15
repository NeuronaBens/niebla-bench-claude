import type { Programa } from './programa.ts'
import { describirFin } from './tiempo.ts'
import type { DiaSlug, Funcion } from './tipos.ts'

export interface Cifras {
  peliculas: number
  funciones: number
  salas: number
  dias: number
  estrenosMundiales: number
}

export function cifras(programa: Programa): Cifras {
  return {
    peliculas: programa.peliculas.length,
    funciones: programa.funciones.length,
    salas: programa.salas.length,
    dias: programa.dias.length,
    estrenosMundiales: programa.peliculas.filter((p) => p.estreno === 'mundial').length,
  }
}

export interface ResumenDia {
  cantidad: number
  primeraHora: string
  finMasTarde: ReturnType<typeof describirFin>
  conNota: Funcion[]
  alAireLibre: Funcion[]
}

export function resumenDia(programa: Programa, slug: DiaSlug): ResumenDia {
  const funciones = programa.funcionesDelDia(slug)
  const primera = funciones[0]
  const ultimaEnTerminar = funciones.reduce((max, f) => (f.fin > max.fin ? f : max), funciones[0])
  return {
    cantidad: funciones.length,
    primeraHora: primera ? primera.inicio.toString() : '',
    finMasTarde: describirFin(ultimaEnTerminar),
    conNota: funciones.filter((f) => f.nota),
    alAireLibre: funciones.filter((f) => f.sala.aireLibre),
  }
}

export interface Destacados {
  conNota: Funcion[]
  conConversatorio: Funcion[]
  alAireLibre: Funcion[]
}

export function destacados(programa: Programa): Destacados {
  return {
    conNota: programa.funciones.filter((f) => f.nota),
    conConversatorio: programa.funciones.filter((f) => f.conversatorioMin > 0),
    alAireLibre: programa.funciones.filter((f) => f.sala.aireLibre),
  }
}

export interface RangoTraslados {
  min: number
  max: number
}

export function rangoTraslados(programa: Programa): RangoTraslados {
  const valores: number[] = []
  for (const a of programa.salas) {
    for (const b of programa.salas) {
      if (a.id === b.id) continue
      valores.push(programa.traslado(a.id, b.id))
    }
  }
  return { min: Math.min(...valores), max: Math.max(...valores) }
}
