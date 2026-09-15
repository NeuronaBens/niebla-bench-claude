/**
 * Filtros del programa: lectura y escritura en la URL (lógica pura, sin React).
 *
 * Formato de URL (compartible):
 *   /programa                                  -> tres días (o "hoy" si el festival está en curso)
 *   /programa?dia=sabado                       -> jueves | viernes | sabado | todos
 *   /programa?seccion=competencia,nocturna     -> una o varias secciones separadas por coma
 *   /programa?vista=grilla                     -> grilla por sala (solo se ve en escritorio)
 * También acepta `seccion` repetido (?seccion=a&seccion=b) y fechas en `dia` (2026-10-17).
 */
import {
  dias,
  diaPorSlug,
  secciones,
  slugDia,
  type Dia,
  type Funcion,
  type SeccionId,
} from "@/lib/programa";

export const TODOS = "todos";
/** Slug de día ("jueves" | "viernes" | "sabado") o "todos". */
export type DiaFiltro = string;
export type Vista = "lista" | "grilla";

export interface Filtros {
  /** null = sin elegir en la URL (se resuelve a "hoy" durante el festival o a "todos"). */
  dia: DiaFiltro | null;
  /** Vacío = todas las secciones. Siempre en el orden oficial de secciones. */
  secciones: SeccionId[];
  vista: Vista;
}

export const FILTROS_INICIALES: Filtros = { dia: null, secciones: [], vista: "lista" };

const IDS_SECCION = new Set<string>(secciones.map((s) => s.id));

/** Nombres cortos para los botones de filtro (el nombre completo se muestra en cada función). */
export const NOMBRE_CORTO_SECCION: Record<SeccionId, string> = {
  competencia: "Competencia",
  panorama: "Panorama",
  nocturna: "Bruma Nocturna",
  costa: "Hecho en la Costa",
};

interface LectorParams {
  get(nombre: string): string | null;
  getAll(nombre: string): string[];
}

export function leerFiltros(params: LectorParams): Filtros {
  const diaCrudo = params.get("dia")?.trim().toLowerCase() ?? null;
  let dia: DiaFiltro | null = null;
  if (diaCrudo === TODOS) dia = TODOS;
  else {
    const d = diaPorSlug(diaCrudo);
    if (d) dia = slugDia(d);
  }

  const pedidas = new Set(
    params
      .getAll("seccion")
      .flatMap((v) => v.split(/[,\s]+/))
      .map((v) => v.trim().toLowerCase())
      .filter((v) => IDS_SECCION.has(v)),
  );
  const elegidas = secciones.map((s) => s.id).filter((id) => pedidas.has(id));

  return {
    dia,
    secciones: elegidas,
    vista: params.get("vista") === "grilla" ? "grilla" : "lista",
  };
}

/** Query string sin "?" (vacía si todo está por defecto). Los valores son slugs seguros. */
export function escribirFiltros(f: Filtros): string {
  const partes: string[] = [];
  if (f.dia) partes.push(`dia=${f.dia}`);
  if (f.secciones.length) partes.push(`seccion=${f.secciones.join(",")}`);
  if (f.vista === "grilla") partes.push("vista=grilla");
  return partes.join("&");
}

/**
 * Día del festival que corresponde a "ahora". El día se corta a las 06:00 para que
 * a la 01:00 del sábado siga contando como la noche del viernes (hay funciones que terminan tarde).
 */
export function diaDeHoy(ahoraMin: number | null): Dia | undefined {
  if (ahoraMin === null) return undefined;
  const CORTE = 6 * 60;
  return dias.find((d) => ahoraMin >= d.indice * 1440 + CORTE && ahoraMin < (d.indice + 1) * 1440 + CORTE);
}

export function filtrarFunciones(lista: readonly Funcion[], diaSlug: DiaFiltro, seccionesElegidas: readonly SeccionId[]) {
  return lista.filter(
    (f) =>
      (diaSlug === TODOS || slugDia(f.dia) === diaSlug) &&
      (seccionesElegidas.length === 0 || seccionesElegidas.includes(f.seccion.id)),
  );
}

const CORTOS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

/** Nombre corto del día calendario en que termina una función que cruza la medianoche ("sáb", "dom"). */
export function cortoDiaFin(f: Funcion): string {
  const [a, m, d] = f.dia.fecha.split("-").map(Number);
  const extra = Math.floor(f.finMin / 1440) - f.dia.indice;
  return CORTOS[new Date(Date.UTC(a, m - 1, d + extra)).getUTCDay()];
}

/** Nombre corto del día siguiente a un día del festival (para la marca de medianoche). */
export function cortoDiaSiguiente(d: Dia): string {
  const [a, m, n] = d.fecha.split("-").map(Number);
  return CORTOS[new Date(Date.UTC(a, m - 1, n + 1)).getUTCDay()];
}
