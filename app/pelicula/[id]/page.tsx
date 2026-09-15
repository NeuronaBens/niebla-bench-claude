import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Afiche } from "@/components/Afiche";
import { ChipEstreno, ChipSeccion } from "@/components/Etiquetas";
import { TarjetaFuncion } from "@/components/TarjetaFuncion";
import { TarjetaPelicula } from "@/components/TarjetaPelicula";
import {
  ETIQUETA_CLASIFICACION,
  funcionesDePelicula,
  pelicula as buscarPelicula,
  peliculas,
  peliculasDeSeccion,
  seccion,
} from "@/lib/datos";
import { calcularFuncion, formatoDuracion, ordenarPorInicio } from "@/lib/tiempo";
import styles from "./page.module.css";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return peliculas.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = buscarPelicula(id);
  if (!p) return { title: "Película no encontrada" };
  return {
    title: p.titulo,
    description: `${p.titulo} (${p.pais}, ${p.anio}) de ${p.direccion}. ${p.sinopsis}`,
  };
}

export default async function PaginaPelicula({ params }: Props) {
  const { id } = await params;
  const p = buscarPelicula(id);
  if (!p) notFound();

  const sec = seccion(p.seccion);
  const funciones = ordenarPorInicio(funcionesDePelicula(p.id).map(calcularFuncion));
  const relacionadas = peliculasDeSeccion(p.seccion).filter((o) => o.id !== p.id).slice(0, 4);

  return (
    <div className={`pagina ${styles.pagina}`}>
      <div className="contenedor">
        <nav className={styles.miga} aria-label="Ruta">
          <Link href="/programa">Programa</Link>
          <span aria-hidden="true">/</span>
          <Link href={`/programa?seccion=${sec.id}`}>{sec.nombre}</Link>
        </nav>

        <div className={styles.ficha}>
          <div className={styles.afiche}>
            <Afiche pelicula={p} detallado />
          </div>

          <div className={styles.datos}>
            <div className={styles.chips}>
              <ChipSeccion id={p.seccion} />
              <ChipEstreno pelicula={p} />
            </div>
            <h1 className={styles.titulo}>{p.titulo}</h1>
            {p.tituloOriginal && <p className={styles.original}>{p.tituloOriginal}</p>}
            <p className={styles.direccion}>{p.direccion}</p>

            <dl className={styles.tabla}>
              <div>
                <dt>País</dt>
                <dd>{p.pais}</dd>
              </div>
              <div>
                <dt>Año</dt>
                <dd className="mono">{p.anio}</dd>
              </div>
              <div>
                <dt>Duración</dt>
                <dd>{formatoDuracion(p.duracionMin)}</dd>
              </div>
              <div>
                <dt>Clasificación</dt>
                <dd>
                  <span className="mono">{p.clasificacion}</span>{" "}
                  <span className={styles.clasificacionTexto}>{ETIQUETA_CLASIFICACION[p.clasificacion] ?? ""}</span>
                </dd>
              </div>
            </dl>

            <p className={styles.sinopsis}>{p.sinopsis}</p>
            <p className={styles.seccionDesc}>
              <strong>{sec.nombre}.</strong> {sec.descripcion}
            </p>
          </div>
        </div>

        <section className={styles.funciones} aria-labelledby="funciones-titulo">
          <h2 id="funciones-titulo" className={styles.funcionesTitulo}>
            {funciones.length === 1 ? "Una función" : `${funciones.length} funciones`}
          </h2>
          <ol className={styles.lista}>
            {funciones.map((f) => (
              <li key={f.id}>
                <TarjetaFuncion funcion={f} mostrarPelicula={false} mostrarDia />
              </li>
            ))}
          </ol>
        </section>

        {relacionadas.length > 0 && (
          <section className={styles.relacionadas} aria-labelledby="relacionadas-titulo">
            <h2 id="relacionadas-titulo" className={styles.relacionadasTitulo}>
              Más de {sec.nombre}
            </h2>
            <div className={styles.relacionadasGrilla}>
              {relacionadas.map((o) => (
                <TarjetaPelicula key={o.id} pelicula={o} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
