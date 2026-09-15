/**
 * Motivos por película: una imagen simple que sale de su título o sinopsis
 * (la grúa del muelle, la sal, el faro, la pipa de agua, el papel recortado...).
 * Se dibujan con primitivas SVG sobre la escena de su sección, en un viewBox de
 * 200 x 300, con el peso visual entre y=30 y y=200 (abajo va el título).
 */
import type { ReactNode } from "react";
import { curvaCerrada, curvaSuave, polilinea, r1 } from "./azar";
import { DefLuz, ref, url, type Ctx, type OpcionesEscena } from "./escenas";

export interface Motivo {
  dibujar: (c: Ctx) => ReactNode;
  cielo?: [string, string, string];
  escena?: OpcionesEscena;
}

/** Silueta humana mínima con los pies en (x, y). */
function Figura({ x, y, h, color, opacity }: { x: number; y: number; h: number; color: string; opacity?: number }) {
  const cabeza = h * 0.12;
  return (
    <g fill={color} opacity={opacity}>
      <circle cx={r1(x)} cy={r1(y - h + cabeza)} r={r1(cabeza)} />
      <path
        d={`M${r1(x - h * 0.13)} ${r1(y)}L${r1(x - h * 0.1)} ${r1(y - h * 0.7)}Q${r1(x)} ${r1(y - h * 0.8)} ${r1(x + h * 0.1)} ${r1(y - h * 0.7)}L${r1(x + h * 0.13)} ${r1(y)}Z`}
      />
    </g>
  );
}

/** Líneas diagonales cruzadas (malla de red) dentro de un recorte. */
function malla(x0: number, x1: number, y0: number, y1: number, paso: number, color: string, ancho: number, opacidad: number) {
  const alto = y1 - y0;
  let d = "";
  for (let x = x0 - alto; x <= x1 + alto; x += paso) {
    d += `M${r1(x)} ${r1(y0)}L${r1(x + alto)} ${r1(y1)}M${r1(x)} ${r1(y0)}L${r1(x - alto)} ${r1(y1)}`;
  }
  return <path d={d} stroke={color} strokeWidth={ancho} opacity={opacidad} fill="none" />;
}

/** Mancha orgánica cerrada alrededor de (cx, cy). */
function mancha(c: Ctx, cx: number, cy: number, radio: number, puntos = 9): string {
  const pts: [number, number][] = [];
  for (let i = 0; i < puntos; i++) {
    const a = (i / puntos) * Math.PI * 2;
    const r = radio * c.R.rango(0.7, 1.15);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.75]);
  }
  return curvaCerrada(pts);
}

function casita(x: number, y: number, w: number, h: number, fill: string, key: string, ventana?: string) {
  return (
    <g key={key}>
      <rect x={r1(x)} y={r1(y - h)} width={r1(w)} height={r1(h)} fill={fill} />
      <path d={polilinea([[x - 1, y - h], [x + w / 2, y - h - w * 0.45], [x + w + 1, y - h]], true)} fill={fill} />
      {ventana && <rect x={r1(x + w * 0.35)} y={r1(y - h * 0.65)} width={r1(w * 0.28)} height={r1(h * 0.3)} fill={ventana} />}
    </g>
  );
}

// ——— Competencia Latinoamericana ———

const laHoraAzul: Motivo = {
  cielo: ["#0c1a33", "#1f3a63", "#6b4a55"],
  dibujar: (c) => {
    const s = c.pal.sombra;
    return (
      <g>
        <defs>
          <DefLuz c={c} nombre="farol" color={c.pal.luz} fuerza={0.7} />
        </defs>
        {/* Grúa pórtico */}
        <g fill={s}>
          <rect x={100} y={74} width={5} height={122} />
          <rect x={150} y={74} width={5} height={122} />
          <rect x={100} y={146} width={55} height={3} />
          <rect x={16} y={70} width={182} height={5} />
          <rect x={56} y={75} width={14} height={10} />
        </g>
        <path d="M100 150L155 196M155 150L100 196" stroke={s} strokeWidth={1.6} />
        <path d="M103 70L128 30L152 70" stroke={s} strokeWidth={3} fill="none" />
        <path d="M128 31L18 71M128 31L196 71" stroke={s} strokeWidth={0.8} />
        <rect x={58} y={78} width={10} height={3} fill={c.pal.luz} />
        <path d="M61 85V120M66 85V120" stroke={s} strokeWidth={0.8} />
        {/* Contenedor colgando */}
        <rect x={44} y={120} width={40} height={17} fill={c.pal.acento} />
        {c.fino && <path d="M48 122v13M53 122v13M58 122v13M63 122v13M68 122v13M73 122v13M78 122v13" stroke="#7a3010" strokeWidth={0.8} />}
        {/* Muelle, contenedores apilados y la estibadora */}
        <rect x={0} y={194} width={200} height={6} fill={s} />
        <rect x={160} y={176} width={36} height={18} fill="#2b3a4a" />
        <rect x={164} y={158} width={32} height={18} fill="#8f4318" />
        <rect x={6} y={180} width={22} height={14} fill="#1f4546" />
        <circle cx={186} cy={118} r={16} fill={url(c, "farol")} />
        <path d="M186 118V194" stroke={s} strokeWidth={1.4} />
        <Figura x={40} y={194} h={17} color={s} />
        <circle cx={40} cy={176.5} r={1.2} fill={c.pal.luz} />
      </g>
    );
  },
};

