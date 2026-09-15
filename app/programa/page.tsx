import { Suspense } from "react";
import type { Metadata } from "next";
import VistaPrograma, { ProgramaConUrl } from "@/components/programa/Programa";
import { FILTROS_INICIALES } from "@/components/programa/filtros";
import { dias, festival, formatoPrecio, funciones, peliculas, salas } from "@/lib/programa";
import s from "./page.module.css";

const primero = dias[0];
const ultimo = dias[dias.length - 1];
const salaAireLibre = salas.find((x) => x.aireLibre);

export const metadata: Metadata = {
  title: "Programa",
  description: `Las ${funciones.length} funciones del Festival de Cine Niebla, del ${primero.largo} al ${ultimo.largo} de ${festival.fechaFin.slice(0, 4)} en ${festival.ciudad}. Filtra por día y sección y arma tu itinerario.`,
};

export default function ProgramaPage() {
  return (
    <>
      <header className={s.encabezado}>
        <div className={s.interior}>
          <p className={s.antetitulo}>
            {festival.nombre} · {festival.edicion}ª edición
          </p>
          <div className={s.fila}>
            <h1 className={s.titulo}>Programa</h1>
            <dl className={s.cifras}>
              <div>
                <dt>Funciones</dt>
                <dd>{funciones.length}</dd>
              </div>
              <div>
                <dt>Películas</dt>
                <dd>{peliculas.length}</dd>
              </div>
              <div>
                <dt>Salas</dt>
                <dd>{salas.length}</dd>
              </div>
            </dl>
          </div>
          <p className={s.fechas}>
            <span className={s.rango}>
              {primero.corto} {primero.numero} — {ultimo.corto} {ultimo.numero} {ultimo.mes}
            </span>
            <span className={s.entradas}>
              Entrada general {formatoPrecio(festival.entradas.general)}
              {salaAireLibre && (
                <>
                  {" "}
                  · {salaAireLibre.nombre}: {formatoPrecio(festival.entradas.aireLibre).toLowerCase()}
                </>
              )}
            </span>
          </p>
          <p className={s.venta}>{festival.entradas.venta}</p>
        </div>
      </header>

      {/*
        La página es estática. Los filtros se leen de la URL en el cliente (useSearchParams),
        así que van dentro de Suspense; el fallback ya muestra el programa completo prerenderizado.
      */}
      <Suspense fallback={<VistaPrograma filtros={FILTROS_INICIALES} />}>
        <ProgramaConUrl />
      </Suspense>

      <p className={s.ventaAlPie}>
        <strong>Entradas.</strong> General {formatoPrecio(festival.entradas.general)}
        {salaAireLibre && (
          <>
            ; en {salaAireLibre.nombre}, {formatoPrecio(festival.entradas.aireLibre).toLowerCase()}
          </>
        )}
        . {festival.entradas.venta}
      </p>
    </>
  );
}
