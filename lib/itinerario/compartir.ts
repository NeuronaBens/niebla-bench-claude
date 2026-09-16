// Codifica y decodifica el parámetro `f` del link compartido: ids de función en orden
// cronológico, sin el prefijo "f" y separados por punto. Ej: "05.09.13" para f05, f09, f13.
import { funcionesPorId } from '../programa'

function quitarPrefijo(id: string): string {
  return id.startsWith('f') || id.startsWith('F') ? id.slice(1) : id
}

function normalizarId(pieza: string): string {
  const numero = quitarPrefijo(pieza.trim())
  const limpio = numero.replace(/^0+(?=\d)/, '')
  return `f${limpio.padStart(2, '0')}`
}

export function codificarItinerario(ids: string[]): string {
  const ordenadas = [...new Set(ids)]
    .map((id) => funcionesPorId.get(id))
    .filter((f): f is NonNullable<typeof f> => Boolean(f))
    .sort((a, b) => a.inicioMin - b.inicioMin || a.id.localeCompare(b.id))

  return ordenadas.map((f) => quitarPrefijo(f.id)).join('.')
}

export interface ItinerarioDecodificado {
  validos: string[]
  cantidadInvalidos: number
}

export function decodificarItinerario(texto: string | null | undefined): ItinerarioDecodificado {
  if (!texto) return { validos: [], cantidadInvalidos: 0 }

  const piezas = texto
    .split(/[.,\s-]+/)
    .map((p) => p.trim())
    .filter(Boolean)

  const vistos = new Set<string>()
  const candidatos: { id: string; inicioMin: number }[] = []
  let cantidadInvalidos = 0

  for (const pieza of piezas) {
    const id = normalizarId(pieza)
    const funcion = funcionesPorId.get(id)
    if (!funcion) {
      cantidadInvalidos += 1
      continue
    }
    if (vistos.has(id)) continue
    vistos.add(id)
    candidatos.push({ id, inicioMin: funcion.inicioMin })
  }

  candidatos.sort((a, b) => a.inicioMin - b.inicioMin || a.id.localeCompare(b.id))

  return { validos: candidatos.map((c) => c.id), cantidadInvalidos }
}

export function urlItinerarioCompartido(ids: string[]): string {
  const parametro = codificarItinerario(ids)
  const origen = typeof window !== 'undefined' ? window.location.origin : ''
  return `${origen}/itinerario/compartido?f=${parametro}`
}
