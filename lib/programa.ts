import datos from "@/data/programa.json";

export type SalaId = "teatro" | "muelle" | "galpon" | "terraza";
export type SeccionId = "competencia" | "panorama" | "nocturna" | "costa";

export type Sala = {
  id: SalaId;
  nombre: string;
  direccion: string;
  capacidad: number;
  aireLibre: boolean;
  nota?: string;
};

export type Seccion = {
  id: SeccionId;
  nombre: string;
  descripcion: string;
};

export type Pelicula = {
  id: string;
  titulo: string;
  tituloOriginal?: string;
  direccion: string;
  pais: string;
  anio: number;
  duracionMin: number;
  seccion: SeccionId;
  clasificacion: string;
  estreno: string;
  sinopsis: string;
};

export type FuncionDato = {
  id: string;
  peliculaId: string;
  salaId: SalaId;
  inicio: string;
  conversatorioMin?: number;
  agotada?: boolean;
  nota?: string;
};

/** Función con todo lo derivado que la interfaz necesita. */
export type Funcion = FuncionDato & {
  pelicula: Pelicula;
  sala: Sala;
  seccion: Seccion;
  /** Día del festival (fecha de inicio, AAAA-MM-DD). */
  dia: string;
  /** Minutos "de reloj" desde una época fija; sólo sirven para comparar. */
  ini: number;
  fin: number;
};

type Datos = {
  festival: {
    nombre: string;
    edicion: number;
    ciudad: string;
    region: string;
    fechaInicio: string;
    fechaFin: string;
    zonaHoraria: string;
    entradas: { moneda: string; general: number; aireLibre: number; venta: string };
    contacto: { correo: string; instagram: string };
  };
  salas: Sala[];
  trasladosMin: Record<string, unknown>;
  secciones: Seccion[];
  peliculas: Pelicula[];
  funciones: FuncionDato[];
};

const d = datos as unknown as Datos;

export const festival = d.festival;
export const salas = d.salas;
export const secciones = d.secciones;
export const peliculas = d.peliculas;

export const salaPorId = new Map(salas.map((s) => [s.id, s]));
export const seccionPorId = new Map(secciones.map((s) => [s.id, s]));
export const peliculaPorId = new Map(peliculas.map((p) => [p.id, p]));

/** Minutos caminando entre dos salas. */
export function traslado(a: SalaId, b: SalaId): number {
  const fila = d.trasladosMin[a] as Record<string, number> | undefined;
  return fila?.[b] ?? 0;
}

/** "2026-10-15T16:00" (hora de Chile) a minutos de reloj comparables. */
export function aMinutos(fechaHora: string): number {
  const [fecha, hora = "00:00"] = fechaHora.split("T");
  const [y, m, dd] = fecha.split("-").map(Number);
  const [hh, mm] = hora.split(":").map(Number);
  return Date.UTC(y, m - 1, dd, hh, mm) / 60000;
}

export const funciones: Funcion[] = d.funciones
  .map((f) => {
    const pelicula = peliculaPorId.get(f.peliculaId)!;
    const ini = aMinutos(f.inicio);
    return {
      ...f,
      pelicula,
      sala: salaPorId.get(f.salaId)!,
      seccion: seccionPorId.get(pelicula.seccion)!,
      dia: f.inicio.slice(0, 10),
      ini,
      fin: ini + pelicula.duracionMin,
    };
  })
  .sort((a, b) => a.ini - b.ini || a.sala.nombre.localeCompare(b.sala.nombre));

export const funcionPorId = new Map(funciones.map((f) => [f.id, f]));

export function funcionesDePelicula(peliculaId: string): Funcion[] {
  return funciones.filter((f) => f.peliculaId === peliculaId);
}

/** Días del festival, de fechaInicio a fechaFin. */
export const dias: string[] = (() => {
  const out: string[] = [];
  let t = aMinutos(festival.fechaInicio);
  const fin = aMinutos(festival.fechaFin);
  while (t <= fin) {
    out.push(new Date(t * 60000).toISOString().slice(0, 10));
    t += 24 * 60;
  }
  return out;
})();

/** Nombres cortos para chips y espacios chicos. */
export const SECCION_CORTA: Record<SeccionId, string> = {
  competencia: "Competencia",
  panorama: "Panorama",
  nocturna: "Bruma Nocturna",
  costa: "Hecho en la Costa",
};

export const CLASIFICACION: Record<string, string> = {
  TE: "Todo espectador",
  "+14": "Mayores de 14",
  "+18": "Mayores de 18",
};

export function textoEstreno(estreno: string): string {
  return `Estreno ${estreno}`;
}

export function precio(f: Funcion): string {
  const valor = f.sala.aireLibre ? festival.entradas.aireLibre : festival.entradas.general;
  return valor === 0 ? "Gratis" : `$${valor.toLocaleString("es-CL")}`;
}