const salDeRoca: Motivo = {
  cielo: ["#131722", "#3b2a31", "#c26f45"],
  escena: { cerros: false, agua: false },
  dibujar: (c) => {
    const papel = "#efe8d8";
    const lineas: string[] = [];
    for (let x = -300; x <= 500; x += 36) lineas.push(`M100 160L${x} 300`);
    for (let t = 0.15; t <= 1; t += 0.17) lineas.push(`M0 ${r1(160 + 140 * t * t)}H200`);
    const montones: [number, number, number, number][] = [
      [26, 200, 38, 24],
      [148, 180, 24, 15],
      [168, 222, 44, 30],
      [66, 176, 18, 10],
    ];
    return (
      <g>
        <defs>
          <linearGradient id={ref(c, "salar")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={papel} stopOpacity={0.42} />
            <stop offset="1" stopColor={papel} stopOpacity={0.06} />
          </linearGradient>
        </defs>
        <circle cx={100} cy={160} r={26} fill={c.pal.acento} opacity={0.9} />
        <rect x={0} y={160} width={200} height={140} fill="#221c1a" />
        <rect x={0} y={160} width={200} height={140} fill={url(c, "salar")} />
        {c.fino && <path d={lineas.join("")} stroke={papel} strokeWidth={0.4} opacity={0.22} />}
        {montones.map(([x, y, w, h], i) => (
          <g key={i}>
            <path d={polilinea([[x, y], [x + w / 2, y - h], [x + w, y]], true)} fill={papel} />
            <path d={polilinea([[x + w / 2, y - h], [x + w, y], [x + w * 0.55, y]], true)} fill="#b3a58e" />
          </g>
        ))}
        {casita(92, 160, 16, 12, c.pal.sombra, "casa", c.pal.luz)}
        {/* Dos hermanos, lejos uno del otro */}
        <path d="M58 196l-26 5h3l24-4Z" fill="#000" opacity={0.4} />
        <Figura x={58} y={196} h={18} color="#0b0c10" />
        <path d="M136 206l-30 6h3l28-5Z" fill="#000" opacity={0.4} />
        <Figura x={136} y={206} h={21} color="#0b0c10" />
      </g>
    );
  },
};

const losQueCuidanElFaro: Motivo = {
  escena: { cerros: false },
  dibujar: (c) => {
    // Torre troncocónica: 16 de ancho arriba (y=82), 24 abajo (y=184).
    const ancho = (y: number) => 8 + ((y - 82) / 102) * 4;
    const franja = (y0: number, y1: number) =>
      polilinea([[140 - ancho(y0), y0], [140 + ancho(y0), y0], [140 + ancho(y1), y1], [140 - ancho(y1), y1]], true);
    return (
      <g>
        <defs>
          <linearGradient id={ref(c, "hazI")} gradientUnits="userSpaceOnUse" x1="140" y1="0" x2="0" y2="0">
            <stop offset="0" stopColor={c.pal.luz} stopOpacity={0.55} />
            <stop offset="1" stopColor={c.pal.luz} stopOpacity={0} />
          </linearGradient>
          <linearGradient id={ref(c, "hazD")} gradientUnits="userSpaceOnUse" x1="140" y1="0" x2="200" y2="0">
            <stop offset="0" stopColor={c.pal.luz} stopOpacity={0.45} />
            <stop offset="1" stopColor={c.pal.luz} stopOpacity={0} />
          </linearGradient>
          <DefLuz c={c} nombre="linterna" color={c.pal.luz} fuerza={0.9} />
        </defs>
        <path d="M140 73L-10 30L-10 104Z" fill={url(c, "hazI")} />
        <path d="M140 73L210 60L210 84Z" fill={url(c, "hazD")} />
        <circle cx={140} cy={73} r={30} fill={url(c, "linterna")} />
        <path d="M104 196L116 178L136 172L160 176L180 196Z" fill={c.pal.sombra} />
        <path d={franja(82, 184)} fill="#e9e1d0" />
        <path d={franja(100, 114)} fill={c.pal.acento} />
        <path d={franja(128, 142)} fill={c.pal.acento} />
        <path d={franja(156, 170)} fill={c.pal.acento} />
        <rect x={128} y={79} width={24} height={3} fill={c.pal.sombra} />
        <rect x={134} y={66} width={12} height={13} fill={c.pal.luz} />
        <path d="M132 66Q140 54 148 66Z" fill={c.pal.sombra} />
        <Figura x={160} y={176} h={14} color="#1d2a36" />
        <Figura x={168} y={178} h={9} color="#1d2a36" />
        {c.fino &&
          [0, 1, 2, 3, 4, 5, 6].map((i) => (
            <rect key={i} x={r1(140 - (6 - i * 0.5) + c.R.rango(-3, 3))} y={200 + i * 7} width={r1(12 - i)} height={1} fill={c.pal.luz} opacity={r1(0.6 - i * 0.07)} />
          ))}
      </g>
    );
  },
};

const temporadaSeca: Motivo = {
  cielo: ["#1a1210", "#4d2715", "#b8521f"],
  escena: { cerros: false, agua: false },
  dibujar: (c) => {
    const grietas: string[] = [];
    if (c.fino) {
      for (let i = 0; i < 16; i++) {
        let x = c.R.rango(0, 200);
        let y = c.R.rango(184, 300);
        let a = c.R.rango(0, Math.PI * 2);
        const pts: [number, number][] = [[x, y]];
        for (let k = 0; k < 4; k++) {
          a += c.R.rango(-0.9, 0.9);
          x += Math.cos(a) * c.R.rango(6, 16);
          y += Math.sin(a) * c.R.rango(3, 8);
          pts.push([x, y]);
        }
        grietas.push(polilinea(pts));
      }
    }
    const oscuro = "#0d0806";
    return (
      <g>
        <circle cx={120} cy={96} r={40} fill={c.pal.acento} opacity={0.92} />
        {c.fino && (
          <g fill="none" stroke={c.pal.acento}>
            <circle cx={120} cy={96} r={50} strokeWidth={1.2} opacity={0.3} />
            <circle cx={120} cy={96} r={62} strokeWidth={1} opacity={0.18} />
            <circle cx={120} cy={96} r={76} strokeWidth={0.8} opacity={0.1} />
          </g>
        )}
        <path d="M0 170L28 161L54 161L62 167L118 165L134 155L170 155L178 164L200 166V190H0Z" fill="#2c1a13" />
        <rect x={0} y={178} width={200} height={122} fill="#1a110c" />
        {c.fino && <path d={grietas.join("")} stroke={c.pal.acento} strokeWidth={0.6} opacity={0.3} fill="none" />}
        {/* Camión aljibe (pipa) */}
        <g fill={oscuro}>
          <rect x={70} y={140} width={72} height={28} rx={14} />
          <path d="M40 178V154L52 143H68V178Z" />
          <rect x={38} y={166} width={106} height={8} />
          <circle cx={54} cy={178} r={7} />
          <circle cx={102} cy={178} r={7} />
          <circle cx={128} cy={178} r={7} />
        </g>
        <path d="M80 141H132" stroke={c.pal.luz} strokeWidth={1} opacity={0.7} />
        <path d="M52 146H66V156H46Z" fill={c.pal.acento} opacity={0.35} />
        <path d="M115 186C115 186 109 194 109 198A6 6 0 0 0 121 198C121 194 115 186 115 186Z" fill="none" stroke={c.pal.luz} strokeWidth={1.2} />
      </g>
    );
  },
};

const cordilleraDePapel: Motivo = {
  cielo: ["#0f1824", "#1b2a3a", "#2d3b4a"],
  escena: { cerros: false, agua: false },
  dibujar: (c) => {
    const colores = ["#3f5367", "#b7a68a", "#e0874f", "#efe8d8"];
    const capas = colores.map((color, i) => {
      const base = 118 + i * 30;
      const pts: [number, number][] = [[-6, 300], [-6, base + 10]];
      let x = -6;
      let arriba = c.R.moneda();
      while (x < 206) {
        x += c.R.rango(14, 30);
        pts.push([x, arriba ? base - c.R.rango(18, 46) + i * 4 : base + c.R.rango(0, 12)]);
        arriba = !arriba;
      }
      pts.push([206, 300]);
      const d = polilinea(pts, true);
      return (
        <g key={i}>
          <path d={d} fill="#000" opacity={0.4} transform="translate(0 3)" />
          <path d={d} fill={color} />
        </g>
      );
    });
    return (
      <g>
        <circle cx={150} cy={58} r={16} fill="#000" opacity={0.35} transform="translate(2 2)" />
        <circle cx={150} cy={58} r={16} fill="#efe8d8" />
        {capas}
        <path d="M-4 128C22 112 34 96 58 88" fill="none" stroke="#efe8d8" strokeWidth={1} strokeDasharray="2 3" opacity={0.7} />
        <g transform="translate(58 64) rotate(-14)">
          <rect x={2} y={3} width={36} height={24} fill="#000" opacity={0.4} />
          <rect x={0} y={0} width={36} height={24} fill="#efe8d8" />
          <path d="M0 0L18 13L36 0" fill="none" stroke="#8a7b64" strokeWidth={1} />
          <rect x={26} y={4} width={6} height={7} fill={c.pal.acento} />
        </g>
      </g>
    );
  },
};

const madrugadaEnPaysandu: Motivo = {
  cielo: ["#070b13", "#131a27", "#2e2331"],
  escena: { cerros: false, agua: false },
  dibujar: (c) => {
    const vy = 96;
    const faroles: ReactNode[] = [];
    [0.07, 0.14, 0.25, 0.41, 0.65, 1].forEach((d, i) => {
      [-1, 1].forEach((lado) => {
        const x = 100 + lado * (5 + 118 * d);
        const base = vy + 110 * d;
        const alto = 7 + 66 * d;
        faroles.push(
          <g key={`${i}${lado}`}>
            <ellipse cx={r1(x - lado * 20 * d)} cy={r1(base)} rx={r1(4 + 26 * d)} ry={r1(1 + 6 * d)} fill={c.pal.acento} opacity={0.12} />
            <path d={`M${r1(x)} ${r1(base)}V${r1(base - alto)}l${r1(-lado * 5 * d)} ${r1(-1.5 * d)}`} stroke="#05070a" strokeWidth={r1(0.5 + 1.6 * d)} fill="none" />
            <circle cx={r1(x - lado * 5 * d)} cy={r1(base - alto)} r={r1(3 + 16 * d)} fill={url(c, "farol")} />
            <circle cx={r1(x - lado * 5 * d)} cy={r1(base - alto + 0.5)} r={r1(0.6 + 1.6 * d)} fill={c.pal.luz} />
          </g>,
        );
      });
    });
    const tramos: [number, number][] = [[99, 101], [106, 111], [120, 130], [146, 164], [190, 222], [250, 300]];
    return (
      <g>
        <defs>
          <DefLuz c={c} nombre="farol" color={c.pal.acento} fuerza={0.8} />
        </defs>
        <rect x={0} y={vy} width={200} height={300 - vy} fill="#090c11" />
        <path d={`M98 ${vy}H102L240 300H-40Z`} fill="#141922" />
        {tramos.map(([a, b], i) => {
          const w = 0.4 + ((a - vy) / 204) * 3.6;
          return <rect key={i} x={r1(100 - w / 2)} y={a} width={r1(w)} height={b - a} fill={c.pal.luz} opacity={0.7} />;
        })}
        {faroles}
        {/* Taxi visto desde atrás */}
        <g transform="translate(100 206) scale(0.8) translate(-100 -262)">
          <ellipse cx={100} cy={262} rx={44} ry={5} fill="#000" opacity={0.6} />
          <path d="M78 238L85 223H115L122 238Z" fill="#0a0c10" />
          <rect x={64} y={236} width={72} height={24} rx={5} fill="#0a0c10" />
          <rect x={87} y={226} width={26} height={10} rx={1.5} fill="#2c3444" />
          <circle cx={95} cy={232} r={2.4} fill="#0a0c10" />
          <circle cx={106} cy={232.5} r={2.2} fill="#0a0c10" />
          <rect x={92} y={217} width={16} height={6} fill={c.pal.luz} />
          <rect x={66} y={242} width={11} height={4} fill="#e8465c" />
          <rect x={123} y={242} width={11} height={4} fill="#e8465c" />
          <path d="M64 237H136" stroke={c.pal.acento} strokeWidth={0.6} opacity={0.6} />
        </g>
      </g>
    );
  },
};

const vidrio: Motivo = {
  cielo: ["#0d0a10", "#26140f", "#56230f"],
  escena: { cerros: false, agua: false },
  dibujar: (c) => {
    const trizas: ReactNode[] = [];
    const n = c.fino ? 9 : 4;
    for (let i = 0; i < n; i++) {
      const a = c.R.rango(0, Math.PI * 2);
      const d = c.R.rango(54, 86);
      const x = 120 + Math.cos(a) * d;
      const y = 112 + Math.sin(a) * d * 0.9;
      const s = c.R.rango(5, 15);
      const g = c.R.rango(0, Math.PI);
      const pts: [number, number][] = [0, 2.2, 3.9].map((k) => [x + Math.cos(g + k) * s * (k === 0 ? 1 : 0.45), y + Math.sin(g + k) * s * (k === 0 ? 1 : 0.45)]);
      trizas.push(<path key={i} d={polilinea(pts, true)} fill={c.pal.luz} fillOpacity={0.12} stroke={c.pal.luz} strokeWidth={0.6} strokeOpacity={0.7} />);
    }
    return (
      <g>
        <defs>
          <radialGradient id={ref(c, "vidrio")} cx="0.4" cy="0.38" r="0.65">
            <stop offset="0" stopColor="#fff3c9" />
            <stop offset="0.3" stopColor={c.pal.luz} />
            <stop offset="0.68" stopColor={c.pal.acento} />
            <stop offset="1" stopColor="#6e1a0b" />
          </radialGradient>
          <DefLuz c={c} nombre="brasa" color={c.pal.acento} fuerza={0.75} />
        </defs>
        <circle cx={120} cy={112} r={80} fill={url(c, "brasa")} />
        {trizas}
        <path d="M8 262L96 138" stroke="#4d5963" strokeWidth={3.2} strokeLinecap="round" />
        <path d="M9 260L95 139" stroke={c.pal.luz} strokeWidth={0.6} opacity={0.4} />
        <ellipse cx={97} cy={136} rx={6} ry={4.5} fill={c.pal.acento} />
        <circle cx={120} cy={112} r={36} fill={url(c, "vidrio")} />
        <ellipse cx={106} cy={96} rx={10} ry={5} fill="#fff" opacity={0.55} transform="rotate(-35 106 96)" />
      </g>
    );
  },
};

const elCantoDeLasRedes: Motivo = {
  cielo: ["#0b1420", "#1c2a3b", "#6b4c3c"],
  escena: { luces: false, horizonte: 196 },
  dibujar: (c) => {
    const bolsa = "M30 46H170V86Q100 176 30 86Z";
    return (
      <g>
        <defs>
          <clipPath id={ref(c, "red")}>
            <path d={bolsa} />
          </clipPath>
        </defs>
        {[26, 44, 62, 80].map((r, i) => (
          <path
            key={r}
            d={`M${100 - r} 190A${r} ${r * 0.8} 0 0 1 ${100 + r} 190`}
            fill="none"
            stroke={c.pal.luz}
            strokeWidth={1.1}
            strokeDasharray={i % 2 ? "1.5 3" : undefined}
            opacity={r1(0.55 - i * 0.12)}
          />
        ))}
        <g clipPath={url(c, "red")}>{malla(30, 170, 46, 176, c.fino ? 9 : 14, "#efe8d8", c.fino ? 0.5 : 1, 0.6)}</g>
        <path d="M30 86Q100 176 170 86" fill="none" stroke="#efe8d8" strokeWidth={0.8} opacity={0.7} />
        {[48, 72, 100, 128, 152].map((x, i) => (
          <circle key={x} cx={x} cy={r1(i === 2 ? 131 : i === 1 || i === 3 ? 119 : 101)} r={2.2} fill={c.pal.acento} />
        ))}
        <path d="M22 46H178" stroke="#9a7650" strokeWidth={2.6} strokeLinecap="round" />
        <path d="M58 197Q100 214 142 197Q136 191 128 193Q100 201 72 193Q64 191 58 197Z" fill="#c99b52" />
        <Figura x={100} y={197} h={13} color={c.pal.sombra} />
      </g>
    );
  },
};

// ——— Panorama Internacional ———

const transbordadorDeInvierno: Motivo = {
  cielo: ["#0a141f", "#233a4f", "#7896a8"],
  escena: { horizonte: 172 },
  dibujar: (c) => {
    const nube: [number, number][] = [];
    for (let x = -10; x <= 210; x += 20) nube.push([x, c.R.rango(40, 66)]);
    const nieve: string[] = [];
    if (c.fino) {
      for (let i = 0; i < 34; i++) {
        const x = c.R.rango(0, 230);
        const y = c.R.rango(0, 170);
        const l = c.R.rango(5, 12);
        nieve.push(`M${r1(x)} ${r1(y)}l${r1(-l * 0.5)} ${r1(l)}`);
      }
    }
    return (
      <g>
        <path d={curvaSuave(nube) + "L210 -5L-10 -5Z"} fill="#050b12" opacity={0.8} />
        {c.fino && <path d={nieve.join("")} stroke={c.pal.luz} strokeWidth={0.5} opacity={0.4} />}
        <path d="M-10 172Q18 148 44 157Q60 150 76 172Z" fill="#06101a" />
        <path d="M136 172Q158 144 182 151Q200 148 214 172Z" fill="#06101a" />
        <path d="M60 176H140L131 188H70Z" fill="#050a10" />
        <rect x={76} y={163} width={48} height={13} fill={c.pal.luz} />
        <rect x={104} y={154} width={16} height={9} fill={c.pal.luz} />
        <rect x={88} y={150} width={7} height={13} fill={c.pal.acento} />
        <path d="M79 169.5H122" stroke="#0a1622" strokeWidth={2.5} strokeDasharray="3 2" />
        <path d="M131 184Q165 187 204 182" fill="none" stroke={c.pal.luz} strokeWidth={0.8} opacity={0.5} />
        <circle cx={63} cy={174} r={1.2} fill={c.pal.luz} />
      </g>
    );
  },
};

const marNegro: Motivo = {
  cielo: ["#0c1a26", "#1b3345", "#284a60"],
  escena: { horizonte: false },
  dibujar: (c) => {
    const grietas: string[] = [];
    const n = c.fino ? 11 : 6;
    for (let i = 0; i < n; i++) {
      let a = (i / n) * Math.PI * 2 + c.R.rango(-0.2, 0.2);
      let x = 100 + Math.cos(a) * 30;
      let y = 124 + Math.sin(a) * 30;
      const pts: [number, number][] = [[x, y]];
      for (let k = 0; k < 6; k++) {
        a += c.R.rango(-0.5, 0.5);
        const l = c.R.rango(10, 26);
        x += Math.cos(a) * l;
        y += Math.sin(a) * l;
        pts.push([x, y]);
      }
      grietas.push(polilinea(pts));
    }
    return (
      <g>
        <defs>
          <DefLuz c={c} nombre="fondoHielo" color={c.pal.acento} fuerza={0.6} />
        </defs>
        <rect width={200} height={300} fill={c.pal.luz} opacity={0.06} />
        <path d={grietas.join("")} stroke={c.pal.luz} strokeWidth={c.fino ? 0.8 : 1.6} opacity={0.55} fill="none" />
        <path d="M18 300C30 230 70 190 86 146" stroke="#e9e1d0" strokeWidth={1.1} fill="none" />
        <circle cx={100} cy={124} r={30} fill="#01050a" />
        <circle cx={104} cy={130} r={22} fill={url(c, "fondoHielo")} />
        <circle cx={100} cy={124} r={30} fill="none" stroke={c.pal.luz} strokeWidth={1.6} opacity={0.75} />
        <rect x={99} y={131} width={10} height={7} fill="none" stroke={c.pal.luz} strokeWidth={0.8} opacity={0.8} transform="rotate(12 104 134)" />
        <circle cx={92} cy={116} r={1.4} fill="none" stroke={c.pal.luz} strokeWidth={0.5} />
        <circle cx={95} cy={109} r={1} fill="none" stroke={c.pal.luz} strokeWidth={0.5} />
      </g>
    );
  },
};

const horasMuertas: Motivo = {
  cielo: ["#0a1420", "#112435", "#193045"],
  escena: { horizonte: false, reticula: false },
  dibujar: (c) => {
    const encendidas = new Set<number>();
    while (encendidas.size < 3) encendidas.add(c.R.entero(0, 8));
    const maquinas: ReactNode[] = [];
    for (let i = 0; i < 9; i++) {
      const col = i % 3;
      const fila = Math.floor(i / 3);
      const x = 23 + col * 54;
      const y = 26 + fila * 54;
      const cx = x + 23;
      const cy = y + 26;
      const on = encendidas.has(i);
      const nivel = c.R.rango(0, 10);
      const giro = c.R.rango(0, 360);
      maquinas.push(
        <g key={i}>
          <rect x={x} y={y} width={46} height={46} rx={4} fill="#0e1d2a" stroke={c.pal.acento} strokeWidth={0.7} strokeOpacity={0.4} />
          <rect x={x + 5} y={y + 4} width={8} height={2} fill={c.pal.acento} opacity={0.5} />
          <circle cx={cx} cy={cy} r={16} fill="#060e16" stroke={c.pal.luz} strokeWidth={2.2} strokeOpacity={on ? 0.95 : 0.5} />
          <circle cx={cx} cy={cy} r={12.5} fill={on ? url(c, "tambor") : "#0b1824"} />
          {on ? (
            <g fill="#07121c">
              <circle cx={cx} cy={cy - 3} r={3.2} />
              <path d={`M${cx - 7} ${cy + 9}Q${cx} ${cy - 3} ${cx + 7} ${cy + 9}Z`} />
            </g>
          ) : (
            <g>
              <path d={`M${cx - 12} ${r1(cy + nivel - 2)}Q${cx} ${r1(cy + nivel - 5)} ${cx + 12} ${r1(cy + nivel - 2)}V${cy + 6}A12 12 0 0 1 ${cx - 12} ${cy + 6}Z`} fill={c.pal.acento} opacity={0.3} />
              {c.fino && <path d={`M${cx} ${cy - 8}A8 8 0 0 1 ${cx + 8} ${cy}`} fill="none" stroke={c.pal.luz} strokeWidth={0.8} opacity={0.5} transform={`rotate(${r1(giro)} ${cx} ${cy})`} />}
            </g>
          )}
        </g>,
      );
    }
    return (
      <g>
        <defs>
          <radialGradient id={ref(c, "tambor")}>
            <stop offset="0" stopColor="#fff6d8" />
            <stop offset="0.7" stopColor={c.pal.luz} />
            <stop offset="1" stopColor={c.pal.acento} />
          </radialGradient>
        </defs>
        {maquinas}
      </g>
    );
  },
};

const ostravaBlues: Motivo = {
  cielo: ["#0b1119", "#1b2632", "#3c4a58"],
  escena: { horizonte: 196, reticula: false },
  dibujar: (c) => {
    const s = "#04080d";
    const cuerdas: string[] = [];
    for (let i = 0; i < 6; i++) {
      const a = -0.5 + i * 0.16;
      cuerdas.push(`M${r1(100 + Math.cos(a) * 20)} ${r1(56 + Math.sin(a) * 20)}L${r1(150 + i * 9)} 300`);
    }
    return (
      <g>
        <defs>
          <DefLuz c={c} nombre="escenario" color="#ffd28a" fuerza={0.55} />
        </defs>
        <circle cx={100} cy={60} r={78} fill={url(c, "escenario")} />
        <path d={cuerdas.join("")} stroke={c.pal.luz} strokeWidth={0.6} opacity={0.6} />
        <g stroke={s} fill="none">
          <path d="M60 196L91 70M140 196L109 70" strokeWidth={4} />
          <path d="M104 72L170 196" strokeWidth={3} />
          <path d="M65 178H135M71 150H129M78 122H122M84 96H116" strokeWidth={1.4} />
          <path d="M65 178L129 150M135 178L71 150M71 150L122 122M129 150L78 122M78 122L116 96M122 122L84 96" strokeWidth={1} />
          <circle cx={100} cy={56} r={20} strokeWidth={3} />
          <path d="M100 36V76M80 56H120M86 42L114 70M114 42L86 70" strokeWidth={1} />
        </g>
        <rect x={84} y={68} width={32} height={6} fill={s} />
        <circle cx={100} cy={56} r={3} fill={s} />
        <path d="M0 196H200V300H0Z" fill="#060b10" />
        <path d="M8 196V176H30V184H44V196ZM156 196V170H176V180H194V196Z" fill={s} />
      </g>
    );
  },
};

const lineaDeSal: Motivo = {
  cielo: ["#0c1824", "#1f3a4e", "#5f8aa0"],
  escena: { horizonte: 128 },
  dibujar: (c) => {
    const marcas: ReactNode[] = [];
    for (let y = 44, i = 0; y < 236; y += 6, i++) {
      marcas.push(<rect key={y} x={128} y={y} width={i % 5 === 0 ? 8 : 4} height={1.3} fill="#0b1622" />);
    }
    return (
      <g>
        <path d="M22 128C24 110 20 98 14 86" stroke="#040a10" strokeWidth={2.2} fill="none" />
        <path d="M14 86Q2 84 -4 92M14 86Q6 76 -2 74M14 86Q24 76 34 78M14 86Q26 86 30 96M14 86Q16 74 22 68" stroke="#040a10" strokeWidth={1.6} fill="none" strokeLinecap="round" />
        {casita(26, 196, 26, 14, "#0a1c2a", "c1")}
        {casita(74, 204, 22, 12, "#0a1c2a", "c2")}
        {casita(156, 190, 26, 16, "#0a1c2a", "c3")}
        <rect x={128} y={40} width={12} height={200} fill="#e8eef0" />
        {c.fino && marcas}
        <rect x={128} y={128} width={12} height={112} fill="#0c2536" opacity={0.6} />
        <path d="M0 176H200" stroke={c.pal.luz} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.65} />
        <path d="M60 172V134" stroke={c.pal.acento} strokeWidth={1.4} />
        <path d="M55 139L60 131L65 139Z" fill={c.pal.acento} />
        <path d="M0 128H200" stroke={c.pal.luz} strokeWidth={1.2} opacity={0.9} />
      </g>
    );
  },
};

