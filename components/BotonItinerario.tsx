"use client";

import { useItinerario } from "@/lib/itinerario-store";
import styles from "./BotonItinerario.module.css";

type Props = {
  funcionId: string;
  titulo: string;
  /** Muestra el texto junto al ícono. */
  conTexto?: boolean;
  className?: string;
};

export function BotonItinerario({ funcionId, titulo, conTexto = true, className }: Props) {
  const { tiene, alternar, cargado } = useItinerario();
  const elegida = cargado && tiene(funcionId);

  return (
    <button
      type="button"
      className={[styles.boton, elegida ? styles.elegida : "", conTexto ? styles.conTexto : "", className]
        .filter(Boolean)
        .join(" ")}
      aria-pressed={elegida}
      aria-label={elegida ? `Quitar ${titulo} de mi itinerario` : `Agregar ${titulo} a mi itinerario`}
      onClick={() => alternar(funcionId)}
      disabled={!cargado}
    >
      <span className={styles.icono} aria-hidden="true">
        <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {elegida ? <path d="M4 10.5l4 4 8-9" /> : <path d="M10 4v12M4 10h12" />}
        </svg>
      </span>
      {conTexto && <span className={styles.texto}>{elegida ? "En mi itinerario" : "Agregar"}</span>}
    </button>
  );
}
