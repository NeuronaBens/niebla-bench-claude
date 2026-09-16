// FNV-1a hash de 32 bits
function fnv1aHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

// Generador pseudoaleatorio determinista (mulberry32)
function mulberry32(a: number) {
  return function() {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface ParametrosSello {
  hash: number;
  rand: () => number;
  anguloFondo: number;
  capasNiebla: number;
  posicionLuz: { x: number; y: number };
  numPuntitos: number;
  angulosOndas: number[];
  amplitudesOndas: number[];
}

export function generarParametrosSello(id: string, seccion: string, duracionMin: number, anio: number): ParametrosSello {
  const entrada = `${id}|${seccion}|${duracionMin}|${anio}`;
  const hash = fnv1aHash(entrada);
  const rng = mulberry32(hash);

  const anguloFondo = -20 + rng() * 40;
  const capasNiebla = 3 + Math.floor(rng() * 4);
  const posicionLuz = {
    x: 30 + rng() * 40,
    y: 10 + rng() * 25,
  };
  const numPuntitos = 4 + ((anio % 7) || 1);
  const angulosOndas = Array(capasNiebla).fill(0).map(() => rng() * 360);
  const amplitudesOndas = Array(capasNiebla).fill(0).map(() => 2 + rng() * 5);

  return {
    hash,
    rand: rng,
    anguloFondo,
    capasNiebla,
    posicionLuz,
    numPuntitos,
    angulosOndas,
    amplitudesOndas,
  };
}
