/**
 * Escena del puerto de noche para el hero: cerros con casitas, niebla (canvas),
 * grúas y contenedores en el muelle, y el faro con su haz barriendo la bahía.
 * Todo es decorativo (aria-hidden). La geometría de los cerros se genera con una
 * semilla fija, así que es idéntica en cada render.
 */
import NieblaCanvas from "./NieblaCanvas";
import s from "./Escena.module.css";

function semilla(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const W = 1600;
const H = 360;
const r1 = (n: number) => Math.round(n * 10) / 10;

const crestaAtras = (x: number) => 128 - 44 * Math.sin(x / 260 + 0.6) - 24 * Math.sin(x / 97 + 1.3) - 9 * Math.sin(x / 41);
const crestaFrente = (x: number) =>
  218 - 46 * Math.sin(x / 330 + 2.1) - 22 * Math.sin(x / 118 + 0.4) - 7 * Math.sin(x / 37 + 2);

function perfil(f: (x: number) => number): string {
  let d = `M0 ${H}L0 ${r1(f(0))}`;
  for (let x = 20; x <= W; x += 20) d += `L${x} ${r1(f(x))}`;
  return `${d}L${W} ${H}Z`;
}

function rect(x: number, y: number, w: number, h: number): string {
  return `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}z`;
}

/** Casitas apiladas en el cerro y sus ventanas encendidas. */
const cerro = (() => {
  const rnd = semilla(1987);
  let casas = "";
  const ventanas = ["", "", "", ""]; // cálidas fijas, frías, parpadeo A, parpadeo B
  for (let x = -4; x < W; x += 13 + rnd() * 4) {
    const cresta = crestaFrente(x + 6);
    let y = cresta + 3 + rnd() * 8;
    const limite = Math.min(cresta + 118, H - 4);
    while (y < limite) {
      const w = 8 + rnd() * 6;
      const h = 6 + rnd() * 5;
      if (rnd() < 0.62) {
        casas += rect(x + rnd() * 2, y, w, h);
        const p = rnd();
        if (p < 0.34) {
          const grupo = p < 0.05 ? 2 : p < 0.09 ? 3 : p < 0.27 ? 0 : 1;
          ventanas[grupo] += rect(x + w / 2 - 1, y + h * 0.3, 2.4, 2.8);
        }
      }
      y += h + 1.2 + rnd() * 3;
    }
  }
  let lejanas = "";
  for (let x = 0; x < W; x += 9 + rnd() * 14) {
    const c = crestaAtras(x);
    const y = c + 8 + rnd() * 70;
    if (y < crestaFrente(x) - 4 && rnd() < 0.5) lejanas += rect(x, y, 1.8, 1.8);
  }
  return { casas, ventanas, lejanas };
})();

const perfilAtras = perfil(crestaAtras);
const perfilFrente = perfil(crestaFrente);

/* Contenedores del muelle: [x, y, color] */
const CONTENEDORES: [number, number, string][] = [
  [18, 362, "#2b1719"],
  [94, 362, "#10262c"],
  [170, 362, "#1c2031"],
  [246, 362, "#2c2113"],
  [40, 332, "#132430"],
  [116, 332, "#2d1a1c"],
  [192, 332, "#12272a"],
  [78, 302, "#262015"],
  [154, 302, "#1a1d2b"],
];

const FAROLES = [352, 612, 878];

export default function Escena() {
  return (
    <div className={s.escena} aria-hidden="true">
      <div className={s.luna} />

      <svg className={s.cerros} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMax slice" focusable="false">
        <path d={perfilAtras} fill="#16232f" />
        <path d={cerro.lejanas} fill="#e9c59a" opacity="0.35" />
        <path d={perfilFrente} fill="#0d1821" />
        <path d={cerro.casas} fill="#15232f" />
        <path d={cerro.ventanas[0]} fill="#ffb46b" opacity="0.85" />
        <path d={cerro.ventanas[1]} fill="#d6e5ea" opacity="0.55" />
        <path d={cerro.ventanas[2]} fill="#ffc27e" className={s.parpadeoA} />
        <path d={cerro.ventanas[3]} fill="#ffc27e" className={s.parpadeoB} />
      </svg>

      <NieblaCanvas className={s.niebla} />

      <svg className={s.puerto} viewBox="0 0 900 420" focusable="false">
        <defs>
          <radialGradient id="np-farol">
            <stop offset="0" stopColor="#ffb070" stopOpacity="0.95" />
            <stop offset="0.18" stopColor="#ff7a2f" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ff7a2f" stopOpacity="0" />
          </radialGradient>
          <pattern id="np-costillas" width="6" height="10" patternUnits="userSpaceOnUse">
            <rect width="2" height="10" fill="#000" opacity="0.35" />
          </pattern>
        </defs>

        {/* Grúa del fondo, con la pluma levantada */}
        <g fill="#0b141c" stroke="#0b141c">
          <rect x="120" y="170" width="8" height="222" stroke="none" />
          <rect x="226" y="170" width="8" height="222" stroke="none" />
          <rect x="112" y="238" width="130" height="7" stroke="none" />
          <path d="M126 176 L178 92 L230 176" fill="none" strokeWidth="6" />
          <rect x="100" y="166" width="180" height="10" stroke="none" />
          <path d="M150 170 L262 10" fill="none" strokeWidth="11" />
          <path d="M178 92 L262 12 M178 92 L102 168" fill="none" strokeWidth="1.5" />
        </g>
        <circle cx="178" cy="90" r="3.2" fill="#ff4d3d" className={s.baliza} />

        {/* Contenedores apilados */}
        {CONTENEDORES.map(([x, y, color]) => (
          <g key={`${x}-${y}`}>
            <rect x={x} y={y} width="74" height="30" fill={color} />
            <rect x={x} y={y} width="74" height="30" fill="url(#np-costillas)" />
            <rect x={x} y={y} width="74" height="1.6" fill="#ff9a55" opacity="0.28" />
            <rect x={x + 68} y={y + 4} width="1.6" height="22" fill="#000" opacity="0.4" />
          </g>
        ))}

        {/* Grúa portacontenedores principal */}
        <g fill="#060b10" stroke="#060b10">
          <rect x="428" y="146" width="11" height="246" stroke="none" />
          <rect x="562" y="146" width="11" height="246" stroke="none" />
          <rect x="420" y="258" width="162" height="9" stroke="none" />
          <path d="M439 262 L562 170 M562 262 L439 170" fill="none" strokeWidth="3" />
          <path d="M438 140 L500 36 L566 140" fill="none" strokeWidth="8" />
          <rect x="300" y="132" width="600" height="13" stroke="none" />
          <path d="M500 38 L898 136 M500 38 L302 136 M500 38 L700 134" fill="none" strokeWidth="2" />
          <rect x="690" y="145" width="30" height="22" stroke="none" />
          <path d="M770 145 V286 M782 145 V286" fill="none" strokeWidth="1.6" />
          <rect x="734" y="286" width="84" height="6" stroke="none" />
        </g>
        <rect x="690" y="150" width="30" height="7" fill="#ffd166" opacity="0.5" />
        <rect x="738" y="292" width="76" height="28" fill="#2d1a1c" />
        <rect x="738" y="292" width="76" height="28" fill="url(#np-costillas)" />
        <circle cx="500" cy="34" r="3.6" fill="#ff4d3d" className={s.balizaB} />

        {/* Faroles de sodio */}
        {FAROLES.map((x) => (
          <g key={x}>
            <circle cx={x} cy="258" r="70" fill="url(#np-farol)" className={s.halo} />
            <rect x={x - 2} y="258" width="4" height="134" fill="#060b10" />
            <rect x={x - 9} y="253" width="18" height="5" fill="#060b10" />
            <rect x={x - 6} y="258" width="12" height="3" fill="#ffc48a" />
          </g>
        ))}

        {/* Muelle */}
        <rect x="0" y="392" width="900" height="28" fill="#060b10" />
        <rect x="0" y="392" width="900" height="1.5" fill="#ff9a55" opacity="0.3" />
        {[60, 300, 520, 760].map((x) => (
          <rect key={x} x={x} y="384" width="10" height="8" rx="2" fill="#060b10" />
        ))}
      </svg>

      <svg className={s.faro} viewBox="0 0 400 560" focusable="false">
        <defs>
          <linearGradient id="np-haz-izq" gradientUnits="userSpaceOnUse" x1="220" y1="0" x2="-1800" y2="0">
            <stop offset="0" stopColor="#ffd166" stopOpacity="0.55" />
            <stop offset="0.22" stopColor="#ffd166" stopOpacity="0.18" />
            <stop offset="1" stopColor="#ffd166" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="np-haz-der" gradientUnits="userSpaceOnUse" x1="220" y1="0" x2="1400" y2="0">
            <stop offset="0" stopColor="#ffd166" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffd166" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="np-halo">
            <stop offset="0" stopColor="#fff3cf" stopOpacity="1" />
            <stop offset="0.2" stopColor="#ffd166" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd166" stopOpacity="0" />
          </radialGradient>
        </defs>

        <g className={s.haz}>
          <path d="M220 222 L-1800 60 L-1800 400 Z" fill="url(#np-haz-izq)" />
          <path d="M220 222 L1400 90 L1400 360 Z" fill="url(#np-haz-der)" />
        </g>
        <circle cx="220" cy="222" r="90" fill="url(#np-halo)" className={s.destello} />

        <path d="M196 205 L220 178 L244 205 Z" fill="#070d13" />
        <rect x="218.5" y="166" width="3" height="14" fill="#070d13" />
        <rect x="203" y="205" width="34" height="34" fill="#ffe29a" />
        <path d="M203 205 h34 v34 h-34z M214 205 v34 M226 205 v34" fill="none" stroke="#070d13" strokeWidth="2.5" />
        <rect x="186" y="239" width="68" height="9" fill="#070d13" />
        <path d="M194 248 L246 248 L258 472 L182 472 Z" fill="#101a23" />
        <path d="M191.9 300 H248.1 L249.8 334 H190.2 Z" fill="#3a1d22" />
        <path d="M188.8 384 H251.2 L253 418 H187 Z" fill="#3a1d22" />
        <path d="M194 248 L208 248 L200 472 L182 472 Z" fill="#000" opacity="0.28" />
        <rect x="213" y="440" width="14" height="32" fill="#ff9a55" opacity="0.55" />
        <path
          d="M0 560 L0 520 Q40 492 92 488 L150 470 Q200 462 280 470 L330 486 Q370 494 400 512 L400 560 Z"
          fill="#060b10"
        />
      </svg>

      <div className={s.agua}>
        <span className={`${s.reflejo} ${s.reflejoSodio}`} />
        <span className={`${s.reflejo} ${s.reflejoSodio2}`} />
        <span className={`${s.reflejo} ${s.reflejoFaro}`} />
      </div>

      <div className={s.nieblaFrente}>
        <span />
        <span />
      </div>
    </div>
  );
}
