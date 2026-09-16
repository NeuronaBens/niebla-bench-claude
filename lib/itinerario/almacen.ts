import type { EstadoItinerario, FuncionId } from '../tipos'
import { normalizarIds } from './reglas'

// Almacén externo de módulo (sin React) para el itinerario: localStorage con
// respaldo en memoria si no está disponible. Pensado para `useSyncExternalStore`:
// `obtenerSnapshot` devuelve siempre la misma referencia mientras no cambie.

const CLAVE = 'festival-niebla:itinerario:v1'
const CLAVE_PRUEBA = 'festival-niebla:prueba'

type Suscriptor = () => void

const SNAPSHOT_SERVIDOR: EstadoItinerario = Object.freeze({
  ids: Object.freeze([] as FuncionId[]),
  listo: false,
  persistente: true,
}) as EstadoItinerario

let ids: FuncionId[] = []
let persistente = true
let inicializado = false
let snapshot: EstadoItinerario = SNAPSHOT_SERVIDOR
const suscriptores = new Set<Suscriptor>()

function congelar(idsNuevos: FuncionId[]): EstadoItinerario {
  return Object.freeze({ ids: Object.freeze([...idsNuevos]), listo: true, persistente }) as EstadoItinerario
}

function idsDesdeValorGuardado(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.filter((v): v is string => typeof v === 'string')
  if (valor && typeof valor === 'object') {
    const posible = (valor as { ids?: unknown }).ids
    if (Array.isArray(posible)) return posible.filter((v): v is string => typeof v === 'string')
  }
  return []
}

function probarDisponibilidad(): boolean {
  try {
    window.localStorage.setItem(CLAVE_PRUEBA, '1')
    window.localStorage.removeItem(CLAVE_PRUEBA)
    return true
  } catch {
    return false
  }
}

function leerDeAlmacen(): string[] {
  try {
    const bruto = window.localStorage.getItem(CLAVE)
    if (bruto == null) return []
    return idsDesdeValorGuardado(JSON.parse(bruto))
  } catch {
    return []
  }
}

function escribirEnAlmacen(idsAEscribir: FuncionId[]): void {
  if (!persistente) return
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify({ v: 1, ids: idsAEscribir }))
  } catch {
    persistente = false
  }
}

function notificar(): void {
  for (const fn of suscriptores) fn()
}

function inicializar(): void {
  if (inicializado) return
  inicializado = true
  persistente = probarDisponibilidad()
  const guardados = persistente ? leerDeAlmacen() : []
  const { validos, invalidos } = normalizarIds(guardados)
  ids = validos.map((f) => f.id)
  if (invalidos.length > 0) escribirEnAlmacen(ids)
  snapshot = congelar(ids)

  window.addEventListener('storage', (evento) => {
    if (evento.storageArea !== window.localStorage) return
    if (evento.key !== CLAVE && evento.key !== null) return
    const { validos: validosAhora } = normalizarIds(persistente ? leerDeAlmacen() : [])
    ids = validosAhora.map((f) => f.id)
    snapshot = congelar(ids)
    notificar()
  })
}

function actualizar(idsPropuestos: FuncionId[]): void {
  const { validos } = normalizarIds(idsPropuestos)
  const resultado = validos.map((f) => f.id)
  const sinCambios = resultado.length === ids.length && resultado.every((id, i) => id === ids[i])
  if (sinCambios) return
  ids = resultado
  escribirEnAlmacen(ids)
  snapshot = congelar(ids)
  notificar()
}

export function suscribir(fn: Suscriptor): () => void {
  inicializar()
  suscriptores.add(fn)
  return () => {
    suscriptores.delete(fn)
  }
}

export function obtenerSnapshot(): EstadoItinerario {
  inicializar()
  return snapshot
}

export function obtenerSnapshotServidor(): EstadoItinerario {
  return SNAPSHOT_SERVIDOR
}

export function agregar(id: FuncionId): void {
  inicializar()
  actualizar([...ids, id])
}

export function quitar(id: FuncionId): void {
  inicializar()
  actualizar(ids.filter((existente) => existente !== id))
}

export function alternar(id: FuncionId): void {
  inicializar()
  if (ids.includes(id)) quitar(id)
  else agregar(id)
}

export function reemplazar(idsNuevos: readonly FuncionId[]): void {
  inicializar()
  actualizar([...idsNuevos])
}

export function sumar(idsNuevos: readonly FuncionId[]): void {
  inicializar()
  actualizar([...ids, ...idsNuevos])
}

/** Vacía el itinerario y devuelve los ids previos, para poder deshacer. */
export function vaciar(): FuncionId[] {
  inicializar()
  const previos = [...ids]
  actualizar([])
  return previos
}
