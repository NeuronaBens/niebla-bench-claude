/**
 * Capa de datos del festival. Lee `data/programa.json` tal cual (sin modificarlo)
 * y expone tipos, índices y funciones ya "enriquecidas" con tiempos calculados.
 *
 * Horas: el JSON trae horas locales de Chile (America/Santiago) sin zona.
 * Nunca las pasamos por `new Date(...)` (se interpretarían en la zona del navegador
 * o del servidor y podrían cambiar entre SSR y cliente). En su lugar las convertimos
 * a "minutos absolutos" contados desde las 00:00 del primer día del festival.
 * Así restar, comparar y cruzar la medianoche es aritmética simple.
 */
import datos from "@/data/programa.json";

export type SalaId = "teatro" | "muelle" | "galpon" | "terraza";
export type SeccionId = "competencia" | "panorama" | "nocturna" | "costa";

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

export interface Sala {
  id: SalaId;
  nombre: string;
  direccion: string;
  capacidad: number;
  aireLibre: boolean;
  nota?: string;
}

export interface Seccion {
  id: SeccionId;
  nombre: string;
  descripcion: string;
}

export interface Pelicula {
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
}

export interface FuncionCruda {
  id: string;
  peliculaId: string;
  salaId: SalaId;
  inicio: string; // "2026-10-15T16:00" hora local de Chile
  conversatorioMin?: number;
  nota?: string;
  agotada?: boolean;
}

export interface Dia {
  /** "2026-10-15" */
  fecha: string;
  /** Índice 0..n-1 dentro del festival */
  indice: number;
  /** "jueves" */
  nombre: string;
  /** "jue" */
  corto: string;
  /** 15 */
  numero: number;
  /** "octubre" */
  mes: string;
  /** "jueves 15 de octubre" */
  largo: string;
}

export interface Funcion extends FuncionCruda {
  pelicula: Pelicula;
  sala: Sala;
  seccion: Seccion;
  /** Día del festival al que pertenece (el día en que EMPIEZA, aunque termine pasada la medianoche). */
  dia: Dia;
  /** Minutos absolutos desde las 00:00 del primer día del festival. */
  inicioMin: number;
  /** inicioMin + duración de la película. */
  finMin: number;
  /** finMin + conversatorioMin (igual a finMin si no hay conversatorio). */
  finConversatorioMin: number;
  /** "16:00" */
  horaInicio: string;
  /** "01:15" */
  horaFin: string;
  /** true si la película termina después de la medianoche (otro día calendario). */
  terminaDiaSiguiente: boolean;
  /** Precio en CLP (0 = entrada liberada). */
  precio: number;
}

export const festival = datos.festival as Festival;
export const salas = datos.salas as Sala[];
export const secciones = datos.secciones as Seccion[];
export const peliculas = datos.peliculas as Pelicula[];
const funcionesCrudas = datos.funciones as FuncionCruda[];

const trasladosCrudos = datos.trasladosMin as unknown as Record<string, Record<string, number> | string>;

const MIN_DIA = 24 * 60;
const NOMBRES_DIA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const CORTOS_DIA = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Días transcurridos desde 1970-01-01 para una fecha "YYYY-MM-DD" (calendario puro, sin zona). */
function diasDesdeEpoch(fecha: string): number {
  const [a, m, d] = fecha.split("-").map(Number);
  return Math.floor(Date.UTC(a, m - 1, d) / 86400000);
}

function fechaDesdeDias(dias: number): string {
  const f = new Date(dias * 86400000);
  const a = f.getUTCFullYear();
  const m = String(f.getUTCMonth() + 1).padStart(2, "0");
  const d = String(f.getUTCDate()).padStart(2, "0");
  return `${a}-${m}-${d}`;
}

const DIA_BASE = diasDesdeEpoch(festival.fechaInicio);

function crearDia(fecha: string): Dia {
  const dias = diasDesdeEpoch(fecha);
  const f = new Date(dias * 86400000);
  const semana = f.getUTCDay();
  const numero = f.getUTCDate();
  const mes = MESES[f.getUTCMonth()];
  return {
    fecha,
    indice: dias - DIA_BASE,
    nombre: NOMBRES_DIA[semana],
    corto: CORTOS_DIA[semana],
    numero,
    mes,
    largo: `${NOMBRES_DIA[semana]} ${numero} de ${mes}`,
  };
}

/** Los días del festival, de fechaInicio a fechaFin. */
export const dias: Dia[] = (() => {
  const out: Dia[] = [];
  for (let d = DIA_BASE; d <= diasDesdeEpoch(festival.fechaFin); d++) out.push(crearDia(fechaDesdeDias(d)));
  return out;
})();

/** Convierte "2026-10-15T16:00" a minutos absolutos desde el inicio del festival. */
export function aMinutos(fechaHora: string): number {
  const [fecha, hora] = fechaHora.split("T");
  const [h, m] = hora.split(":").map(Number);
  return (diasDesdeEpoch(fecha) - DIA_BASE) * MIN_DIA + h * 60 + m;
}

