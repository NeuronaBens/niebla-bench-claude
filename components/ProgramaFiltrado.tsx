"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, type CSSProperties } from "react";
import { dias, funciones, getDia, getSeccion, secciones, type DiaId } from "@/lib/datos";
import { useItinerario } from "@/lib/almacen";
import ProgramaLista, { contarFunciones } from "./ProgramaLista";
import styles from "./ProgramaFiltrado.module.css";

export interface Filtros {
  dia: DiaId | null;
  seccion: string | null;
}

/** Nombre corto de cada sección para los chips en pantallas angostas. */
const SECCION_CORTA: Record<string, string> = {
  competencia: "Competencia",
  panorama: "Panorama",
  nocturna: "Nocturna",
  costa: "Costa",
};

function leerFiltros(params: URLSearchParams): Filtros {
  const dia = getDia(params.get("dia") ?? "")?.id ?? null;
  const seccion = getSeccion(params.get("seccion") ?? "")?.id ?? null;
  return { dia, seccion };
}

function aQuery({ dia, seccion }: Filtros): string {
  const p = new URLSearchParams();
  if (dia) p.set("dia", dia);
  if (seccion) p.set("seccion", seccion);
  const q = p.toString();
  return q ? `?${q}` : "";
}

// ---------- Barra de filtros (presentacional) ----------

export interface ProgramaFiltrosProps {
  filtros: Filtros;
  alCambiar?: (siguiente: Filtros) => void;
}

export function ProgramaFiltros({ filtros, alCambiar }: ProgramaFiltrosProps) {
  const cambiar = (parcial: Partial<Filtros>) => alCambiar?.({ ...filtros, ...parcial });

  return (
    <div className={styles.barra}>
      <div className={`contenedor ${styles.barraInterior}`}>
        <div className={styles.dias} role="group" aria-label="Filtrar por día">
          <button
            type="button"
            className={styles.diaBoton}
            aria-pressed={filtros.dia === null}
            onClick={() => cambiar({ dia: null })}
          >
            <span className={styles.largo}>Todos los días</span>
            <span className={styles.corto} aria-hidden="true">
              Todos
            </span>
          </button>
          {dias.map((d) => (
            <button
              key={d.id}
              type="button"
              className={styles.diaBoton}
              aria-pressed={filtros.dia === d.id}
              onClick={() => cambiar({ dia: filtros.dia === d.id ? null : d.id })}
            >
              <span className={styles.largo}>{d.etiqueta}</span>
              <span className={styles.corto} aria-hidden="true">
                {d.corto} {d.numero}
              </span>
            </button>
          ))}
        </div>

        <div className={styles.filaSecciones}>
          <div className={styles.secciones} role="group" aria-label="Filtrar por sección">
            {secciones.map((s) => {
              const activo = filtros.seccion === s.id;
              const estilo = {
                "--color-sec": `var(--sec-${s.id}, var(--faro))`,
                "--color-sec-suave": `var(--sec-${s.id}-suave, var(--faro-suave))`,
              } as CSSProperties;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`chip ${styles.chipSeccion}${activo ? ` chip--activo ${styles.chipActivo}` : ""}`}
                  style={estilo}
                  aria-pressed={activo}
                  aria-label={s.nombre}
                  onClick={() => cambiar({ seccion: activo ? null : s.id })}
                >
                  <span className={styles.punto} aria-hidden="true" />
                  <span className={styles.largoSeccion}>{s.nombre}</span>
                  <span className={styles.cortoSeccion} aria-hidden="true">
                    {SECCION_CORTA[s.id] ?? s.nombre}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Pie: enlace al itinerario ----------

function PieItinerario() {
  const { ids, listo } = useItinerario();
  if (!listo || ids.length === 0) return null;
  return (
    <div className={styles.pie}>
      <p className={styles.pieTexto}>
        Llevas {contarFunciones(ids.length)} en tu recorrido.
      </p>
      <Link href="/itinerario" className="boton boton--primario">
        Ver mi itinerario
      </Link>
    </div>
  );
}

// ---------- Programa con filtros sincronizados a la URL ----------

export default function ProgramaFiltrado() {
  const searchParams = useSearchParams();
  const filtros = useMemo(() => leerFiltros(new URLSearchParams(searchParams.toString())), [searchParams]);

  const fijar = useCallback((siguiente: Filtros) => {
    // replaceState se integra con el router de Next: useSearchParams se actualiza sin recargar ni hacer scroll.
    // El estado debe ir en null: si se pasa el estado interno de Next, el router lo toma como propio y no sincroniza.
    window.history.replaceState(null, "", `${window.location.pathname}${aQuery(siguiente)}`);
  }, []);

  const visibles = useMemo(
    () =>
      funciones.filter(
        (f) => (filtros.dia === null || f.dia === filtros.dia) && (filtros.seccion === null || f.seccion.id === filtros.seccion),
      ),
    [filtros],
  );

  return (
    <>
      <ProgramaFiltros filtros={filtros} alCambiar={fijar} />
      <div className={`contenedor ${styles.cuerpo}`}>
        <p className="visually-hidden" role="status" aria-live="polite">
          {contarFunciones(visibles.length)} en el programa filtrado
        </p>
        {visibles.length > 0 && (
          <p className={styles.contadorCuerpo} aria-hidden="true">
            {contarFunciones(visibles.length)}
            {filtros.seccion && ` · ${getSeccion(filtros.seccion)?.nombre}`}
          </p>
        )}
        <ProgramaLista
          funciones={visibles}
          dia={filtros.dia}
          seccion={filtros.seccion}
          alLimpiar={() => fijar({ dia: null, seccion: null })}
        />
        <PieItinerario />
      </div>
    </>
  );
}

/** Versión estática (sin hooks de URL) que se muestra mientras se hidrata la interactiva. */
export function ProgramaEstatico() {
  const filtros: Filtros = { dia: null, seccion: null };
  return (
    <>
      <ProgramaFiltros filtros={filtros} />
      <div className={`contenedor ${styles.cuerpo}`}>
        <p className={styles.contadorCuerpo} aria-hidden="true">
          {contarFunciones(funciones.length)}
        </p>
        <ProgramaLista funciones={funciones} dia={null} seccion={null} />
      </div>
    </>
  );
}
