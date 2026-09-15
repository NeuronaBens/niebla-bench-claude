// Único módulo que importa data/programa.json.
// Expone `construirPrograma` (pura, testeable con cualquier ProgramaCrudo) y la
// constante `programa`, ya construida con los datos reales.

import datos from '../data/programa.json' with { type: 'json' }
import { aMinutos, fechaDe, diaSemana, nombreMes, fechaLarga } from './tiempo.ts'
import type {
  DiaFestival,
  DiaSlug,
  Funcion,
  Pelicula,
  ProgramaCrudo,
  Sala,
  SalaId,
  Seccion,
  SeccionId,
} from './tipos.ts'

function quitarTildes(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function construirDias(crudo: ProgramaCrudo): DiaFestival[] {
  const dias: DiaFestival[] = []
  const inicio = aMinutos(`${crudo.festival.fechaInicio}T00:00`)
  const fin = aMinutos(`${crudo.festival.fechaFin}T00:00`)
  for (let m = inicio; m <= fin; m += 24 * 60) {
    const fecha = fechaDe(m)
    const nombre = diaSemana(fecha)
    const numero = Number(fecha.slice(8, 10))
    const slug = quitarTildes(nombre) as DiaSlug
    dias.push({
      slug,
      fecha,
      nombre,
      numero,
      mes: nombreMes(fecha),
      corto: `${nombre.slice(0, 3).replace(/^./, (c) => c.toUpperCase())} ${numero}`,
      largo: fechaLarga(fecha),
    })
  }
  return dias
}

export interface Programa {
  festival: ProgramaCrudo['festival']
  dias: DiaFestival[]
  salas: Sala[]
  secciones: Seccion[]
  peliculas: Pelicula[]
  funciones: Funcion[]
  salaPorId(id: SalaId): Sala
  seccionPorId(id: SeccionId): Seccion
  peliculaPorId(id: string): Pelicula | undefined
  funcionPorId(id: string): Funcion | undefined
  funcionesDePelicula(peliculaId: string): Funcion[]
  funcionesDelDia(slug: DiaSlug): Funcion[]
  peliculasDeSeccion(seccionId: SeccionId): Pelicula[]
  traslado(desde: SalaId, hasta: SalaId): number
}

export function construirPrograma(crudo: ProgramaCrudo): Programa {
  const salasPorId = new Map(crudo.salas.map((s) => [s.id, s]))
  const seccionesPorId = new Map(crudo.secciones.map((s) => [s.id, s]))
  const peliculasPorId = new Map(crudo.peliculas.map((p) => [p.id, p]))
  const dias = construirDias(crudo)
  const diasPorFecha = new Map(dias.map((d) => [d.fecha, d]))

  for (const f of crudo.funciones) {
    if (!/^f\d{2}$/.test(f.id)) {
      throw new Error(`Id de función con formato inválido: "${f.id}"`)
    }
    if (!peliculasPorId.has(f.peliculaId)) {
      throw new Error(`Función "${f.id}" referencia una película inexistente: "${f.peliculaId}"`)
    }
    if (!salasPorId.has(f.salaId)) {
      throw new Error(`Función "${f.id}" referencia una sala inexistente: "${f.salaId}"`)
    }
  }
  const idsUnicos = new Set(crudo.funciones.map((f) => f.id))
  if (idsUnicos.size !== crudo.funciones.length) {
    throw new Error('Hay ids de función repetidos en data/programa.json')
  }
  for (const p of crudo.peliculas) {
    if (!seccionesPorId.has(p.seccion)) {
      throw new Error(`Película "${p.id}" referencia una sección inexistente: "${p.seccion}"`)
    }
  }
  for (const desde of crudo.salas) {
    for (const hasta of crudo.salas) {
      const ida = crudo.trasladosMin[desde.id]?.[hasta.id]
      const vuelta = crudo.trasladosMin[hasta.id]?.[desde.id]
      if (typeof ida !== 'number' || typeof vuelta !== 'number') {
        throw new Error(`Falta el traslado entre "${desde.id}" y "${hasta.id}"`)
      }
      if (ida !== vuelta) {
        throw new Error(`La tabla de traslados no es simétrica entre "${desde.id}" y "${hasta.id}"`)
      }
    }
  }

  const funciones: Funcion[] = crudo.funciones
    .map((f) => {
      const pelicula = peliculasPorId.get(f.peliculaId)!
      const sala = salasPorId.get(f.salaId)!
      const seccion = seccionesPorId.get(pelicula.seccion)!
      const inicio = aMinutos(f.inicio)
      const fin = inicio + pelicula.duracionMin
      const conversatorioMin = f.conversatorioMin ?? 0
      const finConversatorio = conversatorioMin > 0 ? fin + conversatorioMin : null
      const fechaInicio = fechaDe(inicio)
      const dia = diasPorFecha.get(fechaInicio)
      if (!dia) {
        throw new Error(`La función "${f.id}" empieza fuera del rango del festival: ${f.inicio}`)
      }
      return {
        id: f.id,
        pelicula,
        sala,
        seccion,
        inicio,
        fin,
        finConversatorio,
        conversatorioMin,
        agotada: f.agotada ?? false,
        nota: f.nota ?? null,
        dia,
        cruzaMedianoche: fechaDe(fin) !== fechaInicio,
        precio: sala.aireLibre ? crudo.festival.entradas.aireLibre : crudo.festival.entradas.general,
      }
    })
    .sort((a, b) => {
      if (a.inicio !== b.inicio) return a.inicio - b.inicio
      const cmpSala = a.sala.nombre.localeCompare(b.sala.nombre, 'es')
      if (cmpSala !== 0) return cmpSala
      return a.id.localeCompare(b.id, 'es')
    })

  const funcionesPorId = new Map(funciones.map((f) => [f.id, f]))
  const peliculas = [...crudo.peliculas]

  return {
    festival: crudo.festival,
    dias,
    salas: crudo.salas,
    secciones: crudo.secciones,
    peliculas,
    funciones,
    salaPorId(id) {
      const s = salasPorId.get(id)
      if (!s) throw new Error(`Sala inexistente: "${id}"`)
      return s
    },
    seccionPorId(id) {
      const s = seccionesPorId.get(id)
      if (!s) throw new Error(`Sección inexistente: "${id}"`)
      return s
    },
    peliculaPorId(id) {
      return peliculasPorId.get(id)
    },
    funcionPorId(id) {
      return funcionesPorId.get(id)
    },
    funcionesDePelicula(peliculaId) {
      return funciones.filter((f) => f.pelicula.id === peliculaId)
    },
    funcionesDelDia(slug) {
      return funciones.filter((f) => f.dia.slug === slug)
    },
    peliculasDeSeccion(seccionId) {
      return peliculas
        .filter((p) => p.seccion === seccionId)
        .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'))
    },
    traslado(desde, hasta) {
      const min = crudo.trasladosMin[desde]?.[hasta]
      if (typeof min !== 'number') {
        throw new Error(`Falta el traslado entre "${desde}" y "${hasta}"`)
      }
      return min
    },
  }
}

export const programa = construirPrograma(datos as ProgramaCrudo)
