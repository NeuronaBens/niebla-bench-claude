"use client";

import { useSyncExternalStore } from "react";
import { ahoraEnMinutosFestival } from "@/lib/programa";

/**
 * Minuto actual del festival (hora de Chile), actualizado cada 30 s.
 * null en el servidor y durante la hidratación.
 */
function suscribir(aviso: () => void) {
  const t = window.setInterval(aviso, 30_000);
  return () => window.clearInterval(t);
}

export function useMinutoFestival(): number | null {
  return useSyncExternalStore(suscribir, ahoraEnMinutosFestival, () => null);
}
