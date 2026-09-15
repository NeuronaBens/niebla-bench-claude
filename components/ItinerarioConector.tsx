"use client";

import type { ReactNode } from "react";
import { formatoDuracion } from "@/lib/datos";
import type { Aviso, Hueco } from "@/lib/itinerario";
import { IconoAviso, IconoCaminar, IconoSala } from "./ItinerarioIconos";
import styles from "./ItinerarioConector.module.css";

export interface ItinerarioConectorProps {
  /** Aviso entre dos funciones consecutivas (si lo hay). */
  aviso?: Aviso;
  /** Hueco entre dos funciones consecutivas sin problema (si lo hay). */
  hueco?: Hueco;
}

function textoHueco(h: Hueco): ReactNode {
  const despues = h.desde.conversatorioMin != null ? " después del conversatorio" : "";
  if (h.minutosCaminando === 0) {
    return (
      <>
        Misma sala · <strong className={styles.dato}>{formatoDuracion(h.minutosLibres)}</strong> libres{despues}
      </>
    );
  }
  const sobran = h.minutosLibres - h.minutosCaminando;
  return (
    <>
      <strong className={styles.dato}>{h.minutosCaminando} min</strong> caminando de {h.desde.sala.corto} a{" "}
      {h.hasta.sala.corto} ·{" "}
      {sobran <= 0 ? (
        "llegas justo"
      ) : (
        <>
          te sobran <strong className={styles.dato}>{formatoDuracion(sobran)}</strong>
        </>
      )}
      {despues}
    </>
  );
}

/**
 * Conector entre dos funciones consecutivas del mismo día: cuenta el recorrido
 * (caminata y tiempo libre) o el aviso (choque, traslado, conversatorio).
 */
export default function ItinerarioConector({ aviso, hueco }: ItinerarioConectorProps) {
  if (!aviso && !hueco) return null;
  const tipo = aviso ? aviso.tipo : "hueco";

  return (
    <div className={styles.conector} data-tipo={tipo}>
      <div className={styles.rail} aria-hidden="true">
        <svg className={styles.linea} viewBox="0 0 24 100" preserveAspectRatio="none">
          <path className={styles.trazo} d="M12 0V100" pathLength={1} />
        </svg>
        <span className={styles.icono}>
          {aviso ? <IconoAviso tipo={aviso.tipo} /> : hueco && hueco.minutosCaminando > 0 ? <IconoCaminar /> : <IconoSala />}
        </span>
      </div>
      {aviso ? (
        <p className={`${styles.texto} ${styles.textoAviso}`}>
          <span className="visually-hidden">Aviso: </span>
          {aviso.mensaje}
        </p>
      ) : (
        hueco && <p className={styles.texto}>{textoHueco(hueco)}</p>
      )}
    </div>
  );
}

/** Avisos con funciones no consecutivas: van dentro de la tarjeta de la función que empieza antes. */
export function ItinerarioAvisosTarjeta({ avisos }: { avisos: Aviso[] }) {
  return (
    <ul className={styles.avisosTarjeta} aria-label="Avisos">
      {avisos.map((av) => (
        <li key={`${av.b.id}-${av.tipo}`} className={styles.avisoTarjeta} data-tipo={av.tipo}>
          <span className={styles.avisoIcono} aria-hidden="true">
            <IconoAviso tipo={av.tipo} />
          </span>
          <span>
            <span className="visually-hidden">Aviso: </span>
            {av.mensaje}
          </span>
        </li>
      ))}
    </ul>
  );
}