/** Minutos absolutos -> "HH:MM" (hora del reloj, sin día). */
export function formatoHora(minutos: number): string {
  const enDia = ((minutos % MIN_DIA) + MIN_DIA) % MIN_DIA;
  const h = Math.floor(enDia / 60);
  const m = enDia % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Minutos absolutos -> índice de día calendario (0 = primer día del festival). */
export function indiceDiaCalendario(minutos: number): number {
  return Math.floor(minutos / MIN_DIA);
}

/** Duración legible: 98 -> "1 h 38 min", 60 -> "1 h", 45 -> "45 min". */
export function formatoDuracion(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/** 4000 -> "$4.000"; 0 -> "Entrada liberada". */
export function formatoPrecio(clp: number): string {
  if (clp === 0) return "Entrada liberada";
  return "$" + String(clp).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

const ESTRENOS: Record<string, string> = {
  mundial: "Estreno mundial",
  latinoamericano: "Estreno latinoamericano",
  nacional: "Estreno nacional",
};
export function formatoEstreno(estreno: string): string {
  return ESTRENOS[estreno] ?? `Estreno ${estreno}`;
}

const CLASIFICACIONES: Record<string, string> = {
  TE: "Todo espectador",
  "+7": "Mayores de 7 años",
  "+14": "Mayores de 14 años",
  "+18": "Mayores de 18 años",
};
export function formatoClasificacion(c: string): string {
  return CLASIFICACIONES[c] ?? c;
}

/** Minutos caminando entre dos salas (simétrico, 0 si es la misma). */
export function traslado(desde: SalaId, hasta: SalaId): number {
  if (desde === hasta) return 0;
  const fila = trasladosCrudos[desde];
  if (fila && typeof fila === "object" && typeof fila[hasta] === "number") return fila[hasta];
  const inversa = trasladosCrudos[hasta];
  if (inversa && typeof inversa === "object" && typeof inversa[desde] === "number") return inversa[desde];
  return 0;
}

// Índices
export const salaPorId = new Map<SalaId, Sala>(salas.map((s) => [s.id, s]));
export const seccionPorId = new Map<SeccionId, Seccion>(secciones.map((s) => [s.id, s]));
export const peliculaPorId = new Map<string, Pelicula>(peliculas.map((p) => [p.id, p]));
const diaPorFecha = new Map<string, Dia>(dias.map((d) => [d.fecha, d]));

function enriquecer(f: FuncionCruda): Funcion {
  const pelicula = peliculaPorId.get(f.peliculaId);
  const sala = salaPorId.get(f.salaId);
  if (!pelicula || !sala) throw new Error(`Función ${f.id} con película o sala inexistente`);
  const seccion = seccionPorId.get(pelicula.seccion);
  if (!seccion) throw new Error(`Película ${pelicula.id} con sección inexistente`);
  const fecha = f.inicio.split("T")[0];
  const dia = diaPorFecha.get(fecha) ?? crearDia(fecha);
  const inicioMin = aMinutos(f.inicio);
  const finMin = inicioMin + pelicula.duracionMin;
  return {
    ...f,
    pelicula,
    sala,
    seccion,
    dia,
    inicioMin,
    finMin,
    finConversatorioMin: finMin + (f.conversatorioMin ?? 0),
    horaInicio: formatoHora(inicioMin),
    horaFin: formatoHora(finMin),
    terminaDiaSiguiente: indiceDiaCalendario(finMin) > indiceDiaCalendario(inicioMin),
    precio: sala.aireLibre ? festival.entradas.aireLibre : festival.entradas.general,
  };
}

/** Todas las funciones, ordenadas por hora de inicio (y por sala como desempate). */
export const funciones: Funcion[] = funcionesCrudas
  .map(enriquecer)
  .sort((a, b) => a.inicioMin - b.inicioMin || a.salaId.localeCompare(b.salaId));

export const funcionPorId = new Map<string, Funcion>(funciones.map((f) => [f.id, f]));

export function funcionesDePelicula(peliculaId: string): Funcion[] {
  return funciones.filter((f) => f.peliculaId === peliculaId);
}

export function funcionesDelDia(fecha: string): Funcion[] {
  return funciones.filter((f) => f.dia.fecha === fecha);
}

export function peliculasDeSeccion(seccionId: SeccionId): Pelicula[] {
  return peliculas.filter((p) => p.seccion === seccionId);
}

/** Texto de fin de función: "termina 01:15 del sábado" si cruza la medianoche, si no "termina 17:38". */
export function textoFin(f: Funcion): string {
  if (!f.terminaDiaSiguiente) return `termina ${f.horaFin}`;
  const siguiente = crearDia(fechaDesdeDias(DIA_BASE + indiceDiaCalendario(f.finMin)));
  return `termina ${f.horaFin} del ${siguiente.nombre}`;
}

/**
 * Hora actual en Chile expresada en minutos absolutos del festival (puede ser negativa
 * antes del festival). Solo usar en el cliente (después de montar) para evitar
 * diferencias de hidratación.
 */
export function ahoraEnMinutosFestival(ahora: Date = new Date()): number {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: festival.zonaHoraria,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(ahora);
  const v = (t: string) => partes.find((p) => p.type === t)?.value ?? "00";
  return aMinutos(`${v("year")}-${v("month")}-${v("day")}T${v("hour")}:${v("minute")}`);
}

/** Slug de día para URLs: "jueves" | "viernes" | "sabado" (sin tildes). */
export function slugDia(d: Dia): string {
  return d.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export function diaPorSlug(slug: string | null | undefined): Dia | undefined {
  if (!slug) return undefined;
  return dias.find((d) => slugDia(d) === slug || d.fecha === slug);
}
