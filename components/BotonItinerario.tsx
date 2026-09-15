"use client";

import { etiquetaFuncion, type Funcion } from "@/lib/datos";
import { useItinerario } from "@/lib/almacen";
import styles from "./BotonItinerario.module.css";

export interface BotonItinerarioProps {
  funcion: Funcion;
  compacto?: boolean;
}

function IconoMas() {
  return (
    <svg className={styles.icono} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconoCheck() {
  return (
    <svg className={styles.icono} viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M3 8.5l3.2 3.2L13 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function BotonItinerario({ funcion, compacto = false }: BotonItinerarioProps) {
  const { listo, tiene, alternar } = useItinerario();
  const elegida = listo && tiene(funcion.id);

  const texto = elegida
    ? compacto
      ? "Elegida"
      : "En mi itinerario"
    : compacto
      ? "Agregar"
      : "Agregar a mi itinerario";

  const clases = [styles.boton, compacto && styles.compacto, elegida && styles.elegida].filter(Boolean).join(" ");

  return (
    <button
      type="button"
      className={clases}
      aria-pressed={elegida}
      aria-busy={listo ? undefined : true}
      onClick={() => alternar(funcion.id)}
    >
      {elegida ? <IconoCheck /> : <IconoMas />}
      <span>{texto}</span>
      <span className="visually-hidden">
        : {funcion.pelicula.titulo}, {etiquetaFuncion(funcion)}
        {funcion.agotada ? " (agotada)" : ""}
      </span>
    </button>
  );
}
