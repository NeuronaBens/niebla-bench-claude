"use client";

import { useState } from "react";
import type { Funcion } from "@/lib/programa";
import { etiquetaDia, hora } from "@/lib/tiempo";
import { useItinerario } from "@/lib/useItinerario";
import s from "./BotonMarcar.module.css";

export default function BotonMarcar({ f, compacto = false }: { f: Funcion; compacto?: boolean }) {
  const { tiene, alternar } = useItinerario();
  const [tocado, setTocado] = useState(false);
  const marcada = tiene(f.id);
  const cuando = `${etiquetaDia(f.dia)} a las ${hora(f.ini)}`;

  return (
    <button
      type="button"
      className={`${s.boton} ${compacto ? s.compacto : ""} ${tocado ? s.animar : ""}`}
      aria-pressed={marcada}
      aria-label={
        marcada
          ? `Quitar ${f.pelicula.titulo}, ${cuando}, de mi itinerario`
          : `Agregar ${f.pelicula.titulo}, ${cuando}, a mi itinerario`
      }
      onClick={() => {
        setTocado(true);
        alternar(f.id);
      }}
    >
      <span className={s.circulo} aria-hidden="true">
        <svg viewBox="0 0 24 24" className={s.icono}>
          <path className={s.mas} d="M12 5v14M5 12h14" />
          <path className={s.check} d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
        <span className={s.destello} />
      </span>
      <span className={s.texto} aria-hidden="true">
        {marcada ? "Voy" : "Ir"}
      </span>
    </button>
  );
}
