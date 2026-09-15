import type { Metadata } from "next";
import { Suspense } from "react";
import { Programa } from "@/components/Programa";
import { funciones, peliculas, salas } from "@/lib/datos";
import { dias, rangoFechas } from "@/lib/tiempo";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Programa",
  description: `Todas las funciones del festival: ${funciones.length} funciones, ${peliculas.length} películas, ${salas.length} salas, ${rangoFechas()}.`,
};

export default function PaginaPrograma() {
  return (
    <div className={`pagina ${styles.pagina}`}>
      <div className="contenedor">
        <p className="sobreimpreso">Programa</p>
        <h1 className="seccion-titulo">
          {funciones.length} funciones en {dias.length} días
        </h1>
        <p className="seccion-sub">
          Filtra por día y por sección. Toca el botón de cada función para sumarla a tu itinerario:
          te avisamos si se topa con otra o si no alcanzas a llegar caminando.
        </p>
      </div>
      <Suspense fallback={<div className="contenedor" style={{ minHeight: "60vh" }} />}>
        <Programa />
      </Suspense>
    </div>
  );
}
