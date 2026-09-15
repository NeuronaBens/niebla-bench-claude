import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  etiquetaClasificacion,
  etiquetaEstreno,
  formatoDuracion,
  funcionesDePelicula,
  getPelicula,
  getSeccion,
  peliculas,
  peliculasDeSeccion,
} from "@/lib/datos";
import Afiche from "@/components/Afiche";
import TarjetaFuncion from "@/components/TarjetaFuncion";
import styles from "./pelicula.module.css";

interface Props {
  params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return peliculas.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pelicula = getPelicula(id);
  if (!pelicula) return { title: "Película no encontrada" };
  return {
    title: pelicula.titulo,
    description: pelicula.sinopsis,
  };
}

const MAX_RELACIONADAS = 4;

/** Otras películas de la misma sección, empezando por la siguiente en el orden del programa (así cada ficha muestra un grupo distinto). */
function relacionadas(peliculaId: string, seccionId: string) {
  const lista = peliculasDeSeccion(seccionId);
  const indice = lista.findIndex((p) => p.id === peliculaId);
  const otras = [...lista.slice(indice + 1), ...lista.slice(0, Math.max(indice, 0))].filter((p) => p.id !== peliculaId);
  return otras.slice(0, MAX_RELACIONADAS);
}

function IconoFlecha() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
      <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function PeliculaPage({ params }: Props) {
  const { id } = await params;
  const pelicula = getPelicula(id);
  if (!pelicula) notFound();

  const seccion = getSeccion(pelicula.seccion);
  const funciones = funcionesDePelicula(pelicula.id);
  const otras = relacionadas(pelicula.id, pelicula.seccion);

  const estilo = {
    "--color-sec": `var(--sec-${pelicula.seccion}, var(--faro))`,
    "--color-sec-suave": `var(--sec-${pelicula.seccion}-suave, var(--faro-suave))`,
  } as CSSProperties;

  const datos = [
    pelicula.direccion,
    pelicula.pais,
    String(pelicula.anio),
    formatoDuracion(pelicula.duracionMin),
    etiquetaClasificacion(pelicula.clasificacion),
  ];

  return (
    <article className={`contenedor ${styles.ficha}`} style={estilo}>
      <nav className={styles.volver} aria-label="Volver">
        <Link href="/programa" className={styles.enlaceVolver}>
          <IconoFlecha />
          Volver al programa
        </Link>
      </nav>

      <div className={styles.columnas}>
        <div className={styles.columnaAfiche}>
          <div className={styles.afiche}>
            <Afiche pelicula={pelicula} tamano="grande" />
          </div>
        </div>

        <div className={styles.contenido}>
          <header className={styles.cabecera}>
            {seccion && (
              <Link href={`/programa?seccion=${seccion.id}`} className={styles.seccion}>
                <span className={styles.punto} aria-hidden="true" />
                <span className="etiqueta">{seccion.nombre}</span>
              </Link>
            )}
            <h1 className={styles.titulo}>{pelicula.titulo}</h1>
            {pelicula.tituloOriginal && (
              <p className={styles.tituloOriginal} lang="und">
                {pelicula.tituloOriginal}
              </p>
            )}
            <p className={styles.datos}>
              {datos.map((d, i) => (
                <span key={i} className={styles.dato}>
                  {d}
                </span>
              ))}
            </p>
            <p className={styles.chips}>
              <span className={styles.chipEstreno}>{etiquetaEstreno(pelicula.estreno)}</span>
            </p>
          </header>

          <p className={styles.sinopsis}>{pelicula.sinopsis}</p>

          <section className={styles.bloque} aria-labelledby="ficha-funciones">
            <h2 className={styles.subtitulo} id="ficha-funciones">
              Funciones
            </h2>
            {funciones.length > 0 ? (
              <ul className={styles.funciones}>
                {funciones.map((f) => (
                  <li key={f.id}>
                    <TarjetaFuncion funcion={f} mostrarDia mostrarPelicula={false} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.sinFunciones}>Esta película no tiene funciones programadas.</p>
            )}
          </section>

          {seccion && otras.length > 0 && (
            <section className={styles.bloque} aria-labelledby="ficha-mas">
              <div className={styles.masCabecera}>
                <h2 className={styles.subtitulo} id="ficha-mas">
                  Más de {seccion.nombre}
                </h2>
                <Link href={`/programa?seccion=${seccion.id}`} className={styles.masEnlace}>
                  Ver la sección
                </Link>
              </div>
              <ul className={styles.mas}>
                {otras.map((p) => (
                  <li key={p.id} className={styles.masItem}>
                    <Link href={`/pelicula/${p.id}`} className={styles.masEnlaceAfiche} aria-label={p.titulo}>
                      <Afiche pelicula={p} tamano="chico" />
                    </Link>
                    <Link href={`/pelicula/${p.id}`} className={styles.masTitulo} tabIndex={-1} aria-hidden="true">
                      {p.titulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className={styles.volverAbajo}>
            <Link href="/programa" className="boton boton--fantasma">
              <IconoFlecha />
              Volver al programa
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}
