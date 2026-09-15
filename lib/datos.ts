import programa from "@/data/programa.json";

export type Sala = {
  id: string;
  nombre: string;
  direccion: string;
  capacidad: number;
  aireLibre: boolean;
  nota?: string;
};

export type Seccion = {
  id: string;
  nombre: string;
  descripcion: string;
};

export type Estreno = "mundial" | "latinoamericano" | "nacional";

export type Pelicula = {
  id: string;
  titulo: string;
  tituloOriginal?: string;
  direccion: string;
  pais: string;
  anio: number;
  duracionMin: number;
  seccion: string;
  clasificacion: string;
  estreno: Estreno;
  sinopsis: string;
};

export type Funcion = {
  id: string;
  peliculaId: string;
  salaId: string;
  inicio: string;
  conversatorioMin?: number;
  nota?: string;
  agotada?: boolean;
};

export type Festival = typeof programa.festival;

export const festival: Festival = programa.festival;
export const salas: Sala[] = programa.salas;
export const secciones: Seccion[] = programa.secciones;
export const peliculas: Pelicula[] = programa.peliculas as Pelicula[];
export const funciones: Funcion[] = programa.funciones as Funcion[];

const { descripcion: _descripcionTraslados, ...tablaTraslados } = programa.trasladosMin;
void _descripcionTraslados;
export const trasladosMin: Record<string, Record<string, number>> = tablaTraslados;

const salasMap = new Map(salas.map((s) => [s.id, s]));
const seccionesMap = new Map(secciones.map((s) => [s.id, s]));
const peliculasMap = new Map(peliculas.map((p) => [p.id, p]));
const funcionesMap = new Map(funciones.map((f) => [f.id, f]));

export function sala(id: string): Sala {
  const s = salasMap.get(id);
  if (!s) throw new Error(`Sala desconocida: ${id}`);
  return s;
}

export function seccion(id: string): Seccion {
  const s = seccionesMap.get(id);
  if (!s) throw new Error(`Seccion desconocida: ${id}`);
  return s;
}

export function pelicula(id: string): Pelicula | undefined {
  return peliculasMap.get(id);
}

export function funcion(id: string): Funcion | undefined {
  return funcionesMap.get(id);
}

export function funcionesDePelicula(peliculaId: string): Funcion[] {
  return funciones.filter((f) => f.peliculaId === peliculaId);
}

export function peliculasDeSeccion(seccionId: string): Pelicula[] {
  return peliculas.filter((p) => p.seccion === seccionId);
}

export function traslado(desde: string, hasta: string): number {
  return trasladosMin[desde]?.[hasta] ?? 0;
}

export const ETIQUETA_ESTRENO: Record<Estreno, string> = {
  mundial: "Estreno mundial",
  latinoamericano: "Estreno latinoamericano",
  nacional: "Estreno en Chile",
};

export const ETIQUETA_CLASIFICACION: Record<string, string> = {
  TE: "Todo espectador",
  "+14": "Mayores de 14",
  "+18": "Mayores de 18",
};

export function formatoCLP(n: number): string {
  return "$" + n.toLocaleString("es-CL");
}

export function precioFuncion(f: Funcion): string {
  const s = sala(f.salaId);
  const valor = s.aireLibre ? festival.entradas.aireLibre : festival.entradas.general;
  return valor === 0 ? "Gratis" : formatoCLP(valor);
}
