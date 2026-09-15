import programa from "@/data/programa.json";

// ---------- Tipos ----------

export type DiaId = "2026-10-15" | "2026-10-16" | "2026-10-17";

export interface Dia {
  id: DiaId;
  nombre: "Jueves" | "Viernes" | "Sábado";
  corto: "Jue" | "Vie" | "Sáb";
  numero: number;
  etiqueta: string;
}

export interface Sala {
  id: string;
  nombre: string;
  direccion: string;
  capacidad: number;
  aireLibre: boolean;
  nota?: string;
  corto: string;
}

export interface Seccion {
  id: string;
  nombre: string;
  descripcion: string;
}

export type Clasificacion = "TE" | "+14" | "+18";
export type Estreno = "mundial" | "nacional" | "latinoamericano";

export interface Pelicula {
  id: string;
  titulo: string;
  tituloOriginal?: string;
  direccion: string;
  pais: string;
  anio: number;
  duracionMin: number;
  seccion: string;
  clasificacion: Clasificacion;
  estreno: Estreno;
  sinopsis: string;
}

export interface Funcion {
  id: string;
  peliculaId: string;
  salaId: string;
  inicio: string;
  conversatorioMin?: number;
  agotada?: boolean;
  nota?: string;
  pelicula: Pelicula;
  sala: Sala;
  seccion: Seccion;
  dia: DiaId;
  inicioMin: number;
  finMin: number;
  conversatorioFinMin?: number;
  horaInicio: string;
  horaFin: string;
  cruzaMedianoche: boolean;
}

export interface Festival {
  nombre: string;
  edicion: number;
  ciudad: string;
  region: string;
  fechaInicio: string;
  fechaFin: string;
  zonaHoraria: string;
  entradas: { moneda: string; general: number; aireLibre: number; venta: string };
  contacto: { correo: string; instagram: string };
}

// ---------- Días ----------

export const dias: Dia[] = [
  { id: "2026-10-15", nombre: "Jueves", corto: "Jue", numero: 15, etiqueta: "Jueves 15" },
  { id: "2026-10-16", nombre: "Viernes", corto: "Vie", numero: 16, etiqueta: "Viernes 16" },
  { id: "2026-10-17", nombre: "Sábado", corto: "Sáb", numero: 17, etiqueta: "Sábado 17" },
];

const DIA_BASE = 15; // 15 de octubre = día 0

const SALA_CORTA: Record<string, string> = {
  teatro: "Teatro",
  muelle: "El Muelle",
  galpon: "Galpón 7",
  terraza: "Terraza Faro",
};

// ---------- Datos base ----------

export const festival: Festival = programa.festival;

export const salas: Sala[] = programa.salas.map((s) => ({
  ...s,
  corto: SALA_CORTA[s.id] ?? s.nombre,
}));

export const secciones: Seccion[] = programa.secciones;

export const peliculas: Pelicula[] = programa.peliculas as Pelicula[];

const salasPorId = new Map(salas.map((s) => [s.id, s]));
const seccionesPorId = new Map(secciones.map((s) => [s.id, s]));
const peliculasPorId = new Map(peliculas.map((p) => [p.id, p]));

