/**
 * Escenas de fondo por sección. Cada sección tiene un lenguaje propio y cada
 * película lo varía con su semilla:
 *  - Competencia Latinoamericana: luces de sodio, cerros con ventanas encendidas, agua.
 *  - Panorama Internacional: azul hielo, horizonte y retícula de mapa (latitudes).
 *  - Bruma Nocturna: rojo sobre negro, vetas, grano y suelo dentado.
 *  - Hecho en la Costa: verde agua, curvas de nivel y textura de archivo Súper 8.
 * Todo se dibuja en un viewBox de 200 x 300.
 */
import type { ReactNode } from "react";
import type { SeccionId } from "@/lib/programa";
import { curvaSuave, polilinea, r1, type Azar } from "./azar";

export type Detalle = "mini" | "tarjeta" | "grande";

export interface Paleta {
  /** Degradado del cielo: arriba, medio, horizonte. */
  cielo: [string, string, string];
  fondo: string;
  acento: string;
  luz: string;
  sombra: string;
  niebla: string;
  texto: string;
  agua: string;
}

export const PALETAS: Record<SeccionId, Paleta> = {
  competencia: {
    cielo: ["#0a1019", "#171b26", "#4a2a1a"],
    fondo: "#080c11",
    acento: "#ff7a2f",
    luz: "#ffd166",
    sombra: "#070a0e",
    niebla: "#f0d9c0",
    texto: "#f6eee2",
    agua: "#0b1118",
  },
  panorama: {
    cielo: ["#08121c", "#142a3d", "#3d6680"],
    fondo: "#060e16",
    acento: "#8fc4e0",
    luz: "#e4f3fb",
    sombra: "#050b12",
    niebla: "#d6ebf5",
    texto: "#eef7fb",
    agua: "#081521",
  },
  nocturna: {
    cielo: ["#040405", "#0b0608", "#1f080d"],
    fondo: "#030304",
    acento: "#e8465c",
    luz: "#ff9f8f",
    sombra: "#020203",
    niebla: "#d9c3c3",
    texto: "#f2e8e4",
    agua: "#0a0405",
  },
  costa: {
    cielo: ["#061315", "#0c2527", "#1b4440"],
    fondo: "#051012",
    acento: "#5fc9a3",
    luz: "#d9f2e6",
    sombra: "#041010",
    niebla: "#d4efe4",
    texto: "#eaf6f0",
    agua: "#07191a",
  },
};

export interface OpcionesEscena {
  /** Competencia */
  cerros?: boolean;
  luces?: boolean;
  agua?: boolean;
  /** y del agua / horizonte. */
  horizonte?: number | false;
  /** Panorama */
  reticula?: boolean;
  /** Nocturna */
  suelo?: boolean;
  vetas?: boolean;
  /** Costa */
  curvas?: boolean;
  super8?: boolean;
  /** Grano de película (nocturna y costa). */
  grano?: boolean;
}

export interface Ctx {
  /** Azar del motivo. */
  R: Azar;
  /** Flujo de azar independiente por capa: así mini, tarjeta y grande comparten formas. */
  azar: (capa: string) => Azar;
  uid: string;
  pal: Paleta;
  detalle: Detalle;
  /** true salvo en mini: dibuja detalles finos. */
  fino: boolean;
}

export const ref = (c: Ctx, nombre: string) => `${c.uid}-${nombre}`;
export const url = (c: Ctx, nombre: string) => `url(#${c.uid}-${nombre})`;

/** Degradado radial de "luz" reutilizable (centro opaco, borde transparente). */
export function DefLuz({ c, nombre, color, fuerza = 0.6 }: { c: Ctx; nombre: string; color: string; fuerza?: number }) {
  return (
    <radialGradient id={ref(c, nombre)}>
      <stop offset="0" stopColor={color} stopOpacity={fuerza} />
      <stop offset="0.45" stopColor={color} stopOpacity={fuerza * 0.35} />
      <stop offset="1" stopColor={color} stopOpacity={0} />
    </radialGradient>
  );
}

