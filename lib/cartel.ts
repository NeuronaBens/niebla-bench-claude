// Parámetros deterministas del "cartel de niebla" de cada película.
// Puro y testeable: ver docs/DETALLE.md sección 9. El componente
// components/cartel/Cartel.tsx solo dibuja lo que esta función calcula.

import type { Pelicula, SeccionId } from './tipos.ts'

export interface Paleta {
  cieloArriba: string
  cieloHorizonte: string
  niebla: string
  luz: string
  figura: string
}

const PALETAS: Record<SeccionId, Paleta> = {
  competencia: { cieloArriba: '#1B2530', cieloHorizonte: '#3A3B3F', niebla: '#E9D9BF', luz: '#F2A33A', figura: '#0E1419' },
  panorama: { cieloArriba: '#0F2226', cieloHorizonte: '#29423F', niebla: '#D5E4DA', luz: '#3DC47E', figura: '#0A1614' },
  nocturna: { cieloArriba: '#0B0B17', cieloHorizonte: '#231B36', niebla: '#C9BFE0', luz: '#B690FF', figura: '#06060C' },
  costa: { cieloArriba: '#10202E', cieloHorizonte: '#2D4B5E', niebla: '#DCE8EE', luz: '#56B8EA', figura: '#0B1822' },
}

export const MOTIVO_POR_DEFECTO = 'faro'

const MOTIVOS: Record<string, string> = {
  'la-hora-azul-del-puerto': 'grua',
  'sal-de-roca': 'salinas',
  'los-que-cuidan-el-faro': 'faro',
  'temporada-seca': 'sequia',
  'cordillera-de-papel': 'papel',
  'madrugada-en-paysandu': 'taxi',
  vidrio: 'vidrio',
  'el-canto-de-las-redes': 'red',
  'transbordador-de-invierno': 'transbordador',
  'mar-negro': 'hielo',
  'horas-muertas': 'lavanderia',
  'ostrava-blues': 'mina',
  'linea-de-sal': 'marea',
  'doce-noches-claras': 'edificio',
  'la-niebla-tiene-dientes': 'dientes',
  'marea-roja': 'mareaRoja',
  'casa-de-pescadores': 'casaRedes',
  'las-cintas-del-faro': 'vhs',
  ahogados: 'campanario',
  'cortos-oficios-del-mar': 'seisOficios',
  'cortos-noches-de-puerto': 'cincoBares',
  'caleta-sur': 'caleta',
  'el-ultimo-astillero': 'astillero',
  'bruma-1987': 'super8',
}

export function motivoDe(peliculaId: string): string {
  return MOTIVOS[peliculaId] ?? MOTIVO_POR_DEFECTO
}

function fnv1a32(texto: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

function mulberry32(semilla: number): () => number {
  let a = semilla
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface ParametrosLuz {
  x: number
  y: number
  r: number
  doble: boolean
}

export interface ParametrosBanda {
  cx: number
  cy: number
  rx: number
  ry: number
  opacidad: number
  duracionS: number
}

export interface ParametrosCartel {
  paleta: Paleta
  motivo: string
  luz: ParametrosLuz
  lucesHorizonte: number
  yHorizonte: number
  bandas: ParametrosBanda[]
  rnd: () => number
}

function contarBandas(duracionMin: number): number {
  const n = 3 + Math.round(((duracionMin - 63) / (121 - 63)) * 4)
  return Math.min(7, Math.max(3, n))
}

export function parametrosCartel(pelicula: Pelicula): ParametrosCartel {
  const semilla = fnv1a32(pelicula.id)
  const rnd = mulberry32(semilla)

  const x = 0.2 + rnd() * 0.6
  const y = 0.18 + rnd() * 0.16
  const r = 22 + rnd() * 12
  const yHorizonte = 0.58 + rnd() * 0.12

  const n = contarBandas(pelicula.duracionMin)
  const bandas: ParametrosBanda[] = []
  for (let i = 0; i < n; i++) {
    bandas.push({
      cx: 150 + (rnd() - 0.5) * 220,
      cy: 400 * yHorizonte + (rnd() - 0.5) * 60 + i * 8,
      rx: 180 + rnd() * 80,
      ry: 18 + rnd() * 22,
      opacidad: 0.1 + rnd() * 0.22,
      duracionS: 24 + rnd() * 16,
    })
  }

  return {
    paleta: PALETAS[pelicula.seccion],
    motivo: motivoDe(pelicula.id),
    luz: { x, y, r, doble: pelicula.estreno === 'mundial' },
    lucesHorizonte: pelicula.pais.split(',').length,
    yHorizonte,
    bandas,
    rnd,
  }
}
