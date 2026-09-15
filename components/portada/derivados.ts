/**
 * Datos derivados para la portada. Todo sale de `lib/programa` (y por lo tanto de
 * `data/programa.json`): nada de cifras ni horarios escritos a mano.
 */
import {
  dias,
  festival,
  funciones,
  peliculas,
  salas,
  secciones,
  traslado,
  type Dia,
  type Funcion,
  type Sala,
  type SeccionId,
} from "@/lib/programa";

const PALABRAS = ["cero", "una", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];

/** 3 -> "tres" (hasta diez; después, el número). */
export function enPalabras(n: number): string {
  return PALABRAS[n] ?? String(n);
}

export function mayuscula(t: string): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** "Festival de Cine Niebla" -> { antes: "Festival de Cine", marca: "Niebla" } */
export const nombre = (() => {
  const partes = festival.nombre.trim().split(/\s+/);
  const marca = partes.pop() ?? festival.nombre;
  return { antes: partes.join(" "), marca };
})();

export const anio = festival.fechaInicio.slice(0, 4);
export const primerDia = dias[0];
export const ultimoDia = dias[dias.length - 1];

/** "jueves 15 al sábado 17 de octubre de 2026" */
export const rangoFechas =
  primerDia.mes === ultimoDia.mes
    ? `${primerDia.nombre} ${primerDia.numero} al ${ultimoDia.nombre} ${ultimoDia.numero} de ${ultimoDia.mes} de ${anio}`
    : `${primerDia.largo} al ${ultimoDia.largo} de ${anio}`;

export const cifras = {
  peliculas: peliculas.length,
  funciones: funciones.length,
  salas: salas.length,
  dias: dias.length,
  secciones: secciones.length,
  estrenosMundiales: peliculas.filter((p) => p.estreno === "mundial").length,
};

export const colorSeccion = (id: SeccionId) => `var(--sec-${id})`;

export const funcionInaugural: Funcion =
  funciones.find((f) => /inaugura/i.test(f.nota ?? "")) ?? funciones[0];

export const primeraFuncion = funciones[0];
export const ultimaFuncion = funciones.reduce((a, b) => (b.finMin > a.finMin ? b : a), funciones[0]);

/** Etiqueta corta para una función con nota especial. */
export function etiquetaNota(f: Funcion): string {
  const nota = f.nota ?? "";
  if (/inaugura/i.test(nota)) return "Función inaugural";
  if (/premio|premiaci/i.test(nota)) return "Premiación";
  if (/clausura/i.test(nota)) return "Clausura";
  return "Función especial";
}

export const funcionesConNota = funciones.filter((f) => f.nota);
export const funcionesConConversatorio = funciones.filter((f) => (f.conversatorioMin ?? 0) > 0);
export const salasAireLibre: Sala[] = salas.filter((s) => s.aireLibre);
export const funcionesAireLibre = funciones.filter((f) => f.sala.aireLibre);
export const funcionesTrasnoche = funciones.filter((f) => f.seccion.id === "nocturna" && f.terminaDiaSiguiente);

export interface ResumenDia {
  dia: Dia;
  funciones: Funcion[];
  primera: Funcion;
  ultima: Funcion;
  conNota: Funcion[];
  conversatorios: number;
  aireLibre: number;
  esFuerte: boolean;
  /** true si la primera función parte de tarde (se llega después de la pega). */
  despuesDeLaPega: boolean;
}

export const resumenDias: ResumenDia[] = (() => {
  const base = dias.map((dia) => {
    const fs = funciones.filter((f) => f.dia.fecha === dia.fecha);
    return { dia, fs };
  });
  const max = Math.max(...base.map((b) => b.fs.length));
  return base
    .filter((b) => b.fs.length > 0)
    .map(({ dia, fs }) => {
      const primera = fs[0];
      const ultima = fs.reduce((a, b) => (b.finMin > a.finMin ? b : a), fs[0]);
      const horaPrimera = primera.inicioMin - dia.indice * 1440;
      return {
        dia,
        funciones: fs,
        primera,
        ultima,
        conNota: fs.filter((f) => f.nota),
        conversatorios: fs.filter((f) => (f.conversatorioMin ?? 0) > 0).length,
        aireLibre: fs.filter((f) => f.sala.aireLibre).length,
        esFuerte: fs.length === max,
        despuesDeLaPega: horaPrimera >= 15 * 60,
      };
    });
})();

/** Rango horario común a los tres días (en minutos desde las 00:00 del día), redondeado a horas pares. */
export const rangoHorario = (() => {
  let desde = Infinity;
  let hasta = -Infinity;
  for (const f of funciones) {
    const base = f.dia.indice * 1440;
    desde = Math.min(desde, f.inicioMin - base);
    hasta = Math.max(hasta, f.finConversatorioMin - base);
  }
  const d = Math.floor(desde / 120) * 120;
  const h = Math.ceil(hasta / 120) * 120;
  return { desde: d, hasta: h };
})();

/** Pares de salas con sus minutos caminando (sin repetir). */
export const distancias = salas.flatMap((a, i) =>
  salas.slice(0, i).map((b) => ({ a, b, min: traslado(a.id, b.id) })),
);

export const trasladoMaximo = distancias.reduce((m, d) => (d.min > m.min ? d : m), distancias[0]);
