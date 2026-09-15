"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { etiquetaClasificacion, etiquetaEstreno, formatoDuracion, type Funcion } from "@/lib/datos";
import { useItinerario } from "@/lib/almacen";
import Afiche from "./Afiche";
import tf from "./TarjetaFuncion.module.css";
import styles from "./ItinerarioTarjetaCompartida.module.css";

export interface ItinerarioTarjetaCompartidaProps {
  funcion: Funcion;
  avisos?: ReactNode;
}

/**
 * Versión de solo lectura de `TarjetaFuncion` para un itinerario compartido:
 * misma apariencia (reutiliza sus estilos), sin botón de alternar. Marca las
 * funciones que ya están en el itinerario propio.
 */
export default function ItinerarioTarjetaCompartida({ funcion, avisos }: ItinerarioTarjetaCompartidaProps) {
  const { pelicula, sala, seccion } = funcion;
  const { listo, tiene } = useItinerario();
  const enElTuyo = listo && tiene(funcion.id);

  const estilo = {
    "--color-sec": `var(--sec-${seccion.id}, var(--faro))`,
    "--color-sec-suave": `var(--sec-${seccion.id}-suave, var(--faro-suave))`,
  } as CSSProperties;

  const clases = ["tarjeta", tf.tarjeta, tf.conAfiche, styles.tarjeta].join(" ");

  return (
    <article className={clases} style={estilo} aria-labelledby={`tc-${funcion.id}-titulo`}>
      <div className={tf.hora}>
        <time className={tf.horaInicio} dateTime={funcion.inicio}>
          {funcion.horaInicio}
        </time>
        <span className={tf.horaFin}>– {funcion.horaFin}</span>
        {funcion.cruzaMedianoche && <span className={tf.medianoche}>termina pasada la medianoche</span>}
      </div>

      <div className={tf.afiche}>
        <Afiche pelicula={pelicula} tamano="chico" />
      </div>

      <div className={tf.cuerpo}>
        <p className={tf.seccion}>
          <span className={tf.punto} aria-hidden="true" />
          <span className="etiqueta">{seccion.nombre}</span>
        </p>

        <h3 className={tf.titulo} id={`tc-${funcion.id}-titulo`}>
          <Link href={`/pelicula/${pelicula.id}`} className={tf.enlaceTitulo}>
            {pelicula.titulo}
          </Link>
        </h3>

        <p className={tf.meta}>
          <span className={tf.metaItem}>{sala.corto}</span>
          <span className={tf.metaItem}>{formatoDuracion(pelicula.duracionMin)}</span>
          <span className={tf.metaItem}>{etiquetaClasificacion(pelicula.clasificacion)}</span>
        </p>

        <ul className={tf.chips} aria-label="Detalles de la función">
          {enElTuyo && <li className={`${tf.chip} ${styles.enElTuyo}`}>Ya está en tu itinerario</li>}
          {funcion.agotada && <li className={`${tf.chip} ${tf.chipAlerta}`}>Agotada</li>}
          {sala.aireLibre && <li className={tf.chip}>Al aire libre</li>}
          {funcion.conversatorioMin != null && <li className={tf.chip}>Conversatorio +{funcion.conversatorioMin} min</li>}
          <li className={tf.chip}>{etiquetaEstreno(pelicula.estreno)}</li>
        </ul>

        {funcion.nota && <p className={tf.nota}>{funcion.nota}</p>}
      </div>

      {avisos && <div className={tf.avisos}>{avisos}</div>}
    </article>
  );
}
