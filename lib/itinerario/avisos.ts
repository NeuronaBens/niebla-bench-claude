// Lógica de avisos del itinerario: choques, traslados imposibles, conversatorios perdidos,
// películas repetidas, funciones agotadas y al aire libre. Puro, sin React: ver docs/DETALLE.md
// sección 8 para la tabla de casos obligatorios que valida este archivo.
import type { Funcion, SalaId, Traslados } from '../tipos'

export type TipoAviso = 'choque' | 'traslado' | 'conversatorio' | 'repetida' | 'agotada' | 'aireLibre' | 'lluvia'
export type NivelAviso = 'alerta' | 'cuidado' | 'info'

export interface Aviso {
  id: string
  tipo: TipoAviso
  nivel: NivelAviso
  /** Función única (agotada, aireLibre) o par ordenado por inicio (primera, segunda). */
  ids: [string] | [string, string]
  solapeDesde?: number
  solapeHasta?: number
  necesitaMin?: number
  tieneMin?: number
  conversatorioMin?: number
  alcanzaMin?: number
  pierdeConversatorio?: boolean
}

export type EstadoTramo = 'ok' | 'justo' | 'traslado' | 'choque' | 'conversatorio'

export interface Tramo {
  desde: string
  hasta: string
  caminataMin: number
  margenMin: number
  estado: EstadoTramo
}

type TipoPar = 'choque' | 'traslado' | 'conversatorio' | 'ok'

interface ResultadoPar {
  hueco: number
  caminata: number
  tipo: TipoPar
  solapeDesde?: number
  solapeHasta?: number
  necesitaMin?: number
  tieneMin?: number
  conversatorioMin?: number
  alcanzaMin?: number
  pierdeConversatorio?: boolean
}

const MARGEN_JUSTO_MIN = 0
const MARGEN_JUSTO_MAX = 4

function evaluarPar(a: Funcion, b: Funcion, traslados: Traslados, salaA?: SalaId, salaB?: SalaId): ResultadoPar {
  const idSalaA = salaA ?? a.sala.id
  const idSalaB = salaB ?? b.sala.id
  const hueco = b.inicioMin - a.terminoMin
  const caminata = idSalaA === idSalaB ? 0 : traslados[idSalaA][idSalaB]

  if (hueco < 0) {
    return {
      hueco,
      caminata,
      tipo: 'choque',
      solapeDesde: b.inicioMin,
      solapeHasta: Math.min(a.terminoMin, b.terminoMin),
      pierdeConversatorio: a.conversatorioMin > 0,
    }
  }
  if (hueco < caminata) {
    return {
      hueco,
      caminata,
      tipo: 'traslado',
      necesitaMin: caminata,
      tieneMin: hueco,
      pierdeConversatorio: a.conversatorioMin > 0,
    }
  }
  if (a.conversatorioMin > 0 && hueco - caminata < a.conversatorioMin) {
    return {
      hueco,
      caminata,
      tipo: 'conversatorio',
      conversatorioMin: a.conversatorioMin,
      alcanzaMin: hueco - caminata,
    }
  }
  return { hueco, caminata, tipo: 'ok' }
}

function idAviso(tipo: TipoAviso, a: string, b?: string): string {
  return b ? `${tipo}-${a}-${b}` : `${tipo}-${a}`
}

export interface ResultadoAvisos {
  avisos: Aviso[]
  tramos: Tramo[]
}

