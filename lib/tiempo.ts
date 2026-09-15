import { festival, pelicula, type Funcion } from "./datos";

const DIAS_SEMANA = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export type Dia = {
  fecha: string; // YYYY-MM-DD
  indice: number; // 0, 1, 2...
  nombre: string; // jueves
  nombreCorto: string; // jue
  numero: number; // 15
  etiqueta: string; // Jueves 15
  larga: string; // Jueves 15 de octubre
};

function fechaUTC(fecha: string): Date {
  return new Date(fecha + "T12:00:00Z");
}

function capitalizar(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function construirDias(): Dia[] {
  const inicio = fechaUTC(festival.fechaInicio);
  const fin = fechaUTC(festival.fechaFin);
  const lista: Dia[] = [];
  const d = new Date(inicio);
  let i = 0;
  while (d <= fin) {
    const nombre = DIAS_SEMANA[d.getUTCDay()];
    const numero = d.getUTCDate();
    lista.push({
      fecha: d.toISOString().slice(0, 10),
      indice: i,
      nombre,
      nombreCorto: nombre.slice(0, 3),
      numero,
      etiqueta: `${capitalizar(nombre)} ${numero}`,
      larga: `${capitalizar(nombre)} ${numero} de ${MESES[d.getUTCMonth()]}`,
    });
    d.setUTCDate(d.getUTCDate() + 1);
    i++;
  }
  return lista;
}

export const dias: Dia[] = construirDias();

export function diaPorFecha(fecha: string): Dia | undefined {
  return dias.find((d) => d.fecha === fecha);
}

/** Minutos desde las 00:00 del primer día del festival. */
export function minutosDesdeInicio(iso: string): number {
  const [fecha, hora] = iso.split("T");
  const dia = diaPorFecha(fecha);
  const indice = dia ? dia.indice : 0;
  const [h, m] = hora.split(":").map(Number);
  return indice * 1440 + h * 60 + m;
}

export function formatoHora(minutos: number): string {
  const enDia = ((minutos % 1440) + 1440) % 1440;
  const h = Math.floor(enDia / 60);
  const m = enDia % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatoDuracion(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function rangoFechas(): string {
  const primero = dias[0];
  const ultimo = dias[dias.length - 1];
  const mes = MESES[fechaUTC(primero.fecha).getUTCMonth()];
  const anio = fechaUTC(primero.fecha).getUTCFullYear();
  if (dias.length === 3) {
    return `${dias[0].numero}, ${dias[1].numero} y ${dias[2].numero} de ${mes} de ${anio}`;
  }
  return `${primero.numero} al ${ultimo.numero} de ${mes} de ${anio}`;
}

/** Función enriquecida con tiempos calculados. */
export type FuncionCalc = Funcion & {
  inicioMin: number;
  finMin: number; // fin de la película
  finConConversatorioMin: number;
  dia: Dia;
  horaInicio: string;
  horaFin: string;
  terminaAlDiaSiguiente: boolean;
};

export function calcularFuncion(f: Funcion): FuncionCalc {
  const p = pelicula(f.peliculaId);
  const duracion = p ? p.duracionMin : 0;
  const inicioMin = minutosDesdeInicio(f.inicio);
  const finMin = inicioMin + duracion;
  const fecha = f.inicio.slice(0, 10);
  const dia = diaPorFecha(fecha) ?? dias[0];
  return {
    ...f,
    inicioMin,
    finMin,
    finConConversatorioMin: finMin + (f.conversatorioMin ?? 0),
    dia,
    horaInicio: formatoHora(inicioMin),
    horaFin: formatoHora(finMin),
    terminaAlDiaSiguiente: Math.floor(finMin / 1440) > dia.indice,
  };
}

export function ordenarPorInicio<T extends { inicioMin: number }>(lista: T[]): T[] {
  return [...lista].sort((a, b) => a.inicioMin - b.inicioMin);
}
