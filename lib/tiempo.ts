/**
 * Tiempo sin Date: todo en minutos absolutos desde 2026-10-15 00:00
 * Evita problemas de zona horaria entre Node (build) y navegador
 */

const DIAS_INFO = [
  { index: 0, fecha: "2026-10-15", corto: "Jue 15", largo: "Jueves 15 de octubre" },
  { index: 1, fecha: "2026-10-16", corto: "Vie 16", largo: "Viernes 16 de octubre" },
  { index: 2, fecha: "2026-10-17", corto: "Sáb 17", largo: "Sábado 17 de octubre" },
];

export const DIAS = DIAS_INFO;

/**
 * Parsea "2026-10-15T18:30" a minutos desde 2026-10-15 00:00
 */
export function aMinutos(iso: string): number {
  const [fecha, hora] = iso.split("T");
  const day = Number(fecha.split("-")[2]);
  const [h, m] = hora.split(":").map(Number);

  const diaIndex = day - 15; // 15 → 0, 16 → 1, 17 → 2
  return diaIndex * 1440 + h * 60 + m;
}

/**
 * Devuelve el día del festival (0|1|2) en que EMPIEZA la función
 * Ej: función a las 23:45 del sábado → día 2
 */
export function diaDe(min: number): 0 | 1 | 2 {
  const dia = Math.floor(min / 1440);
  if (dia < 0) return 0;
  if (dia > 2) return 2;
  return dia as 0 | 1 | 2;
}

/**
 * Formatea minutos como "18:30"
 * Si `relativoADia` se especifica y el minuto cae en un día posterior,
 * devuelve "01:07 (+1)" o "13:45 (+2)"
 */
export function formatoHora(min: number, opts?: { relativoADia?: number }): string {
  const minutoDelDia = min % 1440;
  const h = Math.floor(minutoDelDia / 60);
  const m = minutoDelDia % 60;

  const hora = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

  if (opts?.relativoADia !== undefined) {
    const diaActual = diaDe(opts.relativoADia);
    const diaDelMinuto = diaDe(min);

    if (diaDelMinuto > diaActual) {
      const diasMas = diaDelMinuto - diaActual;
      return `${hora} (+${diasMas})`;
    }
  }

  return hora;
}

/**
 * Formatea duración en minutos: "1 h 38 min" o "72 min"
 */
export function formatoDuracion(min: number): string {
  const horas = Math.floor(min / 60);
  const minutos = min % 60;

  if (horas === 0) {
    return `${minutos} min`;
  }
  if (minutos === 0) {
    return `${horas} h`;
  }
  return `${horas} h ${minutos} min`;
}
