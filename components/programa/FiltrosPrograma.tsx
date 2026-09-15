"use client";

import { useEffect, useRef, type Ref } from "react";
import { dias, secciones, slugDia, type SeccionId } from "@/lib/programa";
import { NOMBRE_CORTO_SECCION, TODOS, type DiaFiltro, type Vista } from "./filtros";
import s from "./FiltrosPrograma.module.css";

export interface FiltrosProgramaProps {
  diaActivo: DiaFiltro;
  /** Slug del día de hoy si el festival está en curso. */
  hoy?: string;
  seccionesElegidas: readonly SeccionId[];
  vista: Vista;
  onDia: (dia: DiaFiltro) => void;
  onSeccion: (id: SeccionId) => void;
  onTodasLasSecciones: () => void;
  onVista: (vista: Vista) => void;
  ref?: Ref<HTMLDivElement>;
}

export default function FiltrosPrograma({
  diaActivo,
  hoy,
  seccionesElegidas,
  vista,
  onDia,
  onSeccion,
  onTodasLasSecciones,
  onVista,
  ref,
}: FiltrosProgramaProps) {
  const primero = dias[0];
  const ultimo = dias[dias.length - 1];
  const filaSecciones = useRef<HTMLDivElement>(null);
  const claveSecciones = seccionesElegidas.join(",");

  // En móvil la fila de secciones se desliza: si llega una sección elegida desde la URL
  // (p. ej. desde la portada), la dejamos a la vista sin mover la página.
  useEffect(() => {
    const fila = filaSecciones.current;
    if (!fila || !claveSecciones || fila.scrollWidth <= fila.clientWidth) return;
    const chip = fila.querySelector<HTMLElement>('[data-seccion][aria-pressed="true"]');
    if (!chip) return;
    const izquierda = chip.offsetLeft - fila.offsetLeft;
    const derecha = izquierda + chip.offsetWidth;
    if (izquierda < fila.scrollLeft || derecha > fila.scrollLeft + fila.clientWidth - 28) {
      fila.scrollLeft = Math.max(0, izquierda - 16);
    }
  }, [claveSecciones]);

  return (
    <div className={s.barra} ref={ref}>
      <div className={s.interior}>
        <div className={s.dias} role="group" aria-label="Filtrar por día">
          <button
            type="button"
            className={s.dia}
            aria-pressed={diaActivo === TODOS}
            onClick={() => onDia(TODOS)}
            aria-label={`Los tres días, del ${primero.largo} al ${ultimo.largo}`}
          >
            <span className={s.diaNumero}>Todo</span>
          </button>
          {dias.map((d) => {
            const slug = slugDia(d);
            const esHoy = hoy === slug;
            return (
              <button
                key={d.fecha}
                type="button"
                className={s.dia}
                data-hoy={esHoy ? "" : undefined}
                aria-pressed={diaActivo === slug}
                onClick={() => onDia(slug)}
                aria-label={`${d.largo}${esHoy ? ", hoy" : ""}`}
              >
                <span className={s.diaCorto}>{esHoy ? "hoy" : d.corto}</span>
                <span className={s.diaNumero}>{d.numero}</span>
              </button>
            );
          })}
        </div>

        <div className={s.seccionesMarco}>
          <div className={s.secciones} ref={filaSecciones} role="group" aria-label="Filtrar por sección (puedes elegir varias)">
            <button
              type="button"
              className={`${s.chip} ${s.chipTodas}`}
              aria-pressed={seccionesElegidas.length === 0}
              onClick={onTodasLasSecciones}
            >
              Todas
            </button>
            {secciones.map((sec) => (
              <button
                key={sec.id}
                type="button"
                className={s.chip}
                data-seccion={sec.id}
                aria-pressed={seccionesElegidas.includes(sec.id)}
                onClick={() => onSeccion(sec.id)}
                title={sec.nombre}
              >
                <span className={s.muestra} aria-hidden="true" />
                {NOMBRE_CORTO_SECCION[sec.id]}
              </button>
            ))}
          </div>
        </div>

        <div className={s.vistas} role="group" aria-label="Tipo de vista">
          <button type="button" className={s.vista} aria-pressed={vista === "lista"} onClick={() => onVista("lista")}>
            <span className={s.iconoLista} aria-hidden="true" />
            Lista
          </button>
          <button
            type="button"
            className={s.vista}
            aria-pressed={vista === "grilla"}
            onClick={() => onVista("grilla")}
            title="Grilla horaria por sala"
          >
            <span className={s.iconoGrilla} aria-hidden="true" />
            Por sala
          </button>
        </div>
      </div>
    </div>
  );
}
