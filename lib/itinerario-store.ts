// Tienda externa para useSyncExternalStore: el itinerario elegido, guardado en
// localStorage. Solo la importan Client Components.

import type { EstadoItinerario } from './tipos.ts'

const CLAVE = 'niebla:itinerario:v1'

export interface AlmacenSimple {
  getItem(clave: string): string | null
  setItem(clave: string, valor: string): void
  removeItem(clave: string): void
}

interface DatosGuardados {
  v: 1
  ids: string[]
}

function leer(almacen: AlmacenSimple | null, idsValidos: Set<string>): string[] {
  if (!almacen) return []
  try {
    const crudo = almacen.getItem(CLAVE)
    if (!crudo) return []
    const datos = JSON.parse(crudo) as Partial<DatosGuardados>
    if (datos.v !== 1 || !Array.isArray(datos.ids)) return []
    const vistos = new Set<string>()
    const ids: string[] = []
    for (const id of datos.ids) {
      if (typeof id !== 'string') continue
      if (!idsValidos.has(id)) continue
      if (vistos.has(id)) continue
      vistos.add(id)
      ids.push(id)
    }
    return ids
  } catch {
    return []
  }
}

function probarPersistencia(almacen: AlmacenSimple | null): boolean {
  if (!almacen) return false
  try {
    almacen.setItem('niebla:prueba', '1')
    almacen.removeItem('niebla:prueba')
    return true
  } catch {
    return false
  }
}

export interface TiendaItinerario {
  suscribir(callback: () => void): () => void
  obtenerEstado(): EstadoItinerario
  obtenerEstadoServidor(): EstadoItinerario
  agregar(id: string): void
  quitar(id: string): void
  alternar(id: string): void
  vaciar(): void
  reemplazar(ids: string[]): void
  unir(ids: string[]): void
}

const ESTADO_SERVIDOR: EstadoItinerario = { ids: [], persistente: true }

export function crearTienda(almacen: AlmacenSimple | null, idsValidos: Set<string>): TiendaItinerario {
  let persistente = probarPersistencia(almacen)
  let ids: string[] = leer(almacen, idsValidos)
  let estadoCacheado: EstadoItinerario = { ids, persistente }
  const listeners = new Set<() => void>()

  function guardar() {
    if (!almacen) return
    try {
      const datos: DatosGuardados = { v: 1, ids }
      almacen.setItem(CLAVE, JSON.stringify(datos))
    } catch {
      // Falló después de la prueba inicial (p. ej. se llenó la cuota): se avisa.
      if (persistente) {
        persistente = false
        estadoCacheado = { ids, persistente }
      }
    }
  }

  function fijar(nuevosIds: string[]) {
    ids = nuevosIds
    estadoCacheado = { ids, persistente }
    guardar()
    for (const cb of listeners) cb()
  }

  function alListenerDeStorage(evento: StorageEvent) {
    if (evento.key !== null && evento.key !== CLAVE) return
    const nuevos = leer(almacen, idsValidos)
    ids = nuevos
    estadoCacheado = { ids, persistente }
    for (const cb of listeners) cb()
  }

  return {
    suscribir(callback) {
      if (listeners.size === 0 && typeof window !== 'undefined') {
        window.addEventListener('storage', alListenerDeStorage)
      }
      listeners.add(callback)
      return () => {
        listeners.delete(callback)
        if (listeners.size === 0 && typeof window !== 'undefined') {
          window.removeEventListener('storage', alListenerDeStorage)
        }
      }
    },
    obtenerEstado() {
      return estadoCacheado
    },
    obtenerEstadoServidor() {
      return ESTADO_SERVIDOR
    },
    agregar(id) {
      if (ids.includes(id)) return
      fijar([...ids, id])
    },
    quitar(id) {
      if (!ids.includes(id)) return
      fijar(ids.filter((x) => x !== id))
    },
    alternar(id) {
      if (ids.includes(id)) {
        fijar(ids.filter((x) => x !== id))
      } else {
        fijar([...ids, id])
      }
    },
    vaciar() {
      fijar([])
    },
    reemplazar(nuevosIds) {
      const vistos = new Set<string>()
      const limpios: string[] = []
      for (const id of nuevosIds) {
        if (vistos.has(id)) continue
        vistos.add(id)
        limpios.push(id)
      }
      fijar(limpios)
    },
    unir(otrosIds) {
      const vistos = new Set(ids)
      const combinados = [...ids]
      for (const id of otrosIds) {
        if (vistos.has(id)) continue
        vistos.add(id)
        combinados.push(id)
      }
      fijar(combinados)
    },
  }
}

let tiendaSitio: TiendaItinerario | null = null

export function obtenerTiendaSitio(idsValidos: Set<string>): TiendaItinerario {
  if (!tiendaSitio) {
    let almacen: AlmacenSimple | null = null
    try {
      almacen = globalThis.localStorage ?? null
    } catch {
      almacen = null
    }
    tiendaSitio = crearTienda(almacen, idsValidos)
  }
  return tiendaSitio
}
