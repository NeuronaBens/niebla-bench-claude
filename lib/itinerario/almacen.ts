// Almacén externo del itinerario (sin React), pensado para `useSyncExternalStore`.
// Guarda en `localStorage` bajo la clave `niebla.itinerario.v1`. Sin cuentas ni registro.
import { funcionesPorId } from '../programa'

const CLAVE = 'niebla.itinerario.v1'
const IDS_VACIO: string[] = []

let ids: string[] = IDS_VACIO
let persistible = true
let listo = false
let avisoPersistenciaMostrado = false
let listenerStorageAgregado = false

const listeners = new Set<() => void>()

function mismasListas(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((valor, indice) => valor === b[indice])
}

function normalizar(lista: string[]): string[] {
  const vistos = new Set<string>()
  const validas: { id: string; inicioMin: number }[] = []
  for (const id of lista) {
    if (vistos.has(id)) continue
    const funcion = funcionesPorId.get(id)
    if (!funcion) continue
    vistos.add(id)
    validas.push({ id, inicioMin: funcion.inicioMin })
  }
  validas.sort((a, b) => a.inicioMin - b.inicioMin || a.id.localeCompare(b.id))
  return validas.map((v) => v.id)
}

function leerStorage(): string[] {
  // Leer y acceder a `localStorage` son dos fallas distintas: si `getItem` lanza, no hay
  // acceso real al almacenamiento (eso sí afecta `persistible`). Si el dato guardado es un
  // JSON inválido o con forma inesperada, es solo un dato corrupto: no significa que no se
  // pueda guardar, así que no toca `persistible`.
  let bruto: string | null
  try {
    bruto = window.localStorage.getItem(CLAVE)
  } catch {
    persistible = false
    return []
  }

  if (!bruto) return []

  try {
    const data: unknown = JSON.parse(bruto)
    if (
      !data ||
      typeof data !== 'object' ||
      (data as { version?: unknown }).version !== 1 ||
      !Array.isArray((data as { ids?: unknown }).ids)
    ) {
      return []
    }
    return ((data as { ids: unknown[] }).ids).filter((x): x is string => typeof x === 'string')
  } catch {
    return []
  }
}

function guardar(): void {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify({ version: 1, ids }))
  } catch {
    persistible = false
  }
}

function notificar(): void {
  listeners.forEach((l) => l())
}

function manejarEventoStorage(evento: StorageEvent): void {
  if (evento.key !== null && evento.key !== CLAVE) return
  const nuevas = normalizar(leerStorage())
  if (!mismasListas(nuevas, ids)) {
    ids = nuevas
    notificar()
  }
}

function inicializar(): void {
  if (listo) return
  ids = normalizar(leerStorage())
  listo = true
  if (!listenerStorageAgregado && typeof window !== 'undefined') {
    window.addEventListener('storage', manejarEventoStorage)
    listenerStorageAgregado = true
  }
}

export function suscribirse(listener: () => void): () => void {
  inicializar()
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function obtenerIds(): string[] {
  return ids
}

export function obtenerIdsServidor(): string[] {
  return IDS_VACIO
}

export function obtenerListo(): boolean {
  return listo
}

export function obtenerListoServidor(): boolean {
  return false
}

export function obtenerPersistible(): boolean {
  return persistible
}

export function consumirAvisoPersistencia(): boolean {
  if (persistible || avisoPersistenciaMostrado) return false
  avisoPersistenciaMostrado = true
  return true
}

function aplicar(nuevaLista: string[]): string[] {
  const anterior = ids
  const normalizada = normalizar(nuevaLista)
  if (!mismasListas(normalizada, anterior)) {
    ids = normalizada
    guardar()
    notificar()
  }
  return anterior
}

export function agregar(id: string): string[] {
  return aplicar([...ids, id])
}

export function quitar(id: string): string[] {
  return aplicar(ids.filter((x) => x !== id))
}

export function alternar(id: string): string[] {
  return ids.includes(id) ? quitar(id) : agregar(id)
}

export function reemplazar(lista: string[]): string[] {
  return aplicar(lista)
}

export function sumar(lista: string[]): string[] {
  return aplicar([...ids, ...lista])
}

export function vaciar(): string[] {
  return aplicar([])
}
