import type { CSSProperties } from "react";
import { getSeccion, type Pelicula } from "@/lib/datos";
import styles from "./Afiche.module.css";

export interface AficheProps {
  pelicula: Pelicula;
  tamano?: "chico" | "mediano" | "grande";
  className?: string;
}

// ---------- Azar determinista ----------

/** FNV-1a de 32 bits. */
function fnv1a(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32: generador pequeño y reproducible en [0, 1). */
function mulberry32(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

// ---------- Título ----------

/** Divide un título largo en dos líneas por palabras, buscando el corte más parejo. */
function partirTitulo(titulo: string): string[] {
  if (titulo.length <= 16) return [titulo];
  const palabras = titulo.split(" ");
  if (palabras.length < 2) return [titulo];
  let mejor = 1;
  let mejorDiferencia = Infinity;
  for (let i = 1; i < palabras.length; i++) {
    const a = palabras.slice(0, i).join(" ").length;
    const b = palabras.slice(i).join(" ").length;
    const diferencia = Math.abs(a - b);
    if (diferencia < mejorDiferencia) {
      mejorDiferencia = diferencia;
      mejor = i;
    }
  }
  return [palabras.slice(0, mejor).join(" "), palabras.slice(mejor).join(" ")];
}

// ---------- Geometría ----------

const ANCHO = 200;
const ALTO = 300;
const MARGEN = 14;

interface Escena {
  horizonte: number;
  tipoLuz: "luna" | "faro";
  luna: { x: number; y: number; r: number };
  faro: { x: number; alto: number; ancho: number; haciaDerecha: boolean; apertura: number };
  bandas: { y: number; alto: number; x: number; ancho: number; opacidad: number }[];
  olas: { d: string; opacidad: number; grosor: number }[];
  luces: { x: number; y: number; r: number; color: "faro" | "cian"; reflejo: number }[];
  estrellas: { x: number; y: number; r: number; opacidad: number }[];
}

function construirEscena(id: string): Escena {
  const al = mulberry32(fnv1a(id));
  const entre = (min: number, max: number) => min + (max - min) * al();
  const entero = (min: number, max: number) => Math.floor(entre(min, max + 1));

  const horizonte = r1(ALTO * entre(0.35, 0.7));
  // Un bit medio del hash reparte mejor luna/faro entre las 24 películas que el bit bajo.
  const tipoLuz: Escena["tipoLuz"] = ((fnv1a(`${id}:luz`) >>> 8) & 1) === 0 ? "luna" : "faro";

  const luna = {
    x: r1(entre(45, 155)),
    y: r1(entre(34, Math.max(48, horizonte - 34))),
    r: r1(entre(10, 22)),
  };

  const haciaDerecha = al() < 0.5;
  const faro = {
    x: r1(haciaDerecha ? entre(34, 80) : entre(120, 166)),
    alto: r1(entre(42, 72)),
    ancho: r1(entre(6, 9)),
    haciaDerecha,
    apertura: r1(entre(14, 30)),
  };

  const nBandas = entero(3, 7);
  const bandas: Escena["bandas"] = [];
  for (let i = 0; i < nBandas; i++) {
    const alto = r1(entre(5, 22));
    bandas.push({
      y: r1(entre(horizonte - 48, horizonte + 46)),
      alto,
      x: r1(entre(-40, 20)),
      ancho: r1(entre(190, 260)),
      opacidad: r1(entre(0.07, 0.2)),
    });
  }
  bandas.sort((a, b) => a.y - b.y);

  const nOlas = entero(2, 4);
  const olas: Escena["olas"] = [];
  const espacioOlas = 232 - (horizonte + 14);
  for (let i = 0; i < nOlas; i++) {
    const y = horizonte + 14 + (espacioOlas * (i + 0.5)) / nOlas + entre(-6, 6);
    const amplitud = entre(1.5, 4.5);
    const longitud = entre(26, 52);
    let x = -10;
    let arriba = al() < 0.5;
    let d = `M ${r1(x)} ${r1(y)}`;
    while (x < ANCHO + 10) {
      const cx = x + longitud / 4;
      const nx = x + longitud / 2;
      const cy = y + (arriba ? -amplitud : amplitud) * 2;
      d += ` Q ${r1(cx)} ${r1(cy)} ${r1(nx)} ${r1(y)}`;
      x = nx;
      arriba = !arriba;
    }
    olas.push({ d, opacidad: r1(entre(0.3, 0.65)), grosor: r1(entre(0.8, 1.6)) });
  }

  const nLuces = entero(3, 8);
  const luces: Escena["luces"] = [];
  for (let i = 0; i < nLuces; i++) {
    luces.push({
      x: r1(entre(6, 194)),
      y: r1(horizonte + entre(-3, 3)),
      r: r1(entre(0.7, 1.6)),
      color: al() < 0.6 ? "faro" : "cian",
      reflejo: r1(entre(6, 20)),
    });
  }

  const nEstrellas = entero(4, 12);
  const estrellas: Escena["estrellas"] = [];
  for (let i = 0; i < nEstrellas; i++) {
    estrellas.push({
      x: r1(entre(4, 196)),
      y: r1(entre(6, Math.max(20, horizonte - 60))),
      r: r1(entre(0.4, 1)),
      opacidad: r1(entre(0.25, 0.7)),
    });
  }

  return { horizonte, tipoLuz, luna, faro, bandas, olas, luces, estrellas };
}

// ---------- Componente ----------

export default function Afiche({ pelicula, tamano = "mediano", className }: AficheProps) {
  const escena = construirEscena(pelicula.id);
  const seccion = getSeccion(pelicula.seccion);
  const colorSec = `var(--sec-${pelicula.seccion}, var(--faro))`;
  const uid = `af-${pelicula.id}`;
  const idTitulo = `${uid}-titulo`;
  const idCielo = `${uid}-cielo`;
  const idMar = `${uid}-mar`;
  const idNiebla = `${uid}-niebla`;
  const idHaz = `${uid}-haz`;
  const idPieGrad = `${uid}-pie`;
  const idGrano = `grano-${pelicula.id}`;
  const conGrano = tamano === "grande";
  const chico = tamano === "chico";

  const lineas = partirTitulo(pelicula.titulo);
  const largoMax = Math.max(...lineas.map((l) => l.length));
  const tamanoTitulo = r1(Math.min(24, (ANCHO - MARGEN * 2) / (largoMax * 0.56)));
  const interlinea = tamanoTitulo * 1.08;
  const baseTitulo = chico ? 278 : 268;
  const inicioTitulo = baseTitulo - interlinea * (lineas.length - 1);

  const h = escena.horizonte;
  const { luna, faro } = escena;
  const lampX = faro.x;
  const lampY = h - faro.alto;
  const bordeHaz = faro.haciaDerecha ? ANCHO + 30 : -30;

  const estiloSec: CSSProperties = { fill: colorSec };
  const estiloSecStop: CSSProperties = { stopColor: colorSec };
  const estiloSecStroke: CSSProperties = { stroke: colorSec };

  const clases = [styles.afiche, styles[tamano], className].filter(Boolean).join(" ");

  return (
    <svg
      className={clases}
      viewBox={`0 0 ${ANCHO} ${ALTO}`}
      role="img"
      aria-labelledby={idTitulo}
      xmlns="http://www.w3.org/2000/svg"
    >
      <title id={idTitulo}>{`Afiche de ${pelicula.titulo}`}</title>
      <defs>
        <linearGradient id={idCielo} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--noche-950)" />
          <stop offset="0.45" stopColor="var(--noche-900)" />
          <stop offset="0.85" style={estiloSecStop} stopOpacity="0.3" />
          <stop offset="1" style={estiloSecStop} stopOpacity="0.6" />
        </linearGradient>
        <linearGradient id={idMar} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={estiloSecStop} stopOpacity="0.5" />
          <stop offset="0.12" style={estiloSecStop} stopOpacity="0.14" />
          <stop offset="0.5" stopColor="var(--noche-950)" stopOpacity="0.9" />
          <stop offset="1" style={estiloSecStop} stopOpacity="0.12" />
        </linearGradient>
        <linearGradient id={idNiebla} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#dfe8f5" stopOpacity="0" />
          <stop offset="0.25" stopColor="#dfe8f5" stopOpacity="1" />
          <stop offset="0.75" stopColor="#dfe8f5" stopOpacity="1" />
          <stop offset="1" stopColor="#dfe8f5" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={idHaz}
          x1={faro.haciaDerecha ? "0" : "1"}
          y1="0"
          x2={faro.haciaDerecha ? "1" : "0"}
          y2="0"
        >
          <stop offset="0" stopColor="var(--faro)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--faro)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={idPieGrad} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--noche-950)" stopOpacity="0" />
          <stop offset="0.55" stopColor="var(--noche-950)" stopOpacity="0.85" />
          <stop offset="1" stopColor="var(--noche-950)" stopOpacity="0.97" />
        </linearGradient>
        {conGrano && (
          <filter id={idGrano} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch" result="ruido" />
            <feColorMatrix type="saturate" values="0" in="ruido" result="gris" />
            <feComponentTransfer in="gris">
              <feFuncA type="table" tableValues="0 0.16" />
            </feComponentTransfer>
          </filter>
        )}
      </defs>

      {/* Base y cielo */}
      <rect width={ANCHO} height={ALTO} fill="var(--noche-950)" />
      <rect width={ANCHO} height={h} fill={`url(#${idCielo})`} />

      {/* Estrellas */}
      {escena.estrellas.map((e, i) => (
        <circle key={`e${i}`} cx={e.x} cy={e.y} r={e.r} fill="#eef1f5" fillOpacity={e.opacidad} />
      ))}

      {/* Luna o faro */}
      {escena.tipoLuz === "luna" ? (
        <g>
          <circle cx={luna.x} cy={luna.y} r={r1(luna.r * 2.8)} style={estiloSec} fillOpacity="0.1" />
          <circle cx={luna.x} cy={luna.y} r={r1(luna.r * 1.7)} style={estiloSec} fillOpacity="0.16" />
          <circle cx={luna.x} cy={luna.y} r={luna.r} fill="#eef1f5" fillOpacity="0.92" />
          <circle cx={r1(luna.x - luna.r * 0.35)} cy={r1(luna.y - luna.r * 0.3)} r={r1(luna.r * 0.18)} fill="#c7d0dc" fillOpacity="0.5" />
          <circle cx={r1(luna.x + luna.r * 0.3)} cy={r1(luna.y + luna.r * 0.25)} r={r1(luna.r * 0.12)} fill="#c7d0dc" fillOpacity="0.45" />
        </g>
      ) : (
        <g>
          <polygon
            points={`${lampX},${lampY} ${bordeHaz},${r1(lampY - faro.apertura)} ${bordeHaz},${r1(lampY + faro.apertura * 0.7)}`}
            fill={`url(#${idHaz})`}
          />
          <circle cx={lampX} cy={lampY} r={r1(faro.ancho * 1.6)} fill="var(--faro)" fillOpacity="0.18" />
          <polygon
            points={`${r1(lampX - faro.ancho / 2)},${r1(lampY + 3)} ${r1(lampX + faro.ancho / 2)},${r1(lampY + 3)} ${r1(
              lampX + faro.ancho * 0.85,
            )},${r1(h + 2)} ${r1(lampX - faro.ancho * 0.85)},${r1(h + 2)}`}
            fill="var(--noche-950)"
            stroke="#c7d0dc"
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
          <rect
            x={r1(lampX - faro.ancho / 2 - 1)}
            y={r1(lampY - 2)}
            width={r1(faro.ancho + 2)}
            height="5"
            rx="1"
            fill="var(--noche-950)"
            stroke="#c7d0dc"
            strokeOpacity="0.5"
            strokeWidth="0.6"
          />
          <circle cx={lampX} cy={r1(lampY + 0.5)} r={r1(faro.ancho * 0.32)} fill="var(--faro)" />
        </g>
      )}

      {/* Mar */}
      <rect y={h} width={ANCHO} height={ALTO - h} fill={`url(#${idMar})`} />
      <line x1="0" y1={h} x2={ANCHO} y2={h} style={estiloSecStroke} strokeOpacity="0.55" strokeWidth="0.6" />

      {/* Luces del puerto */}
      {escena.luces.map((l, i) => {
        const color = l.color === "faro" ? "var(--faro)" : "var(--sec-panorama)";
        return (
          <g key={`l${i}`}>
            {!chico && (
              <line
                x1={l.x}
                y1={r1(l.y + 1)}
                x2={l.x}
                y2={r1(l.y + l.reflejo)}
                stroke={color}
                strokeOpacity="0.25"
                strokeWidth={r1(l.r * 1.2)}
              />
            )}
            <circle cx={l.x} cy={l.y} r={l.r} fill={color} fillOpacity="0.9" />
          </g>
        );
      })}

      {/* Olas */}
      {escena.olas.map((o, i) => (
        <path key={`o${i}`} d={o.d} fill="none" style={estiloSecStroke} strokeOpacity={o.opacidad} strokeWidth={o.grosor} />
      ))}

      {/* Bandas de niebla */}
      {escena.bandas.map((b, i) => (
        <rect
          key={`b${i}`}
          x={b.x}
          y={b.y}
          width={b.ancho}
          height={b.alto}
          rx={r1(b.alto / 2)}
          fill={`url(#${idNiebla})`}
          fillOpacity={b.opacidad}
        />
      ))}

      {/* Pie oscuro para el título */}
      <rect y="196" width={ANCHO} height="104" fill={`url(#${idPieGrad})`} />

      {/* Grano (solo grande) */}
      {conGrano && <rect width={ANCHO} height={ALTO} filter={`url(#${idGrano})`} opacity="0.7" />}

      {/* Textos */}
      <text
        x={MARGEN}
        y="22"
        className={styles.rotulo}
        style={estiloSec}
      >
        {(seccion?.nombre ?? pelicula.seccion).toUpperCase()}
      </text>
      <text x={MARGEN} y={r1(inicioTitulo)} className={styles.titulo} fontSize={tamanoTitulo}>
        {lineas.map((linea, i) => (
          <tspan key={i} x={MARGEN} dy={i === 0 ? 0 : r1(interlinea)}>
            {linea}
          </tspan>
        ))}
      </text>
      {!chico && (
        <text x={MARGEN} y="284" className={styles.rotulo} fill="var(--niebla-400)">
          {`${pelicula.pais} · ${pelicula.anio}`.toUpperCase()}
        </text>
      )}

      {/* Marco sutil */}
      <rect x="0.5" y="0.5" width={ANCHO - 1} height={ALTO - 1} fill="none" stroke="#ffffff" strokeOpacity="0.07" />
    </svg>
  );
}
