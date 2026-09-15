import type { ReactNode } from "react";
import { peliculas, type SeccionId } from "@/lib/programa";

/*
 * Afiches generados con código. Cada sección tiene un motivo propio y cada
 * película una semilla (su id), así que el mismo título siempre produce el
 * mismo dibujo:
 *   competencia -> horizonte con sol partido por la niebla
 *   panorama    -> carta náutica con curvas de profundidad
 *   nocturna    -> haz de faro atravesando la bruma
 *   costa       -> oleaje sobre un cuadro de película Súper 8
 */

export const PALETAS: Record<
  SeccionId,
  { fondo: string; fondo2: string; niebla: string; acento: string; claro: string }
> = {
  competencia: { fondo: "#17212b", fondo2: "#2c3a46", niebla: "#8d9ca7", acento: "#f0a336", claro: "#f6e7c9" },
  panorama: { fondo: "#0b222c", fondo2: "#153744", niebla: "#6f98a8", acento: "#9fd6e6", claro: "#e4f2f5" },
  nocturna: { fondo: "#110c0f", fondo2: "#2a1a1d", niebla: "#6b575b", acento: "#e5493a", claro: "#f3dad0" },
  costa: { fondo: "#102b26", fondo2: "#1d423a", niebla: "#6f978a", acento: "#86c9a2", claro: "#f1ead8" },
};

const W = 300;
const H = 400;

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function azar(semilla: string) {
  let a = hash(semilla);
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    n: next,
    entre: (min: number, max: number) => min + next() * (max - min),
    entero: (min: number, max: number) => Math.floor(min + next() * (max - min + 1)),
  };
}

const r1 = (x: number) => Math.round(x * 10) / 10;

type Props = {
  semilla: string;
  seccion: SeccionId;
  /** "mini" omite filtros y detalles finos para listas largas. */
  detalle?: "mini" | "normal" | "alto";
  className?: string;
  titulo?: string;
};