function interpolar(puntos: [number, number][], x: number): number {
  for (let i = 0; i < puntos.length - 1; i++) {
    const [x0, y0] = puntos[i];
    const [x1, y1] = puntos[i + 1];
    if (x >= x0 && x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return puntos[puntos.length - 1][1];
}

/** Brillos horizontales sobre el agua bajo una fuente de luz. */
function reflejos(R: Azar, x: number, desde: number, hasta: number, color: string, n: number) {
  const out: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const y = desde + 3 + t * (hasta - desde);
    const w = R.rango(4, 16) * (1 - t * 0.5);
    out.push(
      <rect
        key={i}
        x={r1(x - w / 2 + R.rango(-4, 4))}
        y={r1(y)}
        width={r1(w)}
        height={r1(0.8 + t * 0.8)}
        fill={color}
        opacity={r1((1 - t) * 0.6 * 10) / 10}
      />,
    );
  }
  return out;
}

function escenaCompetencia(c: Ctx, o: OpcionesEscena) {
  const { pal, fino } = c;
  const R = c.azar("escena");
  const L = c.azar("luces");
  const agua = o.agua === false ? null : typeof o.horizonte === "number" ? o.horizonte : 194;
  const haloX = R.rango(40, 160);
  const haloY = R.rango(125, 165);
  const capas: ReactNode[] = [];

  if (o.cerros !== false) {
    const colores = ["#141922", "#0c1017"];
    const crestas = [148, 170].map((base, capa) => {
      const pts: [number, number][] = [];
      for (let x = -10; x <= 220; x += 22) pts.push([x, base + R.rango(-22, 10) * (capa === 0 ? 1.2 : 0.8)]);
      return pts;
    });
    crestas.forEach((pts, capa) => {
      const d = curvaSuave(pts) + `L220 300L-10 300Z`;
      capas.push(<path key={`cerro${capa}`} d={d} fill={colores[capa]} />);
      if (o.luces !== false && fino) {
        const n = c.detalle === "grande" ? 34 : 18;
        for (let i = 0; i < n; i++) {
          const x = L.rango(0, 200);
          const techo = interpolar(pts, x) + 3;
          const piso = (agua ?? 210) - 2;
          const y = L.rango(techo, piso);
          const s = L.rango(0.9, 1.7);
          const tono = L.moneda(0.7);
          const op = L.rango(0.45, 1);
          if (techo >= piso) continue;
          capas.push(
            <rect
              key={`luz${capa}-${i}`}
              x={r1(x)}
              y={r1(y)}
              width={r1(s)}
              height={r1(s)}
              fill={tono ? pal.acento : pal.luz}
              opacity={r1(op)}
            />,
          );
        }
      }
    });
  }

  return (
    <g>
      <circle cx={r1(haloX)} cy={r1(haloY)} r={110} fill={url(c, "halo")} />
      {capas}
      {agua !== null && (
        <g>
          <rect x={0} y={agua} width={200} height={300 - agua} fill={pal.agua} />
          <rect x={0} y={agua} width={200} height={0.6} fill={pal.acento} opacity={0.35} />
          {fino && reflejos(L, haloX, agua, agua + 60, pal.acento, 9)}
        </g>
      )}
    </g>
  );
}

function escenaPanorama(c: Ctx, o: OpcionesEscena) {
  const { pal, fino } = c;
  const R = c.azar("escena");
  const h = o.horizonte === false ? null : (o.horizonte ?? R.rango(160, 178));
  const piso = h ?? 300;
  const lineas: ReactNode[] = [];
  const polar = R.moneda(0.45);

  if (o.reticula !== false && fino) {
    if (polar) {
      const cx = R.rango(20, 180);
      const cy = R.rango(-40, 60);
      for (let r = 18, i = 0; r < 340; r += 22, i++) {
        lineas.push(<circle key={`c${i}`} cx={r1(cx)} cy={r1(cy)} r={r} fill="none" stroke={pal.acento} strokeWidth={0.5} opacity={0.2} />);
      }
      for (let a = 0, i = 0; a < 360; a += 30, i++) {
        const rad = (a * Math.PI) / 180;
        lineas.push(
          <path key={`m${i}`} d={polilinea([[cx, cy], [cx + Math.cos(rad) * 400, cy + Math.sin(rad) * 400]])} stroke={pal.acento} strokeWidth={0.4} opacity={0.16} />,
        );
      }
    } else {
      const polo = 100 + R.rango(-40, 40);
      for (let y = 20 + R.rango(0, 14), i = 0; y < piso - 4; y += 19, i++) {
        const curva = (piso - y) * 0.12;
        lineas.push(
          <path key={`l${i}`} d={`M-5 ${r1(y)}Q100 ${r1(y - curva)} 205 ${r1(y)}`} fill="none" stroke={pal.acento} strokeWidth={0.5} opacity={0.2} />,
        );
      }
      for (let x = -140, i = 0; x <= 340; x += 34, i++) {
        lineas.push(
          <path key={`k${i}`} d={`M${r1(polo)} -160Q${r1((polo + x) / 2 + (x - polo) * 0.25)} ${r1(piso / 2)} ${r1(x)} ${r1(piso)}`} fill="none" stroke={pal.acento} strokeWidth={0.45} opacity={0.14} />,
        );
      }
    }
    // Marcas de registro, como en una carta náutica.
    for (let i = 0; i < 4; i++) {
      const x = R.rango(16, 184);
      const y = R.rango(16, piso - 16);
      lineas.push(<path key={`r${i}`} d={`M${r1(x - 3)} ${r1(y)}h6M${r1(x)} ${r1(y - 3)}v6`} stroke={pal.luz} strokeWidth={0.5} opacity={0.5} />);
    }
  }

  return (
    <g>
      {lineas}
      {h !== null && (
        <g>
          <rect x={0} y={r1(h)} width={200} height={r1(300 - h)} fill={pal.agua} />
          <rect x={0} y={r1(h)} width={200} height={0.7} fill={pal.luz} opacity={0.55} />
          {fino &&
            Array.from({ length: 12 }, (_, i) => {
              const y = h + 4 + i * i * 0.9;
              return (
                <rect key={`o${i}`} x={r1(R.rango(-10, 170))} y={r1(y)} width={r1(R.rango(12, 50))} height={0.5} fill={pal.acento} opacity={r1(0.35 - i * 0.02)} />
              );
            })}
        </g>
      )}
    </g>
  );
}

function escenaNocturna(c: Ctx, o: OpcionesEscena) {
  const { pal, fino } = c;
  const R = c.azar("escena");
  const V = c.azar("vetas");
  const S = c.azar("suelo");
  const out: ReactNode[] = [];
  out.push(<ellipse key="sangre" cx={r1(R.rango(50, 150))} cy={r1(R.rango(150, 230))} rx={150} ry={130} fill={url(c, "halo")} />);

  if (o.vetas !== false && fino) {
    const n = V.entero(8, 14);
    for (let i = 0; i < n; i++) {
      const alto = V.rango(40, 220);
      out.push(
        <rect
          key={`v${i}`}
          x={r1(V.rango(0, 200))}
          y={r1(V.rango(-20, 180))}
          width={r1(V.rango(0.3, 1.1))}
          height={r1(alto)}
          fill={pal.acento}
          opacity={r1(V.rango(0.06, 0.22))}
        />,
      );
    }
  }

  if (o.suelo !== false) {
    const base = typeof o.horizonte === "number" ? o.horizonte : 206;
    const pts: [number, number][] = [[-5, 300], [-5, base]];
    for (let x = 0; x <= 205; x += S.rango(4, 12)) {
      const pico = S.moneda(0.18);
      pts.push([x, base + S.rango(-4, 3) - (pico ? S.rango(8, 26) : 0)]);
      if (pico) pts.push([x + S.rango(1, 3), base + S.rango(-2, 2)]);
    }
    pts.push([205, base], [205, 300]);
    out.push(<path key="suelo" d={polilinea(pts, true)} fill={pal.sombra} />);
  }
  return <g>{out}</g>;
}

function escenaCosta(c: Ctx, o: OpcionesEscena) {
  const { pal, fino } = c;
  const R = c.azar("escena");
  const out: ReactNode[] = [];
  out.push(<circle key="halo" cx={r1(R.rango(30, 170))} cy={r1(R.rango(60, 140))} r={120} fill={url(c, "halo")} />);

  if (o.curvas !== false) {
    const n = fino ? 13 : 5;
    const f1 = R.rango(0.018, 0.034);
    const f2 = R.rango(0.05, 0.09);
    const p1 = R.rango(0, 6.28);
    const p2 = R.rango(0, 6.28);
    const inicio = typeof o.horizonte === "number" ? o.horizonte : 150;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const y0 = inicio + t * (300 - inicio) * 1.05;
      const a1 = 4 + t * 14;
      const a2 = 1.5 + t * 4;
      const pts: [number, number][] = [];
      for (let x = -10; x <= 210; x += 14) {
        pts.push([x, y0 + a1 * Math.sin(x * f1 + p1 + i * 0.35) + a2 * Math.sin(x * f2 + p2 - i * 0.2)]);
      }
      out.push(
        <path
          key={`cn${i}`}
          d={curvaSuave(pts)}
          fill="none"
          stroke={pal.acento}
          strokeWidth={fino ? (i % 4 === 0 ? 0.9 : 0.5) : 2}
          opacity={r1(0.2 + (1 - t) * 0.35)}
        />,
      );
    }
  }
  return <g>{out}</g>;
}

