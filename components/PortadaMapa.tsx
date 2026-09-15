import { salas, traslado, type Sala } from "@/lib/datos";
import styles from "./PortadaMapa.module.css";

/** Posiciones esquemáticas (no es un mapa real): las distancias respetan el orden de los minutos caminando. */
const POSICION: Record<string, { x: number; y: number }> = {
  teatro: { x: 118, y: 74 },
  galpon: { x: 46, y: 152 },
  muelle: { x: 236, y: 130 },
  terraza: { x: 318, y: 60 },
};

const ANCHO = 360;
const ALTO = 220;

function posicion(sala: Sala) {
  return POSICION[sala.id] ?? { x: ANCHO / 2, y: ALTO / 2 };
}

export default function PortadaMapa() {
  const pares: { a: Sala; b: Sala; min: number }[] = [];
  for (let i = 0; i < salas.length; i++) {
    for (let j = i + 1; j < salas.length; j++) {
      pares.push({ a: salas[i], b: salas[j], min: traslado(salas[i].id, salas[j].id) });
    }
  }

  const descripcion = pares
    .map((p) => `${p.a.corto} a ${p.b.corto}: ${p.min} min`)
    .join("; ");

  return (
    <figure className={styles.figura}>
      <svg
        className={styles.mapa}
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        role="img"
        aria-labelledby="pm-titulo pm-desc"
      >
        <title id="pm-titulo">Minutos caminando entre las cuatro salas</title>
        <desc id="pm-desc">{descripcion}</desc>

        {/* Costa: una línea de agua por el lado del muelle y el faro */}
        <path
          d="M 190 220 C 205 190, 250 178, 290 160 S 340 110, 360 70"
          fill="none"
          stroke="var(--sec-panorama)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
        <text x="300" y="205" className={styles.agua}>
          mar
        </text>

        {/* Tramos */}
        {pares.map(({ a, b, min }) => {
          const pa = posicion(a);
          const pb = posicion(b);
          const mx = (pa.x + pb.x) / 2;
          const my = (pa.y + pb.y) / 2;
          return (
            <g key={`${a.id}-${b.id}`}>
              <line
                x1={pa.x}
                y1={pa.y}
                x2={pb.x}
                y2={pb.y}
                stroke="var(--niebla-400)"
                strokeOpacity="0.45"
                strokeWidth="1"
              />
              <rect x={mx - 16} y={my - 9} width="32" height="18" rx="9" className={styles.pildora} />
              <text x={mx} y={my + 3.5} className={styles.minutos}>
                {min}′
              </text>
            </g>
          );
        })}

        {/* Salas */}
        {salas.map((sala, i) => {
          const p = posicion(sala);
          const izquierda = p.x > ANCHO * 0.6;
          const etiquetaX = izquierda ? p.x - 14 : p.x + 14;
          return (
            <g key={sala.id}>
              {sala.aireLibre && (
                <circle cx={p.x} cy={p.y} r="16" fill="var(--faro)" fillOpacity="0.14" />
              )}
              <circle
                cx={p.x}
                cy={p.y}
                r="9"
                fill={sala.aireLibre ? "var(--faro)" : "var(--noche-700)"}
                stroke={sala.aireLibre ? "var(--faro)" : "var(--niebla-200)"}
                strokeWidth="1.5"
              />
              <text
                x={p.x}
                y={p.y + 3.5}
                className={`${styles.numero} ${sala.aireLibre ? styles.numeroOscuro : ""}`}
              >
                {i + 1}
              </text>
              <text
                x={etiquetaX}
                y={p.y + 4}
                className={styles.nombre}
                textAnchor={izquierda ? "end" : "start"}
              >
                {sala.corto}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption className={styles.leyenda}>
        Esquema, no mapa. Los números son minutos caminando entre salas; el punto ámbar es al aire libre.
      </figcaption>
    </figure>
  );
}
