/**
 * Lógica pura del itinerario (sin React): análisis de choques, traslados y
 * conversatorios, y codificación del link para compartir.
 */
import { dias, funcionPorId, traslado, type Dia, type Funcion } from "@/lib/programa";

export type TipoAviso = "choque" | "traslado" | "conversatorio" | "agotada";

export interface Aviso {
  tipo: TipoAviso;
  /** Función que se ve afectada primero (la que empieza antes). */
  funcion: Funcion;
  /** La otra función involucrada (no aplica para "agotada"). */
  otra?: Funcion;
  /**
   * choque: minutos que se solapan las películas.
   * traslado: minutos que faltan para llegar a tiempo.
   * conversatorio: minutos del conversatorio que se perderían.
   */
  minutos?: number;
  /** Minutos caminando entre las dos salas. */
  trasladoMin?: number;
  /** Frase lista para mostrar, en español, sin emojis. */
  mensaje: string;
}

export type EstadoTramo = "choque" | "no-alcanza" | "justo" | "holgado";

/** Paso entre dos funciones consecutivas del itinerario. */
export interface Tramo {
  desde: Funcion;
  hasta: Funcion;
  trasladoMin: number;
  /** Minutos libres al llegar: hasta.inicio - (desde.fin + traslado). Negativo = no alcanza. */
  holguraMin: number;
  estado: EstadoTramo;
  /** true si por ir a `hasta` se pierde (todo o parte de) el conversatorio de `desde`. */
  pierdeConversatorio: boolean;
  /** true si ambas funciones pertenecen al mismo día del festival. */
  mismaJornada: boolean;
}

export interface Analisis {
  /** Funciones válidas, ordenadas por inicio. */
  funciones: Funcion[];
  /** Ids recibidos que no existen en el programa (se ignoran). */
  idsInvalidos: string[];
  avisos: Aviso[];
  tramos: Tramo[];
  /** Avisos indexados por id de función (cada aviso aparece en sus dos funciones). */
  avisosPorFuncion: Map<string, Aviso[]>;
  porDia: { dia: Dia; funciones: Funcion[] }[];
  totalMinutosPelicula: number;
}

/** Holgura (min) bajo la cual avisamos que "vas justo". */
export const UMBRAL_JUSTO_MIN = 5;

function minTxt(n: number): string {
  return n === 1 ? "1 minuto" : `${n} minutos`;
}

export function limpiarIds(ids: readonly string[]): { validos: string[]; invalidos: string[] } {
  const vistos = new Set<string>();
  const validos: string[] = [];
  const invalidos: string[] = [];
  for (const id of ids) {
    if (vistos.has(id)) continue;
    vistos.add(id);
    if (funcionPorId.has(id)) validos.push(id);
    else invalidos.push(id);
  }
  return { validos, invalidos };
}

