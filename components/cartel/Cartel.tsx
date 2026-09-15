import { parametrosCartel } from '@/lib/cartel'
import type { Pelicula } from '@/lib/tipos'
import { dibujarMotivo } from './motivos.tsx'
import estilos from './cartel.module.css'

const ANCHO = 300
const ALTO = 400

export function Cartel({
  pelicula,
  variante,
  idBase,
}: {
  pelicula: Pelicula
  variante: 'mini' | 'tarjeta' | 'grande'
  idBase: string
}) {
  const p = parametrosCartel(pelicula)
  const conFiltro = variante === 'grande'
  const luzX = p.luz.x * ANCHO
  const luzY = p.luz.y * ALTO
  const horizonteY = p.yHorizonte * ALTO

  const idCielo = `${idBase}-cielo`
  const idHalo = `${idBase}-halo`
  const idBlur = `${idBase}-blur`
  const idGrano = `${idBase}-grano`

  return (
    <svg
      className={`${estilos.cartel} ${estilos[variante]}`}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={idCielo} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.paleta.cieloArriba} />
          <stop offset="1" stopColor={p.paleta.cieloHorizonte} />
        </linearGradient>
        <radialGradient id={idHalo}>
          <stop offset="0" stopColor={p.paleta.luz} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.paleta.luz} stopOpacity="0" />
        </radialGradient>
        {conFiltro ? (
          <>
            <filter id={idBlur} x="-20%" y="-100%" width="140%" height="300%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <filter id={idGrano}>
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="ruido" />
              <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.06 0" />
            </filter>
          </>
        ) : null}
      </defs>

      <rect width={ANCHO} height={ALTO} fill={`url(#${idCielo})`} />

      <circle cx={luzX} cy={luzY} r={p.luz.r * 3} fill={`url(#${idHalo})`} />
      <circle cx={luzX} cy={luzY} r={p.luz.r} fill={p.paleta.luz} />
      {p.luz.doble ? (
        <circle cx={luzX} cy={luzY} r={p.luz.r + 8} fill="none" stroke={p.paleta.luz} strokeWidth="1.5" strokeOpacity="0.5" />
      ) : null}

      {Array.from({ length: p.lucesHorizonte }).map((_, i) => (
        <circle
          key={i}
          cx={(ANCHO * (i + 1)) / (p.lucesHorizonte + 1)}
          cy={horizonteY - 1}
          r="2.5"
          fill={p.paleta.luz}
        />
      ))}

      <rect x="0" y={horizonteY} width={ANCHO} height={ALTO - horizonteY} fill={p.paleta.figura} opacity="0.85" />
      {[0, 1, 2].map((i) => (
        <line
          key={i}
          x1="0"
          x2={ANCHO}
          y1={horizonteY + 10 + i * 14}
          y2={horizonteY + 10 + i * 14}
          stroke={p.paleta.niebla}
          strokeWidth="1"
          opacity="0.15"
        />
      ))}

      <g>{dibujarMotivo(p.motivo, { yHorizonte: p.yHorizonte, paleta: p.paleta, rnd: p.rnd })}</g>

      <g filter={conFiltro ? `url(#${idBlur})` : undefined}>
        {p.bandas.map((banda, i) => (
          <ellipse
            key={i}
            className={conFiltro ? estilos.banda : undefined}
            cx={banda.cx}
            cy={banda.cy}
            rx={banda.rx}
            ry={banda.ry}
            fill={p.paleta.niebla}
            opacity={conFiltro ? banda.opacidad : banda.opacidad * 0.6}
            style={conFiltro ? { animationDuration: `${banda.duracionS}s` } : undefined}
          />
        ))}
      </g>

      {conFiltro ? <rect width={ANCHO} height={ALTO} filter={`url(#${idGrano})`} opacity="0.5" /> : null}
    </svg>
  )
}
