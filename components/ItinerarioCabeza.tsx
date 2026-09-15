import type { ReactNode } from "react";
import type { Analisis } from "@/lib/itinerario";
import styles from "./ItinerarioVista.module.css";

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

export interface ItinerarioCabezaProps {
  titulo: string;
  analisis: Analisis;
  children?: ReactNode;
}

/** Cabecera de la vista: título y resumen "N funciones en M días · K avisos". */
export default function ItinerarioCabeza({ titulo, analisis, children }: ItinerarioCabezaProps) {
  const nAvisos = analisis.avisos.length;
  return (
    <header className={styles.cabeza}>
      <p className={`etiqueta ${styles.sobretitulo}`}>Festival de Cine Niebla · 15, 16 y 17 de octubre</p>
      <h1 className={styles.titulo}>{titulo}</h1>
      <p className={styles.resumen}>
        <span className={styles.resumenDato}>
          {plural(analisis.funciones.length, "función", "funciones")} en {plural(analisis.porDia.length, "día", "días")}
        </span>
        {nAvisos > 0 && (
          <>
            <span className={styles.separador} aria-hidden="true">
              ·
            </span>
            <span className={styles.resumenAvisos}>{plural(nAvisos, "aviso", "avisos")}</span>
          </>
        )}
      </p>
      {children}
    </header>
  );
}
