import { dias, getFuncion, traslado, type Dia, type Funcion } from "./datos";

export type TipoAviso = "choque" | "traslado" | "conversatorio";

export interface Aviso {
  tipo: TipoAviso;
  /** Empieza antes. */
  a: Funcion;
  /** Empieza después. */
  b: Funcion;
  /** choque: minutos de superposición · traslado: minutos que faltan · conversatorio: minutos del conversatorio que se pierden */
  minutos: number;
  mensaje: string;
}

export interface Hueco {
  desde: Funcion;
  hasta: Funcion;
  /** Minutos entre el fin de `desde` (incluido su conversatorio) y el inicio de `hasta`. */
  minutosLibres: number;
  minutosCaminando: number;
}

export interface Analisis {
  funciones: Funcion[];
  porDia: { dia: Dia; funciones: Funcion[] }[];
  avisos: Aviso[];
  avisosDe(funcionId: string): Aviso[];
  huecos: Hueco[];
}

export const PARAM_COMPARTIR = "f";

const comillas = (t: string) => `«${t}»`;

function frase(n: number, singular: string, plural = `${singular}s`): string {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** Revisa un par de funciones del mismo día (a empieza antes que b). */
export function compararPar(a: Funcion, b: Funcion): Aviso | null {
  const caminata = traslado(a.salaId, b.salaId);

  if (b.inicioMin < a.finMin) {
    const minutos = Math.min(a.finMin, b.finMin) - b.inicioMin;
    return {
      tipo: "choque",
      a,
      b,
      minutos,
      mensaje: `Se topa con ${comillas(b.pelicula.titulo)}: ${comillas(a.pelicula.titulo)} termina a las ${a.horaFin} y ${comillas(
        b.pelicula.titulo,
      )} empieza a las ${b.horaInicio}.`,
    };
  }

  const libres = b.inicioMin - a.finMin;
  if (libres < caminata) {
    const faltan = caminata - libres;
    return {
      tipo: "traslado",
      a,
      b,
      minutos: faltan,
      mensaje: `No alcanzas a llegar caminando de ${a.sala.corto} a ${b.sala.corto}: son ${frase(caminata, "minuto")} y solo tienes ${frase(
        libres,
        "minuto",
      )} entre una y otra.`,
    };
  }

  if (a.conversatorioMin != null && a.conversatorioFinMin != null) {
    const salidaMax = b.inicioMin - caminata;
    if (salidaMax < a.conversatorioFinMin) {
      const alcanzas = Math.max(0, salidaMax - a.finMin);
      const pierde = a.conversatorioMin - alcanzas;
      const detalle =
        alcanzas === 0
          ? `Tendrías que salir apenas termine la película.`
          : `Solo alcanzas a quedarte ${frase(alcanzas, "minuto")} de los ${a.conversatorioMin}.`;
      return {
        tipo: "conversatorio",
        a,
        b,
        minutos: pierde,
        mensaje: `Te perderías el conversatorio de ${comillas(a.pelicula.titulo)} (${frase(
          a.conversatorioMin,
          "minuto",
        )}) por ir a ${comillas(b.pelicula.titulo)}. ${detalle}`,
      };
    }
  }

  return null;
}

export function analizarItinerario(ids: string[]): Analisis {
  const vistos = new Set<string>();
  const funciones: Funcion[] = [];
  for (const id of ids) {
    if (vistos.has(id)) continue;
    const f = getFuncion(id);
    if (f) {
      vistos.add(id);
      funciones.push(f);
    }
  }
  funciones.sort((x, y) => x.inicioMin - y.inicioMin || x.id.localeCompare(y.id));

  const porDia = dias
    .map((dia) => ({ dia, funciones: funciones.filter((f) => f.dia === dia.id) }))
    .filter((g) => g.funciones.length > 0);

  const avisos: Aviso[] = [];
  const huecos: Hueco[] = [];

  for (const grupo of porDia) {
    const lista = grupo.funciones;
    for (let i = 0; i < lista.length; i++) {
      for (let j = i + 1; j < lista.length; j++) {
        const aviso = compararPar(lista[i], lista[j]);
        if (aviso) avisos.push(aviso);
      }
    }
    for (let i = 0; i < lista.length - 1; i++) {
      const desde = lista[i];
      const hasta = lista[i + 1];
      if (compararPar(desde, hasta)) continue;
      const finReal = desde.conversatorioFinMin ?? desde.finMin;
      huecos.push({
        desde,
        hasta,
        minutosLibres: hasta.inicioMin - finReal,
        minutosCaminando: traslado(desde.salaId, hasta.salaId),
      });
    }
  }

  return {
    funciones,
    porDia,
    avisos,
    huecos,
    avisosDe(funcionId: string) {
      return avisos.filter((av) => av.a.id === funcionId || av.b.id === funcionId);
    },
  };
}

/** Ids de funciones -> "f01.f05.f09" (ordenado por inicio, sin repetidos, solo ids válidos). */
export function codificarItinerario(ids: string[]): string {
  return analizarItinerario(ids)
    .funciones.map((f) => f.id)
    .join(".");
}

/** "f01.f05.f09" (o "f01,f05") -> ids válidos, sin repetidos. */
export function decodificarItinerario(texto: string | null | undefined): string[] {
  if (!texto) return [];
  const vistos = new Set<string>();
  const salida: string[] = [];
  for (const parte of texto.split(/[.,\s]+/)) {
    const id = parte.trim();
    if (!id || vistos.has(id) || !getFuncion(id)) continue;
    vistos.add(id);
    salida.push(id);
  }
  return salida;
}

/** Ruta relativa para compartir. El origen se agrega en el cliente con `location.origin`. */
export function rutaCompartir(ids: string[]): string {
  const codigo = codificarItinerario(ids);
  return codigo ? `/itinerario?${PARAM_COMPARTIR}=${codigo}` : "/itinerario";
}
