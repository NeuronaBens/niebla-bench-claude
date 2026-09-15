"use client";

/**
 * Badge con el número de funciones del itinerario (para el header).
 * No muestra nada si está vacío o antes de hidratar. Late un poco cuando cambia
 * el número por una acción (no al cargar la página).
 */
import { useState } from "react";
import { useItinerario } from "@/lib/useItinerario";
import s from "./ContadorItinerario.module.css";

export default function ContadorItinerario({ className }: { className?: string }) {
  const { ids, listo } = useItinerario();
  const n = ids.length;
  const [visto, setVisto] = useState<number | null>(null);
  const [pulso, setPulso] = useState(0);

  // Estado derivado durante el render (patrón recomendado por React en vez de un efecto).
  if (listo && visto !== n) {
    if (visto !== null) setPulso((p) => p + 1);
    setVisto(n);
  }

  if (!listo || n === 0) return null;

  return (
    <span className={[s.contador, className].filter(Boolean).join(" ")}>
      <span key={pulso} className={s.numero} data-pulso={pulso > 0 ? "si" : undefined} aria-hidden="true">
        {n}
      </span>
      <span className="sr-only">{n === 1 ? "1 función en tu itinerario" : `${n} funciones en tu itinerario`}</span>
    </span>
  );
}
