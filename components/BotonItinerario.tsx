"use client";

import { useItinerario } from "@/lib/useItinerario";
import styles from "./BotonItinerario.module.css";

interface BotonItinerarioProps {
  funcionId: string;
  compacto?: boolean;
}

export default function BotonItinerario({ funcionId, compacto }: BotonItinerarioProps) {
  const { tiene, alternar, listo } = useItinerario();
  const enItinerario = tiene(funcionId);

  return (
    <button
      onClick={() => alternar(funcionId)}
      disabled={!listo}
      aria-pressed={enItinerario}
      aria-label={enItinerario ? "Quitar de mi itinerario" : "Agregar a mi itinerario"}
      className={`${styles.boton} ${enItinerario ? styles.quitar : ""} ${compacto ? styles.compacto : ""}`}
    >
      {compacto
        ? enItinerario ? "Quitar" : "Agregar"
        : enItinerario ? "Quitar de mi itinerario" : "Agregar a mi itinerario"}
    </button>
  );
}
