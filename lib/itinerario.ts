import {
  AnalizarItinerarioResult,
  Aviso,
  FuncionExpandida,
} from "./tipos";
import {
  funcionesExpandidas,
  getFuncionExpandida,
  traslado,
} from "./programa";

/**
 * Analiza un itinerario: retorna funciones ordenadas por inicio y avisos de conflictos
 */
export function analizarItinerario(ids: string[]): AnalizarItinerarioResult {
  // Obtener funciones expandidas y ordenarlas por inicio
  const funcionesDelItinerario = ids
    .map((id) => getFuncionExpandida(id))
    .filter((f): f is FuncionExpandida => f !== undefined)
    .sort((a, b) => a.inicioMin - b.inicioMin);

  const avisos: Aviso[] = [];
  const avisosPorPar = new Map<string, Aviso>(); // clave: "a_b" para evitar duplicados

  // Detectar conflictos
  for (let i = 0; i < funcionesDelItinerario.length; i++) {
    const actual = funcionesDelItinerario[i];

    for (let j = 0; j < i; j++) {
      const anterior = funcionesDelItinerario[j];

      // Solo comparar si son del mismo día
      if (anterior.dia !== actual.dia) {
        continue;
      }

      const parKey = `${anterior.id}_${actual.id}`;

      // 1. CHOQUE: los intervalos [inicioMin, finMin) se superponen
      // (el conversatorio NO cuenta para el choque)
      if (anterior.finMin > actual.inicioMin) {
        const aviso: Aviso = {
          tipo: "choque",
          a: anterior.id,
          b: actual.id,
          texto: `«${anterior.pelicula.titulo}» y «${actual.pelicula.titulo}» se topan.`,
        };
        avisos.push(aviso);
        avisosPorPar.set(parKey, aviso);
        continue; // Si hay choque, no hay traslado ni conversatorio
      }

      // 2. TRASLADO: A termina antes de B, pero no alcanza a llegar caminando
      const minutosTrasladoNecesarios = traslado(anterior.sala.id, actual.sala.id);
      const tiempoDisponible = actual.inicioMin - anterior.finMin;
      const minutosFaltan = minutosTrasladoNecesarios - tiempoDisponible;

      if (minutosFaltan > 0) {
        const aviso: Aviso = {
          tipo: "traslado",
          a: anterior.id,
          b: actual.id,
          minutosFaltan,
          texto: `No alcanzas a llegar caminando de ${anterior.sala.nombre} a ${actual.sala.nombre}: faltan ${minutosFaltan} minuto${minutosFaltan > 1 ? "s" : ""}.`,
        };
        avisos.push(aviso);
        avisosPorPar.set(parKey, aviso);
        continue; // Si hay traslado, no hay conversatorio
      }

      // 3. CONVERSATORIO: A tiene conversatorio y se lo perdería por ir a B
      if (anterior.conversatorioMin && anterior.conversatorioMin > 0) {
        const finConversatorio = anterior.finConversatorioMin;
        const minutosTrasladoConversatorio = traslado(
          anterior.sala.id,
          actual.sala.id
        );
        const tiempoDisponibleConversatorio = actual.inicioMin - finConversatorio;
        const minutosFaltanConversatorio =
          minutosTrasladoConversatorio - tiempoDisponibleConversatorio;

        if (minutosFaltanConversatorio > 0) {
          const aviso: Aviso = {
            tipo: "conversatorio",
            a: anterior.id,
            b: actual.id,
            texto: `Te perderías el conversatorio de «${anterior.pelicula.titulo}» por ir a «${actual.pelicula.titulo}».`,
          };
          avisos.push(aviso);
          avisosPorPar.set(parKey, aviso);
        }
      }
    }
  }

  return {
    funciones: funcionesDelItinerario,
    avisos,
  };
}

/**
 * Obtiene los avisos que involucran a una función específica
 */
export function avisosDeFuncion(
  analisis: AnalizarItinerarioResult,
  id: string
): Aviso[] {
  return analisis.avisos.filter((aviso) => aviso.a === id || aviso.b === id);
}

/**
 * Serializa un arreglo de ids a string: "f01,f05"
 */
export function serializarIds(ids: string[]): string {
  return ids.join(",");
}

/**
 * Parsea un string "f01,f05" a arreglo, descartando ids inválidas
 */
export function parsearIds(str: string): string[] {
  if (!str) return [];

  const idsValidas = new Set(funcionesExpandidas.map((f) => f.id));
  return str
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id && idsValidas.has(id));
}
