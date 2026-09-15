import type { Metadata } from "next";
import { Suspense } from "react";
import { funciones, peliculas, salas } from "@/lib/datos";
import ProgramaFiltrado, { ProgramaEstatico } from "@/components/ProgramaFiltrado";
import styles from "./programa.module.css";

export const metadata: Metadata = {
  title: "Programa",
  description:
    "Todas las funciones del Festival de Cine Niebla: jueves 15, viernes 16 y sábado 17 de octubre de 2026. Filtra por día y por sección.",
};

export default function ProgramaPage() {
  return (
    <>
      <div className={`contenedor ${styles.encabezado}`}>
        <p className="etiqueta">Programa · 3ª edición</p>
        <h1 className={styles.titulo}>Tres días, cuatro salas</h1>
        <p className={styles.bajada}>
          {funciones.length} funciones de {peliculas.length} películas en {salas.length} salas de Puerto Bruma. Toca el día o la
          sección para acotar, y marca las que quieras para armar tu recorrido.
        </p>
      </div>
      <Suspense fallback={<ProgramaEstatico />}>
        <ProgramaFiltrado />
      </Suspense>
    </>
  );
}
