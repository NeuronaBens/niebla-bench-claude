import type { Forma, Marca, Pelicula, SeccionId } from './tipos'

// Marca visual determinista de cada película, sin afiches: mismo id, misma
// marca, siempre. Nunca se usa `Math.random`, la fecha actual ni el índice
// del array; todo sale de un hash del id de la película.

const TONO_BASE: Record<SeccionId, number> = {
  competencia: 330,
  panorama: 165,
  nocturna: 262,
  costa: 208,
}

/** FNV-1a de 32 bits. */
export function hash32(texto: string): number {
  let hash = 2166136261
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

/** mulberry32: generador determinista de números en [0, 1) a partir de una semilla. */
export function crearGenerador(semilla: number): () => number {
  let a = semilla >>> 0
  return function siguiente() {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Redondea a 1 decimal, para un SVG compacto e idéntico en servidor y cliente. */
function r1(n: number): number {
  return Math.round(n * 10) / 10
}

function hsl(h: number, s: number, l: number, alpha?: number): string {
  const hh = r1(((h % 360) + 360) % 360)
  return alpha === undefined ? `hsl(${hh}, ${s}%, ${l}%)` : `hsla(${hh}, ${s}%, ${l}%, ${r1(alpha)})`
}

function formaNiebla(r: () => number, horizonteY: number): Forma {
  return {
    capa: 'niebla',
    tipo: 'ellipse',
    atributos: {
      cx: r1(r() * 120),
      cy: r1(horizonteY - 20 + r() * 30),
      rx: r1(30 + r() * 30),
      ry: r1(6 + r() * 6),
      fill: `rgba(232,238,240,${r1(0.06 + r() * 0.1)})`,
    },
  }
}

function motivoCompetencia(r: () => number, horizonteY: number, colorTrazo: string): Forma[] {
  const formas: Forma[] = []
  const cx = r1(20 + r() * 80)
  const cy = r1(18 + r() * Math.max(1, horizonteY - 14 - 18))
  const radio = r1(9 + r() * 11)
  formas.push({
    capa: 'motivo',
    tipo: 'circle',
    atributos: { cx, cy, r: radio, fill: hsl(45, 78, 65, r1(0.85 + r() * 0.15)) },
  })
  const nOlas = 4 + Math.floor(r() * 4)
  for (let i = 0; i < nOlas; i++) {
    const y = r1(horizonteY + 6 + (i * (150 - horizonteY - 6)) / nOlas)
    const amplitud = r1(1.5 + r() * 4.5)
    const longitud = r1(16 + r() * 24)
    const fase = r1(r() * longitud)
    const puntos: string[] = []
    for (let x = -fase; x <= 126; x += longitud / 6) {
      puntos.push(`${r1(x)},${r1(y + Math.sin((x / longitud) * Math.PI * 2) * amplitud)}`)
    }
    formas.push({
      capa: 'motivo',
      tipo: 'polyline',
      atributos: {
        points: puntos.join(' '),
        fill: 'none',
        stroke: colorTrazo,
        'stroke-width': r1(1.5 + (i % 2) * 1),
        opacity: r1(Math.max(0.15, 0.55 - (i / nOlas) * 0.4)),
      },
    })
  }
  const nGuiones = 3 + Math.floor(r() * 3)
  for (let i = 0; i < nGuiones; i++) {
    const ancho = r1(6 + r() * 10)
    const y = r1(horizonteY + 6 + i * 7)
    formas.push({
      capa: 'motivo',
      tipo: 'line',
      atributos: {
        x1: r1(cx - ancho / 2),
        y1: y,
        x2: r1(cx + ancho / 2),
        y2: y,
        stroke: hsl(45, 70, 70, r1(Math.max(0.1, 0.5 - i * 0.1))),
        'stroke-width': 1.5,
      },
    })
  }
  return formas
}

function motivoPanorama(r: () => number, horizonteY: number, colorTrazo: string): Forma[] {
  const formas: Forma[] = []
  const cx = r1(25 + r() * 70)
  const cy = r1(30 + r() * Math.max(1, horizonteY + 20 - 30))
  const nCirculos = 3 + Math.floor(r() * 4)
  const pasoRadio = r1(9 + r() * 7)
  const patrones = ['', '4 3', '1 4']
  for (let i = 1; i <= nCirculos; i++) {
    const patron = patrones[Math.floor(r() * patrones.length)]
    formas.push({
      capa: 'motivo',
      tipo: 'circle',
      atributos: {
        cx,
        cy,
        r: r1(pasoRadio * i),
        fill: 'none',
        stroke: colorTrazo,
        'stroke-width': 1.5,
        opacity: 0.8,
        ...(patron ? { 'stroke-dasharray': patron } : {}),
      },
    })
  }
  const angulo = (20 + r() * 140) * (Math.PI / 180)
  formas.push({
    capa: 'motivo',
    tipo: 'line',
    atributos: {
      x1: r1(cx - Math.cos(angulo) * 70),
      y1: r1(cy - Math.sin(angulo) * 70),
      x2: r1(cx + Math.cos(angulo) * 70),
      y2: r1(cy + Math.sin(angulo) * 70),
      stroke: colorTrazo,
      'stroke-width': 1,
      opacity: 0.5,
    },
  })
  const indice = 1 + Math.floor(r() * nCirculos)
  const anguloPunto = r() * Math.PI * 2
  formas.push({
    capa: 'motivo',
    tipo: 'circle',
    atributos: {
      cx: r1(cx + Math.cos(anguloPunto) * pasoRadio * indice),
      cy: r1(cy + Math.sin(anguloPunto) * pasoRadio * indice),
      r: 2.5,
      fill: colorTrazo,
    },
  })
  return formas
}

function motivoNocturna(r: () => number, horizonteY: number, colorTrazo: string, colorFondoNoche: string): Forma[] {
  const formas: Forma[] = []
  const nDientes = 7 + Math.floor(r() * 8)
  const anchoDiente = 120 / nDientes
  const puntosArea = ['0,150']
  const puntosSierra: string[] = []
  for (let i = 0; i <= nDientes; i++) {
    const alto = r1(6 + r() * 20)
    const y = r1(horizonteY - (i % 2 === 0 ? alto : alto * 0.4))
    const x = r1(i * anchoDiente)
    puntosArea.push(`${x},${y}`)
    puntosSierra.push(`${x},${y}`)
  }
  puntosArea.push('120,150')
  formas.push({ capa: 'motivo', tipo: 'polyline', atributos: { points: puntosArea.join(' '), fill: colorFondoNoche, stroke: 'none' } })
  formas.push({
    capa: 'motivo',
    tipo: 'polyline',
    atributos: { points: puntosSierra.join(' '), fill: 'none', stroke: colorTrazo, 'stroke-width': 2 },
  })
  const nLuces = 1 + Math.floor(r() * 2)
  for (let i = 0; i < nLuces; i++) {
    formas.push({
      capa: 'motivo',
      tipo: 'circle',
      atributos: {
        cx: r1(10 + r() * 100),
        cy: r1(horizonteY - r() * 30),
        r: r1(1.5 + r() * 1.5),
        fill: r() > 0.5 ? '#FF7B6B' : '#E8EEF0',
      },
    })
  }
  return formas
}

function motivoCosta(r: () => number, horizonteY: number, colorTrazo: string): Forma[] {
  const formas: Forma[] = []
  const nVert = 5 + Math.floor(r() * 5)
  const nHoriz = 5 + Math.floor(r() * 4)
  for (let i = 0; i <= nVert; i++) {
    const x0 = (i * 120) / nVert
    const amplitud = r1(1 + r() * 3)
    const fase = r() * Math.PI * 2
    const puntos: string[] = []
    for (let y = horizonteY; y <= 150; y += 8) {
      const x = r1(x0 + Math.sin(y / 14 + fase) * amplitud)
      puntos.push(`${x},${r1(y)}`)
      if (r() < 0.12) formas.push({ capa: 'motivo', tipo: 'circle', atributos: { cx: x, cy: r1(y), r: 1.6, fill: colorTrazo } })
    }
    formas.push({
      capa: 'motivo',
      tipo: 'polyline',
      atributos: { points: puntos.join(' '), fill: 'none', stroke: colorTrazo, 'stroke-width': 1, opacity: 0.6 },
    })
  }
  for (let j = 0; j <= nHoriz; j++) {
    const y0 = horizonteY + (j * (150 - horizonteY)) / nHoriz
    const amplitud = r1(1 + r() * 3)
    const fase = r() * Math.PI * 2
    const puntos: string[] = []
    for (let x = 0; x <= 120; x += 8) {
      puntos.push(`${r1(x)},${r1(y0 + Math.sin(x / 14 + fase) * amplitud)}`)
    }
    formas.push({
      capa: 'motivo',
      tipo: 'polyline',
      atributos: { points: puntos.join(' '), fill: 'none', stroke: colorTrazo, 'stroke-width': 1, opacity: 0.6 },
    })
  }
  const nPostes = 2 + Math.floor(r() * 3)
  for (let i = 0; i < nPostes; i++) {
    const x = r1(10 + r() * 100)
    formas.push({
      capa: 'motivo',
      tipo: 'line',
      atributos: { x1: x, y1: horizonteY, x2: x, y2: r1(horizonteY - (6 + r() * 6)), stroke: colorTrazo, 'stroke-width': 2 },
    })
  }
  return formas
}

const cache = new Map<string, Marca>()

/**
 * Genera la marca visual de una película: primitivas ya calculadas, listas
 * para dibujar. Consume el generador en un orden fijo (tono, horizonte,
 * niebla, motivo de sección) para que el resultado sea siempre el mismo.
 * Se cachea por id de película: es determinista, así que calcularla dos
 * veces siempre da lo mismo.
 */
export function generarMarca(pelicula: Pelicula): Marca {
  const cacheada = cache.get(pelicula.id)
  if (cacheada) return cacheada
  const marca = calcularMarca(pelicula)
  cache.set(pelicula.id, marca)
  return marca
}

function calcularMarca(pelicula: Pelicula): Marca {
  const r = crearGenerador(hash32(pelicula.id))
  const tonoBase = TONO_BASE[pelicula.seccion]
  const H = tonoBase + (r() * 30 - 15)
  const horizonteY = r1(70 + r() * 40)
  const colorBase = hsl(H, 32, 13)
  const colorHorizonte = hsl(H, 40, 20)
  const colorTrazo = hsl(H, 70, 74)

  const formas: Forma[] = [
    { capa: 'fondo', tipo: 'rect', atributos: { x: 0, y: 0, width: 120, height: 160, fill: colorBase } },
    {
      capa: 'fondo',
      tipo: 'rect',
      atributos: { x: 0, y: horizonteY, width: 120, height: r1(160 - horizonteY), fill: colorHorizonte },
    },
    {
      capa: 'fondo',
      tipo: 'line',
      atributos: { x1: 0, y1: horizonteY, x2: 120, y2: horizonteY, stroke: hsl(H, 30, 60, 0.6), 'stroke-width': 1 },
    },
  ]

  const nNiebla = 2 + Math.floor(r() * 2)
  for (let i = 0; i < nNiebla; i++) formas.push(formaNiebla(r, horizonteY))

  if (pelicula.seccion === 'competencia') formas.push(...motivoCompetencia(r, horizonteY, colorTrazo))
  else if (pelicula.seccion === 'panorama') formas.push(...motivoPanorama(r, horizonteY, colorTrazo))
  else if (pelicula.seccion === 'nocturna') formas.push(...motivoNocturna(r, horizonteY, colorTrazo, hsl(H, 35, 9)))
  else formas.push(...motivoCosta(r, horizonteY, colorTrazo))

  formas.push({
    capa: 'marco',
    tipo: 'rect',
    atributos: { x: 5, y: 5, width: 110, height: 150, fill: 'none', stroke: hsl(H, 30, 60, 0.25), 'stroke-width': 1 },
  })

  return { viewBox: '0 0 120 160', fondo: { colorBase, colorHorizonte }, horizonteY, formas }
}
