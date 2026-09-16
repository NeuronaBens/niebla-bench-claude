import GlifoSala from '@/components/marcas/GlifoSala'
import { traslado } from '@/lib/datos'
import type { SalaId } from '@/lib/tipos'
import estilos from './MapaPuerto.module.css'

interface Props {
  ruta?: SalaId[]
  etiquetaRuta?: string
}

const NODOS: Record<SalaId, { x: number; y: number; nombre: string }> = {
  galpon: { x: 110, y: 150, nombre: 'Galpón 7' },
  teatro: { x: 220, y: 110, nombre: 'Teatro' },
  muelle: { x: 340, y: 190, nombre: 'Muelle' },
  terraza: { x: 450, y: 105, nombre: 'Terraza' },
}

const PARES: [SalaId, SalaId][] = [
  ['galpon', 'teatro'],
  ['galpon', 'muelle'],
  ['galpon', 'terraza'],
  ['teatro', 'muelle'],
  ['teatro', 'terraza'],
  ['muelle', 'terraza'],
]

/** Esquema (no un mapa real) de las cuatro salas con los minutos caminando entre ellas. */
export default function MapaPuerto({ ruta, etiquetaRuta }: Props) {
  const salaIds = Object.keys(NODOS) as SalaId[]

  // Colapsa repeticiones consecutivas de la misma sala en un solo nodo numerado.
  const paradas: { salaId: SalaId; numeros: number[] }[] = []
  ruta?.forEach((salaId, i) => {
    const ultima = paradas[paradas.length - 1]
    if (ultima && ultima.salaId === salaId) ultima.numeros.push(i + 1)
    else paradas.push({ salaId, numeros: [i + 1] })
  })

  return (
    <div className={estilos.contenedor}>
      <p className={estilos.rotulo}>Esquema, no a escala{etiquetaRuta ? ` · ${etiquetaRuta}` : ''}</p>
      <svg
        className={estilos.mapa}
        viewBox="0 0 520 300"
        role="img"
        aria-label="Esquema de las cuatro salas con minutos caminando entre ellas. El detalle completo está en la tabla."
      >
        <path d="M0 250 Q 130 210 260 250 T 520 250" stroke="var(--linea)" strokeWidth="2" fill="none" opacity="0.5" />
        <rect x="0" y="255" width="520" height="45" fill="#0E1B24" opacity="0.6" />

        {PARES.map(([a, b]) => {
          const na = NODOS[a]
          const nb = NODOS[b]
          const mx = (na.x + nb.x) / 2
          const my = (na.y + nb.y) / 2
          return (
            <g key={`${a}-${b}`}>
              <line x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="var(--linea)" strokeWidth="1.5" strokeDasharray="4 4" />
              <text x={mx} y={my} textAnchor="middle" fontSize="14" fill="var(--bruma-tenue)" style={{ fontFamily: 'var(--f-rotulo, sans-serif)' }}>
                {traslado(a, b)} min
              </text>
            </g>
          )
        })}

        {ruta && ruta.length > 1 && (
          <polyline
            points={ruta.map((s) => `${NODOS[s].x},${NODOS[s].y}`).join(' ')}
            fill="none"
            stroke="var(--faro)"
            strokeWidth="3"
          />
        )}

        {paradas.map((p, i) => (
          <circle
            key={`num-${i}`}
            cx={NODOS[p.salaId].x + 14}
            cy={NODOS[p.salaId].y - 14}
            r="9"
            fill="var(--faro)"
            style={{ display: ruta ? 'block' : 'none' }}
          />
        ))}
        {paradas.map((p, i) => (
          <text
            key={`num-texto-${i}`}
            x={NODOS[p.salaId].x + 14}
            y={NODOS[p.salaId].y - 10}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="var(--sobre-faro)"
          >
            {p.numeros.join('·')}
          </text>
        ))}

        {salaIds.map((id) => (
          <g key={id} transform={`translate(${NODOS[id].x - 10}, ${NODOS[id].y - 10})`}>
            <circle cx="10" cy="10" r="18" fill="var(--noche-3)" />
            <GlifoSala salaId={id} />
          </g>
        ))}
      </svg>
    </div>
  )
}
