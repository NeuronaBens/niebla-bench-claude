import { salas, traslados } from '@/lib/programa'
import type { SalaId } from '@/lib/tipos'
import styles from './MapaSalas.module.css'

const POSICIONES: Record<SalaId, { x: number; y: number }> = {
  terraza: { x: 335, y: 45 },
  muelle: { x: 320, y: 250 },
  teatro: { x: 80, y: 60 },
  galpon: { x: 75, y: 245 },
}

// Los nombres completos de `sala.nombre` no caben junto al nodo en el esquema; este acorte
// editorial vive en un `Record<SalaId, string>` (no en una cadena de condicionales) para que
// TypeScript avise si alguna vez se agrega o quita una sala sin actualizarlo. Los nombres
// completos y la dirección real siempre se muestran en la lista y en la tabla, debajo.
const NOMBRES_CORTOS: Record<SalaId, string> = {
  teatro: 'Teatro',
  muelle: 'El Muelle',
  galpon: 'Galpón 7',
  terraza: 'Terraza',
}

// Fracción a la que se ubica la etiqueta a lo largo de cada tramo (no siempre el punto medio),
// para que las dos diagonales que se cruzan cerca del centro no superpongan sus números.
const PARES: [SalaId, SalaId, number][] = [
  ['teatro', 'muelle', 0.5],
  ['teatro', 'galpon', 0.5],
  ['teatro', 'terraza', 0.55],
  ['muelle', 'galpon', 0.45],
  ['muelle', 'terraza', 0.5],
  ['galpon', 'terraza', 0.7],
]

export function MapaSalas() {
  return (
    <section className={`${styles.seccion} contenedor`} aria-labelledby="titulo-salas">
      <h2 id="titulo-salas" className={styles.titulo}>
        Dónde
      </h2>

      <div className={styles.esquemaWrap}>
        <svg
          viewBox="0 0 400 300"
          className={styles.svg}
          role="img"
          aria-label="Esquema de las cuatro salas del festival y los minutos caminando entre ellas. No está a escala; el detalle exacto está en la tabla de abajo."
        >
          <path
            d="M 420 -10 C 360 40, 380 120, 320 160 C 280 190, 300 230, 260 280"
            fill="none"
            stroke="var(--tinta-3)"
            strokeWidth="1.5"
          />
          {PARES.map(([a, b, t]) => {
            const pa = POSICIONES[a]
            const pb = POSICIONES[b]
            const mx = pa.x + (pb.x - pa.x) * t
            const my = pa.y + (pb.y - pa.y) * t
            return (
              <g key={`${a}-${b}`}>
                <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="var(--tinta-3)" strokeWidth="1" />
                <rect x={mx - 12} y={my - 8} width="24" height="14" fill="var(--tinta)" />
                <text x={mx} y={my + 3} textAnchor="middle" fontSize="9" fill="var(--niebla-2)" className="numeros">
                  {traslados[a][b]}
                </text>
              </g>
            )
          })}
          {salas.map((sala) => {
            const p = POSICIONES[sala.id]
            return (
              <g key={sala.id}>
                <circle cx={p.x} cy={p.y} r={sala.aireLibre ? 9 : 7} fill={sala.aireLibre ? 'var(--faro)' : 'var(--niebla)'} />
                <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="11" fill="var(--niebla)" fontWeight={700}>
                  {NOMBRES_CORTOS[sala.id]}
                </text>
              </g>
            )
          })}
        </svg>
        <p className={styles.leyenda}>Esquema, no está a escala. Minutos caminando.</p>
      </div>

      <div className={styles.tablaWrap}>
        <table className={styles.tabla}>
          <caption className="visualmente-oculto">Minutos caminando entre cada par de salas</caption>
          <thead>
            <tr>
              <th scope="col">Sala</th>
              {salas.map((s) => (
                <th scope="col" key={s.id}>
                  {s.nombre}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {salas.map((fila) => (
              <tr key={fila.id}>
                <th scope="row">{fila.nombre}</th>
                {salas.map((col) => (
                  <td key={col.id} className="numeros">
                    {traslados[fila.id][col.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className={styles.listaSalas}>
        {salas.map((sala) => (
          <li key={sala.id} className={styles.sala}>
            <p className={styles.nombreSala}>{sala.nombre}</p>
            <p className={styles.direccion}>{sala.direccion}</p>
            <p className={styles.capacidad}>
              {sala.capacidad} {sala.aireLibre ? 'personas' : 'butacas'}
              {sala.aireLibre && <span className={styles.etiquetaAireLibre}> · Al aire libre</span>}
            </p>
            {sala.nota && <p className={styles.nota}>{sala.nota}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
