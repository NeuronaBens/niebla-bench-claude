// Afiche generado con código: sin imágenes, determinista por película (misma semilla siempre
// produce la misma pieza), sin estado, importable desde servidor y cliente. Ver docs/DETALLE.md 5.
//
// Todos los números de la pieza se calculan una sola vez, en `calcularParametros`, una función
// pura que no depende de qué tamaño se va a dibujar ni de cuántas veces se llame: usa un
// generador con semilla distinta por capa (fondo, motivo, niebla), sembrado con el id de la
// película más una sal fija por capa, así ningún tamaño "adelanta" al otro en la secuencia
// pseudoaleatoria. `mini`, `medio` y `grande` leen los mismos parámetros y solo deciden qué
// capas dibujar, nunca qué números salen — así la miniatura y el afiche grande son la misma
// pieza. Los `Motivo*` reciben esos números por props: no llaman al generador al renderizar.
import { crearGenerador, entre, entreEntero, hashFnv1a } from '@/lib/azar'
import { estiloDeSeccion } from '@/lib/estiloSecciones'
import type { Pelicula, SeccionId } from '@/lib/tipos'

export type TamanoAfiche = 'mini' | 'medio' | 'grande'

interface Props {
  pelicula: Pelicula
  tamano: TamanoAfiche
  instancia: string
}

const DIMENSIONES: Record<TamanoAfiche, { ancho: number; alto: number }> = {
  mini: { ancho: 48, alto: 60 },
  medio: { ancho: 160, alto: 200 },
  grande: { ancho: 400, alto: 500 },
}