const doceNochesClaras: Motivo = {
  cielo: ["#2a4660", "#7397b0", "#ecdcb8"],
  escena: { horizonte: 196, reticula: false },
  dibujar: (c) => {
    const tonos = ["#ffd98a", "#f5c46e", "#d8e9f2", "#ffe7b5"];
    const ventanas: ReactNode[] = [];
    for (let i = 0; i < 12; i++) {
      const col = i % 3;
      const fila = Math.floor(i / 3);
      const apagada = c.R.moneda(0.18);
      ventanas.push(
        <rect key={i} x={57 + col * 26} y={78 + fila * 28} width={17} height={19} fill={apagada ? "#1d3345" : c.R.elegir(tonos)} opacity={apagada ? 1 : r1(c.R.rango(0.75, 1))} />,
      );
    }
    const s = "#0d1824";
    return (
      <g>
        <circle cx={154} cy={196} r={20} fill="#fff0c8" opacity={0.95} />
        <rect x={0} y={196} width={200} height={104} fill={c.pal.agua} />
        <rect x={46} y={66} width={92} height={134} fill={s} />
        <rect x={42} y={62} width={100} height={5} fill={s} />
        {ventanas}
        <g fill={s}>
          <ellipse cx={119} cy={56} rx={8} ry={5} />
          <circle cx={127.5} cy={50} r={3.8} />
          <path d="M124.6 48L125.6 43.2L128 46.6ZM127.8 46.6L130.6 43.2L131.2 48.2Z" />
          <rect x={113} y={57} width={2} height={6} />
          <rect x={123} y={57} width={2} height={6} />
        </g>
        <path d="M111.5 55Q103 53 105 42" fill="none" stroke={s} strokeWidth={1.8} strokeLinecap="round" />
      </g>
    );
  },
};

