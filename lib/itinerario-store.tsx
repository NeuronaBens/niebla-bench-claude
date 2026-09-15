"use client";

import { useMemo } from "react";
import { crearAlmacen, useAlmacen, useHidratado } from "./almacen-local";
import { funcion } from "./datos";

const CLAVE = "niebla-itinerario-v1";
const VACIO: string[] = [];

const almacen = crearAlmacen<string[]>(CLAVE, VACIO, (crudo) => {
  if (!Array.isArray(crudo)) return null;
  return crudo.filter((x): x is string => typeof x === "string" && Boolean(funcion(x)));
});

export type Itinerario = {
  ids: string[];
  /** Falso hasta que el navegador leyó lo guardado. */
  cargado: boolean;
  tiene: (id: string) => boolean;
  agregar: (id: string) => void;
  quitar: (id: string) => void;
  alternar: (id: string) => void;
  agregarVarias: (ids: string[]) => void;
  reemplazar: (ids: string[]) => void;
  vaciar: () => void;
};

export function useItinerario(): Itinerario {
  const ids = useAlmacen(almacen);
  const cargado = useHidratado();

  return useMemo(
    () => ({
      ids,
      cargado,
      tiene: (id) => ids.includes(id),
      agregar: (id) => almacen.set((prev) => (prev.includes(id) || !funcion(id) ? prev : [...prev, id])),
      quitar: (id) => almacen.set((prev) => prev.filter((x) => x !== id)),
      alternar: (id) =>
        almacen.set((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
      agregarVarias: (nuevos) =>
        almacen.set((prev) => {
          const conjunto = new Set(prev);
          for (const id of nuevos) if (funcion(id)) conjunto.add(id);
          return [...conjunto];
        }),
      reemplazar: (nuevos) => almacen.set(nuevos.filter((id) => Boolean(funcion(id)))),
      vaciar: () => almacen.set(VACIO),
    }),
    [ids, cargado],
  );
}
