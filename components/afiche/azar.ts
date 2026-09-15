/**
 * Azar determinista para los afiches: la misma película produce siempre el mismo
 * dibujo (en el servidor, en el cliente y en cada build). Nada de Math.random().
 */

/** Hash FNV-1a de 32 bits: convierte el id de la película en una semilla. */
export function hashTexto(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface Azar {
  /** Número en [0, 1). */
  sig(): number;
  /** Número en [a, b). */
  rango(a: number, b: number): number;
  /** Entero en [a, b] (ambos incluidos). */
  entero(a: number, b: number): number;
  /** true con probabilidad p. */
  moneda(p?: number): boolean;
  elegir<T>(opciones: readonly T[]): T;
}

/** PRNG mulberry32: rápido, pequeño y suficiente para decidir formas. */
export function crearAzar(semilla: string | number): Azar {
  let a = typeof semilla === "string" ? hashTexto(semilla) : semilla >>> 0;
  const sig = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    sig,
    rango: (x, y) => x + (y - x) * sig(),
    entero: (x, y) => Math.floor(x + (y - x + 1) * sig()),
    moneda: (p = 0.5) => sig() < p,
    elegir: (opciones) => opciones[Math.floor(sig() * opciones.length)],
  };
}

/** Redondea a 1 decimal para que el SVG sea corto y estable. */
export function r1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Arma un atributo `d` a partir de puntos. */
export function polilinea(puntos: readonly (readonly [number, number])[], cerrar = false): string {
  const d = puntos.map(([x, y], i) => `${i === 0 ? "M" : "L"}${r1(x)} ${r1(y)}`).join("");
  return cerrar ? d + "Z" : d;
}

/**
 * Línea suave (Catmull-Rom convertida a curvas Bézier) que pasa por los puntos.
 * Útil para cerros, olas y curvas de nivel.
 */
export function curvaSuave(puntos: readonly (readonly [number, number])[]): string {
  if (puntos.length < 2) return "";
  let d = `M${r1(puntos[0][0])} ${r1(puntos[0][1])}`;
  for (let i = 0; i < puntos.length - 1; i++) {
    const p0 = puntos[i - 1] ?? puntos[i];
    const p1 = puntos[i];
    const p2 = puntos[i + 1];
    const p3 = puntos[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d;
}

/** Curva cerrada suave (Catmull-Rom periódica) que pasa por los puntos. */
export function curvaCerrada(puntos: readonly (readonly [number, number])[]): string {
  const n = puntos.length;
  if (n < 3) return "";
  let d = `M${r1(puntos[0][0])} ${r1(puntos[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = puntos[(i - 1 + n) % n];
    const p1 = puntos[i];
    const p2 = puntos[(i + 1) % n];
    const p3 = puntos[(i + 2) % n];
    d += `C${r1(p1[0] + (p2[0] - p0[0]) / 6)} ${r1(p1[1] + (p2[1] - p0[1]) / 6)} ${r1(p2[0] - (p3[0] - p1[0]) / 6)} ${r1(p2[1] - (p3[1] - p1[1]) / 6)} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return d + "Z";
}
