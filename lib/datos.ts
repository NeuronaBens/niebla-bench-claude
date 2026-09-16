import programa from '@/data/programa.json';
import { Festival, Sala, Seccion, Pelicula, Funcion, FuncionEnriquecida, Programa, DiaFestival } from '@/types/festival';
import {
  parseInicio,
  minutosAbsolutos,
  obtenerFechaDeMinutos,
  cruzaMedianoche as calcularCruzaMedianoche,
  obtenerDiaIndice,
  obtenerDiasFestival,
} from './tiempo';

const p = programa as unknown as Programa;

export function getFestival(): Festival {
  return p.festival;
}

export function getSalas(): Sala[] {
  return p.salas;
}

export function getSala(id: string): Sala | undefined {
  return p.salas.find(s => s.id === id);
}

export function getSecciones(): Seccion[] {
  return p.secciones;
}

export function getSeccion(id: string): Seccion | undefined {
  return p.secciones.find(s => s.id === id);
}

export function getPeliculas(): Pelicula[] {
  return p.peliculas;
}

export function getPelicula(id: string): Pelicula | undefined {
  return p.peliculas.find(p => p.id === id);
}

export function getFunciones(): FuncionEnriquecida[] {
  return p.funciones.map(f => enriquecerFuncion(f));
}

export function getFuncion(id: string): FuncionEnriquecida | undefined {
  const f = p.funciones.find(fn => fn.id === id);
  return f ? enriquecerFuncion(f) : undefined;
}

export function getFuncionesDeDia(diaIndice: number): FuncionEnriquecida[] {
  const dias = getDiasFestival();
  if (!dias[diaIndice]) return [];
  const fecha = dias[diaIndice].fecha;

  return getFunciones()
    .filter(f => f.sala.id !== undefined && obtenerFechaDeMinutos(f.inicioMin).dia === parseInt(fecha.split('-')[2]))
    .sort((a, b) => a.inicioMin - b.inicioMin || (a.sala.nombre.localeCompare(b.sala.nombre)));
}

export function getFuncionesDePelicula(peliculaId: string): FuncionEnriquecida[] {
  return getFunciones()
    .filter(f => f.pelicula.id === peliculaId)
    .sort((a, b) => a.inicioMin - b.inicioMin);
}

export function getDiasFestival(): DiaFestival[] {
  return obtenerDiasFestival(p.festival.fechaInicio, p.festival.fechaFin);
}

function enriquecerFuncion(f: Funcion): FuncionEnriquecida {
  const pelicula = getPelicula(f.peliculaId)!;
  const sala = getSala(f.salaId)!;
  const inicioPartes = parseInicio(f.inicio);
  const inicioMin = minutosAbsolutos(inicioPartes);
  const finMin = inicioMin + pelicula.duracionMin;
  const finConConversatorioMin = finMin + (f.conversatorioMin ?? 0);
  const cruzaMedianoche = calcularCruzaMedianoche(inicioMin, finMin);
  const diaIndice = obtenerDiaIndice(f.inicio, p.festival.fechaInicio);

  return {
    ...f,
    pelicula,
    sala,
    inicioMin,
    finMin,
    finConConversatorioMin,
    cruzaMedianoche,
    diaIndice,
  };
}

export function getTrasladoMinutos(salaAId: string, salaBId: string): number {
  const trasladosMin = p.trasladosMin as Record<string, Record<string, number>>;
  return trasladosMin[salaAId]?.[salaBId] ?? 0;
}
