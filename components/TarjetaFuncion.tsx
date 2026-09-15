"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import {
  etiquetaClasificacion,
  etiquetaEstreno,
  formatoDuracion,
  getDia,
  type Funcion,
} from "@/lib/datos";
import Afiche from "./Afiche";
import BotonItinerario from "./BotonItinerario";
import styles from "./TarjetaFuncion.module.css";

export interface TarjetaFuncionProps {
  funcion: Funcion;
  mostrarDia?: boolean;
  mostrarPelicula?: boolean;
  mostrarAfiche?: boolean;
  avisos?: ReactNode;
}

export default function TarjetaFuncion({
  funcion,
  mostrarDia = false,
  mostrarPelicula = true,
  mostrarAfiche = true,
  avisos,
}: TarjetaFuncionProps) {
  const { pelicula, sala, seccion } = funcion;
  const dia = mostrarDia ? getDia(funcion.dia) : undefined;
  const conAfiche = mostrarAfiche && mostrarPelicula;

  const estilo = {
    "--color-sec": `var(--sec-${seccion.id}, var(--faro))`,
    "--color-sec-suave": `var(--sec-${seccion.id}-suave, var(--faro-suave))`,
  } as CSSProperties;

  const clases = ["tarjeta", styles.tarjeta, conAfiche ? styles.conAfiche : styles.sinAfiche].join(" ");

  return (
    <article className={clases} style={estilo} aria-labelledby={`tf-${funcion.id}-titulo`}>
      <div className={styles.hora}>
        {dia && <span className={styles.dia}>{dia.etiqueta}</span>}
        <time className={styles.horaInicio} dateTime={funcion.inicio}>
          {funcion.horaInicio}
        </time>
        <span className={styles.horaFin}>– {funcion.horaFin}</span>
        {funcion.cruzaMedianoche && <span className={styles.medianoche}>termina pasada la medianoche</span>}
      </div>

      {conAfiche && (
        <div className={styles.afiche}>
          <Afiche pelicula={pelicula} tamano="chico" />
        </div>
      )}

      <div className={styles.cuerpo}>
        <p className={styles.seccion}>
          <span className={styles.punto} aria-hidden="true" />
          <span className="etiqueta">{seccion.nombre}</span>
        </p>

        <h3 className={styles.titulo} id={`tf-${funcion.id}-titulo`}>
          {mostrarPelicula ? (
            <Link href={`/pelicula/${pelicula.id}`} className={styles.enlaceTitulo}>
              {pelicula.titulo}
            </Link>
          ) : (
            <span className="visually-hidden">{pelicula.titulo}, </span>
          )}
          {!mostrarPelicula && <span>{sala.corto}</span>}
        </h3>

        <p className={styles.meta}>
          {mostrarPelicula && <span className={styles.metaItem}>{sala.corto}</span>}
          <span className={styles.metaItem}>{formatoDuracion(pelicula.duracionMin)}</span>
          <span className={styles.metaItem}>{etiquetaClasificacion(pelicula.clasificacion)}</span>
        </p>

        <ul className={styles.chips} aria-label="Detalles de la función">
          {funcion.agotada && <li className={`${styles.chip} ${styles.chipAlerta}`}>Agotada</li>}
          {sala.aireLibre && <li className={styles.chip}>Al aire libre</li>}
          {funcion.conversatorioMin != null && (
            <li className={styles.chip}>Conversatorio +{funcion.conversatorioMin} min</li>
          )}
          <li className={styles.chip}>{etiquetaEstreno(pelicula.estreno)}</li>
        </ul>

        {funcion.nota && <p className={styles.nota}>{funcion.nota}</p>}
      </div>

      <div className={styles.boton}>
        <BotonItinerario funcion={funcion} compacto />
      </div>

      {avisos && <div className={styles.avisos}>{avisos}</div>}
    </article>
  );
}
