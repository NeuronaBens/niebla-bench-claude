"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { getFuncion } from "./datos";

const CLAVE = "niebla:itinerario:v1";

interface Contexto {
  ids: string[];
  listo: boolean;
  tiene(id: string): boolean;
  alternar(id: string): void;
  agregar(ids: string[]): void;
  quitar(id: string): void;
  vaciar(): void;
}

const ItinerarioContexto = createContext<Contexto | null>(null);

// ---------- Almacén externo (localStorage + suscriptores) ----------

const VACIO: string[] = [];
let cache: string[] | null = null;
const oyentes = new Set<() => void>();

function limpiar(lista: unknown): string[] {
  if (!Array.isArray(lista)) return [];
  const unicos = new Set<string>();
  for (const x of lista) {
    if (typeof x === "string" && getFuncion(x)) unicos.add(x);
  }
  return Array.from(unicos);
}

function leer(): string[] {
  try {
    const crudo = window.localStorage.getItem(CLAVE);
    return crudo ? limpiar(JSON.parse(crudo)) : [];
  } catch {
    return [];
  }
}

function obtener(): string[] {
  if (cache === null) cache = leer();
  return cache;
}

function avisar() {
  for (const fn of oyentes) fn();
}

function fijar(siguiente: string[]) {
  cache = limpiar(siguiente);
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(cache));
  } catch {
    // Sin almacenamiento (modo privado, cuota): el itinerario vive solo en memoria.
  }
  avisar();
}

function suscribir(fn: () => void) {
  oyentes.add(fn);
  const alCambiar = (e: StorageEvent) => {
    if (e.key === CLAVE || e.key === null) {
      cache = leer();
      avisar();
    }
  };
  window.addEventListener("storage", alCambiar);
  return () => {
    oyentes.delete(fn);
    window.removeEventListener("storage", alCambiar);
  };
}

const obtenerServidor = () => VACIO;
const listoCliente = () => true;
const listoServidor = () => false;

// ---------- Contexto React ----------

export function ItinerarioProvider({ children }: { children: ReactNode }) {
  const ids = useSyncExternalStore(suscribir, obtener, obtenerServidor);
  const listo = useSyncExternalStore(suscribir, listoCliente, listoServidor);

  const valor = useMemo<Contexto>(
    () => ({
      ids,
      listo,
      tiene: (id) => ids.includes(id),
      alternar: (id) => {
        const actual = obtener();
        fijar(actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id]);
      },
      agregar: (nuevos) => fijar([...obtener(), ...nuevos]),
      quitar: (id) => fijar(obtener().filter((x) => x !== id)),
      vaciar: () => fijar([]),
    }),
    [ids, listo],
  );

  return <ItinerarioContexto.Provider value={valor}>{children}</ItinerarioContexto.Provider>;
}

export function useItinerario(): Contexto {
  const ctx = useContext(ItinerarioContexto);
  if (!ctx) {
    throw new Error("useItinerario debe usarse dentro de <ItinerarioProvider>");
  }
  return ctx;
}