export function Escena({ c, seccion, opciones }: { c: Ctx; seccion: SeccionId; opciones: OpcionesEscena }) {
  switch (seccion) {
    case "competencia":
      return escenaCompetencia(c, opciones);
    case "panorama":
      return escenaPanorama(c, opciones);
    case "nocturna":
      return escenaNocturna(c, opciones);
    case "costa":
      return escenaCosta(c, opciones);
  }
}

/** Capas por encima del motivo: textura de archivo (Súper 8) y viñeta. */
export function Textura({ c, seccion, opciones }: { c: Ctx; seccion: SeccionId; opciones: OpcionesEscena }) {
  const { pal, fino } = c;
  const R = c.azar("textura");
  const out: ReactNode[] = [];
  const conGrano = opciones.grano ?? (seccion === "nocturna" || seccion === "costa");

  if (seccion === "costa" && opciones.super8 && fino) {
    // Rayas verticales y polvo de película.
    const n = R.entero(3, 6);
    for (let i = 0; i < n; i++) {
      const x = R.rango(10, 190);
      out.push(
        <path key={`raya${i}`} d={`M${r1(x)} ${r1(R.rango(0, 120))}l${r1(R.rango(-2, 2))} ${r1(R.rango(60, 200))}`} stroke={pal.luz} strokeWidth={r1(R.rango(0.3, 0.7))} opacity={r1(R.rango(0.12, 0.3))} />,
      );
    }
    for (let i = 0; i < 10; i++) {
      out.push(<circle key={`polvo${i}`} cx={r1(R.rango(0, 200))} cy={r1(R.rango(0, 300))} r={r1(R.rango(0.3, 1.1))} fill={pal.luz} opacity={0.35} />);
    }
  }

  if (conGrano && fino) {
    if (c.detalle === "grande") {
      out.push(<rect key="grano" width={200} height={300} filter={url(c, "grano")} opacity={seccion === "nocturna" ? 0.5 : 0.35} />);
    } else {
      out.push(<rect key="grano" width={200} height={300} fill={url(c, "granoP")} opacity={0.55} />);
    }
  }
  out.push(<rect key="vineta" width={200} height={300} fill={url(c, "vineta")} />);
  return <g>{out}</g>;
}