// ——— Bruma Nocturna ———

const laNieblaTieneDientes: Motivo = {
  escena: { suelo: false },
  dibujar: (c) => {
    const pts: [number, number][] = [[-5, -5], [205, -5], [205, 100]];
    let x = 205;
    while (x > -5) {
      const w = c.R.rango(8, 20);
      const punta = c.R.rango(112, 156);
      pts.push([x - w / 2, punta]);
      x -= w;
      pts.push([x, c.R.rango(94, 102)]);
    }
    pts.push([-5, 100]);
    const casas: ReactNode[] = [];
    let cx = 8;
    let k = 0;
    while (cx < 190) {
      const w = c.R.rango(9, 15);
      const h = c.R.rango(6, 13);
      casas.push(casita(cx, 204, w, h, c.pal.sombra, `k${k}`, k === 2 ? c.pal.acento : undefined));
      cx += w + c.R.rango(3, 12);
      k++;
    }
    return (
      <g>
        <defs>
          <linearGradient id={ref(c, "dientes")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#8f8480" stopOpacity={0.2} />
            <stop offset="0.55" stopColor="#ddd3ce" stopOpacity={0.85} />
            <stop offset="1" stopColor="#f5eeea" />
          </linearGradient>
        </defs>
        <path d={polilinea(pts, true)} fill={url(c, "dientes")} />
        <rect x={0} y={202} width={200} height={98} fill={c.pal.sombra} />
        {casas}
        <Figura x={150} y={194} h={8} color={c.pal.sombra} />
        <Figura x={160} y={192} h={7} color={c.pal.sombra} opacity={0.7} />
      </g>
    );
  },
};

const mareaRoja: Motivo = {
  escena: { suelo: false, vetas: false },
  dibujar: (c) => {
    const manchas: ReactNode[] = [];
    const n = c.fino ? 6 : 4;
    for (let i = 0; i < n; i++) {
      manchas.push(
        <path key={i} d={mancha(c, c.R.rango(20, 180), c.R.rango(130, 240), c.R.rango(22, 56))} fill={i % 2 ? "#9e1b2e" : c.pal.acento} opacity={r1(c.R.rango(0.25, 0.55))} />,
      );
    }
    const celulas: ReactNode[] = [];
    if (c.fino) {
      for (let i = 0; i < 8; i++) {
        const x = c.R.rango(20, 180);
        const y = c.R.rango(124, 200);
        const r = c.R.rango(2.5, 5.5);
        celulas.push(
          <g key={i} fill="none" stroke={c.pal.luz} strokeWidth={0.6} opacity={0.8}>
            <circle cx={r1(x)} cy={r1(y)} r={r1(r)} />
            <path d={`M${r1(x + r)} ${r1(y)}q4 -3 7 1t7 0`} />
          </g>,
        );
      }
    }
    return (
      <g>
        <circle cx={58} cy={52} r={13} fill={c.pal.acento} />
        <rect x={0} y={104} width={200} height={196} fill={c.pal.agua} />
        {manchas}
        {celulas}
        {c.fino &&
          [0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={r1(52 - i * 0.5 + c.R.rango(-3, 3))} y={108 + i * 6} width={r1(12 - i)} height={1} fill={c.pal.acento} opacity={r1(0.7 - i * 0.1)} />
          ))}
        <path d="M0 104H200" stroke={c.pal.luz} strokeWidth={0.6} opacity={0.5} />
        <path d="M140 104H156L153 108H143ZM148 104V92" fill={c.pal.sombra} stroke={c.pal.sombra} strokeWidth={0.8} />
      </g>
    );
  },
};