function hexARgb(hex: string): [number, number, number] {
  const limpio = hex.replace('#', '')
  const num = parseInt(limpio, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function mezclarColor(colorA: string, colorB: string, t: number): string {
  const [ra, ga, ba] = hexARgb(colorA)
  const [rb, gb, bb] = hexARgb(colorB)
  const r = Math.round(ra + (rb - ra) * t)
  const g = Math.round(ga + (gb - ga) * t)
  const b = Math.round(ba + (bb - ba) * t)
  return `rgb(${r}, ${g}, ${b})`
}

const TINTA = '#0e1a24'
const NIEBLA = '#ece8df'

// --- Parámetros: una función pura por película, sin efecto de tamaño ni de reintentos. ---

interface ParametrosCompetencia {
  tipo: 'competencia'
  radio: number
  cx: number
  cy: number
  anillos: number
}

interface ParametrosPanorama {
  tipo: 'panorama'
  alturaHorizonte: number
  barcoX: number
}

interface ParametrosNocturna {
  tipo: 'nocturna'
  cantidad: number
  desdeAbajo: boolean
  lunaX: number
  lunaY: number
  alturasDientes: number[]
}

interface ParametrosCosta {
  tipo: 'costa'
  cantidad: number
  amplitudes: number[]
  fases: number[]
}

type ParametrosMotivo = ParametrosCompetencia | ParametrosPanorama | ParametrosNocturna | ParametrosCosta

interface ParametrosNiebla {
  cy: number
  ry: number
}

interface ParametrosAfiche {
  anguloDegradado: number
  motivo: ParametrosMotivo
  niebla: ParametrosNiebla[]
}

function calcularParametrosMotivo(seccion: SeccionId, gen: () => number): ParametrosMotivo {
  switch (seccion) {
    case 'competencia':
      return {
        tipo: 'competencia',
        radio: entre(gen, 50, 90, 1),
        cx: entre(gen, 130, 270, 1),
        cy: entre(gen, 110, 190, 1),
        anillos: entreEntero(gen, 3, 6),
      }
    case 'panorama':
      return {
        tipo: 'panorama',
        alturaHorizonte: entre(gen, 275, 375, 1),
        barcoX: entre(gen, 80, 320, 1),
      }
    case 'nocturna': {
      const cantidad = entreEntero(gen, 7, 13)
      return {
        tipo: 'nocturna',
        cantidad,
        desdeAbajo: gen() > 0.5,
        lunaX: entre(gen, 60, 340, 1),
        lunaY: entre(gen, 60, 130, 1),
        alturasDientes: Array.from({ length: cantidad }, () => entre(gen, 60, 220, 1)),
      }
    }
    case 'costa': {
      const cantidad = entreEntero(gen, 5, 9)
      return {
        tipo: 'costa',
        cantidad,
        amplitudes: Array.from({ length: cantidad }, () => entre(gen, 10, 26, 1)),
        fases: Array.from({ length: cantidad }, () => entre(gen, 0, 60, 1)),
      }
    }
  }
}

function calcularParametros(pelicula: Pelicula): ParametrosAfiche {
  // Un generador por capa, sembrado con el id de la película más una sal fija por capa: así
  // el motivo no depende de si la niebla se calculó antes, ni de en qué tamaño se dibuja.
  const genFondo = crearGenerador(hashFnv1a(`${pelicula.id}:fondo`))
  const genMotivo = crearGenerador(hashFnv1a(`${pelicula.id}:motivo`))
  const genNiebla = crearGenerador(hashFnv1a(`${pelicula.id}:niebla`))

  const anguloDegradado = entre(genFondo, -10, 10, 1)
  const motivo = calcularParametrosMotivo(pelicula.seccion, genMotivo)
  const niebla: ParametrosNiebla[] = Array.from({ length: 3 }, () => ({
    cy: 80 + genNiebla() * 340,
    ry: 60 + entre(genNiebla, 0, 40, 1),
  }))

  return { anguloDegradado, motivo, niebla }
}

// --- Dibujo: componentes puros que solo leen los parámetros ya calculados. ---

function MotivoCompetencia({ p, color }: { p: ParametrosCompetencia; color: string }) {
  return (
    <g opacity={0.85}>
      <circle cx={p.cx} cy={p.cy} r={p.radio * 0.5} fill={color} opacity={0.5} />
      {Array.from({ length: p.anillos }).map((_, i) => (
        <circle
          key={i}
          cx={p.cx}
          cy={p.cy}
          r={p.radio + i * (p.radio * 0.4)}
          fill="none"
          stroke={color}
          strokeWidth={1.5}
          opacity={0.5 - i * 0.06}
        />
      ))}
    </g>
  )
}

function MotivoPanorama({ p, color }: { p: ParametrosPanorama; color: string }) {
  const { alturaHorizonte, barcoX } = p
  return (
    <g opacity={0.8}>
      <line x1={0} y1={alturaHorizonte} x2={400} y2={alturaHorizonte} stroke={color} strokeWidth={1.5} />
      {Array.from({ length: 6 }).map((_, i) => {
        const y = alturaHorizonte + 12 + i * 16
        const inset = i * 10
        return (
          <line
            key={`p-${i}`}
            x1={inset}
            y1={y}
            x2={400 - inset}
            y2={y}
            stroke={color}
            strokeWidth={1}
            opacity={0.35 - i * 0.03}
          />
        )
      })}
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={`m-${i}`}
          x1={40 + i * 80}
          y1={alturaHorizonte}
          x2={40 + i * 80 + (i - 2) * 16}
          y2={500}
          stroke={color}
          strokeWidth={1}
          opacity={0.2}
        />
      ))}
      <g transform={`translate(${barcoX} ${alturaHorizonte - 2})`}>
        <polygon points="-22,0 22,0 14,-14 -14,-14" fill={color} opacity={0.7} />
        <line x1={0} y1={-14} x2={0} y2={-34} stroke={color} strokeWidth={2} opacity={0.7} />
      </g>
    </g>
  )
}

function MotivoNocturna({ p, color }: { p: ParametrosNocturna; color: string }) {
  const { cantidad, desdeAbajo, lunaX, lunaY, alturasDientes } = p
  const anchoDiente = 400 / cantidad
  return (
    <g>
      <circle cx={lunaX} cy={lunaY} r={18} fill={NIEBLA} opacity={0.5} />
      <g opacity={0.9}>
        {alturasDientes.map((alto, i) => {
          const x = i * anchoDiente
          const base = desdeAbajo ? 500 : 0
          const puntaY = desdeAbajo ? 500 - alto : alto
          return (
            <polygon
              key={i}
              points={`${x},${base} ${x + anchoDiente},${base} ${x + anchoDiente / 2},${puntaY}`}
              fill={color}
              opacity={0.55 + (i % 3) * 0.1}
            />
          )
        })}
      </g>
    </g>
  )
}

