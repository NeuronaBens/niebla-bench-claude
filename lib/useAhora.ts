"use client";

import { useSyncExternalStore } from "react";
import { ahoraEnChile } from "./tiempo";

function suscribir(fn: () => void) {
  const t = window.setInterval(fn, 30_000);
  return () => window.clearInterval(t);
}

/** Minutos de reloj en Chile; `null` durante el render en servidor. */
export function useAhora(): number | null {
  return useSyncExternalStore<number | null>(suscribir, ahoraEnChile, () => null);
}
