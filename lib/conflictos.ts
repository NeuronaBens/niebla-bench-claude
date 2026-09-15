import { funcion, pelicula, sala, traslado } from "./datos";
import { calcularFuncion, ordenarPorInicio, type FuncionCalc } from "./tiempo";

export type TipoAviso = "choque" | "traslado" | "conversatorio";

export type Aviso = {
  tipo: TipoAviso;
  funcionId: string;
  otraFuncionId: string;
  minutos: number;
  mensaje: string;
};

export type Tramo = {
  desdeId: string;
  hastaId: string;
  minutosDisponibles: number; // entre el fin de la película y el siguiente inicio
  minutosCaminando: number;
  mismaSala: boolean;
  alcanza: boolean;
};

export type Analisis = {
  funciones: FuncionCalc[];
  avisos: Map<string, Aviso[]>;
  tramos: Tramo[];
};

function titulo(f: FuncionCalc): string {
  return pelicula(f.peliculaId)?.titulo ?? f.peliculaId;
}

function agregar(mapa: Map<string, Aviso[]>, aviso: Aviso) {
  const lista = mapa.get(aviso.funcionId) ?? [];
  lista.push(aviso);
  mapa.set(aviso.funcionId, lista);
}

/**
 * Analiza un conjunto de funciones elegidas: detecta choques de horario,
 * traslados que no alcanzan y conversatorios que se perderían.
 */
export function analizar(ids: string[]): Analisis {
  const lista = ordenarPorInicio(
    ids
      .map((id) => funcion(id))
      .filter((f): f is NonNullable<typeof f> => Boolean(f))
      .map(calcularFuncion),
  );
  const avisos = new Map<string, Aviso[]>();
  const tramos: Tramo[] = [];

  for (let i = 0; i < lista.length; i++) {
    const a = lista[i];
    let siguienteEncontrado = false;
    for (let j = i + 1; j < lista.length; j++) {
      const b = lista[j];
      if (b.inicioMin < a.finMin) {
        // Se topan. El conversatorio no cuenta como choque.
        const solape = Math.min(a.finMin, b.finMin) - b.inicioMin;
        agregar(avisos, {
          tipo: "choque",
          funcionId: a.id,
          otraFuncionId: b.id,
          minutos: solape,
          mensaje: `Se topa con «${titulo(b)}»: se cruzan ${solape} min.`,
        });
        agregar(avisos, {
          tipo: "choque",
          funcionId: b.id,
          otraFuncionId: a.id,
          minutos: solape,
          mensaje: `Se topa con «${titulo(a)}»: se cruzan ${solape} min.`,
        });
        continue;
      }
      if (siguienteEncontrado) break;
      siguienteEncontrado = true;

      const disponible = b.inicioMin - a.finMin;
      const caminando = traslado(a.salaId, b.salaId);
      const alcanza = disponible >= caminando;
      tramos.push({
        desdeId: a.id,
        hastaId: b.id,
        minutosDisponibles: disponible,
        minutosCaminando: caminando,
        mismaSala: a.salaId === b.salaId,
        alcanza,
      });

      if (!alcanza) {
        agregar(avisos, {
          tipo: "traslado",
          funcionId: b.id,
          otraFuncionId: a.id,
          minutos: caminando - disponible,
          mensaje: `No alcanzas a llegar caminando desde ${sala(a.salaId).nombre}: hay ${disponible} min y el trayecto toma ${caminando}.`,
        });
      }

      if (a.conversatorioMin) {
        const margen = disponible - caminando; // minutos que puedes quedarte después de la película
        if (margen < a.conversatorioMin) {
          const todo = margen <= 0;
          const pierde = todo ? a.conversatorioMin : a.conversatorioMin - margen;
          agregar(avisos, {
            tipo: "conversatorio",
            funcionId: a.id,
            otraFuncionId: b.id,
            minutos: pierde,
            mensaje: todo
              ? `Te perderías el conversatorio completo por ir a «${titulo(b)}».`
              : `Te perderías ${pierde} min del conversatorio por ir a «${titulo(b)}».`,
          });
        }
      }
    }
  }

  return { funciones: lista, avisos, tramos };
}

/** Avisos que tendría una función si se agregara a un conjunto ya elegido. */
export function avisosSiAgrego(ids: string[], nuevoId: string): Aviso[] {
  if (ids.includes(nuevoId)) return [];
  const { avisos } = analizar([...ids, nuevoId]);
  return avisos.get(nuevoId) ?? [];
}

export const ORDEN_AVISO: Record<TipoAviso, number> = { choque: 0, traslado: 1, conversatorio: 2 };

export function peorAviso(avisos: Aviso[] | undefined): TipoAviso | null {
  if (!avisos || avisos.length === 0) return null;
  return [...avisos].sort((a, b) => ORDEN_AVISO[a.tipo] - ORDEN_AVISO[b.tipo])[0].tipo;
}

export const ETIQUETA_AVISO: Record<TipoAviso, string> = {
  choque: "Se topa",
  traslado: "No alcanzas a llegar",
  conversatorio: "Conversatorio",
};
