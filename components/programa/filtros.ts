// Lectura y escritura de los filtros del programa en la URL (`dia`, `seccion`).
import { secciones } from '@/lib/programa'
import type { DiaId, SeccionId } from '@/lib/tipos'

const DIAS_VALIDOS: DiaId[] = ['jueves', 'viernes', 'sabado']
const SECCIONES_VALIDAS = secciones.map((s) => s.id)

export interface Filtros {
  dia: DiaId | null
  secciones: SeccionId[]
}

export function leerFiltros(searchParams: URLSearchParams): Filtros {
  const diaBruto = searchParams.get('dia')
  const dia = DIAS_VALIDOS.includes(diaBruto as DiaId) ? (diaBruto as DiaId) : null

  const seccionBruta = searchParams.get('seccion')
  const seccionesLimpias = seccionBruta
    ? Array.from(new Set(seccionBruta.split(',').map((s) => s.trim())))
        .filter((s): s is SeccionId => SECCIONES_VALIDAS.includes(s as SeccionId))
    : []

  // Orden fijo: el de los datos, para que el mismo filtro dé siempre la misma URL.
  const ordenadas = SECCIONES_VALIDAS.filter((id) => seccionesLimpias.includes(id))

  return { dia, secciones: ordenadas }
}

export function construirQuery(filtros: Filtros): string {
  const params = new URLSearchParams()
  if (filtros.dia) params.set('dia', filtros.dia)
  if (filtros.secciones.length > 0) params.set('seccion', filtros.secciones.join(','))
  const texto = params.toString()
  return texto ? `?${texto}` : ''
}
