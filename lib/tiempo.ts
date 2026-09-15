import { aMinutos, festival } from "./programa";

const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function fecha(min: number) {
  return new Date(min * 60000);
}

/** "19:30" */
export function hora(min: number): string {
  const d = fecha(min);
  return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`;
}

/** Nombre del día de la semana para una fecha AAAA-MM-DD o minutos. */
export function diaSemana(x: string | number): string {
  const min = typeof x === "string" ? aMinutos(x) : x;
  return DIAS_SEMANA[fecha(min).getUTCDay()];
}

export function numeroDia(x: string | number): number {
  const min = typeof x === "string" ? aMinutos(x) : x;
  return fecha(min).getUTCDate();
}

export function mes(x: string | number): string {
  const min = typeof x === "string" ? aMinutos(x) : x;
  return MESES[fecha(min).getUTCMonth()];
}

export function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Jueves 15" */
export function etiquetaDia(dia: string): string {
  return `${capitalizar(diaSemana(dia))} ${numeroDia(dia)}`;
}

/** "Jue 15" */
export function etiquetaDiaCorta(dia: string): string {
  return `${capitalizar(diaSemana(dia).slice(0, 3))} ${numeroDia(dia)}`;
}

/** Hora de término, indicando si cae al día siguiente respecto de `dia`. */
export function horaFin(fin: number, dia: string): { hora: string; otroDia: boolean } {
  const otroDia = Math.floor(fin / 1440) !== Math.floor(aMinutos(dia) / 1440);
  return { hora: hora(fin), otroDia };
}

/** "1 h 38 min", "45 min" */
export function duracion(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

/**
 * Hora actual en Puerto Bruma como minutos de reloj comparables con los del
 * programa. Sólo debe llamarse en el navegador.
 */
export function ahoraEnChile(): number {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: festival.zonaHoraria,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const v = (t: string) => partes.find((p) => p.type === t)?.value ?? "00";
  return aMinutos(`${v("year")}-${v("month")}-${v("day")}T${v("hour")}:${v("minute")}`);
}