function MotivoCosta({ p, color }: { p: ParametrosCosta; color: string }) {
  const { cantidad, amplitudes, fases } = p
  return (
    <g opacity={0.85}>
      {amplitudes.map((amplitud, i) => {
        const y = 130 + i * (330 / cantidad)
        const fase = fases[i]
        const d = `M -20 ${y} C ${80 + fase} ${y - amplitud}, ${180 - fase} ${y + amplitud}, ${280} ${y} S ${480} ${y - amplitud}, ${520} ${y}`
        return <path key={i} d={d} fill="none" stroke={color} strokeWidth={1.6} opacity={0.5} />
      })}
      <g opacity={0.25} stroke={color} strokeWidth={1}>
        {Array.from({ length: 8 }).map((_, i) => (
          <line key={`d1-${i}`} x1={i * 60 - 100} y1={0} x2={i * 60 + 200} y2={500} />
        ))}
      </g>
    </g>
  )
}

function Motivo({ p, color }: { p: ParametrosMotivo; color: string }) {
  switch (p.tipo) {
    case 'competencia':
      return <MotivoCompetencia p={p} color={color} />
    case 'panorama':
      return <MotivoPanorama p={p} color={color} />
    case 'nocturna':
      return <MotivoNocturna p={p} color={color} />
    case 'costa':
      return <MotivoCosta p={p} color={color} />
  }
}

export function AfichePelicula({ pelicula, tamano, instancia }: Props) {
  const { ancho, alto } = DIMENSIONES[tamano]
  const estilo = estiloDeSeccion(pelicula.seccion)
  const { anguloDegradado, motivo, niebla } = calcularParametros(pelicula)

  const oscuro = mezclarColor(TINTA, estilo.colorPapel, 0.35)
  const medio = mezclarColor(TINTA, estilo.colorTinta, 0.4)

  const idBase = `af-${pelicula.id}-${instancia}`
  const idBlur = `${idBase}-blur`
  const idGrano = `${idBase}-grano`
  const idDegradado = `${idBase}-fondo`

  return (
    <svg
      viewBox="0 0 400 500"
      width={ancho}
      height={alto}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid slice"
      style={{ width: '100%', height: '100%', background: oscuro }}
    >
      <defs>
        <linearGradient id={idDegradado} gradientTransform={`rotate(${anguloDegradado} 0.5 0.5)`}>
          <stop offset="0%" stopColor={oscuro} />
          <stop offset="100%" stopColor={medio} />
        </linearGradient>
        {tamano !== 'mini' && (
          <filter id={idBlur}>
            <feGaussianBlur stdDeviation={18} />
          </filter>
        )}
        {tamano === 'grande' && (
          <filter id={idGrano}>
            <feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
        )}
      </defs>

      <rect x={0} y={0} width={400} height={500} fill={`url(#${idDegradado})`} />

      <Motivo p={motivo} color={estilo.colorTinta} />

      {tamano !== 'mini' && (
        <g filter={`url(#${idBlur})`}>
          {niebla.map((n, i) => (
            <ellipse key={i} cx={200} cy={n.cy} rx={340} ry={n.ry} fill={NIEBLA} opacity={0.2 + (i % 3) * 0.05} />
          ))}
        </g>
      )}

      {tamano === 'grande' && (
        <>
          <rect x={0} y={0} width={400} height={500} filter={`url(#${idGrano})`} opacity={0.08} />
          <text x={24} y={40} fill={NIEBLA} fontFamily="var(--font-texto)" fontSize={13} letterSpacing={2} opacity={0.85}>
            {estilo.nombreCorto.toUpperCase()} · {pelicula.anio}
          </text>
          <text
            x={24}
            y={462}
            fill={NIEBLA}
            fontFamily="var(--font-display)"
            fontWeight={800}
            fontSize={30}
            textLength={pelicula.titulo.length > 14 ? 352 : undefined}
            lengthAdjust="spacingAndGlyphs"
          >
            {pelicula.titulo}
          </text>
        </>
      )}
    </svg>
  )
}
