'use client'

import { useSyncExternalStore } from 'react'
import { obtenerTiendaSitio } from '@/lib/itinerario-store'
import { programa } from '@/lib/programa'
import type { EstadoItinerario } from '@/lib/tipos'

const idsValidos = new Set(programa.funciones.map((f) => f.id))

export interface Itinerario extends EstadoItinerario {
  agregar(id: string): void
  quitar(id: string): void
  alternar(id: string): void
  vaciar(): void
  reemplazar(ids: string[]): void
  unir(ids: string[]): void
}

export function useItinerario(): Itinerario {
  const tienda = obtenerTiendaSitio(idsValidos)
  const estado = useSyncExternalStore(tienda.suscribir, tienda.obtenerEstado, tienda.obtenerEstadoServidor)

  return {
    ...estado,
    agregar: tienda.agregar,
    quitar: tienda.quitar,
    alternar: tienda.alternar,
    vaciar: tienda.vaciar,
    reemplazar: tienda.reemplazar,
    unir: tienda.unir,
  }
}
