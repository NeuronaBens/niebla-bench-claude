"use client";

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { serializarIds, parsearIds } from "./itinerario";

const STORAGE_KEY = "niebla:itinerario";

interface Estado {
  ids: string[];
  listo: boolean;
}

// Estado global compartido por todos los componentes que usan el hook.
let estado: Estado = { ids: [], listo: false };
const ESTADO_SERVIDOR: Estado = { ids: [], listo: false };

let listeners: Array<() => void> = [];
let escuchandoStorage = false;

function suscribir(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function notificar(): void {
  listeners.forEach((l) => l());
}

function setEstado(parcial: Partial<Estado>): void {
  estado = { ...estado, ...parcial };
  notificar();
}

function leerStorage(): string[] {
  try {
    const str = localStorage.getItem(STORAGE_KEY);
    return str ? parsearIds(str) : [];
  } catch {
    return [];
  }
}

function guardar(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, serializarIds(ids));
  } catch {
    // localStorage no disponible: el estado queda solo en memoria.
  }
}

/** Lee localStorage una sola vez, después de hidratar. */
function inicializar(): void {
  if (estado.listo) return;
  setEstado({ ids: leerStorage(), listo: true });

  if (!escuchandoStorage) {
    escuchandoStorage = true;
    window.addEventListener("storage", (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setEstado({ ids: e.newValue ? parsearIds(e.newValue) : [] });
      }
    });
  }
}

function getSnapshot(): Estado {
  return estado;
}

function getServerSnapshot(): Estado {
  return ESTADO_SERVIDOR;
}

function cambiarIds(nuevos: string[]): void {
  guardar(nuevos);
  setEstado({ ids: nuevos });
}

export function useItinerario() {
  const { ids, listo } = useSyncExternalStore(suscribir, getSnapshot, getServerSnapshot);

  useEffect(() => {
    inicializar();
  }, []);

  const tiene = useCallback((id: string) => ids.includes(id), [ids]);

  const quitar = useCallback((id: string) => {
    if (estado.ids.includes(id)) cambiarIds(estado.ids.filter((x) => x !== id));
  }, []);

  const agregar = useCallback((id: string) => {
    if (!estado.ids.includes(id)) cambiarIds([...estado.ids, id]);
  }, []);

  const alternar = useCallback(
    (id: string) => {
      if (estado.ids.includes(id)) quitar(id);
      else agregar(id);
    },
    [agregar, quitar]
  );

  const agregarVarios = useCallback((nuevos: string[]) => {
    const unidos = [...new Set([...estado.ids, ...nuevos])];
    if (unidos.length !== estado.ids.length) cambiarIds(unidos);
  }, []);

  const vaciar = useCallback(() => {
    if (estado.ids.length > 0) cambiarIds([]);
  }, []);

  return { ids, listo, tiene, alternar, agregar, agregarVarios, quitar, vaciar };
}
