import { dias, funcionPorId, traslado } from '../datos'
import type { AnalisisItinerario, AvisoCandidata, Choque, EstadoFuncionItinerario, Funcion, FuncionId, ResumenDia, Tramo } from '../tipos'
import * as mensajes from './mensajes'

// Reglas puras del itinerario: choques, traslados y conversatorios. Sin DOM,
// sin `Date`, sin efectos. Se recalcula en cada render con `useMemo`.

/**
 * Limpia y valida una lista de ids: minúsculas, sin espacios, sin vacíos, sin
 * duplicados (se conserva el primero) y separados en válidos/inválidos según
 * existan en `funcionPorId`. Los válidos quedan ordenados por inicio y luego
 * por id.
 */
export function normalizarIds(ids: readonly string[]): { validos: Funcion[]; invalidos: string[] } {
  const vistos = new Set<string>()
  const invalidosVistos = new Set<string>()
  const validos: Funcion[] = []
  const invalidos: string[] = []
  for (const bruto of ids) {
    const id = bruto.trim().toLowerCase()
    if (id === '') continue
    const funcion = funcionPorId.get(id)
    if (!funcion) {
      if (!invalidosVistos.has(id)) {
        invalidosVistos.add(id)
        invalidos.push(id)
      }
      continue
    }
    if (vistos.has(id)) continue
    vistos.add(id)
    validos.push(funcion)
  }
  validos.sort((a, b) => a.inicioMin - b.inicioMin || a.id.localeCompare(b.id))
  return { validos, invalidos }
}

function calcularTramo(a: Funcion, b: Funcion): Tramo {
  const t = traslado(a.salaId, b.salaId)
  const mismoDia = a.dia.fecha === b.dia.fecha
  const salidaMin = a.finMin
  const llegadaMin = a.finMin + t
  const disponibleMin = b.inicioMin - (a.finConversatorioMin ?? a.finMin)
  const sobraMin = disponibleMin - t
  const salidaMaximaMin = b.inicioMin - t
  const base = { desde: a, hacia: b, mismoDia, trasladoMin: t, salidaMin, llegadaMin, disponibleMin, sobraMin, salidaMaximaMin }

  // 1. Choque: los intervalos de proyección se solapan.
  if (a.finMin > b.inicioMin) {
    return { ...base, estado: 'choque', atrasoMin: 0, conversatorioVistoMin: null }
  }
  // 2. Traslado: no alcanza a llegar a la película (fin==inicio sí alcanza).
  if (llegadaMin > b.inicioMin) {
    return { ...base, estado: 'traslado', atrasoMin: llegadaMin - b.inicioMin, conversatorioVistoMin: null }
  }
  // 3. Conversatorio: alcanza a la película, pero no a todo el conversatorio.
  if (a.conversatorioMin) {
    const finConv = a.finMin + a.conversatorioMin
    if (finConv + t > b.inicioMin) {
      const conversatorioVistoMin = Math.max(0, Math.min(a.conversatorioMin, b.inicioMin - t - a.finMin))
      return { ...base, estado: 'conversatorio', atrasoMin: 0, conversatorioVistoMin }
    }
  }
  // 4. Holgura: alcanza sin problema (y al conversatorio completo, si hay).
  return { ...base, estado: 'holgura', atrasoMin: 0, conversatorioVistoMin: null }
}

