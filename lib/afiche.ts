/**
 * Generador determinista de "afiches" para cada película.
 * No hay imágenes: cada película recibe un paisaje de capas, niebla y un astro,
 * derivados de su id y de la sección a la que pertenece.
 */

export type Paleta = {
  cieloArriba: string;
  cieloAbajo: string;
  capas: string[];
  astro: string;
  niebla: string;
  texto: string;
};

export const PALETAS: Record<string, Paleta> = {
  competencia: {
    cieloArriba: "#F7C98A",
    cieloAbajo: "#D9603A",
    capas: ["#B8452C", "#7E2A22", "#4E1A1B", "#2A1214"],
    astro: "#FFF1CF",
    niebla: "#FFE4C2",
    texto: "#FFF4E6",
  },
  panorama: {
    cieloArriba: "#CFE9EC",
    cieloAbajo: "#3B8A99",
    capas: ["#2E6E7E", "#214E62", "#173648", "#0D2230"],
    astro: "#F6F3E4",
    niebla: "#E4F2F3",
    texto: "#EEF7F8",
  },
  nocturna: {
    cieloArriba: "#4A2160",
    cieloAbajo: "#140B1F",
    capas: ["#63295E", "#411C48", "#27122F", "#120918"],
    astro: "#F3E4C4",
    niebla: "#B79ACB",
    texto: "#F5E9F5",
  },
  costa: {
    cieloArriba: "#E5EDD9",
    cieloAbajo: "#6EA88C",
    capas: ["#4C8A69", "#356650", "#22483A", "#122B23"],
    astro: "#FFF8DC",
    niebla: "#F0F5EA",
    texto: "#F2F8F0",
  },
};

export function hashCadena(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Generador pseudoaleatorio pequeño y determinista (mulberry32). */
export function crearAzar(semilla: number): () => number {
  let a = semilla;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Capa = { d: string; color: string; opacidad: number };

export type Afiche = {
  ancho: number;
  alto: number;
  paleta: Paleta;
  astro: { cx: number; cy: number; r: number; creciente: boolean };
  capas: Capa[];
  nieblas: { y: number; alto: number; opacidad: number }[];
  haz: { x: number; y: number; angulo: number } | null;
  estelas: { x1: number; y: number; x2: number }[];
};

function ondulacion(
  azar: () => number,
  ancho: number,
  base: number,
  amplitud: number,
  frecuencia: number,
  alto: number,
): string {
  const pasos = 24;
  const fase = azar() * Math.PI * 2;
  const fase2 = azar() * Math.PI * 2;
  const puntos: string[] = [];
  for (let i = 0; i <= pasos; i++) {
    const x = (ancho / pasos) * i;
    const t = (i / pasos) * Math.PI * 2;
    const y =
      base +
      Math.sin(t * frecuencia + fase) * amplitud +
      Math.sin(t * frecuencia * 2.3 + fase2) * (amplitud * 0.35);
    puntos.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M0,${alto} L${puntos.join(" L")} L${ancho},${alto} Z`;
}

export function generarAfiche(id: string, seccion: string): Afiche {
  const ancho = 300;
  const alto = 400;
  const paleta = PALETAS[seccion] ?? PALETAS.panorama;
  const azar = crearAzar(hashCadena(id));

  const cantidadCapas = 3 + Math.floor(azar() * 2); // 3 o 4
  const capas: Capa[] = [];
  const horizonte = 190 + azar() * 60;
  for (let i = 0; i < cantidadCapas; i++) {
    const base = horizonte + i * ((alto - horizonte) / (cantidadCapas + 0.6));
    const amplitud = seccion === "costa" ? 6 + azar() * 10 : 8 + azar() * 22;
    const frecuencia = seccion === "costa" ? 1.5 + azar() * 2 : 0.6 + azar() * 1.4;
    capas.push({
      d: ondulacion(azar, ancho, base, amplitud, frecuencia, alto),
      color: paleta.capas[Math.min(i, paleta.capas.length - 1)],
      opacidad: 1,
    });
  }

  const astro = {
    cx: 50 + azar() * 200,
    cy: 60 + azar() * (horizonte - 110),
    r: 22 + azar() * 30,
    creciente: seccion === "nocturna",
  };

  const nieblas = Array.from({ length: 2 + Math.floor(azar() * 2) }, () => ({
    y: horizonte - 30 + azar() * 140,
    alto: 30 + azar() * 50,
    opacidad: 0.25 + azar() * 0.3,
  }));

  const haz =
    seccion === "nocturna" || (seccion === "costa" && azar() > 0.5)
      ? { x: azar() > 0.5 ? 30 : 270, y: horizonte + 10, angulo: -20 + azar() * 40 }
      : null;

  const estelas = Array.from({ length: Math.floor(azar() * 4) }, () => {
    const x1 = azar() * 200;
    return { x1, y: horizonte + 20 + azar() * 120, x2: x1 + 30 + azar() * 70 };
  });

  return { ancho, alto, paleta, astro, capas, nieblas, haz, estelas };
}
