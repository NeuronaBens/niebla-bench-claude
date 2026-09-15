"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Afiche } from "./Afiche";
import { BotonItinerario } from "./BotonItinerario";
import { ChipSeccion, ChipsFuncion } from "./Etiquetas";
import { avisosSiAgrego, peorAviso, type Aviso } from "@/lib/conflictos";
import { pelicula as buscarPelicula, sala, type Funcion } from "@/lib/datos";
import { useItinerario } from "@/lib/itinerario-store";
import { calcularFuncion, formatoDuracion } from "@/lib/tiempo";
import styles from "./TarjetaFuncion.module.css";

type Props = {
  funcion: Funcion;
  /** Muestra afiche y título (falso en la ficha de la película). */
  mostrarPelicula?: boolean;
  /** Muestra el día junto a la hora. */
  mostrarDia?: boolean;
  /** Avisos ya calculados para esta función (cuando está elegida). */
  avisos?: Aviso[];
  /** Si es verdadero, no calcula avisos hipotéticos para funciones no elegidas. */
  sinHipoteticos?: boolean;
  /** Sin botón de agregar (para itinerarios compartidos, por ejemplo). */
  sinBoton?: boolean;
};

export function TarjetaFuncion({
  funcion,
  mostrarPelicula = true,
  mostrarDia = false,
  avisos,
  sinHipoteticos = false,
  sinBoton = false,
}: Props) {
  const { ids, cargado } = useItinerario();
  const p = buscarPelicula(funcion.peliculaId);
  const s = sala(funcion.salaId);
  const calc = useMemo(() => calcularFuncion(funcion), [funcion]);
  const elegida = cargado && ids.includes(funcion.id);

  const hipoteticos = useMemo(
    () => (cargado && !elegida && !sinHipoteticos ? avisosSiAgrego(ids, funcion.id) : []),
    [cargado, elegida, sinHipoteticos, ids, funcion.id],
  );

  if (!p) return null;

  const listaAvisos = elegida ? (avisos ?? []) : [];
  const peor = peorAviso(listaAvisos);
  const peorHipotetico = peorAviso(hipoteticos);

  return (
    <article
      className={[
        styles.tarjeta,
        elegida ? styles.elegida : "",
        peor ? styles[`aviso_${peor}`] : "",
        funcion.agotada ? styles.agotada : "",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={`f-${funcion.id}-titulo`}
    >
      <div className={styles.hora}>
        {mostrarDia && <span className={styles.dia}>{calc.dia.nombreCorto}</span>}
        <span className={`mono ${styles.inicio}`}>{calc.horaInicio}</span>
        <span className={`mono ${styles.fin}`}>
          {calc.horaFin}
          {calc.terminaAlDiaSiguiente && <span className={styles.finNota}>+1</span>}
        </span>
      </div>

      {mostrarPelicula && (
        <Link href={`/pelicula/${p.id}`} className={styles.miniatura} tabIndex={-1} aria-hidden="true">
          <Afiche pelicula={p} />
        </Link>
      )}

      <div className={styles.cuerpo}>
        <h3 className={styles.titulo} id={`f-${funcion.id}-titulo`}>
          {mostrarPelicula ? (
            <Link href={`/pelicula/${p.id}`}>{p.titulo}</Link>
          ) : (
            <span>{s.nombre}</span>
          )}
        </h3>
        <p className={styles.meta}>
          {mostrarPelicula && (
            <>
              <span className={styles.sala}>{s.nombre}</span>
              <span className={styles.punto} aria-hidden="true">
                ·
              </span>
            </>
          )}
          <span>{formatoDuracion(p.duracionMin)}</span>
          <span className={styles.punto} aria-hidden="true">
            ·
          </span>
          <span>{p.clasificacion}</span>
          {!mostrarPelicula && (
            <>
              <span className={styles.punto} aria-hidden="true">
                ·
              </span>
              <span>{s.direccion}</span>
            </>
          )}
        </p>
        <div className={styles.chips}>
          {mostrarPelicula && <ChipSeccion id={p.seccion} />}
          <ChipsFuncion funcion={funcion} />
        </div>
        {funcion.nota && <p className={styles.nota}>{funcion.nota}</p>}

        {listaAvisos.length > 0 && (
          <ul className={styles.avisos} aria-label="Avisos del itinerario">
            {listaAvisos.map((a, i) => (
              <li key={i} className={`${styles.avisoItem} ${styles[`texto_${a.tipo}`]}`}>
                {a.mensaje}
              </li>
            ))}
          </ul>
        )}

        {!elegida && peorHipotetico && (
          <p className={`${styles.hipotetico} ${styles[`texto_${peorHipotetico}`]}`}>
            {peorHipotetico === "choque" && "Se topa con algo de tu itinerario."}
            {peorHipotetico === "traslado" && "No alcanzarías a llegar caminando desde tu función anterior."}
            {peorHipotetico === "conversatorio" && "Te perderías un conversatorio de tu itinerario."}
          </p>
        )}
      </div>

      {!sinBoton && (
        <div className={styles.accion}>
          <BotonItinerario funcionId={funcion.id} titulo={p.titulo} />
        </div>
      )}
    </article>
  );
}