export function calcularAvisos(seleccion: Funcion[], traslados: Traslados): ResultadoAvisos {
  const ordenadas = [...seleccion].sort((a, b) => a.inicioMin - b.inicioMin || a.id.localeCompare(b.id))
  const avisos: Aviso[] = []
  const paresConAlerta = new Set<string>()

  for (let i = 0; i < ordenadas.length; i++) {
    const a = ordenadas[i]
    for (let j = i + 1; j < ordenadas.length; j++) {
      const b = ordenadas[j]
      const resultado = evaluarPar(a, b, traslados)

      if (resultado.tipo === 'choque') {
        paresConAlerta.add(`${a.id}-${b.id}`)
        avisos.push({
          id: idAviso('choque', a.id, b.id),
          tipo: 'choque',
          nivel: 'alerta',
          ids: [a.id, b.id],
          solapeDesde: resultado.solapeDesde,
          solapeHasta: resultado.solapeHasta,
          pierdeConversatorio: resultado.pierdeConversatorio,
        })
      } else if (resultado.tipo === 'traslado') {
        paresConAlerta.add(`${a.id}-${b.id}`)
        avisos.push({
          id: idAviso('traslado', a.id, b.id),
          tipo: 'traslado',
          nivel: 'alerta',
          ids: [a.id, b.id],
          necesitaMin: resultado.necesitaMin,
          tieneMin: resultado.tieneMin,
          pierdeConversatorio: resultado.pierdeConversatorio,
        })
      } else if (resultado.tipo === 'conversatorio') {
        avisos.push({
          id: idAviso('conversatorio', a.id, b.id),
          tipo: 'conversatorio',
          nivel: 'cuidado',
          ids: [a.id, b.id],
          conversatorioMin: resultado.conversatorioMin,
          alcanzaMin: resultado.alcanzaMin,
        })
      }

      if (a.pelicula.id === b.pelicula.id) {
        avisos.push({
          id: idAviso('repetida', a.id, b.id),
          tipo: 'repetida',
          nivel: 'info',
          ids: [a.id, b.id],
        })
      }
    }
  }

  for (const f of ordenadas) {
    if (f.agotada) {
      avisos.push({ id: idAviso('agotada', f.id), tipo: 'agotada', nivel: 'info', ids: [f.id] })
    }
    if (f.aireLibre) {
      avisos.push({ id: idAviso('aireLibre', f.id), tipo: 'aireLibre', nivel: 'info', ids: [f.id] })
    }
  }

  // Lluvia (P2): para pares con Terraza Faro sin alerta ya detectada, se repite el cálculo
  // reemplazando la terraza por el Galpón 7 (misma hora de inicio, solo cambia la sala).
  for (let i = 0; i < ordenadas.length; i++) {
    const a = ordenadas[i]
    for (let j = i + 1; j < ordenadas.length; j++) {
      const b = ordenadas[j]
      if (paresConAlerta.has(`${a.id}-${b.id}`)) continue
      const aEsTerraza = a.sala.id === 'terraza'
      const bEsTerraza = b.sala.id === 'terraza'
      if (!aEsTerraza && !bEsTerraza) continue
      const salaA2: SalaId = aEsTerraza ? 'galpon' : a.sala.id
      const salaB2: SalaId = bEsTerraza ? 'galpon' : b.sala.id
      if (salaA2 === salaB2) continue
      const resultado = evaluarPar(a, b, traslados, salaA2, salaB2)
      if (resultado.tipo === 'choque' || resultado.tipo === 'traslado') {
        avisos.push({
          id: idAviso('lluvia', a.id, b.id),
          tipo: 'lluvia',
          nivel: 'cuidado',
          ids: [a.id, b.id],
          necesitaMin: resultado.tipo === 'traslado' ? resultado.necesitaMin : resultado.caminata,
          tieneMin: resultado.tipo === 'traslado' ? resultado.tieneMin : resultado.hueco,
        })
      }
    }
  }

  const tramos: Tramo[] = []
  for (let i = 0; i < ordenadas.length - 1; i++) {
    const a = ordenadas[i]
    const b = ordenadas[i + 1]
    if (a.dia !== b.dia) continue
    const resultado = evaluarPar(a, b, traslados)
    const margen = resultado.hueco - resultado.caminata
    let estado: EstadoTramo = 'ok'
    if (resultado.tipo === 'choque') estado = 'choque'
    else if (resultado.tipo === 'traslado') estado = 'traslado'
    else if (resultado.tipo === 'conversatorio') estado = 'conversatorio'
    else if (margen >= MARGEN_JUSTO_MIN && margen <= MARGEN_JUSTO_MAX) estado = 'justo'

    tramos.push({
      desde: a.id,
      hasta: b.id,
      caminataMin: resultado.caminata,
      margenMin: margen,
      estado,
    })
  }

  return { avisos, tramos }
}