export default function Afiche({ semilla, seccion, detalle = "normal", className, titulo }: Props) {
  const p = PALETAS[seccion];
  const rnd = azar(`${seccion}:${semilla}`);
  const uid = `af-${hash(semilla + detalle).toString(36)}`;
  const fino = detalle !== "mini";
  // Las películas de una misma sección se reparten las variantes en orden, para que no se repitan seguidas.
  const indice = peliculas.filter((x) => x.seccion === seccion).findIndex((x) => x.id === semilla);
  const variante = (indice >= 0 ? indice : hash(semilla)) % 3;

  let motivo: ReactNode;
  if (seccion === "competencia") motivo = horizonte(rnd, p, uid, fino);
  else if (seccion === "panorama") motivo = carta(rnd, p, uid, fino);
  else if (seccion === "nocturna") motivo = haz(rnd, p, uid, fino, variante);
  else motivo = oleaje(rnd, p, uid, fino, variante);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={titulo ? "img" : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
      focusable="false"
    >
      <rect width={W} height={H} fill={p.fondo} />
      {motivo}
      {detalle === "alto" && (
        <>
          <filter id={`${uid}-grano`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.14" />
            </feComponentTransfer>
          </filter>
          <rect width={W} height={H} filter={`url(#${uid}-grano)`} style={{ mixBlendMode: "overlay" }} />
        </>
      )}
    </svg>
  );
}

type Rnd = ReturnType<typeof azar>;
type Paleta = (typeof PALETAS)[SeccionId];

function horizonte(rnd: Rnd, p: Paleta, uid: string, fino: boolean) {
  const hor = rnd.entre(215, 275);
  const r = rnd.entre(48, 86);
  const cx = rnd.entre(80, 220);
  const cy = hor - r * rnd.entre(0.15, 0.85);
  const franjas = rnd.entero(4, 7);
  const bandas: ReactNode[] = [];
  for (let i = 0; i < franjas; i++) {
    const y = cy - r * 0.1 + i * (r * 1.05) / franjas + rnd.entre(-3, 3);
    const alto = 2 + i * rnd.entre(1.2, 2.6);
    bandas.push(<rect key={i} x={0} y={r1(y)} width={W} height={r1(alto)} fill={p.fondo2} />);
  }
  const nieblas: ReactNode[] = [];
  const nn = fino ? rnd.entero(3, 5) : 2;
  for (let i = 0; i < nn; i++) {
    const y = rnd.entre(60, hor + 20);
    nieblas.push(
      <rect
        key={i}
        x={r1(rnd.entre(-120, 40))}
        y={r1(y)}
        width={r1(rnd.entre(200, 380))}
        height={r1(rnd.entre(10, 34))}
        rx={16}
        fill={p.niebla}
        opacity={r1(rnd.entre(0.12, 0.3))}
      />,
    );
  }
  const reflejos: ReactNode[] = [];
  const nr = fino ? rnd.entero(10, 16) : 6;
  for (let i = 0; i < nr; i++) {
    const y = hor + 8 + i * ((H - hor - 10) / nr);
    const ancho = r * rnd.entre(0.3, 1.4) * (1 - i / (nr * 1.6));
    reflejos.push(
      <rect
        key={i}
        x={r1(cx - ancho / 2 + rnd.entre(-6, 6))}
        y={r1(y)}
        width={r1(Math.max(4, ancho))}
        height={2}
        fill={p.acento}
        opacity={r1(0.85 - i / nr / 1.3)}
      />,
    );
  }
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-cielo`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={p.fondo} />
          <stop offset="1" stopColor={p.fondo2} />
        </linearGradient>
        <clipPath id={`${uid}-sol`}>
          <rect x={0} y={0} width={W} height={hor} />
        </clipPath>
      </defs>
      <rect width={W} height={hor} fill={`url(#${uid}-cielo)`} />
      <g clipPath={`url(#${uid}-sol)`}>
        <circle cx={r1(cx)} cy={r1(cy)} r={r1(r)} fill={p.acento} />
        {bandas}
      </g>
      <rect x={0} y={r1(hor)} width={W} height={r1(H - hor)} fill={p.fondo} />
      {reflejos}
      {nieblas}
      <rect x={0} y={r1(hor)} width={W} height={1.5} fill={p.claro} opacity={0.5} />
    </>
  );
}

function carta(rnd: Rnd, p: Paleta, uid: string, fino: boolean) {
  const cx = rnd.entre(70, 230);
  const cy = rnd.entre(110, 300);
  const n = fino ? rnd.entero(10, 15) : 7;
  const paso = rnd.entre(16, 24);
  const f1 = rnd.entero(2, 4);
  const f2 = rnd.entero(3, 6);
  const fa = rnd.entre(0, Math.PI * 2);
  const fb = rnd.entre(0, Math.PI * 2);
  const puntos = fino ? 64 : 32;
  const curvas: ReactNode[] = [];
  for (let k = 1; k <= n; k++) {
    const radio = k * paso;
    let d = "";
    for (let i = 0; i <= puntos; i++) {
      const t = (i / puntos) * Math.PI * 2;
      const ruido = 1 + 0.16 * Math.sin(f1 * t + fa + k * 0.35) + 0.08 * Math.sin(f2 * t + fb - k * 0.2);
      const x = cx + Math.cos(t) * radio * ruido * 1.05;
      const y = cy + Math.sin(t) * radio * ruido * 0.9;
      d += `${i === 0 ? "M" : "L"}${r1(x)} ${r1(y)}`;
    }
    d += "Z";
    const destacada = k === 3 || k === 4;
    curvas.push(
      <path
        key={k}
        d={d}
        fill={k <= 2 ? p.acento : "none"}
        fillOpacity={k === 1 ? 0.9 : k === 2 ? 0.35 : 0}
        stroke={destacada ? p.acento : p.claro}
        strokeOpacity={destacada ? 0.95 : r1(0.7 - k / (n * 1.5))}
        strokeWidth={destacada ? 2 : 1}
        strokeDasharray={k % 4 === 0 ? "4 5" : undefined}
      />,
    );
  }
  const reticula: ReactNode[] = [];
  if (fino) {
    for (let x = 50; x < W; x += 50) {
      reticula.push(<line key={`x${x}`} x1={x} x2={x} y1={0} y2={H} stroke={p.niebla} strokeOpacity={0.18} />);
    }
    for (let y = 50; y < H; y += 50) {
      reticula.push(<line key={`y${y}`} x1={0} x2={W} y1={y} y2={y} stroke={p.niebla} strokeOpacity={0.18} />);
    }
  }
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-agua`} cx={r1(cx / W)} cy={r1(cy / H)} r="0.9">
          <stop offset="0" stopColor={p.fondo2} />
          <stop offset="1" stopColor={p.fondo} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${uid}-agua)`} />
      {reticula}
      {curvas}
      {fino && (
        <g stroke={p.claro} strokeOpacity={0.8} strokeWidth={1.2}>
          <line x1={W - 34} x2={W - 34} y1={22} y2={62} />
          <line x1={W - 54} x2={W - 14} y1={42} y2={42} />
          <circle cx={W - 34} cy={42} r={12} fill="none" />
        </g>
      )}
    </>
  );
}

