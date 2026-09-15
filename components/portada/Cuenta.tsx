"use client";

import { aMinutos, festival } from "@/lib/programa";
import { useAhora } from "@/lib/useAhora";

/** Cuenta regresiva en hora de Chile. En el servidor no muestra nada. */
export default function Cuenta({ className }: { className?: string }) {
  const ahora = useAhora();
  if (ahora === null) return <span className={className} aria-hidden="true">&nbsp;</span>;

  const inicio = aMinutos(festival.fechaInicio);
  const fin = aMinutos(festival.fechaFin) + 24 * 60;
  const dia = Math.floor(ahora / 1440);
  const diaInicio = Math.floor(inicio / 1440);

  let texto: string;
  if (ahora < inicio) {
    const faltan = diaInicio - dia;
    texto = faltan === 1 ? "Mañana empieza" : `Faltan ${faltan} días`;
  } else if (ahora < fin) {
    texto = `Hoy es el día ${dia - diaInicio + 1} del festival`;
  } else {
    texto = `Gracias por venir a la ${festival.edicion}ª edición`;
  }
  return <span className={className}>{texto}</span>;
}
