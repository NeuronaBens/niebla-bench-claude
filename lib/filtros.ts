import { diaPorSlug, seccionPorId } from './datos'
import type { FiltrosPrograma, Funcion, SeccionId } from './tipos'

// Lectura y escritura de los filtros del programa en la URL. Puro: no toca
// `window` ni `document`, así que sirve tanto en el fallback server como en
// el cliente.

function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

export function leerFiltros(params: URLSearchParams | { get(nombre: string): string | null }): {
  filtros: FiltrosPrograma
  huboInvalidos: boolean
} {
  const diaBruto = params.get('dia')
  const seccionBruta = params.get('seccion')
  let huboInvalidos = false

  let dia: string | null = null
  if (diaBruto != null) {
    const normalizado = normalizarTexto(diaBruto)
    if (diaPorSlug.has(normalizado)) {
      dia = normalizado
    } else {
      huboInvalidos = true
    }
  }

  let seccion: SeccionId | null = null
  if (seccionBruta != null) {
    const normalizado = normalizarTexto(seccionBruta) as SeccionId
    if (seccionPorId.has(normalizado)) {
      seccion = normalizado
    } else {
      huboInvalidos = true
    }
  }

  return { filtros: { dia, seccion }, huboInvalidos }
}

export function escribirFiltros(filtros: FiltrosPrograma): string {
  const partes: string[] = []
  if (filtros.dia) partes.push(`dia=${filtros.dia}`)
  if (filtros.seccion) partes.push(`seccion=${filtros.seccion}`)
  return partes.length === 0 ? '' : `?${partes.join('&')}`
}

export function filtrarFunciones(funciones: Funcion[], filtros: FiltrosPrograma): Funcion[] {
  return funciones.filter((f) => {
    if (filtros.dia && f.dia.slug !== filtros.dia) return false
    if (filtros.seccion && f.seccion.id !== filtros.seccion) return false
    return true
  })
}
