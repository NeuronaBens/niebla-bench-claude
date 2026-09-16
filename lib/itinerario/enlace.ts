import type { Funcion, FuncionId } from '../tipos'
import { normalizarIds } from './reglas'

// Formato del itinerario compartido: todo va en la URL, sin servidor.

export type EstadoEnlace = 'vacio' | 'invalido' | 'parcial' | 'ok'

/** `${origen}/itinerario/compartido?f=f05-f06-f10`, con ids en orden canónico. */
export function crearEnlace(ids: readonly FuncionId[], origen: string): string {
  return `${origen}/itinerario/compartido?f=${ids.join('-')}`
}

export function leerEnlace(valor: string | null): { validos: Funcion[]; invalidos: string[]; estado: EstadoEnlace } {
  if (valor == null || valor.trim() === '') return { validos: [], invalidos: [], estado: 'vacio' }
  const recortado = valor.length > 1000 ? valor.slice(0, 1000) : valor
  const tokens = recortado
    .split(/[-,.+\s]+/)
    .filter((t) => t !== '')
    .slice(0, 100)
  const { validos, invalidos } = normalizarIds(tokens)
  let estado: EstadoEnlace
  if (validos.length === 0) estado = 'invalido'
  else if (invalidos.length > 0) estado = 'parcial'
  else estado = 'ok'
  return { validos, invalidos, estado }
}