/** "2026-10-15T19:30" -> minutos desde el 15 de octubre a las 00:00 (sin Date, sin zonas horarias). */
function minutosDesdeInicio(iso: string): { dia: DiaId; minutos: number } {
  const [fecha, hora] = iso.split("T");
  const [, , d] = fecha.split("-").map(Number);
  const [h, m] = hora.split(":").map(Number);
  const diaIndice = d - DIA_BASE;
  return { dia: fecha as DiaId, minutos: diaIndice * 1440 + h * 60 + m };
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Minutos absolutos -> "HH:MM" (módulo 24 h). */
export function horaDesdeMinutos(min: number): string {
  const enDia = ((min % 1440) + 1440) % 1440;
  return `${pad(Math.floor(enDia / 60))}:${pad(enDia % 60)}`;
}

function completarFuncion(f: (typeof programa.funciones)[number]): Funcion {
  const pelicula = peliculasPorId.get(f.peliculaId);
  const sala = salasPorId.get(f.salaId);
  if (!pelicula || !sala) {
    throw new Error(`Función ${f.id}: película o sala desconocida`);
  }
  const seccion = seccionesPorId.get(pelicula.seccion);
  if (!seccion) {
    throw new Error(`Película ${pelicula.id}: sección desconocida`);
  }
  const { dia, minutos } = minutosDesdeInicio(f.inicio);
  const finMin = minutos + pelicula.duracionMin;
  const diaIndice = Math.floor(minutos / 1440);
  const cruzaMedianoche = Math.floor(finMin / 1440) > diaIndice;
  const conversatorioFinMin = f.conversatorioMin != null ? finMin + f.conversatorioMin : undefined;
  return {
    id: f.id,
    peliculaId: f.peliculaId,
    salaId: f.salaId,
    inicio: f.inicio,
    conversatorioMin: f.conversatorioMin,
    agotada: f.agotada,
    nota: f.nota,
    pelicula,
    sala,
    seccion,
    dia,
    inicioMin: minutos,
    finMin,
    conversatorioFinMin,
    horaInicio: horaDesdeMinutos(minutos),
    horaFin: horaDesdeMinutos(finMin),
    cruzaMedianoche,
  };
}

export const funciones: Funcion[] = programa.funciones
  .map(completarFuncion)
  .sort((a, b) => a.inicioMin - b.inicioMin || a.id.localeCompare(b.id));

const funcionesPorId = new Map(funciones.map((f) => [f.id, f]));

// ---------- Consultas ----------

export function getPelicula(id: string): Pelicula | undefined {
  return peliculasPorId.get(id);
}

export function getFuncion(id: string): Funcion | undefined {
  return funcionesPorId.get(id);
}

export function getSala(id: string): Sala | undefined {
  return salasPorId.get(id);
}

export function getSeccion(id: string): Seccion | undefined {
  return seccionesPorId.get(id);
}

export function getDia(id: string): Dia | undefined {
  return dias.find((d) => d.id === id);
}

export function funcionesDePelicula(peliculaId: string): Funcion[] {
  return funciones.filter((f) => f.peliculaId === peliculaId);
}

export function funcionesDelDia(dia: DiaId): Funcion[] {
  return funciones.filter((f) => f.dia === dia);
}

export function peliculasDeSeccion(seccionId: string): Pelicula[] {
  return peliculas.filter((p) => p.seccion === seccionId);
}

const traslados = programa.trasladosMin as unknown as Record<string, Record<string, number>>;

/** Minutos caminando entre dos salas. Misma sala = 0. */
export function traslado(salaA: string, salaB: string): number {
  if (salaA === salaB) return 0;
  const fila = traslados[salaA];
  const valor = fila && typeof fila === "object" ? fila[salaB] : undefined;
  return typeof valor === "number" ? valor : 0;
}

// ---------- Formato ----------

export function formatoDuracion(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function formatoCLP(n: number): string {
  if (n === 0) return "Gratis";
  const entero = Math.round(n).toString();
  const conPuntos = entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `$${conPuntos}`;
}

export function etiquetaEstreno(e: Estreno): string {
  switch (e) {
    case "mundial":
      return "Estreno mundial";
    case "nacional":
      return "Estreno en Chile";
    case "latinoamericano":
      return "Estreno latinoamericano";
  }
}

export function etiquetaClasificacion(c: Clasificacion): string {
  switch (c) {
    case "TE":
      return "Todo espectador";
    case "+14":
      return "Mayores de 14";
    case "+18":
      return "Mayores de 18";
  }
}

/** "Jueves 15 · 19:30" */
export function etiquetaFuncion(f: Funcion): string {
  const dia = getDia(f.dia);
  return `${dia?.etiqueta ?? f.dia} · ${f.horaInicio}`;
}
