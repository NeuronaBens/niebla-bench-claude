"use client";

import { useSyncExternalStore } from "react";

/*
 * Lectura de los parámetros de la URL sin useSearchParams: así la página se
 * prerenderiza completa (con los filtros por defecto) y, al hidratar, toma los
 * de la URL. Los cambios usan la History API nativa, que Next.js integra con su
 * router.
 */

const EVENTO = "niebla:url";

function suscribir(fn: () => void) {
  window.addEventListener("popstate", fn);
  window.addEventListener(EVENTO, fn);
  return () => {
    window.removeEventListener("popstate", fn);
    window.removeEventListener(EVENTO, fn);
  };
}

/** `location.search` actual; `null` en el servidor y durante la hidratación. */
export function useBusqueda(): string | null {
  return useSyncExternalStore(
    suscribir,
    () => window.location.search,
    () => null,
  );
}

export function cambiarUrl(url: string, { agregarAlHistorial = false } = {}) {
  if (agregarAlHistorial) window.history.pushState(null, "", url);
  else window.history.replaceState(null, "", url);
  window.dispatchEvent(new Event(EVENTO));
}
