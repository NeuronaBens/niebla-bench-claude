// Hash determinista y generador pseudoaleatorio con semilla.
// Prohibido `Math.random` para todo lo que deba verse igual en servidor y cliente
// (los afiches generados por código: ver components/afiche/AfichePelicula.tsx).

/** Hash FNV-1a de 32 bits sobre un texto. Determinista y estable entre ejecuciones. */
export function hashFnv1a(texto: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < texto.length; i++) {
    hash ^= texto.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

/** Generador mulberry32: a partir de una semilla entera, produce una función que da números en [0, 1). */
export function crearGenerador(semilla: number): () => number {
  let a = semilla >>> 0
  return function siguiente() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Número aleatorio determinista entre `min` y `max` (incluye ambos extremos), redondeado a `decimales`. */
export function entre(generador: () => number, min: number, max: number, decimales = 2): number {
  const valor = min + generador() * (max - min)
  const factor = 10 ** decimales
  return Math.round(valor * factor) / factor
}

/** Entero aleatorio determinista entre `min` y `max`, ambos incluidos. */
export function entreEntero(generador: () => number, min: number, max: number): number {
  return Math.floor(min + generador() * (max - min + 1))
}
