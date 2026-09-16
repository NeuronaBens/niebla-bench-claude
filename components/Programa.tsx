"use client";

import type { CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { funcionesExpandidas, secciones, salas, nombreCorto } from "@/lib/programa";
import { DIAS, formatoHora } from "@/lib/tiempo";
import TarjetaFuncion from "./TarjetaFuncion";
import styles from "./Programa.module.css";

const PASO = 15; // minutos por fila de la grilla

// Rango horario de cada día, calculado sobre TODAS las funciones (no cambia con los filtros)
const RANGO_DIA = DIAS.map((dia) => {
  const delDia = funcionesExpandidas.filter((f) => f.dia === dia.index);
  const inicio = Math.floor(Math.min(...delDia.map((f) => f.inicioMin)) / 60) * 60;
  const fin = Math.ceil(Math.max(...delDia.map((f) => f.finConversatorioMin)) / 60) * 60;
  return { inicio, fin, filas: (fin - inicio) / PASO };
});

export default function Programa() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // La URL es la fuente de verdad de los filtros
  const diaParam = searchParams.get("dia");
  const seccionActiva = searchParams.get("seccion");
  const ocultarAgotadas = searchParams.get("agotadas") === "ocultar";

  let diaActivo: number | null;
  if (diaParam === "todos") diaActivo = null;
  else if (diaParam !== null && /^[0-2]$/.test(diaParam)) diaActivo = Number(diaParam);
  else diaActivo = seccionActiva ? null : 0;

  const cambiarUrl = (dia: number | null, seccion: string | null, ocultar: boolean) => {
    const params = new URLSearchParams();
    params.set("dia", dia === null ? "todos" : String(dia));
    if (seccion) params.set("seccion", seccion);
    if (ocultar) params.set("agotadas", "ocultar");
    router.replace(`/programa?${params.toString()}`, { scroll: false });
  };

  const funcionesFiltradas = funcionesExpandidas.filter(
    (f) =>
      (diaActivo === null || f.dia === diaActivo) &&
      (!seccionActiva || f.seccion.id === seccionActiva) &&
      (!ocultarAgotadas || !f.agotada)
  );

  const diasVisibles = DIAS.filter((dia) => diaActivo === null || dia.index === diaActivo);

  return (
    <div className={styles.programa}>
      <div className={styles.filtros}>
        <div className={styles.tabs} role="tablist" aria-label="Día">
          {DIAS.map((dia) => (
            <button
              key={dia.index}
              role="tab"
              aria-selected={diaActivo === dia.index}
              onClick={() => cambiarUrl(dia.index, seccionActiva, ocultarAgotadas)}
              className={`${styles.tab} ${diaActivo === dia.index ? styles.activo : ""}`}
            >
              {dia.corto}
            </button>
          ))}
          <button
            role="tab"
            aria-selected={diaActivo === null}
            onClick={() => cambiarUrl(null, seccionActiva, ocultarAgotadas)}
            className={`${styles.tab} ${diaActivo === null ? styles.activo : ""}`}
          >
            Todos
          </button>
        </div>

        <div className={styles.chipsFila}>
          <div className={styles.chips}>
            <button
              onClick={() => cambiarUrl(diaActivo, null, ocultarAgotadas)}
              className={`${styles.chip} ${!seccionActiva ? styles.activo : ""}`}
              aria-pressed={!seccionActiva}
            >
              Todas
            </button>
            {secciones.map((seccion) => (
              <button
                key={seccion.id}
                onClick={() => cambiarUrl(diaActivo, seccion.id, ocultarAgotadas)}
                className={`${styles.chip} sec-${seccion.id} ${seccionActiva === seccion.id ? styles.activo : ""}`}
                aria-pressed={seccionActiva === seccion.id}
              >
                {seccion.nombre}
              </button>
            ))}
            <button
              onClick={() => cambiarUrl(diaActivo, seccionActiva, !ocultarAgotadas)}
              className={`${styles.chip} ${ocultarAgotadas ? styles.activo : ""}`}
              aria-pressed={ocultarAgotadas}
            >
              Ocultar agotadas
            </button>
          </div>
          <div className={styles.conteo} aria-live="polite">
            {funcionesFiltradas.length} {funcionesFiltradas.length === 1 ? "función" : "funciones"}
          </div>
        </div>
      </div>

      {funcionesFiltradas.length === 0 && (
        <div className={styles.vacio}>
          Con estos filtros no queda ninguna función. Prueba con otro día u otra sección.
        </div>
      )}

      {diasVisibles.map((dia) => {
        const funcionesDia = funcionesFiltradas.filter((f) => f.dia === dia.index);
        if (funcionesDia.length === 0) return null;
        const rango = RANGO_DIA[dia.index];

        const horas: number[] = [];
        for (let m = rango.inicio; m <= rango.fin; m += 60) horas.push(m);

        return (
          <section key={dia.index} className={styles.bloqueDia} aria-label={dia.largo}>
            <h2 className={styles.diaEncabezado}>{dia.largo}</h2>

            <div
              className={styles.dia}
              style={{ gridTemplateRows: `auto repeat(${rango.filas}, var(--alto-fila))` } as CSSProperties}
            >
              {salas.map((sala, idx) => (
                <div key={sala.id} className={styles.salaEncabezado} style={{ gridColumn: idx + 2 }}>
                  <div>{nombreCorto(sala)}</div>
                  {sala.aireLibre && <div className={styles.salaNota}>aire libre</div>}
                </div>
              ))}

              {horas.map((m) => {
                const fila = 2 + (m - rango.inicio) / PASO;
                return (
                  <div key={m} className={styles.horaLinea} style={{ gridRow: fila }}>
                    <span className={styles.horaTexto}>{formatoHora(m)}</span>
                  </div>
                );
              })}

              {funcionesDia.map((f) => {
                const col = salas.findIndex((s) => s.id === f.sala.id) + 2;
                const filaIni = 2 + Math.floor((f.inicioMin - rango.inicio) / PASO);
                const filaFin = 2 + Math.ceil((f.finConversatorioMin - rango.inicio) / PASO);
                return (
                  <div
                    key={f.id}
                    className={styles.celda}
                    style={{ gridColumn: col, gridRow: `${filaIni} / ${filaFin}` }}
                  >
                    <TarjetaFuncion funcion={f} variante="grilla" />
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      <div className={styles.leyenda}>
        <h3 className={styles.leyendaTitulo}>Secciones</h3>
        <div className={styles.leyendaItems}>
          {secciones.map((seccion) => (
            <div key={seccion.id} className={`${styles.leyendaItem} sec-${seccion.id}`}>
              <span className={styles.leyendaColor} />
              {seccion.nombre}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