function haz(rnd: Rnd, p: Paleta, uid: string, fino: boolean, variante: number) {
  if (variante === 1) return marea(rnd, p, uid, fino);
  if (variante === 2) return focos(rnd, p, uid, fino);
  return faro(rnd, p, uid, fino);
}

/** Luna baja partida por bandas de bruma y lluvia vertical. */
function marea(rnd: Rnd, p: Paleta, uid: string, fino: boolean) {
  const cx = rnd.entre(90, 210);
  const cy = rnd.entre(110, 200);
  const r = rnd.entre(60, 95);
  const lluvia: ReactNode[] = [];
  const nl = fino ? rnd.entero(26, 40) : 12;
  for (let i = 0; i < nl; i++) {
    const x = rnd.entre(0, W);
    const y = rnd.entre(-20, H);
    const largo = rnd.entre(20, 70);
    lluvia.push(
      <line key={i} x1={r1(x)} x2={r1(x - 4)} y1={r1(y)} y2={r1(y + largo)} stroke={p.claro} strokeOpacity={r1(rnd.entre(0.08, 0.3))} strokeWidth={1} />,
    );
  }
  const bandas: ReactNode[] = [];
  const nb = fino ? rnd.entero(5, 8) : 4;
  for (let i = 0; i < nb; i++) {
    bandas.push(
      <rect
        key={i}
        x={-20}
        y={r1(cy - r + (i * 2 * r) / nb + rnd.entre(0, 8))}
        width={W + 40}
        height={r1(rnd.entre(4, 16))}
        fill={p.fondo}
        opacity={r1(rnd.entre(0.55, 0.95))}
      />,
    );
  }
  const agua = rnd.entre(250, 310);
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-luna`}>
          <stop offset="0" stopColor={p.acento} stopOpacity="0.55" />
          <stop offset="1" stopColor={p.acento} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={p.fondo} />
      <circle cx={r1(cx)} cy={r1(cy)} r={r1(r * 2)} fill={`url(#${uid}-luna)`} />
      <circle cx={r1(cx)} cy={r1(cy)} r={r1(r)} fill={p.acento} />
      {bandas}
      <rect x={0} y={r1(agua)} width={W} height={r1(H - agua)} fill={p.fondo2} />
      <rect x={r1(cx - r * 0.7)} y={r1(agua + 10)} width={r1(r * 1.4)} height={3} fill={p.acento} opacity={0.7} />
      <rect x={r1(cx - r * 0.45)} y={r1(agua + 24)} width={r1(r * 0.9)} height={3} fill={p.acento} opacity={0.45} />
      <rect x={r1(cx - r * 0.25)} y={r1(agua + 38)} width={r1(r * 0.5)} height={3} fill={p.acento} opacity={0.25} />
      {lluvia}
    </>
  );
}

