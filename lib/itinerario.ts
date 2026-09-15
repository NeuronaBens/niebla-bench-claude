import { funcionPorId, salaPorId, traslado, type Funcion, type SalaId } from "./programa";

export type Aviso =
  | {
      tipo: "tope";
      a: Funcion;
      b: Funcion;
      /** Minutos que se pisan. */
      minutos: number;
    }
  | {
      tipo: "traslado";
      a: Funcion;
      b: Funcion;
      caminata: number;
      margen: number;
      /** Minutos que faltan para llegar a tiempo. */
      faltan: number;
    }
  | {
      tipo: "conversatorio";
      a: Funcion;
      b: Funcion;
      duracion: number;
      /** Minutos del conversatorio que alcanzaría a ver (0 = se lo pierde entero). */
      alcanza: number;
    }
  | {
      tipo: "lluvia";
      a: Funcion;
      b: Funcion;
      caminata: number;
      faltan: number;
    };

/** Relación entre dos funciones consecutivas de un recorrido. */
export type Tramo = {
  a: Funcion;
  b: Funcion;
  /** Minutos entre el fin de `a` y el inicio de `b` (negativo si se topan). */
  margen: number;
  caminata: number;
  /** Tiempo libre después de caminar (negativo si no alcanza). */
  holgura: number;
};

const SALA_LLUVIA: SalaId = "galpon";

function salaSiLlueve(f: Funcion): SalaId {
  return f.sala.aireLibre ? SALA_LLUVIA : f.salaId;
}

/** Normaliza una lista de ids: sólo ids válidos, sin repetir, en orden cronológico. */
export function normalizar(ids: readonly string[]): string[] {
  const vistos = new Set<string>();
  const out: Funcion[] = [];
  for (const id of ids) {
    const f = funcionPorId.get(id);
    if (f && !vistos.has(id)) {
      vistos.add(id);
      out.push(f);
    }
  }
  return out.sort((x, y) => x.ini - y.ini).map((f) => f.id);
}

export function funcionesDe(ids: readonly string[]): Funcion[] {
  return normalizar(ids).map((id) => funcionPorId.get(id)!);
}

/** Avisos entre un par de funciones, con `a` empezando antes o junto a `b`. */
function avisosPar(a: Funcion, b: Funcion): Aviso[] {
  if (b.ini < a.fin) {
    return [{ tipo: "tope", a, b, minutos: Math.min(a.fin, b.fin) - b.ini }];
  }
  const margen = b.ini - a.fin;
  const caminata = traslado(a.salaId, b.salaId);
  const out: Aviso[] = [];

  if (margen < caminata) {
    out.push({ tipo: "traslado", a, b, caminata, margen, faltan: caminata - margen });
  } else if (a.sala.aireLibre || b.sala.aireLibre) {
    const caminataLluvia = traslado(salaSiLlueve(a), salaSiLlueve(b));
    if (margen < caminataLluvia) {
      out.push({ tipo: "lluvia", a, b, caminata: caminataLluvia, faltan: caminataLluvia - margen });
    }
  }

  if (a.conversatorioMin) {
    const alcanza = Math.max(0, margen - caminata);
    if (alcanza < a.conversatorioMin) {
      out.push({ tipo: "conversatorio", a, b, duracion: a.conversatorioMin, alcanza });
    }
  }
  return out;
}

/**
 * Revisa todo el recorrido. Los topes se buscan entre todos los pares; los
 * traslados y conversatorios, entre cada función y la siguiente que no se le
 * cruza (que es a la que de verdad hay que llegar).
 */
export function analizar(lista: Funcion[]): Aviso[] {
  const fs = [...lista].sort((x, y) => x.ini - y.ini);
  const avisos: Aviso[] = [];
  for (let i = 0; i < fs.length; i++) {
    const a = fs[i];
    let siguienteLibre: Funcion | undefined;
    for (let j = i + 1; j < fs.length; j++) {
      const b = fs[j];
      if (b.ini < a.fin) {
        avisos.push(...avisosPar(a, b));
      } else if (!siguienteLibre) {
        siguienteLibre = b;
      }
    }
    if (siguienteLibre) {
      avisos.push(...avisosPar(a, siguienteLibre).filter((x) => x.tipo !== "tope"));
    }
  }
  return avisos;
}

export function tramos(lista: Funcion[]): Tramo[] {
  const fs = [...lista].sort((x, y) => x.ini - y.ini);
  const out: Tramo[] = [];
  for (let i = 0; i + 1 < fs.length; i++) {
    const a = fs[i];
    const b = fs[i + 1];
    const margen = b.ini - a.fin;
    const caminata = traslado(a.salaId, b.salaId);
    out.push({ a, b, margen, caminata, holgura: margen - caminata });
  }
  return out;
}

/** Avisos que aparecerían al sumar `f` a un recorrido. */
export function avisosAlAgregar(f: Funcion, ids: readonly string[]): Aviso[] {
  if (ids.includes(f.id)) return [];
  const actuales = funcionesDe(ids);
  const antes = new Set(analizar(actuales).map(claveAviso));
  return analizar([...actuales, f]).filter(
    (x) => (x.a.id === f.id || x.b.id === f.id) && !antes.has(claveAviso(x)),
  );
}

export function claveAviso(x: Aviso): string {
  return `${x.tipo}:${x.a.id}:${x.b.id}`;
}

export function esGrave(x: Aviso): boolean {
  return x.tipo === "tope" || x.tipo === "traslado";
}

export function nombreSalaCorto(id: SalaId): string {
  const s = salaPorId.get(id)!;
  return CORTOS[id] ?? s.nombre;
}

const CORTOS: Record<SalaId, string> = {
  teatro: "Teatro Municipal",
  muelle: "El Muelle",
  galpon: "Galpón 7",
  terraza: "Terraza Faro",
};

/* ------------------------- Compartir por link ------------------------- */

/** "f05","f22" -> "05.22" */
export function codificar(ids: readonly string[]): string {
  return normalizar(ids)
    .map((id) => id.replace(/^f/, ""))
    .join(".");
}

export function decodificar(texto: string | null | undefined): string[] {
  if (!texto) return [];
  const ids = texto
    .split(/[.,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => (t.startsWith("f") ? t : `f${t.padStart(2, "0")}`));
  return normalizar(ids);
}

export function limpiarNombre(nombre: string | null | undefined): string {
  return (nombre ?? "").replace(/\s+/g, " ").trim().slice(0, 32);
}
