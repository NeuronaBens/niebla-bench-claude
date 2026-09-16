import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  peliculas,
  getPelicula,
  funcionesDePelicula,
  getSeccion,
} from "@/lib/programa";
import { formatoDuracion } from "@/lib/tiempo";
import Afiche from "@/components/Afiche";
import TarjetaFuncion from "@/components/TarjetaFuncion";
import Etiqueta from "@/components/Etiqueta";
import styles from "./page.module.css";

export async function generateStaticParams() {
  return peliculas.map((pelicula) => ({
    id: pelicula.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const pelicula = getPelicula(id);

  if (!pelicula) {
    return { title: "Película no encontrada" };
  }

  return {
    title: `${pelicula.titulo} · Festival de Cine Niebla`,
    description: pelicula.sinopsis,
  };
}

export default async function PeliculaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pelicula = getPelicula(id);

  if (!pelicula) {
    notFound();
  }

  const funciones = funcionesDePelicula(id);
  const seccion = getSeccion(pelicula.seccion);

  const textEstreno =
    pelicula.estreno === "mundial"
      ? "Estreno mundial"
      : pelicula.estreno === "latinoamericano"
        ? "Estreno latinoamericano"
        : "Estreno nacional";

  // Películas de la misma sección (sin la actual)
  const peliculasMismaSeccion = peliculas
    .filter((p) => p.seccion === pelicula.seccion && p.id !== pelicula.id)
    .slice(0, 4);

  return (
    <div className={styles.pelicula}>
      <Link href="/programa" className={styles.volver}>
        Volver al programa
      </Link>

      <div className={styles.principal}>
        <div className={styles.afiche}>
          <Afiche pelicula={pelicula} variante="grande" sinTexto />
        </div>

        <div className={styles.ficha}>
          <h1 className={styles.titulo}>{pelicula.titulo}</h1>

          {pelicula.tituloOriginal && (
            <div className={styles.tituloOriginal}>
              Título original: {pelicula.tituloOriginal}
            </div>
          )}

          <div className={styles.datos}>
            <div className={styles.datosGrupo}>
              <span className={styles.datosGrupoLabel}>Dirección</span>
              <span className={styles.datosGrupoValor}>{pelicula.direccion}</span>
            </div>

            <div className={styles.datosGrupo}>
              <span className={styles.datosGrupoLabel}>País</span>
              <span className={styles.datosGrupoValor}>{pelicula.pais}</span>
            </div>

            <div className={styles.datosGrupo}>
              <span className={styles.datosGrupoLabel}>Año</span>
              <span className={styles.datosGrupoValor}>{pelicula.anio}</span>
            </div>

            <div className={styles.datosGrupo}>
              <span className={styles.datosGrupoLabel}>Duración</span>
              <span className={styles.datosGrupoValor}>{formatoDuracion(pelicula.duracionMin)}</span>
            </div>

            <div className={styles.datosGrupo}>
              <span className={styles.datosGrupoLabel}>Sección</span>
              <Link
                href={`/programa?seccion=${pelicula.seccion}`}
                className={`${styles.seccionLink} sec-${pelicula.seccion}`}
              >
                {seccion?.nombre}
              </Link>
            </div>
          </div>

          <div className={styles.etiquetas}>
            <Etiqueta tipo="clasificacion" texto={pelicula.clasificacion} />
            <Etiqueta tipo="estreno" texto={textEstreno} />
          </div>

          <div className={styles.sinopsis}>{pelicula.sinopsis}</div>
        </div>
      </div>

      {funciones.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Funciones</h2>
          <div className={styles.funciones}>
            {funciones.map((funcion) => (
              <TarjetaFuncion
                key={funcion.id}
                funcion={funcion}
                mostrarDia={true}
              />
            ))}
          </div>
        </section>
      )}

      {peliculasMismaSeccion.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Más de {seccion?.nombre.toLowerCase()}</h2>
          <div className={styles.masDelaSerie}>
            {peliculasMismaSeccion.map((peli) => (
              <Link
                key={peli.id}
                href={`/pelicula/${peli.id}`}
                className={styles.tarjetaPelicula}
              >
                <Afiche pelicula={peli} variante="tarjeta" />
                <h3 className={styles.tarjetaPeliculaTitulo}>{peli.titulo}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Link href="/programa" className={styles.volverFinal}>
        Volver al programa
      </Link>
    </div>
  );
}