const casaDePescadores: Motivo = {
  escena: { vetas: true },
  dibujar: (c) => {
    const bolsa = "M138 116Q146 196 178 184Q186 142 162 110Z";
    const peces: ReactNode[] = [];
    const posiciones: [number, number][] = [[150, 140], [162, 156], [150, 166], [168, 172], [158, 128], [164, 142]];
    posiciones.forEach(([x, y], i) => {
      peces.push(
        <path key={i} d={`M${x} ${y}q5 -3.5 10 0q-5 3.5 -10 0Zm10 0l3 -2.5v5Z`} fill="#e8ddd8" opacity={0.9} transform={`rotate(${i * 23 - 40} ${x + 5} ${y})`} />,
      );
    });
    return (
      <g>
        <defs>
          <clipPath id={ref(c, "bolsa")}>
            <path d={bolsa} />
          </clipPath>
          <DefLuz c={c} nombre="ventana" color={c.pal.acento} fuerza={0.8} />
        </defs>
        <path d="M148 34A14 14 0 1 0 148 62A11 11 0 1 1 148 34Z" fill={c.pal.acento} />
        <circle cx={79} cy={146} r={34} fill={url(c, "ventana")} />
        <rect x={112} y={90} width={8} height={18} fill={c.pal.sombra} />
        <path d="M48 122L92 86L138 122Z" fill={c.pal.sombra} />
        <rect x={56} y={120} width={74} height={90} fill={c.pal.sombra} />
        <rect x={72} y={138} width={14} height={16} fill={c.pal.acento} />
        <path d="M79 138V154M72 146H86" stroke={c.pal.sombra} strokeWidth={1} />
        <rect x={100} y={164} width={14} height={46} fill="#150709" />
        <path d="M136 114L162 108" stroke="#cfc3be" strokeWidth={0.8} />
        <path d="M163 106V210" stroke={c.pal.sombra} strokeWidth={2.2} />
        <g clipPath={url(c, "bolsa")}>
          {peces}
          {malla(130, 190, 104, 200, c.fino ? 5 : 8, "#d8cfc9", c.fino ? 0.45 : 0.9, 0.7)}
        </g>
        <path d={bolsa} fill="none" stroke="#d8cfc9" strokeWidth={0.8} opacity={0.8} />
        {c.fino && (
          <g fill={c.pal.acento}>
            <ellipse cx={160} cy={194} rx={0.9} ry={1.6} />
            <ellipse cx={170} cy={200} rx={0.8} ry={1.4} />
          </g>
        )}
      </g>
    );
  },
};

