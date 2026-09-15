/**
 * Composición tipográfica del título dentro del SVG.
 *
 * SVG no parte líneas solo, así que estimamos el ancho de cada palabra con una tabla
 * de avances medida de Big Shoulders (peso 800, en milésimas de em / 10) y probamos
 * todas las formas de repartir las palabras en líneas. Nos quedamos con la que
 * permite el cuerpo de letra más grande sin salirse de la caja y sin dejar
 * artículos o preposiciones colgando al final de una línea.
 *
 * Cada línea se dibuja con `textLength` igual a su ancho estimado: si la fuente aún
 * no carga (o carga la de respaldo) el texto se ajusta a ese ancho y nunca se corta.
 */

// Avance por carácter en Big Shoulders 800, en centésimas de em.
const AVANCE_800: Record<string, number> = {
  A: 49, B: 49, C: 50, D: 50, E: 43, F: 42, G: 50, H: 51, I: 24, J: 47, K: 50, L: 40, M: 81,
  N: 60, O: 51, P: 49, Q: 51, R: 49, S: 49, T: 42, U: 51, V: 50, W: 83, X: 46, Y: 45, Z: 42,
  Á: 49, É: 43, Í: 24, Ó: 51, Ú: 51, Ñ: 60, Ü: 51,
  a: 48, b: 51, c: 47, d: 51, e: 47, f: 35, g: 51, h: 52, i: 24, j: 24, k: 46, l: 24, m: 77,
  n: 52, o: 49, p: 51, q: 51, r: 36, s: 45, t: 35, u: 51, v: 45, w: 76, x: 42, y: 46, z: 41,
  á: 48, é: 47, í: 24, ó: 49, ú: 51, ñ: 52, ü: 51,
  "0": 51, "1": 28, "2": 49, "3": 49, "4": 51, "5": 51, "6": 50, "7": 47, "8": 50, "9": 50,
  " ": 22, ":": 26, ",": 26, ".": 24, "-": 32, "'": 20,
};

/** Factor de ancho de otros pesos respecto de 800 (medido: 500 ≈ 0,89). */
function factorPeso(peso: number): number {
  if (peso >= 800) return 1;
  if (peso <= 500) return 0.89;
  return 0.89 + ((peso - 500) / 300) * 0.11;
}

/** Ancho estimado de un texto en em. */
export function anchoEm(texto: string, peso = 800, espaciado = 0): number {
  let total = 0;
  for (const ch of texto) total += (AVANCE_800[ch] ?? 50) + espaciado * 100;
  return (total / 100) * factorPeso(peso);
}

const CORTAS = new Set([
  "la", "el", "los", "las", "de", "del", "y", "e", "en", "a", "al", "un", "una", "o", "por", "con", "sin",
]);

export interface LineaTitulo {
  texto: string;
  /** Línea base (y). */
  y: number;
  /** Ancho estimado en unidades del viewBox. */
  ancho: number;
}

export interface BloqueTitulo {
  lineas: LineaTitulo[];
  tamano: number;
  /** y de la parte alta de las mayúsculas de la primera línea. */
  arriba: number;
}

export interface OpcionesTitulo {
  ancho: number;
  /** Alto máximo del bloque (de la altura de mayúsculas de la primera línea a la base de la última). */
  altoMax: number;
  /** Línea base de la última línea. */
  base: number;
  tamMax: number;
  interlinea?: number;
  peso?: number;
  mayusculas?: boolean;
  espaciado?: number;
  maxLineas?: number;
}

const ALTURA_MAYUSCULA = 0.74;

/** Reparte el título en líneas y calcula el cuerpo de letra. */
export function componerTitulo(titulo: string, o: OpcionesTitulo): BloqueTitulo {
  const interlinea = o.interlinea ?? 0.92;
  const peso = o.peso ?? 800;
  const espaciado = o.espaciado ?? 0;
  const maxLineas = o.maxLineas ?? 4;
  const texto = o.mayusculas ? titulo.toLocaleUpperCase("es-CL") : titulo;
  const palabras = texto.split(/\s+/).filter(Boolean);
  const n = palabras.length;

  let mejor: { lineas: string[]; tamano: number; puntaje: number } | null = null;
  const combinaciones = 1 << Math.max(0, n - 1);

  for (let m = 0; m < combinaciones; m++) {
    const lineas: string[] = [];
    let actual: string[] = [palabras[0]];
    for (let i = 1; i < n; i++) {
      if (m & (1 << (i - 1))) {
        lineas.push(actual.join(" "));
        actual = [palabras[i]];
      } else {
        actual.push(palabras[i]);
      }
    }
    lineas.push(actual.join(" "));
    if (lineas.length > maxLineas) continue;

    const k = lineas.length;
    const masAncha = Math.max(...lineas.map((l) => anchoEm(l, peso, espaciado)));
    const porAncho = o.ancho / masAncha;
    const porAlto = o.altoMax / (ALTURA_MAYUSCULA + (k - 1) * interlinea);
    const tamano = Math.min(o.tamMax, porAncho, porAlto);

    let colgantes = 0;
    lineas.forEach((l, i) => {
      if (i === k - 1) return;
      const ultima = l.split(" ").pop()!.toLocaleLowerCase("es-CL").replace(/[:,.]/g, "");
      if (CORTAS.has(ultima)) colgantes++;
    });
    // Una palabra corta sola en una línea también se ve mal ("LA / HORA...").
    const huerfanas = lineas.filter((l) => l.length <= 3 && k > 1).length;

    const puntaje = tamano * (1 - 0.05 * (k - 1)) - colgantes * tamano * 0.3 - huerfanas * tamano * 0.2;
    if (!mejor || puntaje > mejor.puntaje + 0.001) mejor = { lineas, tamano, puntaje };
  }

  const elegido = mejor ?? { lineas: [texto], tamano: o.tamMax };
  const t = elegido.tamano;
  const k = elegido.lineas.length;
  const lineas = elegido.lineas.map((l, i) => ({
    texto: l,
    y: o.base - (k - 1 - i) * t * interlinea,
    ancho: Math.min(o.ancho, anchoEm(l, peso, espaciado) * t),
  }));
  return { lineas, tamano: t, arriba: o.base - (k - 1) * t * interlinea - t * ALTURA_MAYUSCULA };
}

/** Separa "Cortos II: Noches de puerto" en antetítulo y título. */
export function separarAntetitulo(titulo: string): { antetitulo?: string; titulo: string } {
  const i = titulo.indexOf(": ");
  if (i > 0 && i < 16) return { antetitulo: titulo.slice(0, i), titulo: titulo.slice(i + 2) };
  return { titulo };
}
