"use client";

import { useCallback, useSyncExternalStore } from "react";
import { normalizar } from "./itinerario";

const CLAVE = "niebla:itinerario:v1";
const VACIO: string[] = [];

let crudo: string | null | undefined;
let cache: string[] = VACIO;
const oyentes = new Set<() => void>();

function leer(): string[] {
  let valor: string | null = null;
  try {
    valor = window.localStorage.getItem(CLAVE);
  } catch {
    valor = null;
  }
  if (valor === crudo) return cache;
  crudo = valor;
  try {
    const parsed = valor ? JSON.parse(valor) : [];
    cache = Array.isArray(parsed) ? normalizar(parsed.filter((x) => typeof x === "string")) : VACIO;
  } catch {
    cache = VACIO;
  }
  return cache;
}

function avisar() {
  oyentes.forEach((fn) => fn());
}

function suscribir(fn: () => void) {
  oyentes.add(fn);
  const alCambiarEnOtraPestana = (e: StorageEvent) => {
    if (e.key === CLAVE) fn();
  };
  window.addEventListener("storage", alCambiarEnOtraPestana);
  return () => {
    oyentes.delete(fn);
    window.removeEventListener("storage", alCambiarEnOtraPestana);
  };
}

export function guardarItinerario(ids: readonly string[]) {
  const limpio = normalizar(ids);
  const texto = JSON.stringify(limpio);
  try {
    window.localStorage.setItem(CLAVE, texto);
    crudo = texto;
    cache = limpio;
  } catch {
    // Sin almacenamiento (modo privado estricto): al menos vive en memoria.
    crudo = texto;
    cache = limpio;
  }
  avisar();
}

export function useItinerario() {
  const ids = useSyncExternalStore(suscribir, leer, () => VACIO);

  const tiene = useCallback((id: string) => ids.includes(id), [ids]);

  const alternar = useCallback((id: string) => {
    const actual = leer();
    guardarItinerario(actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]);
  }, []);

  const quitar = useCallback((id: string) => {
    guardarItinerario(leer().filter((x) => x !== id));
  }, []);

  const agregar = useCallback((nuevos: readonly string[]) => {
    guardarItinerario([...leer(), ...nuevos]);
  }, []);

  const reemplazar = useCallback((nuevos: readonly string[]) => {
    guardarItinerario(nuevos);
  }, []);

  return { ids, tiene, alternar, quitar, agregar, reemplazar };
}

const noSuscribir = () => () => {};

/** `true` sólo después de hidratar en el navegador. */
export function useHidratado(): boolean {
  return useSyncExternalStore(
    noSuscribir,
    () => true,
    () => false,
  );
}