export function analizarItinerario(ids: readonly string[]): AnalisisItinerario {
  const { validos: s, invalidos: idsInvalidos } = normalizarIds(ids)

  // Choques: todos los pares i<j (ya ordenados por inicio).
  const choques: Choque[] = []
  const choquesPorId = new Map<FuncionId, Funcion[]>()
  for (const f of s) choquesPorId.set(f.id, [])
  for (let i = 0; i < s.length; i++) {
    for (let j = i + 1; j < s.length; j++) {
      const a = s[i]
      const b = s[j]
      if (a.finMin > b.inicioMin) {
        choques.push({ a, b, solapeMin: Math.min(a.finMin, b.finMin) - b.inicioMin })
        choquesPorId.get(a.id)!.push(b)
        choquesPorId.get(b.id)!.push(a)
      }
    }
  }

  // Tramos: solo entre consecutivas del orden global.
  const tramos: Tramo[] = []
  for (let k = 0; k < s.length - 1; k++) {
    tramos.push(calcularTramo(s[k], s[k + 1]))
  }

  // Estado por función.
  const estadoPorId = new Map<FuncionId, EstadoFuncionItinerario>()
  for (const f of s) {
    estadoPorId.set(f.id, {
      choquesCon: choquesPorId.get(f.id) ?? [],
      llegaTardeDesde: null,
      noAlcanzaA: null,
      pierdeConversatorioPor: null,
      mismaPeliculaEn: s.filter((otra) => otra.id !== f.id && otra.peliculaId === f.peliculaId),
    })
  }
  for (const t of tramos) {
    if (t.estado === 'traslado') {
      estadoPorId.get(t.desde.id)!.noAlcanzaA = t
      estadoPorId.get(t.hacia.id)!.llegaTardeDesde = t
    } else if (t.estado === 'conversatorio') {
      estadoPorId.get(t.desde.id)!.pierdeConversatorioPor = t
    }
  }

  // Agrupación por día, en el orden de `dias`.
  const porDia = dias
    .map((dia) => {
      const funcionesDia = s.filter((f) => f.dia.fecha === dia.fecha)
      if (funcionesDia.length === 0) return null
      const tramosDia = tramos.filter((t) => t.desde.dia.fecha === dia.fecha)
      const finesDia = funcionesDia.map((f) => f.finConversatorioMin ?? f.finMin)
      const ultimaFinMin = Math.max(...finesDia)
      const resumen: ResumenDia = {
        cantidad: funcionesDia.length,
        primeraInicioMin: Math.min(...funcionesDia.map((f) => f.inicioMin)),
        ultimaFinMin,
        terminaDiaSiguiente: ultimaFinMin >= dia.inicioDiaMin + 1440,
      }
      return { dia, funciones: funcionesDia, tramos: tramosDia, resumen }
    })
    .filter((x): x is { dia: (typeof dias)[number]; funciones: Funcion[]; tramos: Tramo[]; resumen: ResumenDia } => x !== null)

  return { funciones: s, porDia, choques, tramos, estadoPorId, idsInvalidos }
}

/**
 * Avisos que involucran a `candidataId`, evaluados sobre `ids` más la
 * candidata (si no estaba ya). Orden: choques, traslado, conversatorio,
 * misma película. Se usa para la pista antes de marcar (H4.2 CA6, H4.7 CA2).
 */
export function evaluarCandidata(ids: readonly string[], candidataId: FuncionId): AvisoCandidata[] {
  const candidata = funcionPorId.get(candidataId)
  if (!candidata) return []
  const yaEsta = ids.some((id) => id.trim().toLowerCase() === candidataId.toLowerCase())
  const idsAnalizar = yaEsta ? ids : [...ids, candidataId]
  const analisis = analizarItinerario(idsAnalizar)
  const estado = analisis.estadoPorId.get(candidataId)
  if (!estado) return []

  const avisos: AvisoCandidata[] = []

  for (const otra of estado.choquesCon) {
    avisos.push({ tipo: 'choque', texto: mensajes.pistaChoque(otra), otra })
  }
  if (estado.noAlcanzaA) {
    const t = estado.noAlcanzaA
    avisos.push({ tipo: 'traslado', texto: mensajes.pistaNoAlcanzaA(t.hacia, t.atrasoMin), otra: t.hacia })
  }
  if (estado.llegaTardeDesde) {
    const t = estado.llegaTardeDesde
    avisos.push({ tipo: 'traslado', texto: mensajes.pistaNoAlcanzaDesde(t.desde, t.atrasoMin), otra: t.desde })
  }
  if (estado.pierdeConversatorioPor) {
    const t = estado.pierdeConversatorioPor
    avisos.push({ tipo: 'conversatorio', texto: mensajes.pistaConversatorioDeA(t.desde), otra: t.hacia })
  } else {
    const tramoEntrante = analisis.tramos.find((t) => t.hacia.id === candidataId && t.estado === 'conversatorio')
    if (tramoEntrante) {
      avisos.push({ tipo: 'conversatorio', texto: mensajes.pistaConversatorioDeA(tramoEntrante.desde), otra: tramoEntrante.desde })
    }
  }
  for (const otra of estado.mismaPeliculaEn) {
    avisos.push({ tipo: 'mismaPelicula', texto: mensajes.pistaMismaPelicula(otra), otra })
  }

  return avisos
}
