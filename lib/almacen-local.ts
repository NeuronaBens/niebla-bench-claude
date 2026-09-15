"use client";

import { useSyncExternalStore } from "react";

/**
 * Almacén pequeño respaldado en localStorage, pensado para useSyncExternalStore.
 * En el servidor (y durante la hidratación) entrega siempre el valor por defecto,
 * así el HTML inicial coincide y no hay saltos.
 */
export type Almacen<T> = {
  get: () => T;
  getServidor: () => T;
  suscribir: (avisar: () => void) => () => void;
  set: (valor: T | ((previo: T) => T)) => void;
};

export function crearAlmacen<T>(clave: string, defecto: T, validar: (crudo: unknown) => T | null): Almacen<T> {
  let cache: T | undefined;
  const oyentes = new Set<() => void>();

  const leer = (): T => {
    try {
      const crudo = window.localStorage.getItem(clave);
      if (crudo === null) return defecto;
      return validar(JSON.parse(crudo)) ?? defecto;
    } catch {
      return defecto;
    }
  };

  const avisarTodos = () => {
    for (const oyente of oyentes) oyente();
  };

  const alCambiarStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== clave) return;
    cache = leer();
    avisarTodos();
  };

  return {
    get: () => {
      if (cache === undefined) cache = leer();
      return cache;
    },
    getServidor: () => defecto,
    suscribir: (avisar) => {
      oyentes.add(avisar);
      if (oyentes.size === 1) window.addEventListener("storage", alCambiarStorage);
      return () => {
        oyentes.delete(avisar);
        if (oyentes.size === 0) window.removeEventListener("storage", alCambiarStorage);
      };
    },
    set: (valor) => {
      const previo = cache === undefined ? leer() : cache;
      const siguiente = typeof valor === "function" ? (valor as (p: T) => T)(previo) : valor;
      cache = siguiente;
      try {
        window.localStorage.setItem(clave, JSON.stringify(siguiente));
      } catch {
        // Sin almacenamiento disponible: el valor vive solo en memoria.
      }
      avisarTodos();
    },
  };
}

export function useAlmacen<T>(almacen: Almacen<T>): T {
  return useSyncExternalStore(almacen.suscribir, almacen.get, almacen.getServidor);
}

const suscribirNada = () => () => {};

/** Falso en el servidor y durante la hidratación; verdadero después. */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    suscribirNada,
    () => true,
    () => false,
  );
}