/** Definiciones compartidas (degradados, patrón y filtro de grano). */
export function DefsEscena({ c, seccion, cielo, opciones }: { c: Ctx; seccion: SeccionId; cielo: [string, string, string]; opciones: OpcionesEscena }) {
  const { pal, fino } = c;
  const conGrano = (opciones.grano ?? (seccion === "nocturna" || seccion === "costa")) && fino;
  const puntosGrano: ReactNode[] = [];
  if (conGrano && c.detalle !== "grande") {
    const G = c.azar("grano");
    for (let i = 0; i < 16; i++) {
      puntosGrano.push(<rect key={i} x={r1(G.rango(0, 24))} y={r1(G.rango(0, 24))} width={0.6} height={0.6} fill={pal.luz} opacity={r1(G.rango(0.15, 0.5))} />);
    }
  }
  return (
    <>
      <linearGradient id={ref(c, "cielo")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={cielo[0]} />
        <stop offset="0.45" stopColor={cielo[1]} />
        <stop offset="0.66" stopColor={cielo[2]} />
        <stop offset="1" stopColor={pal.fondo} />
      </linearGradient>
      <DefLuz c={c} nombre="halo" color={pal.acento} fuerza={seccion === "nocturna" ? 0.55 : 0.4} />
      <linearGradient id={ref(c, "banda")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={pal.niebla} stopOpacity={0} />
        <stop offset="0.5" stopColor={pal.niebla} stopOpacity={1} />
        <stop offset="1" stopColor={pal.niebla} stopOpacity={0} />
      </linearGradient>
      <linearGradient id={ref(c, "velo")} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={pal.fondo} stopOpacity={0} />
        <stop offset="0.55" stopColor={pal.fondo} stopOpacity={0.78} />
        <stop offset="1" stopColor={pal.fondo} stopOpacity={0.96} />
      </linearGradient>
      <radialGradient id={ref(c, "vineta")} cx="0.5" cy="0.45" r="0.75">
        <stop offset="0.6" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={seccion === "nocturna" ? 0.7 : 0.45} />
      </radialGradient>
      {conGrano && c.detalle === "grande" && (
        <filter id={ref(c, "grano")} x="0" y="0" width="1" height="1">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} stitchTiles="stitch" result="ruido" />
          <feColorMatrix in="ruido" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -20 0 0 0 5.6" />
        </filter>
      )}
      {puntosGrano.length > 0 && (
        <pattern id={ref(c, "granoP")} width={24} height={24} patternUnits="userSpaceOnUse">
          {puntosGrano}
        </pattern>
      )}
    </>
  );
}
