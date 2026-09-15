"use client";

import { useMemo, useSyncExternalStore } from "react";
import { aMinutos, ahoraEnMinutosFestival } from "@/lib/programa";

/*
 * Reloj del festival en minutos absolutos (ver lib/programa.ts).
 * Devuelve null en el servidor y durante la hidratación; luego se actualiza cada 30 s.
 */

function suscribir(avisar: () => void) {
  const id = window.setInterval(avisar, 30_000);
  const alVolver = () => {
    if (document.visibilityState === "visible") avisar();
  };
  document.addEventListener("visibilitychange", alVolver);
  return () => {
    window.clearInterval(id);
    document.removeEventListener("visibilitychange", alVolver);
  };
}

const minutoActual = () => Math.floor(Date.now() / 60_000);
const sinReloj = () => null;

/**
 * @param simulado "2026-10-17T18:10" para probar el programa "durante" el festival
 *                 (solo se respeta fuera de producción).
 */
export function useAhora(simulado?: string | null): number | null {
  const minuto = useSyncExternalStore<number | null>(suscribir, minutoActual, sinReloj);
  return useMemo(() => {
    if (minuto === null) return null;
    if (simulado && process.env.NODE_ENV !== "production" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(simulado)) {
      return aMinutos(simulado);
    }
    return ahoraEnMinutosFestival(new Date(minuto * 60_000));
  }, [minuto, simulado]);
}
