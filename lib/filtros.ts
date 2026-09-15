import type { Programa } from './programa.ts'
import type { DiaSlug, FiltrosPrograma, Funcion, SeccionId } from './tipos.ts'

function quitarTildes(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function leerFiltros(params: URLSearchParams | null, programa: Programa): FiltrosPrograma {
  const diaCrudo = params?.get('dia') ?? null
  const seccionCrudo = params?.get('seccion') ?? null

  const diaNormalizado = diaCrudo ? quitarTildes(diaCrudo.trim().toLowerCase()) : null
  const dia = (programa.dias.find((d) => d.slug === diaNormalizado)?.slug ?? null) as DiaSlug | null

  const seccionNormalizada = seccionCrudo ? seccionCrudo.trim().toLowerCase() : null
  const seccion = (programa.secciones.find((s) => s.id === seccionNormalizada)?.id ?? null) as SeccionId | null

  return { dia, seccion }
}

export function escribirFiltros(f: FiltrosPrograma): string {
  const partes: string[] = []
  if (f.dia) partes.push(`dia=${f.dia}`)
  if (f.seccion) partes.push(`seccion=${f.seccion}`)
  return partes.length ? `?${partes.join('&')}` : ''
}

export function filtrarFunciones(funciones: Funcion[], f: FiltrosPrograma): Funcion[] {
  return funciones.filter((funcion) => {
    if (f.dia && funcion.dia.slug !== f.dia) return false
    if (f.seccion && funcion.seccion.id !== f.seccion) return false
    return true
  })
}
