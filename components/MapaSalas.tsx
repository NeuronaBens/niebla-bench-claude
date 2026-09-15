import { salas, traslado } from "@/lib/datos";
import styles from "./MapaSalas.module.css";

/**
 * Esquema de las cuatro salas con los minutos caminando entre ellas.
 * No es un mapa real: es un diagrama para decidir rápido.
 */
const POSICIONES: Record<string, { x: number; y: number }> = {
  teatro: { x: 90, y: 70 },
  galpon: { x: 90, y: 250 },
  muelle: { x: 330, y: 110 },
  terraza: { x: 360, y: 290 },
};

const NOMBRES_CORTOS: Record<string, string> = {
  teatro: "Teatro Municipal",
  galpon: "Galpón 7",
  muelle: "Cine Arte El Muelle",
  terraza: "Terraza Faro",
};

export function MapaSalas() {
  const pares: [string, string][] = [];
  for (let i = 0; i < salas.length; i++) {
    for (let j = i + 1; j < salas.length; j++) {
      pares.push([salas[i].id, salas[j].id]);
    }
  }

  return (
    <figure className={styles.figura}>
      <svg viewBox="0 0 500 340" className={styles.svg} role="img" aria-labelledby="mapa-titulo mapa-desc">
        <title id="mapa-titulo">Minutos caminando entre salas</title>
        <desc id="mapa-desc">
          {pares
            .map(([a, b]) => `${NOMBRES_CORTOS[a]} a ${NOMBRES_CORTOS[b]}: ${traslado(a, b)} minutos`)
            .join(". ")}
        </desc>
        <defs>
          <pattern id="mapa-olas" width="40" height="14" patternUnits="userSpaceOnUse">
            <path d="M0 7c10-8 20-8 40 0" fill="none" stroke="currentColor" strokeOpacity="0.14" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect x="300" y="0" width="200" height="340" fill="url(#mapa-olas)" opacity="0.9" />
        <text x="470" y="26" textAnchor="end" className={styles.mar}>
          mar
        </text>

        {pares.map(([a, b]) => {
          const pa = POSICIONES[a];
          const pb = POSICIONES[b];
          const mx = (pa.x + pb.x) / 2;
          const my = (pa.y + pb.y) / 2;
          return (
            <g key={`${a}-${b}`}>
              <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} className={styles.linea} />
              <rect x={mx - 20} y={my - 11} width="40" height="22" rx="11" className={styles.etiquetaFondo} />
              <text x={mx} y={my + 4} textAnchor="middle" className={styles.etiqueta}>
                {traslado(a, b)}′
              </text>
            </g>
          );
        })}

        {salas.map((s) => {
          const p = POSICIONES[s.id];
          const izquierda = p.x < 250;
          return (
            <g key={s.id}>
              <circle cx={p.x} cy={p.y} r="13" className={s.aireLibre ? styles.nodoAire : styles.nodo} />
              {s.aireLibre && <circle cx={p.x} cy={p.y} r="19" className={styles.nodoAireAnillo} />}
              <text
                x={izquierda ? p.x - 22 : p.x + 22}
                y={p.y + 5}
                textAnchor={izquierda ? "end" : "start"}
                className={styles.nombre}
              >
                {NOMBRES_CORTOS[s.id]}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className={styles.leyenda}>
        Minutos caminando entre salas. La Terraza Faro es al aire libre.
      </figcaption>
    </figure>
  );
}
