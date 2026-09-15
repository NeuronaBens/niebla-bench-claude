import type { Metadata } from "next";
import { ProgramaConUrl } from "@/components/programa/Programa";
import { festival, funciones, peliculas, salas } from "@/lib/programa";
import s from "./page.module.css";

export const metadata: Metadata = {
  title: "Programa",
  description: "Todas las funciones del Festival de Cine Niebla, por día, sección y sala.",
};

export default function PaginaPrograma() {
  return (
    <>
      <header className={`contenedor ${s.cabecera}`}>
        <p className={s.antetitulo}>
          {festival.nombre} · {festival.edicion}ª edición
        </p>
        <h1 className={s.titulo}>Programa</h1>
        <p className={s.bajada}>
          <span className="num">{funciones.length}</span> funciones, <span className="num">{peliculas.length}</span>{" "}
          películas, <span className="num">{salas.length}</span> salas. Toca el círculo de cada función para sumarla a
          tu itinerario: te avisamos si se topa con otra o si no alcanzas a llegar caminando.
        </p>
      </header>
      <ProgramaConUrl />
    </>
  );
}
