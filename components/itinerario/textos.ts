/**
 * Textos del itinerario derivados de la lógica de `lib/itinerario.ts`.
 * Todo en español de Chile, sin emojis.
 */
import type { Aviso, Tramo } from "@/lib/itinerario";
import { formatoDuracion, type Funcion } from "@/lib/programa";

export function plural(n: number, uno: string, varios: string): string {
  return `${n} ${n === 1 ? uno : varios}`;
}

/** "jue 15 · 18:00" */
export function cuando(f: Funcion): string {
  return `${f.dia.corto} ${f.dia.numero} · ${f.horaInicio}`;
}

/** Minutos de solape de un tramo en choque. */
export function solapeTramo(t: Tramo): number {
  return Math.min(t.desde.finMin, t.hasta.finMin) - t.hasta.inicioMin;
}

/** Minutos de conversatorio que se pierden en un tramo. */
export function conversatorioPerdido(t: Tramo): number {
  const conv = t.desde.conversatorioMin ?? 0;
  return Math.max(0, Math.min(conv, t.desde.finConversatorioMin + t.trasladoMin - t.hasta.inicioMin));
}

export interface TextoTramo {
  /** Frase principal ("te sobran 23 min", "no alcanzas: faltan 2 min"). */
  titular: string;
  /** Detalle del recorrido. */
  detalle: string;
}

export function textoTramo(t: Tramo): TextoTramo {
  const misma = t.desde.salaId === t.hasta.salaId;
  const camino = misma
    ? `Te quedas en ${t.desde.sala.nombre}`
    : `${t.trasladoMin} min caminando de ${t.desde.sala.nombre} a ${t.hasta.sala.nombre}`;

  switch (t.estado) {
    case "choque": {
      const n = solapeTramo(t);
      return {
        titular: `Se topan ${formatoDuracion(n)}`,
        detalle: `${t.desde.pelicula.titulo} termina a las ${t.desde.horaFin} y ${t.hasta.pelicula.titulo} empieza a las ${t.hasta.horaInicio}.`,
      };
    }
    case "no-alcanza": {
      const faltan = -t.holguraMin;
      return {
        titular: `No alcanzas: ${faltan === 1 ? "falta 1 min" : `faltan ${faltan} min`}`,
        detalle: `${camino}. La película termina a las ${t.desde.horaFin} y la siguiente empieza a las ${t.hasta.horaInicio}.`,
      };
    }
    case "justo":
      return {
        titular: t.holguraMin === 0 ? "Llegas justo" : `Llegas justo: ${t.holguraMin} min de margen`,
        detalle: misma ? `${camino}: sales de una y entras a la otra.` : `${camino}.`,
      };
    default:
      return {
        titular: `Te sobran ${formatoDuracion(t.holguraMin)}`,
        detalle: `${camino}.`,
      };
  }
}

/**
 * Aviso corto, pensado desde la función que se acaba de agregar.
 */
export function textoAvisoAlAgregar(a: Aviso, nuevaId: string): string {
  const esLaPrimera = a.funcion.id === nuevaId;
  const otra = esLaPrimera ? a.otra : a.funcion;
  const tituloOtra = otra ? `${otra.pelicula.titulo} (${otra.dia.corto} ${otra.horaInicio})` : "";
  const n = a.minutos ?? 0;
  switch (a.tipo) {
    case "choque":
      return `Se topa con ${tituloOtra}: se cruzan ${formatoDuracion(n)}.`;
    case "traslado":
      return esLaPrimera
        ? `Después no alcanzas a llegar a ${tituloOtra}: faltan ${n} min caminando.`
        : `No alcanzas a llegar desde ${tituloOtra}: faltan ${n} min caminando.`;
    case "conversatorio":
      return esLaPrimera
        ? `Te perderías su conversatorio por ir a ${tituloOtra}.`
        : `Te perderías el conversatorio de ${tituloOtra}.`;
    default:
      return a.mensaje;
  }
}

export const NOMBRE_TIPO: Record<Aviso["tipo"], [string, string]> = {
  choque: ["choque", "choques"],
  traslado: ["traslado imposible", "traslados imposibles"],
  conversatorio: ["conversatorio perdido", "conversatorios perdidos"],
  agotada: ["función agotada", "funciones agotadas"],
};
