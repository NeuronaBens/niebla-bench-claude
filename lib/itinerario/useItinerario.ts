'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'
import { funcionesPorId, traslados } from '../programa'
import type { Funcion } from '../tipos'
import {
  agregar,
  alternar,
  consumirAvisoPersistencia,
  obtenerIds,
  obtenerIdsServidor,
  obtenerListo,
  obtenerListoServidor,
  obtenerPersistible,
  quitar,
  reemplazar,
  suscribirse,
  sumar,
  vaciar,
} from './almacen'
import { calcularAvisos } from './avisos'

export function useItinerario() {
  const ids = useSyncExternalStore(suscribirse, obtenerIds, obtenerIdsServidor)
  const listo = useSyncExternalStore(suscribirse, obtenerListo, obtenerListoServidor)

  const idsSet = useMemo(() => new Set(ids), [ids])

  const funciones = useMemo<Funcion[]>(
    () => ids.map((id) => funcionesPorId.get(id)).filter((f): f is Funcion => Boolean(f)),
    [ids]
  )

  const { avisos, tramos } = useMemo(() => calcularAvisos(funciones, traslados), [funciones])

  const estaEn = useCallback((id: string) => idsSet.has(id), [idsSet])

  return {
    ids,
    idsSet,
    funciones,
    listo,
    persistible: obtenerPersistible(),
    avisos,
    tramos,
    estaEn,
    agregar,
    quitar,
    alternar,
    reemplazar,
    sumar,
    vaciar,
    consumirAvisoPersistencia,
  }
}
