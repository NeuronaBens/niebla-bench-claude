"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { BotonItinerario } from "./BotonItinerario";
import { TarjetaFuncion } from "./TarjetaFuncion";
import { analizar, peorAviso } from "@/lib/conflictos";
import { funciones, pelicula, salas, secciones } from "@/lib/datos";
import { crearAlmacen, useAlmacen } from "@/lib/almacen-local";
import { useItinerario } from "@/lib/itinerario-store";
import { calcularFuncion, dias, formatoHora, ordenarPorInicio, type Dia, type FuncionCalc } from "@/lib/tiempo";
import styles from "./Programa.module.css";

type Vista = "lista" | "grilla";

const almacenVista = crearAlmacen<Vista>("niebla-vista-programa", "lista", (crudo) =>
  crudo === "grilla" || crudo === "lista" ? crudo : null,
);

export function Programa() {
  const router = useRouter();
  const ruta = usePathname();
  const params = useSearchParams();
  const { ids, cargado } = useItinerario();

  const diaParam = params.get("dia");
  const seccionParam = params.get("seccion");
  const dia = dias.find((d) => d.fecha === diaParam || String(d.numero) === diaParam) ?? null;
  const seccion = secciones.find((s) => s.id === seccionParam) ?? null;
  const soloMias = params.get("mias") === "1";

  const vista = useAlmacen(almacenVista);
  const cambiarVista = almacenVista.set;

  const actualizar = useCallback(
    (cambios: Record<string, string | null>) => {
      const nuevos = new URLSearchParams(params.toString());
      for (const [k, v] of Object.entries(cambios)) {
        if (v === null) nuevos.delete(k);
        else nuevos.set(k, v);
      }
      const cadena = nuevos.toString();
      router.replace(cadena ? `${ruta}?${cadena}` : ruta, { scroll: false });
    },
    [params, router, ruta],
  );

  const todas = useMemo(() => ordenarPorInicio(funciones.map(calcularFuncion)), []);
  const analisis = useMemo(() => analizar(ids), [ids]);

  const filtradas = useMemo(
    () =>
      todas.filter((f) => {
        if (dia && f.dia.fecha !== dia.fecha) return false;
        if (seccion && pelicula(f.peliculaId)?.seccion !== seccion.id) return false;
        if (soloMias && !ids.includes(f.id)) return false;
        return true;
      }),
    [todas, dia, seccion, soloMias, ids],
  );

  const porDia = useMemo(() => {
    const mapa = new Map<string, FuncionCalc[]>();
    for (const f of filtradas) {
      const lista = mapa.get(f.dia.fecha) ?? [];
      lista.push(f);
      mapa.set(f.dia.fecha, lista);
    }
    return dias.filter((d) => mapa.has(d.fecha)).map((d) => ({ dia: d, lista: mapa.get(d.fecha)! }));
  }, [filtradas]);

  const hayFiltros = Boolean(dia || seccion || soloMias);

  return (
    <>
      <div className={styles.filtros} role="region" aria-label="Filtros del programa">
        <div className={`contenedor ${styles.filtrosInterior}`}>
          <div className={styles.grupo} role="group" aria-label="Día">
            <button
              type="button"
              className={`${styles.segmento} ${!dia ? styles.segmentoActivo : ""}`}
              aria-pressed={!dia}
              onClick={() => actualizar({ dia: null })}
            >
              Todos
            </button>
            {dias.map((d) => (
              <button
                key={d.fecha}
                type="button"
                className={`${styles.segmento} ${dia?.fecha === d.fecha ? styles.segmentoActivo : ""}`}
                aria-pressed={dia?.fecha === d.fecha}
                onClick={() => actualizar({ dia: d.fecha })}
              >
                <span className={styles.segmentoDia}>{d.nombreCorto}</span>
                <span className="mono">{d.numero}</span>
              </button>
            ))}
          </div>

          <div className={styles.chipsFila} role="group" aria-label="Sección">
            <button
              type="button"
              className={`${styles.chipFiltro} ${!seccion ? styles.chipFiltroActivo : ""}`}
              aria-pressed={!seccion}
              onClick={() => actualizar({ seccion: null })}
            >
              Todas las secciones
            </button>
            {secciones.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`${styles.chipFiltro} ${styles[`chip_${s.id}`]} ${seccion?.id === s.id ? styles.chipFiltroActivo : ""}`}
                aria-pressed={seccion?.id === s.id}
                onClick={() => actualizar({ seccion: seccion?.id === s.id ? null : s.id })}
              >
                {s.nombre}
              </button>
            ))}
            {cargado && ids.length > 0 && (
              <button
                type="button"
                className={`${styles.chipFiltro} ${styles.chipMias} ${soloMias ? styles.chipFiltroActivo : ""}`}
                aria-pressed={soloMias}
                onClick={() => actualizar({ mias: soloMias ? null : "1" })}
              >
                Solo mi itinerario ({ids.length})
              </button>
            )}
          </div>

          <div className={styles.filaFinal}>
            <p className={styles.resumen} aria-live="polite">
              {filtradas.length === funciones.length
                ? `${funciones.length} funciones`
                : `${filtradas.length} de ${funciones.length} funciones`}
              {hayFiltros && (
                <>
                  {" "}
                  <button type="button" className={styles.limpiar} onClick={() => actualizar({ dia: null, seccion: null, mias: null })}>
                    Quitar filtros
                  </button>
                </>
              )}
            </p>
            <div className={styles.vistas} role="group" aria-label="Vista">
              <button
                type="button"
                className={`${styles.vistaBoton} ${vista === "lista" ? styles.vistaActiva : ""}`}
                aria-pressed={vista === "lista"}
                onClick={() => cambiarVista("lista")}
              >
                Lista
              </button>
              <button
                type="button"
                className={`${styles.vistaBoton} ${vista === "grilla" ? styles.vistaActiva : ""}`}
                aria-pressed={vista === "grilla"}
                onClick={() => cambiarVista("grilla")}
              >
                Grilla
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className={`contenedor ${styles.contenido}`}>
        {porDia.length === 0 && (
          <div className={styles.vacio}>
            <p>No hay funciones con esos filtros.</p>
            <button type="button" className="boton boton--secundario" onClick={() => actualizar({ dia: null, seccion: null, mias: null })}>
              Quitar filtros
            </button>
          </div>
        )}

        {porDia.map(({ dia: d, lista }) => (
          <section key={d.fecha} className={styles.dia} aria-labelledby={`dia-${d.fecha}`}>
            <header className={styles.diaCabecera}>
              <h2 id={`dia-${d.fecha}`} className={styles.diaTitulo}>
                {d.larga}
              </h2>
              <p className={styles.diaResumen}>
                {lista.length} {lista.length === 1 ? "función" : "funciones"} · de {lista[0].horaInicio} a{" "}
                {formatoHora(Math.max(...lista.map((f) => f.finMin)))}
              </p>
            </header>
            {vista === "grilla" ? (
              <GrillaDia dia={d} lista={lista} analisis={analisis} />
            ) : (
              <ol className={styles.lista}>
                {lista.map((f) => (
                  <li key={f.id}>
                    <TarjetaFuncion funcion={f} avisos={analisis.avisos.get(f.id)} />
                  </li>
                ))}
              </ol>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

const PASO_MIN = 15;

function GrillaDia({
  dia,
  lista,
  analisis,
}: {
  dia: Dia;
  lista: FuncionCalc[];
  analisis: ReturnType<typeof analizar>;
}) {
  const { ids, cargado } = useItinerario();
  const base = dia.indice * 1440;
  const inicioGrilla = Math.floor((Math.min(...lista.map((f) => f.inicioMin)) - base) / 60) * 60;
  const finGrilla = Math.ceil((Math.max(...lista.map((f) => f.finConConversatorioMin)) - base) / 60) * 60;
  const filas = (finGrilla - inicioGrilla) / PASO_MIN;
  const horas: number[] = [];
  for (let m = inicioGrilla; m < finGrilla; m += 60) horas.push(m);

  const salasConFunciones = salas.filter((s) => lista.some((f) => f.salaId === s.id));

  return (
    <div className={styles.grillaEnvoltorio}>
      <div
        className={styles.grilla}
        style={{
          gridTemplateColumns: `56px repeat(${salasConFunciones.length}, minmax(150px, 1fr))`,
          gridTemplateRows: `auto repeat(${filas}, 22px)`,
        }}
      >
        <div className={styles.grillaEsquina} />
        {salasConFunciones.map((s, i) => (
          <div key={s.id} className={styles.grillaSala} style={{ gridColumn: i + 2, gridRow: 1 }}>
            {s.nombre}
            {s.aireLibre && <span className={styles.grillaAire}> · aire libre</span>}
          </div>
        ))}
        {horas.map((m) => {
          const fila = (m - inicioGrilla) / PASO_MIN + 2;
          return (
            <div key={m} className={`mono ${styles.grillaHora}`} style={{ gridRow: `${fila} / span 4`, gridColumn: 1 }}>
              {formatoHora(m)}
            </div>
          );
        })}
        {horas.map((m, i) => {
          const fila = (m - inicioGrilla) / PASO_MIN + 2;
          return (
            <div
              key={`l-${m}`}
              className={`${styles.grillaLinea} ${i === 0 ? styles.grillaLineaPrimera : ""}`}
              style={{ gridRow: fila, gridColumn: `2 / span ${salasConFunciones.length}` }}
            />
          );
        })}
        {lista.map((f) => {
          const p = pelicula(f.peliculaId);
          if (!p) return null;
          const col = salasConFunciones.findIndex((s) => s.id === f.salaId) + 2;
          const filaInicio = Math.round((f.inicioMin - base - inicioGrilla) / PASO_MIN) + 2;
          const filaFin = Math.round((f.finMin - base - inicioGrilla) / PASO_MIN) + 2;
          const filaFinConv = Math.round((f.finConConversatorioMin - base - inicioGrilla) / PASO_MIN) + 2;
          const elegida = cargado && ids.includes(f.id);
          const peor = elegida ? peorAviso(analisis.avisos.get(f.id)) : null;
          return (
            <div
              key={f.id}
              className={`${styles.bloque} ${styles[`bloque_${p.seccion}`]} ${elegida ? styles.bloqueElegido : ""} ${peor ? styles[`bloqueAviso_${peor}`] : ""}`}
              style={{ gridColumn: col, gridRow: `${filaInicio} / ${filaFinConv}` }}
            >
              <div className={styles.bloquePelicula} style={{ flex: `${filaFin - filaInicio} 0 0` }}>
                <div className={styles.bloqueCabecera}>
                  <span className={`mono ${styles.bloqueHora}`}>
                    {f.horaInicio}–{f.horaFin}
                  </span>
                  <BotonItinerario funcionId={f.id} titulo={p.titulo} conTexto={false} className={styles.bloqueBoton} />
                </div>
                <Link href={`/pelicula/${p.id}`} className={styles.bloqueTitulo}>
                  {p.titulo}
                </Link>
                <span className={styles.bloqueMeta}>
                  {f.agotada ? "Agotada · " : ""}
                  {p.duracionMin} min
                </span>
              </div>
              {f.conversatorioMin && (
                <div className={styles.bloqueConversatorio} style={{ flex: `${filaFinConv - filaFin} 0 0` }}>
                  Conversatorio {f.conversatorioMin} min
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
