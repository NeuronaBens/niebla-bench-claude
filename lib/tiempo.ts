import { DiaFestival } from '@/types/festival';

const DIAS_ESP = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export interface FechaPartes {
  anio: number;
  mes: number;
  dia: number;
  hora: number;
  minuto: number;
}

export function parseInicio(iso: string): FechaPartes {
  const [fecha, hora] = iso.split('T');
  const [anio, mes, dia] = fecha.split('-').map(Number);
  const [h, m] = hora.split(':').map(Number);
  return { anio, mes, dia, hora: h, minuto: m };
}

export function minutosAbsolutos(partes: FechaPartes): number {
  return Math.floor(new Date(Date.UTC(partes.anio, partes.mes - 1, partes.dia, partes.hora, partes.minuto)).getTime() / 60000);
}

export function formatearHora(minutosAbs: number): string {
  const d = new Date(minutosAbs * 60000);
  const h = String(d.getUTCHours()).padStart(2, '0');
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function obtenerFechaDeMinutos(minutosAbs: number): FechaPartes {
  const d = new Date(minutosAbs * 60000);
  return {
    anio: d.getUTCFullYear(),
    mes: d.getUTCMonth() + 1,
    dia: d.getUTCDate(),
    hora: d.getUTCHours(),
    minuto: d.getUTCMinutes(),
  };
}

export function diaSemana(partes: FechaPartes): number {
  return new Date(Date.UTC(partes.anio, partes.mes - 1, partes.dia)).getUTCDay();
}

export function formatearDuracion(minutos: number): string {
  if (minutos < 60) return `${minutos} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

export function cruzaMedianoche(inicioMin: number, finMin: number): boolean {
  const inicioFecha = obtenerFechaDeMinutos(inicioMin);
  const finFecha = obtenerFechaDeMinutos(finMin);
  return finFecha.dia !== inicioFecha.dia;
}

export function obtenerNombreDia(partes: FechaPartes): string {
  return DIAS_ESP[diaSemana(partes)];
}

export function obtenerDiasFestival(fechaInicio: string, fechaFin: string): DiaFestival[] {
  const inicio = parseInicio(fechaInicio + 'T00:00');
  const fin = parseInicio(fechaFin + 'T00:00');
  const dias: DiaFestival[] = [];

  const actual = { ...inicio };
  let indice = 0;

  while (
    actual.anio < fin.anio ||
    (actual.anio === fin.anio && actual.mes < fin.mes) ||
    (actual.anio === fin.anio && actual.mes === fin.mes && actual.dia <= fin.dia)
  ) {
    const nombreDia = obtenerNombreDia(actual);
    const slug = nombreDia.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    const etiqueta = `${nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} ${actual.dia}`;

    dias.push({
      indice,
      fecha: `${actual.anio}-${String(actual.mes).padStart(2, '0')}-${String(actual.dia).padStart(2, '0')}`,
      nombreDia,
      slug,
      etiqueta,
    });

    actual.dia++;
    if (actual.dia > new Date(Date.UTC(actual.anio, actual.mes, 0)).getUTCDate()) {
      actual.dia = 1;
      actual.mes++;
      if (actual.mes > 12) {
        actual.mes = 1;
        actual.anio++;
      }
    }
    indice++;
  }

  return dias;
}

export function obtenerDiaIndice(iso: string, fechaInicio: string): number {
  const partes = parseInicio(iso);
  const inicio = parseInicio(fechaInicio + 'T00:00');

  let días = 0;
  const actual = { ...inicio };

  while (
    actual.anio < partes.anio ||
    (actual.anio === partes.anio && actual.mes < partes.mes) ||
    (actual.anio === partes.anio && actual.mes === partes.mes && actual.dia < partes.dia)
  ) {
    actual.dia++;
    if (actual.dia > new Date(Date.UTC(actual.anio, actual.mes, 0)).getUTCDate()) {
      actual.dia = 1;
      actual.mes++;
      if (actual.mes > 12) {
        actual.mes = 1;
        actual.anio++;
      }
    }
    días++;
  }

  return días;
}

export function obtenerHoyEnChile(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(new Date());
}