/** Dos focos que se cruzan desde abajo en la niebla. */
function focos(rnd: Rnd, p: Paleta, uid: string, fino: boolean) {
  const cruce = rnd.entre(90, 200);
  const xc = rnd.entre(90, 210);
  const bruma: ReactNode[] = [];
  const nb = fino ? rnd.entero(4, 6) : 2;
  for (let i = 0; i < nb; i++) {
    bruma.push(
      <ellipse
        key={i}
        cx={r1(rnd.entre(0, W))}
        cy={r1(rnd.entre(60, H - 60))}
        rx={r1(rnd.entre(90, 180))}
        ry={r1(rnd.entre(20, 40))}
        fill={p.niebla}
        opacity={r1(rnd.entre(0.12, 0.28))}
        filter={fino ? `url(#${uid}-difuso)` : undefined}
      />,
    );
  }
  const ancho = rnd.entre(26, 48);
  return (
    <>
      <defs>
        <linearGradient id={`${uid}-foco`} x1="0" x2="0" y1="1" y2="0">
          <stop offset="0" stopColor={p.claro} stopOpacity="0.85" />
          <stop offset="0.5" stopColor={p.acento} stopOpacity="0.45" />
          <stop offset="1" stopColor={p.acento} stopOpacity="0" />
        </linearGradient>
        {fino && (
          <filter id={`${uid}-difuso`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        )}
      </defs>
      <rect width={W} height={H} fill={p.fondo} />
      <polygon
        points={`${r1(xc - 150)},${H} ${r1(xc - 120)},${H} ${r1(xc + ancho)},${r1(cruce - 120)} ${r1(xc + ancho * 3)},${r1(cruce - 150)}`}
        fill={`url(#${uid}-foco)`}
      />
      <polygon
        points={`${r1(xc + 150)},${H} ${r1(xc + 120)},${H} ${r1(xc - ancho)},${r1(cruce - 120)} ${r1(xc - ancho * 3)},${r1(cruce - 150)}`}
        fill={`url(#${uid}-foco)`}
      />
      {bruma}
      <rect x={0} y={H - 36} width={W} height={36} fill={p.fondo2} />
      <circle cx={r1(xc - 135)} cy={H - 36} r={7} fill={p.claro} />
      <circle cx={r1(xc + 135)} cy={H - 36} r={7} fill={p.claro} />
    </>
  );
}

function faro(rnd: Rnd, p: Paleta, uid: string, fino: boolean) {
  const ox = rnd.entre(40, 260);
  const oy = rnd.entre(120, 250);
  const ang = rnd.entre(-0.5, 0.5) + (ox > W / 2 ? Math.PI : 0);
  const apertura = rnd.entre(0.16, 0.3);
  const largo = 520;
  const x1 = ox + Math.cos(ang - apertura) * largo;
  const y1 = oy + Math.sin(ang - apertura) * largo;
  const x2 = ox + Math.cos(ang + apertura) * largo;
  const y2 = oy + Math.sin(ang + apertura) * largo;
  const bruma: ReactNode[] = [];
  const nb = fino ? rnd.entero(5, 8) : 3;
  for (let i = 0; i < nb; i++) {
    bruma.push(
      <ellipse
        key={i}
        cx={r1(rnd.entre(-40, W + 40))}
        cy={r1(rnd.entre(40, H))}
        rx={r1(rnd.entre(80, 170))}
        ry={r1(rnd.entre(18, 46))}
        fill={p.niebla}
        opacity={r1(rnd.entre(0.14, 0.32))}
        filter={fino ? `url(#${uid}-difuso)` : undefined}
      />,
    );
  }
  const torreAlto = rnd.entre(70, 120);
  return (
    <>
      <defs>
        <radialGradient id={`${uid}-halo`} cx={r1(ox / W)} cy={r1(oy / H)} r="0.6">
          <stop offset="0" stopColor={p.fondo2} />
          <stop offset="1" stopColor={p.fondo} />
        </radialGradient>
        <linearGradient
          id={`${uid}-luz`}
          gradientUnits="userSpaceOnUse"
          x1={r1(ox)}
          y1={r1(oy)}
          x2={r1(ox + Math.cos(ang) * 320)}
          y2={r1(oy + Math.sin(ang) * 320)}
        >
          <stop offset="0" stopColor={p.claro} stopOpacity="0.95" />
          <stop offset="0.25" stopColor={p.acento} stopOpacity="0.7" />
          <stop offset="1" stopColor={p.acento} stopOpacity="0" />
        </linearGradient>
        {fino && (
          <filter id={`${uid}-difuso`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="12" />
          </filter>
        )}
      </defs>
      <rect width={W} height={H} fill={`url(#${uid}-halo)`} />
      <polygon points={`${r1(ox)},${r1(oy)} ${r1(x1)},${r1(y1)} ${r1(x2)},${r1(y2)}`} fill={`url(#${uid}-luz)`} />
      {bruma}
      <polygon
        points={`${r1(ox - 7)},${r1(oy + 6)} ${r1(ox + 7)},${r1(oy + 6)} ${r1(ox + 12)},${r1(oy + torreAlto)} ${r1(ox - 12)},${r1(oy + torreAlto)}`}
        fill={p.fondo}
        stroke={p.niebla}
        strokeOpacity={0.5}
      />
      <rect x={r1(ox - 60)} y={r1(oy + torreAlto)} width={120} height={H} fill={p.fondo} />
      <circle cx={r1(ox)} cy={r1(oy)} r={5} fill={p.claro} />
      <circle cx={r1(ox)} cy={r1(oy)} r={14} fill={p.acento} opacity={0.35} />
    </>
  );
}

function oleaje(rnd: Rnd, p: Paleta, uid: string, fino: boolean, variante: number) {
  const n = fino ? rnd.entero(14, 20) : 9;
  const y0 = rnd.entre(120, 190);
  const amp = rnd.entre(4, 12);
  const frec = rnd.entre(1.5, 3.5);
  const fase = rnd.entre(0, 6);
  const olas: ReactNode[] = [];
  for (let k = 0; k < n; k++) {
    const y = y0 + (k * (H - y0 + 20)) / n;
    let d = "";
    const pasos = fino ? 30 : 12;
    for (let i = 0; i <= pasos; i++) {
      const x = (i / pasos) * (W + 120) - 60;
      const yy = y + Math.sin((x / W) * Math.PI * 2 * frec + fase + k * 0.7) * amp * (1 + k / n);
      d += `${i === 0 ? "M" : "L"}${r1(x)} ${r1(yy)}`;
    }
    olas.push(
      <path
        key={k}
        d={d}
        fill="none"
        stroke={k % 3 === 0 ? p.acento : p.claro}
        strokeOpacity={k % 3 === 0 ? 0.9 : r1(0.25 + k / n / 2)}
        strokeWidth={r1(1 + (k / n) * 2.4)}
      />,
    );
  }
  const lx = rnd.entre(60, 240);
  const ly = rnd.entre(55, y0 - 35);
  const lr = rnd.entre(14, 30);
  const inclinacion = rnd.entre(-10, 10);

  let figura: ReactNode;
  if (variante === 1) {
    // Pilotes de un muelle entrando al agua.
    const n = rnd.entero(5, 9);
    const base = y0 + rnd.entre(10, 60);
    figura = (
      <g>
        <rect x={0} y={r1(base - 34)} width={W} height={6} fill={p.claro} opacity={0.85} />
        {Array.from({ length: n }, (_, i) => (
          <rect
            key={i}
            x={r1(20 + (i * (W - 40)) / n)}
            y={r1(base - 30)}
            width={7}
            height={r1(60 + i * 6)}
            fill={p.claro}
            opacity={r1(0.9 - i / (n * 1.4))}
          />
        ))}
      </g>
    );
  } else if (variante === 2) {
    // Una lancha chica.
    const bx = lx;
    const by = y0 + rnd.entre(0, 30);
    figura = (
      <g transform={`rotate(${r1(inclinacion / 2)} ${r1(bx)} ${r1(by)})`}>
        <path
          d={`M${r1(bx - 52)} ${r1(by)} L${r1(bx + 52)} ${r1(by)} L${r1(bx + 36)} ${r1(by + 20)} L${r1(bx - 40)} ${r1(by + 20)} Z`}
          fill={p.acento}
        />
        <rect x={r1(bx - 12)} y={r1(by - 22)} width={24} height={22} fill={p.claro} />
        <rect x={r1(bx - 1.5)} y={r1(by - 60)} width={3} height={40} fill={p.claro} />
      </g>
    );
  } else {
    figura = <circle cx={r1(lx)} cy={r1(ly)} r={r1(lr)} fill={p.claro} opacity={0.92} />;
  }

  return (
    <>
      <defs>
        <clipPath id={`${uid}-cuadro`}>
          <rect x={30} y={14} width={W - 44} height={H - 28} rx={18} />
        </clipPath>
      </defs>
      <rect x={30} y={14} width={W - 44} height={H - 28} rx={18} fill={p.fondo2} />
      <g clipPath={`url(#${uid}-cuadro)`}>
        {variante !== 1 && figura}
        <rect x={0} y={r1(y0 - 14)} width={W} height={H} fill={p.fondo2} opacity={variante === 2 ? 0 : 1} />
        <g transform={`rotate(${r1(inclinacion)} ${W / 2} ${H / 2})`}>{olas}</g>
        {variante === 1 && figura}
      </g>
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={9} y={20 + i * 48} width={12} height={20} rx={3} fill={p.claro} opacity={0.2} />
      ))}
    </>
  );
}
