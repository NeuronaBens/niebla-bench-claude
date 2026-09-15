import type { Paleta } from '@/lib/cartel'

export interface PropsMotivo {
  yHorizonte: number // 0-1, fracción del alto (400)
  paleta: Paleta
  rnd: () => number
}

const ANCHO = 300
const ALTO = 400

function y(frac: number): number {
  return ALTO * frac
}

const motivos: Record<string, (p: PropsMotivo) => React.ReactNode> = {
  grua({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <rect x="70" y={base - 90} width="6" height="90" fill={paleta.figura} />
        <rect x="150" y={base - 110} width="6" height="110" fill={paleta.figura} />
        <rect x="60" y={base - 92} width="102" height="6" fill={paleta.figura} />
        <rect x="150" y={base - 115} width="80" height="6" fill={paleta.figura} />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={95 + i * 2} y={base - 22 - i * 14} width="34" height="14" fill={paleta.figura} />
        ))}
        <rect x="99" y={base - 36} width="8" height="6" fill={paleta.luz} />
      </g>
    )
  },
  salinas({ yHorizonte, paleta, rnd }) {
    const base = y(yHorizonte)
    const montones = 3 + Math.round(rnd())
    return (
      <g>
        {Array.from({ length: montones }).map((_, i) => (
          <polygon
            key={i}
            points={`${40 + i * 60},${base} ${70 + i * 60},${base - 34} ${100 + i * 60},${base}`}
            fill={paleta.niebla}
            opacity="0.8"
          />
        ))}
        <rect x="220" y={base - 30} width="30" height="30" fill={paleta.figura} />
        <polygon points={`218,${base - 30} 235,${base - 44} 252,${base - 30}`} fill={paleta.figura} />
      </g>
    )
  },
  faro({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <polygon points={`142,${base} 158,${base} 152,${base - 70} 148,${base - 70}`} fill={paleta.figura} />
        <rect x="145" y={base - 82} width="10" height="12" fill={paleta.luz} />
        <circle cx="120" cy={base - 2} r="9" fill={paleta.figura} />
        <circle cx="103" cy={base - 1} r="5" fill={paleta.figura} />
      </g>
    )
  },
  sequia({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <path
          d={`M0,${base} L60,${base} L75,${base + 10} L95,${base} L140,${base} L155,${base + 12} L180,${base} L300,${base}`}
          fill="none"
          stroke={paleta.luz}
          strokeWidth="1.5"
          opacity="0.4"
        />
        <rect x="190" y={base - 26} width="46" height="20" rx="2" fill={paleta.figura} />
        <circle cx="202" cy={base - 4} r="5" fill={paleta.figura} />
        <circle cx="226" cy={base - 4} r="5" fill={paleta.figura} />
      </g>
    )
  },
  papel({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g fill="none" stroke={paleta.niebla} strokeWidth="1.5">
        <polyline points={`10,${base} 60,${base - 50} 110,${base - 10} 160,${base - 60} 210,${base - 15} 260,${base - 45} 300,${base - 5}`} />
        <polyline points={`0,${base + 10} 55,${base - 38} 108,${base + 2} 158,${base - 46} 208,${base} 258,${base - 32} 300,${base + 8}`} opacity="0.7" />
        <rect x="220" y={base - 90} width="16" height="12" fill={paleta.niebla} stroke="none" opacity="0.9" />
      </g>
    )
  },
  taxi({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <path d={`M0,${base} L130,${base - 60}`} stroke={paleta.figura} strokeWidth="1.5" />
        <path d={`M300,${base} L170,${base - 60}`} stroke={paleta.figura} strokeWidth="1.5" />
        {[0, 1, 2, 3].map((i) => (
          <circle key={i} cx={70 + i * 40} cy={base - 20 - i * 8} r="2" fill={paleta.luz} />
        ))}
        <rect x="120" y={base - 18} width="40" height="16" rx="2" fill={paleta.figura} />
        <circle cx="128" cy={base - 2} r="3" fill={paleta.figura} />
        <circle cx="152" cy={base - 2} r="3" fill={paleta.figura} />
        <circle cx="156" cy={base - 12} r="2.5" fill={paleta.luz} />
      </g>
    )
  },
  vidrio({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g fill={paleta.luz} stroke={paleta.luz} strokeWidth="1">
        <path d={`M110,${base} q-4,-40 12,-46 q16,6 12,46 z`} opacity="0.35" />
        <path d={`M150,${base} q-6,-60 16,-70 q22,10 16,70 z`} opacity="0.45" />
        <path d={`M195,${base} q-3,-30 9,-34 q12,4 9,34 z`} opacity="0.3" />
      </g>
    )
  },
  red({ yHorizonte, paleta }) {
    const base = y(yHorizonte) - 40
    const filas = 5
    const cols = 8
    return (
      <g stroke={paleta.figura} strokeWidth="1" opacity="0.8">
        <line x1="40" y1={base} x2="40" y2={base + 50} />
        <line x1="260" y1={base} x2="260" y2={base + 50} />
        {Array.from({ length: filas }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => (
            <line
              key={`${r}-${c}`}
              x1={40 + (c * 220) / cols}
              y1={base + (r * 50) / filas}
              x2={40 + ((c + 1) * 220) / cols}
              y2={base + ((r + 1) * 50) / filas}
            />
          ))
        )}
        <circle cx="150" cy={base + 65} r="14" fill="none" opacity="0.5" />
        <circle cx="150" cy={base + 65} r="24" fill="none" opacity="0.3" />
      </g>
    )
  },
  transbordador({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <polygon points={`40,${base} 260,${base} 240,${base - 30} 60,${base - 30}`} fill={paleta.figura} />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={90 + i * 50} y={base - 24} width="14" height="10" fill={paleta.luz} />
        ))}
        {[0, 1, 2].map((i) => (
          <line key={i} x1={40 + i * 20} y1={base - 60} x2={70 + i * 20} y2={base - 90} stroke={paleta.niebla} strokeWidth="1.5" opacity="0.5" />
        ))}
      </g>
    )
  },
  hielo({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <rect x="0" y={base - 6} width={ANCHO} height="10" fill={paleta.niebla} opacity="0.7" />
        <circle cx="150" cy={base - 1} r="16" fill={paleta.cieloArriba} />
        <circle cx="150" cy={base + 20} r="6" fill={paleta.figura} />
      </g>
    )
  },
  lavanderia({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <rect x="90" y={base - 40} width="120" height="40" fill={paleta.figura} />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx={115 + i * 35} cy={base - 20} r="12" fill="none" stroke={i === 1 ? paleta.luz : paleta.niebla} strokeWidth="1.5" />
            <circle cx={115 + i * 35} cy={base - 20} r="6" fill="none" stroke={i === 1 ? paleta.luz : paleta.niebla} strokeWidth="1" />
          </g>
        ))}
      </g>
    )
  },
  mina({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g stroke={paleta.figura} strokeWidth="1.5" fill="none">
        <line x1="140" y1={base} x2="140" y2={base - 70} />
        <line x1="170" y1={base} x2="170" y2={base - 70} />
        <line x1="140" y1={base - 70} x2="170" y2={base - 70} />
        <line x1="140" y1={base - 20} x2="170" y2={base - 50} />
        <line x1="140" y1={base - 50} x2="170" y2={base - 20} />
        <circle cx="155" cy={base - 82} r="10" />
        <path d={`M80,${base} q10,-14 20,0 M90,${base} q10,-14 20,0`} strokeWidth="1" opacity="0.7" />
      </g>
    )
  },
  marea({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x={40 + i * 60} y={base - 30} width="40" height="30" fill={paleta.figura} />
            <path d={`M${40 + i * 60},${base - 12} h40`} stroke={paleta.luz} strokeWidth="1.5" opacity="0.6" />
          </g>
        ))}
        <line x1="260" y1={base - 60} x2="260" y2={base} stroke={paleta.luz} strokeWidth="1.5" />
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="256" y1={base - 10 - i * 12} x2="264" y2={base - 10 - i * 12} stroke={paleta.luz} strokeWidth="1" />
        ))}
      </g>
    )
  },
  edificio({ yHorizonte, paleta, rnd }) {
    const base = y(yHorizonte)
    const ancho = 130
    const alto = 110
    const x0 = 90
    const y0 = base - alto
    return (
      <g>
        <rect x={x0} y={y0} width={ancho} height={alto} fill={paleta.figura} />
        {Array.from({ length: 12 }).map((_, i) => {
          const col = i % 3
          const fila = Math.floor(i / 3)
          const encendida = rnd() > 0.55
          return (
            <rect
              key={i}
              x={x0 + 14 + col * 38}
              y={y0 + 14 + fila * 24}
              width="18"
              height="14"
              fill={encendida ? paleta.luz : paleta.cieloArriba}
            />
          )
        })}
        <circle cx="250" cy={y0 - 6} r="7" fill={paleta.luz} opacity="0.5" />
        <circle cx={x0 + ancho - 12} cy={y0 - 4} r="3" fill={paleta.figura} />
      </g>
    )
  },
  dientes({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    const dientes = 10
    let puntos = `0,${base - 40} `
    for (let i = 0; i <= dientes; i++) {
      const x = (i * ANCHO) / dientes
      puntos += `${x},${base - (i % 2 === 0 ? 40 : 20)} `
    }
    puntos += `${ANCHO},${base + 20} 0,${base + 20}`
    return (
      <g>
        <polygon points={puntos} fill={paleta.niebla} opacity="0.6" />
        <rect x="60" y={base + 10} width="24" height="18" fill={paleta.figura} />
        <rect x="200" y={base + 8} width="24" height="20" fill={paleta.figura} />
      </g>
    )
  },
  mareaRoja({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <path d={`M0,${base} q40,-14 80,0 t80,0 t80,0 t60,0`} fill="none" stroke={paleta.niebla} strokeWidth="2" opacity="0.5" />
        <path d={`M0,${base - 6} q40,-14 80,0 t80,0 t80,0 t60,0`} fill="none" stroke="#C2413A" strokeWidth="1.5" opacity="0.8" />
        <polygon points={`220,${base + 20} 260,${base - 20} 300,${base + 20}`} fill={paleta.figura} />
      </g>
    )
  },
  casaRedes({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <polygon points={`110,${base - 50} 150,${base - 78} 190,${base - 50}`} fill={paleta.figura} />
        <rect x="115" y={base - 50} width="70" height="50" fill={paleta.figura} />
        {Array.from({ length: 18 }).map((_, i) => (
          <circle key={i} cx={200 + (i % 6) * 12} cy={base - 40 + Math.floor(i / 6) * 14} r="2" fill={paleta.luz} opacity="0.8" />
        ))}
      </g>
    )
  },
  vhs({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <rect x="30" y={base - 90} width="240" height="140" fill="none" stroke={paleta.figura} strokeWidth="2" />
        <polygon points={`142,${base - 30} 158,${base - 30} 152,${base - 60} 148,${base - 60}`} fill={paleta.figura} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x="30" y={base - 90 + 20 + i * 25} width="240" height="4" fill={paleta.luz} opacity="0.35" />
        ))}
        <rect x="30" y={base + 30} width="240" height="10" fill="#ffffff" opacity="0.08" />
      </g>
    )
  },
  campanario({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <rect x="140" y={base - 80} width="20" height="80" fill={paleta.figura} />
        <polygon points={`134,${base - 80} 150,${base - 100} 166,${base - 80}`} fill={paleta.figura} />
        <rect x="146" y={base - 60} width="8" height="10" fill={paleta.luz} opacity="0.6" />
        <g opacity="0.3" transform={`scale(1,-1) translate(0,${-2 * base})`}>
          <rect x="140" y={base - 80} width="20" height="80" fill={paleta.figura} />
          <polygon points={`134,${base - 80} 150,${base - 100} 166,${base - 80}`} fill={paleta.figura} />
        </g>
      </g>
    )
  },
  seisOficios({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    const anchoPanel = ANCHO / 6
    const formas = ['balde', 'remo', 'bote', 'pez', 'gancho', 'canasto']
    return (
      <g>
        {formas.map((forma, i) => {
          const cx = anchoPanel * i + anchoPanel / 2
          return (
            <g key={forma} stroke={paleta.figura} strokeWidth="1.5" fill="none">
              <line x1={anchoPanel * i} y1={base - 90} x2={anchoPanel * i} y2={base + 10} opacity="0.25" />
              {forma === 'balde' && <rect x={cx - 8} y={base - 20} width="16" height="14" />}
              {forma === 'remo' && <line x1={cx} y1={base - 40} x2={cx} y2={base} />}
              {forma === 'bote' && <path d={`M${cx - 12},${base - 6} q12,10 24,0`} />}
              {forma === 'pez' && <ellipse cx={cx} cy={base - 14} rx="10" ry="5" />}
              {forma === 'gancho' && <path d={`M${cx},${base - 30} v20 q0,10 -8,10`} />}
              {forma === 'canasto' && <path d={`M${cx - 10},${base - 20} h20 l-3,16 h-14 z`} />}
            </g>
          )
        })}
      </g>
    )
  },
  cincoBares({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    const anchoLetrero = 40
    return (
      <g>
        {[0, 1, 2, 3, 4].map((i) => {
          const encendido = i === 2
          const x = 20 + i * 52
          return (
            <rect
              key={i}
              x={x}
              y={base - 40}
              width={anchoLetrero}
              height="20"
              fill={encendido ? paleta.luz : 'none'}
              stroke={paleta.figura}
              strokeWidth="1.5"
            />
          )
        })}
      </g>
    )
  },
  caleta({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <path d={`M${20 + i * 65},${base} q20,-16 50,0 z`} fill={paleta.figura} />
            <line x1={30 + i * 65} y1={base - 4} x2={60 + i * 65} y2={base - 4} stroke={paleta.luz} strokeWidth="2" />
          </g>
        ))}
        <rect x="250" y={base - 40} width="2" height="40" fill={paleta.figura} />
        <rect x="235" y={base - 46} width="30" height="10" fill="none" stroke={paleta.figura} strokeWidth="1" />
      </g>
    )
  },
  astillero({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g stroke={paleta.figura} strokeWidth="1.75" fill="none">
        <path d={`M60,${base} Q150,${base - 40} 240,${base}`} />
        {Array.from({ length: 6 }).map((_, i) => {
          const x = 75 + i * 30
          return <path key={i} d={`M${x},${base + 4} Q${x + 15},${base - 22} ${x + 30},${base + 4}`} />
        })}
        <line x1="50" y1={base + 6} x2="250" y2={base + 6} strokeWidth="1" opacity="0.5" />
      </g>
    )
  },
  super8({ yHorizonte, paleta }) {
    const base = y(yHorizonte)
    return (
      <g>
        <rect x="40" y={base - 70} width="220" height="140" rx="6" fill="none" stroke={paleta.figura} strokeWidth="2" />
        {Array.from({ length: 6 }).map((_, i) => (
          <g key={i}>
            <rect x="46" y={base - 60 + i * 22} width="6" height="10" fill={paleta.figura} />
            <rect x="248" y={base - 60 + i * 22} width="6" height="10" fill={paleta.figura} />
          </g>
        ))}
        <circle cx="120" cy={base - 10} r="10" fill={paleta.figura} />
        <circle cx="150" cy={base + 2} r="7" fill={paleta.figura} />
        <path d={`M100,${base + 10} h80`} stroke={paleta.luz} strokeWidth="2" opacity="0.5" />
      </g>
    )
  },
}

export function dibujarMotivo(nombre: string, props: PropsMotivo): React.ReactNode {
  const fn = motivos[nombre] ?? motivos.faro
  return fn(props)
}
