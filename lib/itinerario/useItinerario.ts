'use client'

import { useCallback, useSyncExternalStore } from 'react'
import type { FuncionId } from '../tipos'
import * as almacen from './almacen'

/**
 * Estado y acciones del itinerario, sincronizado con `localStorage` y entre
 * pestañas. Mientras `listo` es `false` (render de servidor e hidratación),
 * todo lo que dependa de esto debe mostrar un estado neutro de dimensiones
 * fijas, nunca un "0" o "Agregar" provisorio.
 */
export function useItinerario() {
  const estado = useSyncExternalStore(almacen.suscribir, almacen.obtenerSnapshot, almacen.obtenerSnapshotServidor)

  const agregar = useCallback((id: FuncionId) => almacen.agregar(id), [])
  const quitar = useCallback((id: FuncionId) => almacen.quitar(id), [])
  const alternar = useCallback((id: FuncionId) => almacen.alternar(id), [])
  const reemplazar = useCallback((ids: readonly FuncionId[]) => almacen.reemplazar(ids), [])
  const sumar = useCallback((ids: readonly FuncionId[]) => almacen.sumar(ids), [])
  const vaciar = useCallback(() => almacen.vaciar(), [])
  const tiene = useCallback((id: FuncionId) => estado.ids.includes(id), [estado.ids])

  return {
    ids: estado.ids,
    listo: estado.listo,
    persistente: estado.persistente,
    tiene,
    agregar,
    quitar,
    alternar,
    reemplazar,
    sumar,
    vaciar,
  }
}
