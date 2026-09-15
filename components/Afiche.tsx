import { useId } from "react";
import { generarAfiche } from "@/lib/afiche";
import type { Pelicula } from "@/lib/datos";
import styles from "./Afiche.module.css";

type Props = {
  pelicula: Pelicula;
  /** Muestra el título sobre el afiche. */
  conTitulo?: boolean;
  /** Añade grano y más detalle; para el afiche grande de la ficha. */
  detallado?: boolean;
  className?: string;
};

/**
 * Afiche generado con código para una película.
 * Cada película tiene un paisaje propio derivado de su id y su sección.
 */
export function Afiche({ pelicula, conTitulo = false, detallado = false, className }: Props) {
  const a = generarAfiche(pelicula.id, pelicula.seccion);
  const reactId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const uid = `af-${reactId}`;
  const { paleta } = a;

  return (
    <div
      className={[styles.afiche, className].filter(Boolean).join(" ")}
      style={{ ["--afiche-texto" as string]: paleta.texto }}
    >
      <svg
        viewBox={`0 0 ${a.ancho} ${a.alto}`}
        className={styles.svg}
        role="img"
        aria-label={`Afiche generado para ${pelicula.titulo}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id={`${uid}-cielo`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={paleta.cieloArriba} />
            <stop offset="1" stopColor={paleta.cieloAbajo} />
          </linearGradient>
          <linearGradient id={`${uid}-niebla`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={paleta.niebla} stopOpacity="0" />
            <stop offset="0.5" stopColor={paleta.niebla} stopOpacity="1" />
            <stop offset="1" stopColor={paleta.niebla} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-haz`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={paleta.astro} stopOpacity="0.55" />
            <stop offset="1" stopColor={paleta.astro} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-haz-inv`} x1="1" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor={paleta.astro} stopOpacity="0.55" />
            <stop offset="1" stopColor={paleta.astro} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-pie`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.55" />
          </linearGradient>
          {a.astro.creciente && (
            <mask id={`${uid}-luna`}>
              <rect width={a.ancho} height={a.alto} fill="#fff" />
              <circle
                cx={a.astro.cx + a.astro.r * 0.45}
                cy={a.astro.cy - a.astro.r * 0.25}
                r={a.astro.r * 0.9}
                fill="#000"
              />
            </mask>
          )}
          {detallado && (
            <filter id={`${uid}-grano`} x="0" y="0" width="100%" height="100%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
              <feColorMatrix type="saturate" values="0" />
              <feComponentTransfer>
                <feFuncA type="table" tableValues="0 0.18" />
              </feComponentTransfer>
            </filter>
          )}
        </defs>

        <rect width={a.ancho} height={a.alto} fill={`url(#${uid}-cielo)`} />

        <circle
          cx={a.astro.cx}
          cy={a.astro.cy}
          r={a.astro.r}
          fill={paleta.astro}
          mask={a.astro.creciente ? `url(#${uid}-luna)` : undefined}
        />

        {a.haz && (
          <g transform={`rotate(${a.haz.angulo} ${a.haz.x} ${a.haz.y})`}>
            <polygon
              points={
                a.haz.x < a.ancho / 2
                  ? `${a.haz.x},${a.haz.y} ${a.ancho + 80},${a.haz.y - 110} ${a.ancho + 80},${a.haz.y + 40}`
                  : `${a.haz.x},${a.haz.y} -80,${a.haz.y - 110} -80,${a.haz.y + 40}`
              }
              fill={a.haz.x < a.ancho / 2 ? `url(#${uid}-haz)` : `url(#${uid}-haz-inv)`}
              style={{ mixBlendMode: "screen" }}
            />
          </g>
        )}

        {a.capas.map((capa, i) => (
          <path key={i} d={capa.d} fill={capa.color} opacity={capa.opacidad} />
        ))}

        {a.estelas.map((e, i) => (
          <line
            key={i}
            x1={e.x1}
            x2={e.x2}
            y1={e.y}
            y2={e.y}
            stroke={paleta.astro}
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        ))}

        {a.nieblas.map((n, i) => (
          <rect
            key={i}
            x="0"
            y={n.y}
            width={a.ancho}
            height={n.alto}
            fill={`url(#${uid}-niebla)`}
            opacity={n.opacidad}
          />
        ))}

        {conTitulo && <rect x="0" y={a.alto * 0.55} width={a.ancho} height={a.alto * 0.45} fill={`url(#${uid}-pie)`} />}

        {detallado && (
          <rect width={a.ancho} height={a.alto} filter={`url(#${uid}-grano)`} style={{ mixBlendMode: "multiply" }} />
        )}
      </svg>

      {conTitulo && (
        <div className={styles.titulo}>
          <span className={styles.tituloTexto}>{pelicula.titulo}</span>
          <span className={styles.tituloDir}>{pelicula.direccion}</span>
        </div>
      )}
    </div>
  );
}
