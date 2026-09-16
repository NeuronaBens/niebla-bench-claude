import programa from "@/data/programa.json";
import { Programa, FuncionExpandida, SalaId, Pelicula, Funcion, Sala, Seccion } from "./tipos";
import { aMinutos, diaDe } from "./tiempo";

const p = programa as Programa;

export const festival = p.festival;
export const salas = p.salas;
export const secciones = p.secciones;
export const peliculas = p.peliculas;
export const funciones = p.funciones;

/**
 * Crea funciones expandidas con película, sala, sección, minutos, etc.
 */
export const funcionesExpandidas: FuncionExpandida[] = p.funciones
  .map((f) => {
    const pelicula = p.peliculas.find((pel) => pel.id === f.peliculaId)!;
    const sala = p.salas.find((s) => s.id === f.salaId)!;
    const seccion = p.secciones.find((sec) => sec.id === pelicula.seccion)!;

    const inicioMin = aMinutos(f.inicio);
    const finMin = inicioMin + pelicula.duracionMin;
    const finConversatorioMin = f.conversatorioMin ? finMin + f.conversatorioMin : finMin;

    return {
      id: f.id,
      pelicula,
      sala,
      seccion,
      inicioMin,
      finMin,
      finConversatorioMin,
      conversatorioMin: f.conversatorioMin,
      nota: f.nota,
      agotada: f.agotada,
      dia: diaDe(inicioMin),
    };
  })
  .sort((a, b) => a.inicioMin - b.inicioMin);

/**
 * Busca una película por id
 */
export function getPelicula(id: string): Pelicula | undefined {
  return p.peliculas.find((pel) => pel.id === id);
}

/**
 * Busca una función por id
 */
export function getFuncion(id: string): Funcion | undefined {
  return p.funciones.find((f) => f.id === id);
}

/**
 * Obtiene todas las funciones de una película
 */
export function funcionesDePelicula(peliculaId: string): FuncionExpandida[] {
  return funcionesExpandidas.filter((f) => f.pelicula.id === peliculaId);
}

/**
 * Busca una sala por id
 */
export function getSala(id: SalaId): Sala | undefined {
  return p.salas.find((s) => s.id === id);
}

/**
 * Busca una sección por id
 */
export function getSeccion(id: string): Seccion | undefined {
  return p.secciones.find((sec) => sec.id === id);
}

/**
 * Retorna los minutos de traslado entre dos salas
 */
export function traslado(a: SalaId, b: SalaId): number {
  return p.trasladosMin[a]?.[b] ?? 0;
}

/**
 * Busca una función expandida por id
 */
export function getFuncionExpandida(id: string): FuncionExpandida | undefined {
  return funcionesExpandidas.find((f) => f.id === id);
}

const NOMBRES_CORTOS: Record<SalaId, string> = {
  teatro: "Teatro Municipal",
  muelle: "El Muelle",
  galpon: "Galpón 7",
  terraza: "Terraza Faro",
};

/**
 * Nombre corto de una sala para tarjetas y encabezados
 */
export function nombreCorto(sala: Sala): string {
  return NOMBRES_CORTOS[sala.id] ?? sala.nombre;
}