const lasCintasDelFaro: Motivo = {
  escena: { suelo: false },
  dibujar: (c) => {
    const bandas: ReactNode[] = [];
    if (c.fino) {
      for (let i = 0; i < 4; i++) {
        bandas.push(
          <rect key={i} x={r1(c.R.rango(-40, 40))} y={r1(c.R.rango(20, 220))} width={r1(c.R.rango(120, 240))} height={r1(c.R.rango(1, 4))} fill={i % 2 ? "#fff" : c.pal.acento} opacity={i % 2 ? 0.12 : 0.35} />,
        );
      }
    }
    const papel = "#e9e1d6";
    return (
      <g>
        <defs>
          <pattern id={ref(c, "lineas")} width={4} height={3} patternUnits="userSpaceOnUse">
            <rect width={4} height={1} fill="#000" opacity={0.45} />
          </pattern>
        </defs>
        <path d="M100 30L-20 0V70ZM100 30L220 -10V60Z" fill={c.pal.acento} opacity={0.12} />
        <circle cx={34} cy={44} r={4} fill={c.pal.acento} />
        <text x={170} y={46} textAnchor="end" fill={papel} opacity={0.8} fontSize={9} style={{ fontFamily: "var(--f-mono)" }}>
          1994
        </text>
        <g transform="translate(0 6)">
          <rect x={20} y={70} width={160} height={104} rx={5} fill="#111113" stroke="#2c2c30" strokeWidth={1} />
          <rect x={32} y={78} width={136} height={42} rx={2} fill={papel} />
          <rect x={32} y={106} width={136} height={6} fill={c.pal.acento} />
          <path d="M40 88H116M40 97H98" stroke="#6d6560" strokeWidth={1.4} strokeLinecap="round" />
          <path d="M150 102L152 84H156L158 102Z" fill="#1a1a1a" />
          <rect x={151} y={80} width={6} height={4} fill="#1a1a1a" />
          <path d="M154 82L136 78M154 82L136 88" stroke="#1a1a1a" strokeWidth={0.6} />
          <rect x={62} y={126} width={76} height={28} rx={3} fill="#050505" />
          <circle cx={80} cy={140} r={11} fill="#2a2426" />
          <circle cx={120} cy={140} r={7} fill="#2a2426" />
          <circle cx={80} cy={140} r={4} fill={papel} />
          <circle cx={120} cy={140} r={4} fill={papel} />
          <path d="M78 140h4M80 138v4M118 140h4M120 138v4" stroke="#111" strokeWidth={0.8} />
          <path d="M50 174L58 160H142L150 174Z" fill="#1b1b1e" />
          <circle cx={27} cy={77} r={1.5} fill="#333" />
          <circle cx={173} cy={77} r={1.5} fill="#333" />
        </g>
        {bandas}
        {c.fino && <rect width={200} height={300} fill={url(c, "lineas")} />}
      </g>
    );
  },
};

