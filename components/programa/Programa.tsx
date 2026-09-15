"use client";

import { useCallback, useMemo } from "react";
import { SECCION_CORTA, dias, funciones, secciones, type SeccionId } from "@/lib/programa";
import { etiquetaDia, etiquetaDiaCorta, hora, horaFin, mes } from "@/lib/tiempo";
import { useAhora } from "@/lib/useAhora";
import { cambiarUrl, useBusqueda } from "@/lib/useUrl";
import FuncionFila from "../FuncionFila";
import Grilla from "./Grilla";
import s from "./Programa.module.css";

export type Vista = "lista" | "grilla";

export type Filtros = {
  dia: string | null;
  secciones: SeccionId[];
  vista: Vista;
};

const IDS_SECCION = new Set<string>(secciones.map((x) => x.id));

export const FILTROS_INICIALES: Filtros = { dia: null, secciones: [], vista: "lista" };

export function leerFiltros(sp: URLSearchParams | null): Filtros {
  if (!sp) return FILTROS_INICIALES;
  const dia = sp.get("dia");
  const secs = (sp.get("seccion") ?? "")
    .split(",")
    .filter((x): x is SeccionId => IDS_SECCION.has(x));
  return {
    dia: dia && dias.includes(dia) ? dia : null,
    secciones: secs,
    vista: sp.get("vista") === "grilla" ? "grilla" : "lista",
  };
}

function aQuery(f: Filtros): string {
  const q = new URLSearchParams();
  if (f.dia) q.set("dia", f.dia);
  if (f.secciones.length) q.set("seccion", f.secciones.join(","));
  if (f.vista === "grilla") q.set("vista", "grilla");
  const t = q.toString();
  return t ? `?${t}` : "";
}

/** Versión conectada a la URL: los filtros se pueden compartir y sobreviven al volver atrás. */
export function ProgramaConUrl() {
  const busqueda = useBusqueda();
  const filtros = useMemo(
    () => (busqueda === null ? FILTROS_INICIALES : leerFiltros(new URLSearchParams(busqueda))),
    [busqueda],
  );
  const cambiar = useCallback((f: Filtros) => cambiarUrl(`${window.location.pathname}${aQuery(f)}`), []);
  return <Programa filtros={filtros} onCambiar={cambiar} />;
}

export default function Programa({
  filtros,
  onCambiar,
}: {
  filtros: Filtros;
  onCambiar?: (f: Filtros) => void;
}) {
  const ahora = useAhora();
  const hoy = useMemo(() => {
    if (ahora === null) return null;
    const fecha = new Date(ahora * 60000).toISOString().slice(0, 10);
    return dias.includes(fecha) ? fecha : null;
  }, [ahora]);

  const cambiar = (parcial: Partial<Filtros>) => onCambiar?.({ ...filtros, ...parcial });

  const alternarSeccion = (id: SeccionId) => {
    const set = new Set(filtros.secciones);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    const lista = secciones.map((x) => x.id).filter((x) => set.has(x));
    cambiar({ secciones: lista.length === secciones.length ? [] : lista });
  };

  const diasVisibles = filtros.dia ? [filtros.dia] : dias;
  const pasaSeccion = (id: SeccionId) => filtros.secciones.length === 0 || filtros.secciones.includes(id);
  const visibles = funciones.filter((f) => diasVisibles.includes(f.dia) && pasaSeccion(f.seccion.id));

  const conteoDia = (d: string | null) =>
    funciones.filter((f) => (d === null || f.dia === d) && pasaSeccion(f.seccion.id)).length;

  return (
    <div className={s.programa}>
      <div className={s.filtros}>
        <div className={`contenedor ${s.filtrosInterior}`}>
          <div className={s.dias} role="group" aria-label="Filtrar por día">
            <button
              type="button"
              className={s.dia}
              aria-pressed={filtros.dia === null}
              onClick={() => cambiar({ dia: null })}
            >
              <span className={s.diaNombre}>Todo</span>
              <span className={`${s.diaNum} num`}>{conteoDia(null)}</span>
            </button>
            {dias.map((d) => (
              <button
                key={d}
                type="button"
                className={s.dia}
                aria-pressed={filtros.dia === d}
                onClick={() => cambiar({ dia: d })}
              >
                <span className={s.diaNombre}>
                  {etiquetaDiaCorta(d)}
                  {hoy === d && <span className={s.hoy}>hoy</span>}
                </span>
                <span className={`${s.diaNum} num`}>{conteoDia(d)}</span>
              </button>
            ))}
          </div>

          <div className={s.fila2}>
            <div className={s.secciones} role="group" aria-label="Filtrar por sección">
              {filtros.secciones.length > 0 && (
                <button type="button" className={s.limpiar} onClick={() => cambiar({ secciones: [] })}>
                  Ver todas
                </button>
              )}
              {secciones.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  className={s.chip}
                  data-seccion={sec.id}
                  aria-pressed={filtros.secciones.includes(sec.id)}
                  onClick={() => alternarSeccion(sec.id)}
                >
                  <span className={s.punto} aria-hidden="true" />
                  <span className={s.nombreLargo}>{sec.nombre}</span>
                  <span className={s.nombreCorto} aria-hidden="true">
                    {SECCION_CORTA[sec.id]}
                  </span>
                </button>
              ))}
            </div>

            <div className={s.vistas} role="group" aria-label="Forma de ver el programa">
              <button
                type="button"
                aria-pressed={filtros.vista === "lista"}
                onClick={() => cambiar({ vista: "lista" })}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M3 5h14M3 10h14M3 15h14" />
                </svg>
                Lista
              </button>
              <button
                type="button"
                aria-pressed={filtros.vista === "grilla"}
                onClick={() => cambiar({ vista: "grilla" })}
              >
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M3 4h7M8 8h9M3 12h6M11 16h6" />
                </svg>
                Por sala
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="solo-lector" aria-live="polite">
        {visibles.length} funciones
      </p>

      <div className="contenedor">
        {visibles.length === 0 && (
          <div className={s.vacio}>
            <p>No hay funciones con esos filtros.</p>
            <button type="button" onClick={() => cambiar({ dia: null, secciones: [] })}>
              Ver todo el programa
            </button>
          </div>
        )}

        {diasVisibles.map((d) => {
          const delDia = visibles.filter((f) => f.dia === d);
          if (filtros.vista === "lista" && delDia.length === 0) return null;
          const todasDelDia = funciones.filter((f) => f.dia === d);
          const primera = delDia[0] ?? todasDelDia[0];
          const ultima = [...(delDia.length ? delDia : todasDelDia)].sort((a, b) => b.fin - a.fin)[0];
          const fin = horaFin(ultima.fin, d);
          return (
            <section key={d} className={s.bloqueDia} aria-labelledby={`dia-${d}`}>
              <header className={s.cabeceraDia}>
                <h2 id={`dia-${d}`} className={s.tituloDia}>
                  {etiquetaDia(d)} <span className={s.mes}>de {mes(d)}</span>
                </h2>
                <p className={`${s.resumenDia} num`}>
                  {delDia.length} {delDia.length === 1 ? "función" : "funciones"} · de {hora(primera.ini)} a{" "}
                  {fin.hora}
                  {fin.otroDia ? " de la madrugada" : ""}
                </p>
              </header>

              {filtros.vista === "lista" ? (
                <ol className={s.lista}>
                  {delDia.map((f) => (
                    <li key={f.id}>
                      <FuncionFila f={f} />
                    </li>
                  ))}
                </ol>
              ) : (
                <Grilla dia={d} secciones={filtros.secciones} ahora={ahora} />
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