export function analizarItinerario(ids: readonly string[]): Analisis {
  const { validos, invalidos } = limpiarIds(ids);
  const lista = validos
    .map((id) => funcionPorId.get(id)!)
    .sort((a, b) => a.inicioMin - b.inicioMin || a.salaId.localeCompare(b.salaId));

  const avisos: Aviso[] = [];

  for (const f of lista) {
    if (f.agotada) {
      avisos.push({
        tipo: "agotada",
        funcion: f,
        mensaje: `${f.pelicula.titulo} (${f.dia.nombre} ${f.horaInicio}) está agotada: ya no quedan entradas en boletería.`,
      });
    }
  }

  const conversatorioYaAvisado = new Set<string>();

  for (let i = 0; i < lista.length; i++) {
    const a = lista[i];
    for (let j = i + 1; j < lista.length; j++) {
      const b = lista[j];
      // b empieza igual o después que a.
      if (b.inicioMin >= a.finConversatorioMin + 24 * 60) break; // demasiado lejos, nada que revisar
      const t = traslado(a.salaId, b.salaId);

      if (b.inicioMin < a.finMin) {
        const solape = Math.min(a.finMin, b.finMin) - b.inicioMin;
        avisos.push({
          tipo: "choque",
          funcion: a,
          otra: b,
          minutos: solape,
          trasladoMin: t,
          mensaje: `${a.pelicula.titulo} y ${b.pelicula.titulo} se topan: se cruzan ${minTxt(solape)}.`,
        });
        continue;
      }

      if (b.inicioMin < a.finMin + t) {
        const faltan = a.finMin + t - b.inicioMin;
        avisos.push({
          tipo: "traslado",
          funcion: a,
          otra: b,
          minutos: faltan,
          trasladoMin: t,
          mensaje: `No alcanzas a llegar caminando de ${a.sala.nombre} a ${b.sala.nombre}: son ${minTxt(t)} y llegarías ${minTxt(faltan)} tarde a ${b.pelicula.titulo}.`,
        });
        continue;
      }

      if (a.conversatorioMin && !conversatorioYaAvisado.has(a.id) && b.inicioMin < a.finConversatorioMin + t) {
        conversatorioYaAvisado.add(a.id);
        const perdidos = Math.min(a.conversatorioMin, a.finConversatorioMin + t - b.inicioMin);
        const todo = perdidos >= a.conversatorioMin;
        avisos.push({
          tipo: "conversatorio",
          funcion: a,
          otra: b,
          minutos: perdidos,
          trasladoMin: t,
          mensaje: todo
            ? `Te perderías el conversatorio de ${a.pelicula.titulo} para llegar a ${b.pelicula.titulo}.`
            : `Para llegar a ${b.pelicula.titulo} tendrías que salir antes del conversatorio de ${a.pelicula.titulo} (te perderías ${minTxt(perdidos)} de ${minTxt(a.conversatorioMin)}).`,
        });
      }
    }
  }

  const tramos: Tramo[] = [];
  for (let i = 0; i + 1 < lista.length; i++) {
    const desde = lista[i];
    const hasta = lista[i + 1];
    const t = traslado(desde.salaId, hasta.salaId);
    const holgura = hasta.inicioMin - (desde.finMin + t);
    let estado: EstadoTramo;
    if (hasta.inicioMin < desde.finMin) estado = "choque";
    else if (holgura < 0) estado = "no-alcanza";
    else if (holgura < UMBRAL_JUSTO_MIN) estado = "justo";
    else estado = "holgado";
    tramos.push({
      desde,
      hasta,
      trasladoMin: t,
      holguraMin: holgura,
      estado,
      pierdeConversatorio:
        !!desde.conversatorioMin && estado !== "choque" && estado !== "no-alcanza" && hasta.inicioMin < desde.finConversatorioMin + t,
      mismaJornada: desde.dia.fecha === hasta.dia.fecha,
    });
  }

  const avisosPorFuncion = new Map<string, Aviso[]>();
  const agregar = (id: string, av: Aviso) => {
    const l = avisosPorFuncion.get(id);
    if (l) l.push(av);
    else avisosPorFuncion.set(id, [av]);
  };
  for (const av of avisos) {
    agregar(av.funcion.id, av);
    if (av.otra) agregar(av.otra.id, av);
  }

  const porDia = dias
    .map((dia) => ({ dia, funciones: lista.filter((f) => f.dia.fecha === dia.fecha) }))
    .filter((g) => g.funciones.length > 0);

  return {
    funciones: lista,
    idsInvalidos: invalidos,
    avisos,
    tramos,
    avisosPorFuncion,
    porDia,
    totalMinutosPelicula: lista.reduce((s, f) => s + f.pelicula.duracionMin, 0),
  };
}

/** Avisos (choque/traslado/conversatorio) que provocaría agregar `nuevaId` a un itinerario existente. */
export function avisosAlAgregar(idsActuales: readonly string[], nuevaId: string): Aviso[] {
  if (idsActuales.includes(nuevaId)) return [];
  const { avisos } = analizarItinerario([...idsActuales, nuevaId]);
  return avisos.filter((a) => a.tipo !== "agotada" && (a.funcion.id === nuevaId || a.otra?.id === nuevaId));
}

// ---------------------------------------------------------------------------
// Compartir
// ---------------------------------------------------------------------------

/** Ruta de la vista compartida. */
export const RUTA_COMPARTIDO = "/itinerario/compartido";
const SEPARADOR = ".";
const MAX_NOMBRE = 40;

/** Query string para compartir: "f=f03.f05.f13&n=Camila" (sin "?"). */
export function codificarItinerario(ids: readonly string[], nombre?: string): string {
  const { validos } = limpiarIds(ids);
  const ordenados = validos
    .map((id) => funcionPorId.get(id)!)
    .sort((a, b) => a.inicioMin - b.inicioMin)
    .map((f) => f.id);
  const p = new URLSearchParams();
  p.set("f", ordenados.join(SEPARADOR));
  const n = nombre?.trim().slice(0, MAX_NOMBRE);
  if (n) p.set("n", n);
  return p.toString();
}

/** Lee los parámetros de un link compartido. Tolera ids repetidos, inválidos o separadores alternativos. */
export function decodificarItinerario(params: { get(nombre: string): string | null }): {
  ids: string[];
  idsInvalidos: string[];
  nombre: string | null;
} {
  const crudo = params.get("f") ?? "";
  const partes = crudo
    .split(/[.,\s-]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const { validos, invalidos } = limpiarIds(partes);
  const n = params.get("n")?.trim().slice(0, MAX_NOMBRE) || null;
  return { ids: validos, idsInvalidos: invalidos, nombre: n };
}

/** Link absoluto para compartir. Solo en el cliente (usa window.location.origin). */
export function linkCompartido(ids: readonly string[], nombre?: string): string {
  const origen = typeof window !== "undefined" ? window.location.origin : "";
  return `${origen}${RUTA_COMPARTIDO}?${codificarItinerario(ids, nombre)}`;
}
