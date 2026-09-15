"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { avisosAlAgregar } from "@/lib/itinerario";
import { dias, funciones, secciones, slugDia, type Funcion, type SeccionId } from "@/lib/programa";
import { useItinerario } from "@/lib/useItinerario";
import FilaFuncion, { type EstadoTiempo } from "./FilaFuncion";
import FiltrosPrograma from "./FiltrosPrograma";
import GrillaSalas from "./GrillaSalas";
import {
  NOMBRE_CORTO_SECCION,
  TODOS,
  diaDeHoy,
  escribirFiltros,
  filtrarFunciones,
  leerFiltros,
  type DiaFiltro,
  type Filtros,
  type Vista,
} from "./filtros";
import { useAhora } from "./useAhora";
import s from "./Programa.module.css";

const TOTAL = funciones.length;
const PRIMER_INICIO = funciones[0].inicioMin;
const ULTIMO_FIN = Math.max(...funciones.map((f) => f.finConversatorioMin));
const VACIO: ReadonlySet<string> = new Set();

/** Lee los filtros desde la URL. Debe ir dentro de <Suspense> (la página es estática). */
export function ProgramaConUrl() {
  const params = useSearchParams();
  const filtros = useMemo(() => leerFiltros(params), [params]);
  const simulado = params.get("ahora");

  const cambiar = useCallback((nuevos: Filtros) => {
    const q = escribirFiltros(nuevos);
    const actual = new URLSearchParams(window.location.search);
    const extra = actual.get("ahora");
    const query = [q, extra ? `ahora=${encodeURIComponent(extra)}` : ""].filter(Boolean).join("&");
    // replaceState se integra con el router de Next (actualiza useSearchParams) sin pedir nada al servidor.
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, []);

  return <VistaPrograma filtros={filtros} onCambiar={cambiar} ahoraSimulado={simulado} />;
}

function unirNombres(nombres: string[]): string {
  if (nombres.length <= 1) return nombres.join("");
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

function estadoTiempo(f: Funcion, ahora: number): EstadoTiempo | null {
  if (ahora >= f.finMin) return { tipo: "termino" };
  if (ahora >= f.inicioMin) return { tipo: "curso", quedan: f.finMin - ahora };
  const faltan = f.inicioMin - ahora;
  if (faltan <= 90) return { tipo: "pronto", faltan };
  return null;
}

export interface VistaProgramaProps {
  filtros: Filtros;
  /** Sin esta función (fallback prerenderizado) los filtros no hacen nada hasta hidratar. */
  onCambiar?: (filtros: Filtros) => void;
  ahoraSimulado?: string | null;
}

export default function VistaPrograma({ filtros, onCambiar, ahoraSimulado }: VistaProgramaProps) {
  const raizRef = useRef<HTMLDivElement>(null);
  const barraRef = useRef<HTMLDivElement>(null);
  const resultadosRef = useRef<HTMLDivElement>(null);

  // --- Tiempo real (solo en el cliente, tras montar) ---
  const ahora = useAhora(ahoraSimulado);
  const enFestival = ahora !== null && ahora >= PRIMER_INICIO - 12 * 60 && ahora < ULTIMO_FIN + 6 * 60;
  const hoy = enFestival ? diaDeHoy(ahora) : undefined;
  const hoySlug = hoy ? slugDia(hoy) : undefined;

  // Sin día en la URL: durante el festival se muestra hoy; si no, los tres días.
  const diaActivo: DiaFiltro = filtros.dia ?? hoySlug ?? TODOS;
  const { secciones: elegidasSec, vista } = filtros;

  const visibles = useMemo(() => filtrarFunciones(funciones, diaActivo, elegidasSec), [diaActivo, elegidasSec]);
  const grupos = useMemo(
    () =>
      dias
        .map((dia) => ({ dia, funciones: visibles.filter((f) => f.dia.fecha === dia.fecha) }))
        .filter((g) => g.funciones.length > 0),
    [visibles],
  );
  const diasGrilla = useMemo(
    () =>
      dias
        .filter((d) => diaActivo === TODOS || slugDia(d) === diaActivo)
        .map((dia) => ({ dia, funciones: funciones.filter((f) => f.dia.fecha === dia.fecha) })),
    [diaActivo],
  );

  // --- Itinerario ---
  const { ids, listo } = useItinerario();
  const elegidas = useMemo<ReadonlySet<string>>(() => (listo ? new Set(ids) : VACIO), [ids, listo]);
  const avisos = useMemo(() => {
    const m = new Map<string, string>();
    if (!listo || ids.length === 0) return m;
    for (const f of funciones) {
      if (ids.includes(f.id)) continue;
      const av = avisosAlAgregar(ids, f.id).find((a) => a.tipo === "choque" || a.tipo === "traslado");
      if (!av) continue;
      const otra = av.funcion.id === f.id ? av.otra : av.funcion;
      if (!otra) continue;
      const cuando = `${otra.dia.corto} ${otra.horaInicio}`;
      if (av.tipo === "choque") m.set(f.id, `Se topa con ${otra.pelicula.titulo} (${cuando}), que ya está en tu itinerario.`);
      else if (otra.inicioMin < f.inicioMin)
        m.set(f.id, `No alcanzas a llegar caminando desde ${otra.pelicula.titulo} (${otra.sala.nombre}).`);
      else m.set(f.id, `Si vas, no alcanzas a llegar caminando a ${otra.pelicula.titulo} (${otra.sala.nombre}).`);
    }
    return m;
  }, [ids, listo]);

  // Alto real de la barra de filtros: lo usan los encabezados sticky y el desplazamiento.
  useEffect(() => {
    const barra = barraRef.current;
    const raiz = raizRef.current;
    if (!barra || !raiz) return;
    const medir = () => raiz.style.setProperty("--alto-filtros", `${Math.round(barra.getBoundingClientRect().height)}px`);
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(barra);
    return () => obs.disconnect();
  }, []);

  const desplazarA = useCallback((el: HTMLElement | null, soloSiQuedoArriba: boolean) => {
    const barra = barraRef.current;
    if (!el || !barra) return;
    const limite = barra.getBoundingClientRect().bottom;
    const top = el.getBoundingClientRect().top;
    if (soloSiQuedoArriba && top >= limite) return;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: top - limite - 12, behavior: soloSiQuedoArriba || reducido ? "auto" : "smooth" });
  }, []);

  const aplicar = (cambios: Partial<Filtros>) => {
    if (!onCambiar) return;
    const nuevos = { ...filtros, ...cambios };
    // Fuera del festival "todos" es el valor por defecto: se deja fuera de la URL.
    if (nuevos.dia === TODOS && !hoySlug) nuevos.dia = null;
    onCambiar(nuevos);
    // Si la persona estaba más abajo, vuelve al inicio de los resultados (bajo la barra).
    requestAnimationFrame(() => desplazarA(resultadosRef.current, true));
  };

  const alternarSeccion = (id: SeccionId) => {
    const set = new Set(elegidasSec);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    aplicar({ secciones: secciones.map((x) => x.id).filter((x) => set.has(x)) });
  };

  const hayFiltros = diaActivo !== TODOS || elegidasSec.length > 0;
  const diaObj = dias.find((d) => slugDia(d) === diaActivo);
  const nombresSec = elegidasSec.map((id) => NOMBRE_CORTO_SECCION[id]);

  // "Lo que viene": primera función visible de hoy que no ha terminado.
  const siguiente =
    ahora !== null && hoy ? visibles.find((f) => f.dia.fecha === hoy.fecha && f.finMin > ahora) : undefined;

  const textoConteo =
    visibles.length === 0
      ? "Ninguna función con estos filtros"
      : `${visibles.length} ${visibles.length === 1 ? "función" : "funciones"}${hayFiltros ? ` de ${TOTAL}` : ""}`;
  const textoContexto = [
    diaObj ? diaObj.largo : "los tres días",
    nombresSec.length ? unirNombres(nombresSec) : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className={s.raiz} ref={raizRef} data-vista={vista}>
      <FiltrosPrograma
        ref={barraRef}
        diaActivo={diaActivo}
        hoy={hoySlug}
        seccionesElegidas={elegidasSec}
        vista={vista}
        onDia={(dia) => aplicar({ dia })}
        onSeccion={alternarSeccion}
        onTodasLasSecciones={() => aplicar({ secciones: [] })}
        onVista={(v: Vista) => aplicar({ vista: v })}
      />

      <div className={s.contenido} ref={resultadosRef}>
        <div className={s.estado}>
          <p className={s.conteo} aria-live="polite" aria-atomic="true">
            <strong>{textoConteo}</strong>
            <span className={s.contexto}>{textoContexto}</span>
          </p>
          <div className={s.acciones}>
            {siguiente && (
              <button
                type="button"
                className={s.accion}
                onClick={() => desplazarA(document.getElementById(`funcion-${siguiente.id}`), false)}
              >
                Ir a lo que viene
              </button>
            )}
            {hayFiltros && (
              <button
                type="button"
                className={s.accion}
                onClick={() => aplicar({ dia: TODOS, secciones: [] })}
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {visibles.length === 0 ? (
          <div className={s.vacio}>
            <p className={s.vacioTitulo}>Esta combinación no tiene funciones.</p>
            <p className={s.vacioTexto}>
              {nombresSec.length ? unirNombres(nombresSec) : "Ninguna sección"} no tiene funciones{" "}
              {diaObj ? `el ${diaObj.largo}` : "en el festival"}. Prueba con otro día o suma otra sección.
            </p>
            <div className={s.vacioAcciones}>
              {diaActivo !== TODOS && (
                <button type="button" className={s.accionFuerte} onClick={() => aplicar({ dia: TODOS })}>
                  Ver los tres días
                </button>
              )}
              {elegidasSec.length > 0 && (
                <button type="button" className={s.accion} onClick={() => aplicar({ secciones: [] })}>
                  Todas las secciones
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className={s.lista}>
              {grupos.map(({ dia, funciones: lista }) => {
                const idTitulo = `dia-${slugDia(dia)}`;
                return (
                  <section key={dia.fecha} className={s.dia} aria-labelledby={idTitulo}>
                    <h2 className={s.diaTitulo} id={idTitulo}>
                      <span className={s.diaNombre}>{dia.nombre}</span>
                      <span className={s.diaNumero}>{dia.numero}</span>
                      <span className={s.diaMes}>
                        {dia.mes}
                        {hoy?.fecha === dia.fecha && <span className={s.hoy}>Hoy</span>}
                      </span>
                      <span className={s.diaCuenta}>
                        {lista.length} {lista.length === 1 ? "función" : "funciones"}
                      </span>
                    </h2>
                    <ol className={s.funciones}>
                      {lista.map((f) => (
                        <FilaFuncion
                          key={f.id}
                          funcion={f}
                          enItinerario={elegidas.has(f.id)}
                          aviso={avisos.get(f.id)}
                          tiempo={enFestival && ahora !== null ? estadoTiempo(f, ahora) : null}
                        />
                      ))}
                    </ol>
                  </section>
                );
              })}
            </div>

            {vista === "grilla" && (
              <div className={s.grillas}>
                {diasGrilla.map(({ dia, funciones: lista }) => {
                  const idTitulo = `grilla-${slugDia(dia)}`;
                  return (
                    <section key={dia.fecha} className={s.dia} aria-labelledby={idTitulo}>
                      <h2 className={s.diaTitulo} id={idTitulo}>
                        <span className={s.diaNombre}>{dia.nombre}</span>
                        <span className={s.diaNumero}>{dia.numero}</span>
                        <span className={s.diaMes}>
                          {dia.mes}
                          {hoy?.fecha === dia.fecha && <span className={s.hoy}>Hoy</span>}
                        </span>
                        <span className={s.diaCuenta}>por sala</span>
                      </h2>
                      <GrillaSalas
                        dia={dia}
                        funciones={lista}
                        seccionesElegidas={elegidasSec}
                        elegidas={elegidas}
                        ahora={enFestival ? ahora : null}
                        idTitulo={idTitulo}
                      />
                    </section>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
