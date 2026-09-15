"use client";

/**
 * Estado del itinerario personal, guardado en localStorage.
 * Usa useSyncExternalStore: en el servidor y durante la hidratación el itinerario
 * está vacío; justo después se sincroniza con lo guardado. Se mantiene sincronizado
 * entre pestañas con el evento "storage".
 */
import { useCallback, useSyncExternalStore } from "react";
import { limpiarIds } from "@/lib/itinerario";

const CLAVE = "niebla:itinerario:v1";
const VACIO: readonly string[] = Object.freeze([]);

type Oyente = () => void;
const oyentes = new Set<Oyente>();

let cacheCrudo: string | null | undefined;
let cacheIds: readonly string[] = VACIO;
/** true si localStorage falló al escribir: desde ahí el estado vive solo en memoria. */
let soloMemoria = false;

function leer(): readonly string[] {
  if (soloMemoria) return cacheIds;
  let crudo: string | null = null;
  try {
    crudo = window.localStorage.getItem(CLAVE);
  } catch {
    crudo = null;
  }
  if (crudo === cacheCrudo) return cacheIds;
  cacheCrudo = crudo;
  try {
    const parsed: unknown = crudo ? JSON.parse(crudo) : [];
    const ids = Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
    cacheIds = Object.freeze(limpiarIds(ids).validos);
  } catch {
    cacheIds = VACIO;
  }
  return cacheIds;
}

function escribir(ids: readonly string[]) {
  const limpios = limpiarIds(ids).validos;
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(limpios));
  } catch {
    // Sin almacenamiento (modo privado estricto o lleno): mantenemos el estado en memoria.
    soloMemoria = true;
    cacheCrudo = JSON.stringify(limpios);
    cacheIds = Object.freeze(limpios);
  }
  oyentes.forEach((o) => o());
}

function suscribir(oyente: Oyente) {
  oyentes.add(oyente);
  const alCambiarStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === CLAVE) oyente();
  };
  window.addEventListener("storage", alCambiarStorage);
  return () => {
    oyentes.delete(oyente);
    window.removeEventListener("storage", alCambiarStorage);
  };
}

const snapshotServidor = () => VACIO;

export interface ControlItinerario {
  /** Ids de funciones elegidas (orden de inserción). */
  ids: readonly string[];
  /** false durante SSR/hidratación: úsalo para no mostrar "vacío" antes de leer localStorage. */
  listo: boolean;
  tiene: (id: string) => boolean;
  agregar: (id: string) => void;
  quitar: (id: string) => void;
  /** Agrega si no está, quita si está. Devuelve true si quedó agregada. */
  alternar: (id: string) => boolean;
  /** Reemplaza todo el itinerario. */
  reemplazar: (ids: readonly string[]) => void;
  /** Suma ids al itinerario actual (sin duplicar). */
  combinar: (ids: readonly string[]) => void;
  vaciar: () => void;
}

const suscribirNada = () => () => {};

/** true solo en el cliente después de hidratar. */
export function useMontado(): boolean {
  return useSyncExternalStore(
    suscribirNada,
    () => true,
    () => false,
  );
}

export function useItinerario(): ControlItinerario {
  const ids = useSyncExternalStore(suscribir, leer, snapshotServidor);
  const listo = useMontado();

  const tiene = useCallback((id: string) => ids.includes(id), [ids]);
  const agregar = useCallback((id: string) => {
    const act = leer();
    if (!act.includes(id)) escribir([...act, id]);
  }, []);
  const quitar = useCallback((id: string) => {
    escribir(leer().filter((x) => x !== id));
  }, []);
  const alternar = useCallback((id: string) => {
    const act = leer();
    if (act.includes(id)) {
      escribir(act.filter((x) => x !== id));
      return false;
    }
    escribir([...act, id]);
    return true;
  }, []);
  const reemplazar = useCallback((nuevos: readonly string[]) => escribir(nuevos), []);
  const combinar = useCallback((nuevos: readonly string[]) => escribir([...leer(), ...nuevos]), []);
  const vaciar = useCallback(() => escribir([]), []);

  return { ids, listo, tiene, agregar, quitar, alternar, reemplazar, combinar, vaciar };
}