const ahogados: Motivo = {
  cielo: ["#050305", "#0c0507", "#1a070b"],
  escena: { suelo: false, vetas: false },
  dibujar: (c) => {
    // Un ojo cerrado (el sueño que comparten) sobre el agua que tapó el pueblo.
    const pestanas: string[] = [];
    for (let i = 0; i < 7; i++) {
      const t = (i + 1) / 8;
      const x = 58 + t * 84;
      const y = 44 + Math.sin(t * Math.PI) * 14;
      pestanas.push(`M${r1(x)} ${r1(y)}l${r1((t - 0.5) * 10)} ${r1(6 + Math.sin(t * Math.PI) * 4)}`);
    }
    const olas: [number, number][] = [];
    for (let x = -10; x <= 210; x += 20) olas.push([x, 84 + (x / 20) % 2 * 2]);
    const burbujas: ReactNode[] = [];
    if (c.fino) {
      for (let i = 0; i < 9; i++) {
        burbujas.push(<circle key={i} cx={r1(108 + c.R.rango(-10, 14))} cy={r1(96 + i * 5 + c.R.rango(-2, 2))} r={r1(c.R.rango(0.8, 2.6))} fill="none" stroke={c.pal.luz} strokeWidth={0.5} opacity={0.7} />);
      }
    }
    const edif = "#12060a";
    return (
      <g>
        <defs>
          <linearGradient id={ref(c, "hondo")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3a0c14" />
            <stop offset="1" stopColor="#060203" />
          </linearGradient>
        </defs>
        <path d="M52 44Q100 76 148 44" fill="none" stroke={c.pal.luz} strokeWidth={1.8} strokeLinecap="round" />
        <path d={pestanas.join("")} stroke={c.pal.luz} strokeWidth={1.3} strokeLinecap="round" />
        <path d={curvaSuave(olas) + "L210 300L-10 300Z"} fill={url(c, "hondo")} />
        <path d="M40 90L10 300H50ZM120 92L100 300H150Z" fill={c.pal.acento} opacity={0.07} />
        <g fill={edif} stroke={c.pal.acento} strokeWidth={0.6} strokeOpacity={0.45}>
          <rect x={96} y={138} width={24} height={62} />
          <path d="M96 138L108 104L120 138Z" />
          <rect x={46} y={172} width={30} height={28} />
          <path d="M44 172L61 160L78 172Z" />
          <rect x={136} y={168} width={34} height={32} />
          <path d="M134 168L153 156L172 168Z" />
        </g>
        <path d="M104 150A4 4 0 0 1 112 150V160H104Z" fill={c.pal.acento} opacity={0.5} />
        <path d="M24 200V150M20 152H28" stroke={c.pal.acento} strokeWidth={0.8} opacity={0.4} />
        {burbujas}
        <path d="M-5 200Q50 192 100 200T205 198V300H-5Z" fill="#070304" />
        <path d={curvaSuave(olas)} fill="none" stroke={c.pal.acento} strokeWidth={1} opacity={0.7} />
      </g>
    );
  },
};

// ——— Hecho en la Costa ———

function tira(c: Ctx, x: number, y: number, w: number, h: number, paso: number) {
  const hoyos: ReactNode[] = [];
  for (let yy = y + 6, i = 0; yy < y + h - 8; yy += paso, i++) {
    hoyos.push(<rect key={`a${i}`} x={x + 3} y={yy} width={6} height={7} rx={1.5} fill="#1a403c" />);
    hoyos.push(<rect key={`b${i}`} x={x + w - 9} y={yy} width={6} height={7} rx={1.5} fill="#1a403c" />);
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#061412" />
      {c.fino ? hoyos : null}
    </g>
  );
}

const cortosOficiosDelMar: Motivo = {
  escena: { horizonte: 170 },
  dibujar: (c) => {
    const papel = "#efe8d8";
    const a = c.pal.acento;
    const iconos: ((x: number, y: number) => ReactNode)[] = [
      (x, y) => (
        <g>
          <path d={`M${x - 14} ${y + 8}Q${x} ${y - 20} ${x + 14} ${y + 8}Q${x} ${y + 14} ${x - 14} ${y + 8}Z`} fill={papel} />
          <path d={`M${x} ${y + 11}L${x - 9} ${y - 2}M${x} ${y + 11}L${x} ${y - 6}M${x} ${y + 11}L${x + 9} ${y - 2}`} stroke="#9c8f78" strokeWidth={1} />
        </g>
      ),
      (x, y) => (
        <g>
          <path d={`M${x - 16} ${y + 2}H${x + 16}L${x + 11} ${y + 11}H${x - 11}Z`} fill={a} />
          <path d={`M${x - 2} ${y + 2}V${y - 14}L${x + 10} ${y}`} stroke={papel} strokeWidth={1.2} fill="none" />
        </g>
      ),
      (x, y) => (
        <g>
          <path d={`M${x - 14} ${y}Q${x - 2} ${y - 10} ${x + 8} ${y}Q${x - 2} ${y + 10} ${x - 14} ${y}Z`} fill={papel} />
          <path d={`M${x + 8} ${y}L${x + 15} ${y - 6}V${y + 6}Z`} fill={papel} />
          <circle cx={x - 8} cy={y - 1.5} r={1.3} fill="#061412" />
        </g>
      ),
      (x, y) => <path d={`M${x + 2} ${y - 15}V${y + 5}A6 6 0 1 1 ${x - 10} ${y + 4}l-2 -4`} stroke={papel} strokeWidth={2.2} fill="none" strokeLinecap="round" />,
      (x, y) => (
        <g fill="none" stroke={a} strokeWidth={2.4}>
          <circle cx={x} cy={y} r={11} strokeDasharray="4 2" />
          <circle cx={x} cy={y} r={4.5} stroke={papel} strokeWidth={1.5} />
        </g>
      ),
      (x, y) => (
        <g>
          <rect x={x - 15} y={y - 2} width={30} height={14} fill="#b98a55" />
          <path d={`M${x - 15} ${y + 5}H${x + 15}`} stroke="#6f4f2c" strokeWidth={1} />
          <circle cx={x - 8} cy={y - 4} r={4} fill="#1d1d2b" />
          <circle cx={x} cy={y - 5} r={4} fill="#1d1d2b" />
          <circle cx={x + 8} cy={y - 4} r={4} fill="#1d1d2b" />
        </g>
      ),
    ];
    return (
      <g>
        {tira(c, 30, 22, 140, 176, 16)}
        {iconos.map((dib, i) => {
          const x = 43 + (i % 2) * 58;
          const y = 30 + Math.floor(i / 2) * 55;
          return (
            <g key={i}>
              <rect x={x} y={y} width={54} height={49} rx={3} fill="#12322e" />
              {dib(x + 27, y + 26)}
            </g>
          );
        })}
      </g>
    );
  },
};

const cortosNochesDePuerto: Motivo = {
  escena: { horizonte: 180 },
  dibujar: (c) => {
    const papel = "#efe8d8";
    const escenas: ((x: number, y: number) => ReactNode)[] = [
      // Bar que cierra: ventana con toldo.
      (x, y) => (
        <g>
          <rect x={x + 18} y={y + 8} width={26} height={16} fill={c.pal.luz} opacity={0.25} />
          <path d={`M${x + 14} ${y + 8}H${x + 48}L${x + 44} ${y + 3}H${x + 18}Z`} fill={c.pal.acento} />
          <path d={`M${x + 31} ${y + 8}V${y + 24}`} stroke="#04100f" strokeWidth={1} />
        </g>
      ),
      // Farol.
      (x, y) => (
        <g>
          <circle cx={x + 40} cy={y + 9} r={9} fill={url(c, "farolito")} />
          <path d={`M${x + 40} ${y + 30}V${y + 9}`} stroke={papel} strokeWidth={0.8} />
          <circle cx={x + 40} cy={y + 9} r={1.8} fill="#ffd166" />
        </g>
      ),
      // Luna sobre el agua.
      (x, y) => (
        <g>
          <circle cx={x + 20} cy={y + 12} r={6} fill={papel} />
          <path d={`M${x + 16} ${y + 26}h8M${x + 18} ${y + 29}h4`} stroke={papel} strokeWidth={0.8} />
        </g>
      ),
      // Lancha con su luz.
      (x, y) => (
        <g>
          <path d={`M${x + 16} ${y + 21}H${x + 46}L${x + 41} ${y + 27}H${x + 21}Z`} fill={c.pal.acento} />
          <rect x={x + 26} y={y + 14} width={9} height={7} fill={papel} />
          <circle cx={x + 30} cy={y + 11} r={1.4} fill="#ffd166" />
        </g>
      ),
      // Grúa apagada.
      (x, y) => <path d={`M${x + 22} ${y + 30}V${y + 5}H${x + 48}M${x + 22} ${y + 12}L${x + 30} ${y + 5}M${x + 44} ${y + 5}V${y + 16}`} stroke={papel} strokeWidth={1.2} fill="none" />,
    ];
    return (
      <g>
        <defs>
          <DefLuz c={c} nombre="farolito" color="#ffd166" fuerza={0.7} />
        </defs>
        <g transform="rotate(-7 100 112)">
          {tira(c, 50, 14, 100, 196, 12)}
          {escenas.map((dib, i) => {
            const x = 69;
            const y = 20 + i * 37.5;
            return (
              <g key={i}>
                <rect x={x} y={y} width={62} height={33} rx={2} fill="#0b2422" />
                <path d={`M${x} ${y + 25}H${x + 62}`} stroke={c.pal.acento} strokeWidth={0.5} opacity={0.6} />
                {dib(x, y)}
              </g>
            );
          })}
        </g>
      </g>
    );
  },
};

const caletaSur: Motivo = {
  escena: { horizonte: 176 },
  dibujar: (c) => {
    const torres: [number, number, number][] = [[18, 44, 40], [72, 18, 50], [138, 54, 44]];
    const lancha = (x: number, y: number, w: number, color: string, giro: number, key: string) => (
      <g key={key} transform={`rotate(${giro} ${x + w / 2} ${y})`}>
        <path d={`M${x} ${y}H${x + w}L${x + w * 0.86} ${y + 12}H${x + w * 0.1}Z`} fill={color} />
        <path d={`M${x + 1} ${y + 3}H${x + w - 1}`} stroke="#061412" strokeWidth={1.2} opacity={0.6} />
      </g>
    );
    return (
      <g>
        {torres.map(([x, y, w], i) => (
          <g key={i}>
            <rect x={x} y={y} width={w} height={176 - y} fill="#051110" opacity={0.7} stroke={c.pal.acento} strokeWidth={0.7} strokeOpacity={0.5} />
            {c.fino && (
              <path
                d={Array.from({ length: Math.floor((176 - y) / 9) }, (_, k) => `M${x} ${y + 9 + k * 9}H${x + w}`).join("")}
                stroke={c.pal.acento}
                strokeWidth={0.5}
                strokeDasharray="1.5 2.5"
                opacity={0.4}
              />
            )}
          </g>
        ))}
        <path d="M97 18V2H136M97 8L106 2M130 2V14" stroke={c.pal.acento} strokeWidth={0.8} fill="none" opacity={0.6} />
        <path d="M-5 172Q60 164 120 170T205 168V190H-5Z" fill="#0b1f1c" />
        {lancha(14, 170, 52, "#c9543f", -4, "l1")}
        {lancha(76, 176, 46, "#efe8d8", 3, "l2")}
        {lancha(132, 171, 56, "#3f8fb0", -2, "l3")}
        {[70, 82, 94, 106, 118, 130].map((x, i) => (
          <Figura key={x} x={x} y={206} h={i % 2 ? 15 : 17} color={c.pal.sombra} />
        ))}
        <rect x={0} y={206} width={200} height={3} fill={c.pal.sombra} />
      </g>
    );
  },
};

const elUltimoAstillero: Motivo = {
  cielo: ["#071416", "#13302f", "#4d5a44"],
  escena: { horizonte: 196 },
  dibujar: (c) => {
    const madera = "#d9ab70";
    const quilla = (x: number) => 170 + Math.sin(((x - 26) / 150) * Math.PI) * 8 - ((x - 26) / 150) * 4;
    const cuadernas: string[] = [];
    const topes: [number, number][] = [];
    for (let i = 0; i < 11; i++) {
      const t = (i + 0.5) / 11;
      const x = 30 + t * 142;
      const yq = quilla(x);
      const h = 18 + Math.sin(t * Math.PI) * 52;
      const w = 4 + Math.sin(t * Math.PI) * 9;
      cuadernas.push(`M${r1(x - w)} ${r1(yq - h)}C${r1(x - w * 1.1)} ${r1(yq - 4)} ${r1(x + w * 1.1)} ${r1(yq - 4)} ${r1(x + w)} ${r1(yq - h)}`);
      topes.push([x - w, yq - h]);
    }
    return (
      <g>
        <defs>
          <DefLuz c={c} nombre="ampolleta" color="#ffd166" fuerza={0.7} />
        </defs>
        <rect x={0} y={196} width={200} height={104} fill="#0a1714" />
        <circle cx={100} cy={52} r={40} fill={url(c, "ampolleta")} />
        <path d="M100 0V48" stroke="#0a1714" strokeWidth={0.8} />
        <circle cx={100} cy={50} r={2.4} fill="#ffe9a8" />
        <path d="M40 196L70 168M160 196L136 166M100 196V178" stroke="#6f5234" strokeWidth={1.6} />
        <path d={cuadernas.join("")} stroke={madera} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <path d={curvaSuave(topes)} stroke={madera} strokeWidth={1.2} fill="none" opacity={0.85} />
        <path d="M26 170Q100 184 176 166" stroke={madera} strokeWidth={3.2} fill="none" strokeLinecap="round" />
        <path d="M176 166Q188 128 184 96" stroke={madera} strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M26 170L20 120" stroke={madera} strokeWidth={3} strokeLinecap="round" />
        <Figura x={58} y={196} h={17} color={c.pal.sombra} />
        <path d="M0 196H200" stroke={madera} strokeWidth={0.6} opacity={0.4} />
        {c.fino &&
          Array.from({ length: 14 }, (_, i) => <circle key={i} cx={r1(c.R.rango(40, 170))} cy={r1(c.R.rango(198, 206))} r={0.7} fill={madera} opacity={0.6} />)}
      </g>
    );
  },
};

const bruma1987: Motivo = {
  escena: { super8: true, curvas: false },
  dibujar: (c) => {
    const rayas: string[] = [];
    if (c.fino) {
      for (let i = 0; i < 4; i++) {
        const x = c.R.rango(30, 170);
        rayas.push(`M${r1(x)} 40l${r1(c.R.rango(-3, 3))} 140`);
      }
    }
    return (
      <g>
        <defs>
          <clipPath id={ref(c, "cuadro")}>
            <rect x={22} y={36} width={156} height={150} rx={16} />
          </clipPath>
          <linearGradient id={ref(c, "archivo")} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9d4a6" />
            <stop offset="0.55" stopColor="#c7b58c" />
            <stop offset="1" stopColor="#6f9186" />
          </linearGradient>
          <radialGradient id={ref(c, "fuga")} cx="0" cy="0" r="0.9">
            <stop offset="0" stopColor="#ff7a2f" stopOpacity={0.75} />
            <stop offset="1" stopColor="#ff7a2f" stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect x={10} y={20} width={180} height={182} fill="#030a0a" />
        {[40, 100, 160].map((y) => (
          <rect key={y} x={3} y={y} width={9} height={16} rx={2.5} fill="#0f2b29" />
        ))}
        <g clipPath={url(c, "cuadro")}>
          <rect x={22} y={36} width={156} height={150} fill={url(c, "archivo")} />
          <circle cx={134} cy={80} r={15} fill="#fff6dc" opacity={0.9} />
          <rect x={22} y={118} width={156} height={30} fill="#4f8a80" opacity={0.85} />
          <path d="M22 124Q60 120 100 124T178 123M22 134Q70 130 110 134T178 133" stroke="#e8f1e4" strokeWidth={0.8} fill="none" opacity={0.7} />
          <path d="M22 148Q100 140 178 150V186H22Z" fill="#d8c296" />
          <path d="M88 158L128 66" stroke="#2c3a36" strokeWidth={0.5} opacity={0.7} />
          <path d="M128 58L134 66L128 76L122 66Z" fill="#c9543f" />
          <Figura x={62} y={166} h={27} color="#2c3a36" />
          <Figura x={76} y={166} h={25} color="#2c3a36" />
          <Figura x={88} y={166} h={15} color="#2c3a36" />
          <rect x={22} y={36} width={156} height={150} fill={url(c, "fuga")} />
          <path d={rayas.join("")} stroke="#fff" strokeWidth={0.5} opacity={0.5} />
        </g>
        <rect x={22} y={36} width={156} height={150} rx={16} fill="none" stroke="#000" strokeWidth={3} opacity={0.5} />
      </g>
    );
  },
};

export const MOTIVOS: Record<string, Motivo> = {
  "la-hora-azul-del-puerto": laHoraAzul,
  "sal-de-roca": salDeRoca,
  "los-que-cuidan-el-faro": losQueCuidanElFaro,
  "temporada-seca": temporadaSeca,
  "cordillera-de-papel": cordilleraDePapel,
  "madrugada-en-paysandu": madrugadaEnPaysandu,
  vidrio,
  "el-canto-de-las-redes": elCantoDeLasRedes,
  "transbordador-de-invierno": transbordadorDeInvierno,
  "mar-negro": marNegro,
  "horas-muertas": horasMuertas,
  "ostrava-blues": ostravaBlues,
  "linea-de-sal": lineaDeSal,
  "doce-noches-claras": doceNochesClaras,
  "la-niebla-tiene-dientes": laNieblaTieneDientes,
  "marea-roja": mareaRoja,
  "casa-de-pescadores": casaDePescadores,
  "las-cintas-del-faro": lasCintasDelFaro,
  ahogados,
  "cortos-oficios-del-mar": cortosOficiosDelMar,
  "cortos-noches-de-puerto": cortosNochesDePuerto,
  "caleta-sur": caletaSur,
  "el-ultimo-astillero": elUltimoAstillero,
  "bruma-1987": bruma1987,
};
