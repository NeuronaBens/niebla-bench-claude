'use client';

import React, { ReactNode, useSyncExternalStore, useCallback } from 'react';
import { leerItinerario, escribirItinerario } from '@/lib/almacenamiento';
import { getFuncion } from '@/lib/datos';

export interface ItinerarioContextType {
  funcionesElegidas: string[];
  agregar: (id: string) => void;
  quitar: (id: string) => void;
  vaciar: () => void;
  tieneFuncion: (id: string) => boolean;
  cargado: boolean;
  disponible: boolean;
}

export const ItinerarioContext = React.createContext<ItinerarioContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

class ItinerarioStore {
  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitChange() {
    this.listeners.forEach(listener => listener());
  }

  getSnapshot() {
    const { ids, disponible } = leerItinerario();
    const idsValidos = ids.filter(id => getFuncion(id) !== undefined);
    return { ids: idsValidos, disponible };
  }

  getServerSnapshot() {
    return { ids: [], disponible: true };
  }

  setIds(ids: string[]) {
    escribirItinerario(ids);
    this.emitChange();
  }
}

const store = new ItinerarioStore();

export default function ItinerarioProvider({ children }: Props) {
  const snapshot = useSyncExternalStore(
    (listener) => store.subscribe(listener),
    () => store.getSnapshot(),
    () => store.getServerSnapshot()
  );

  const agregar = useCallback((id: string) => {
    if (!getFuncion(id)) return;
    const current = store.getSnapshot().ids;
    if (current.includes(id)) return;
    const nuevas = [...current, id];
    store.setIds(nuevas);
    anunciarCambio(id, true, nuevas);
  }, []);

  const quitar = useCallback((id: string) => {
    const current = store.getSnapshot().ids;
    const nuevas = current.filter(x => x !== id);
    store.setIds(nuevas);
    anunciarCambio(id, false, nuevas);
  }, []);

  const vaciar = useCallback(() => {
    store.setIds([]);
  }, []);

  const tieneFuncion = useCallback((id: string) => {
    return snapshot.ids.includes(id);
  }, [snapshot.ids]);

  const value: ItinerarioContextType = {
    funcionesElegidas: snapshot.ids,
    agregar,
    quitar,
    vaciar,
    tieneFuncion,
    cargado: true,
    disponible: snapshot.disponible,
  };

  return (
    <ItinerarioContext.Provider value={value}>
      {children}
    </ItinerarioContext.Provider>
  );
}

function anunciarCambio(id: string, agregada: boolean, itinerario: string[]) {
  if (typeof window === 'undefined') return;

  const funcion = getFuncion(id);
  if (!funcion) return;

  const regionAnuncios = document.getElementById('anuncios-itinerario');
  if (!regionAnuncios) return;

  let msg = '';
  if (agregada) {
    msg = `Agregada "${funcion.pelicula.titulo}" a tu itinerario.`;
  } else {
    msg = `Quitada "${funcion.pelicula.titulo}".`;
  }

  msg += ` Tu itinerario tiene ${itinerario.length} función${itinerario.length !== 1 ? 's' : ''}.`;
  regionAnuncios.textContent = msg;
}
