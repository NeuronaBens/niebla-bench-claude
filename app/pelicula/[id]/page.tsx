import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Afiche from "@/components/afiche/Afiche";
import {
  festival,
  formatoClasificacion,
  formatoDuracion,
  formatoEstreno,
  formatoPrecio,
  funcionesDePelicula,
  peliculaPorId,
  peliculas,
  peliculasDeSeccion,
  salas,
  seccionPorId,
  type Pelicula,
} from "@/lib/programa";
import Boleto from "./Boleto";
import s from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return peliculas.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/pelicula/[id]">): Promise<Metadata> {
  const { id } = await params;
  const pelicula = peliculaPorId.get(id);
  if (!pelicula) return {};
  const n = funcionesDePelicula(id).length;
  const descripcion = `${pelicula.sinopsis} ${quienDirige(pelicula)}, ${pelicula.pais}, ${pelicula.anio}. ${n} ${n === 1 ? "función" : "funciones"} en el ${festival.nombre}.`;
  return {
    title: pelicula.titulo,
    description: descripcion,
    openGraph: { title: `${pelicula.titulo} · ${festival.nombre}`, description: descripcion, type: "article" },
  };
}

function quienDirige(p: Pelicula): string {
  if (/^(varios|colectivo)/i.test(p.direccion)) return p.direccion;
  return `De ${p.direccion}`;
}

/** Idioma probable del título original, para que los lectores de pantalla lo pronuncien bien. */
const IDIOMA_POR_PAIS: Record<string, string> = {
  Noruega: "no",
  Japón: "ja-Latn",
  Francia: "fr",
  Dinamarca: "da",
  Canadá: "en",
  Nigeria: "en",
};

export default async function FichaPage({ params }: PageProps<"/pelicula/[id]">) {
  const { id } = await params;
  const pelicula = peliculaPorId.get(id);
  if (!pelicula) notFound();

  const seccion = seccionPorId.get(pelicula.seccion)!;
  const funciones = funcionesDePelicula(pelicula.id);
  const otras = peliculasDeSeccion(seccion.id).filter((p) => p.id !== pelicula.id);
  const hrefSeccion = `/programa?seccion=${seccion.id}`;
  const idioma = IDIOMA_POR_PAIS[pelicula.pais.split(",")[0].trim()];
  const aireLibre = salas.filter((x) => x.aireLibre);
  const estiloSeccion = { "--sec": `var(--sec-${seccion.id})` } as CSSProperties;

  return (
    <article className={s.ficha} style={estiloSeccion}>
      <div className={s.contenedor}>
        <nav className={s.migas} aria-label="Volver">
          <ol>
            <li>
              <Link href="/programa" className={s.volver}>
                <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" className={s.flecha}>
                  <path d="M10 3L5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Programa
              </Link>
            </li>
          </ol>
        </nav>

        <div className={s.grilla}>
          <div className={s.colAfiche}>
            <div className={s.aficheGrande}>
              <Afiche pelicula={pelicula} tamano="grande" />
            </div>
          </div>

          <div className={s.colInfo}>
            <header className={s.cabecera}>
              <Link href={hrefSeccion} className={s.seccion}>
                <span className={s.punto} aria-hidden="true" />
                {seccion.nombre}
              </Link>
              <h1 className={s.titulo}>{pelicula.titulo}</h1>
              {pelicula.tituloOriginal && (
                <p className={s.original}>
                  Título original: <cite lang={idioma}>{pelicula.tituloOriginal}</cite>
                </p>
              )}
              <p className={s.direccion}>
                <span className={s.etiqueta}>Dirección</span> {pelicula.direccion}
              </p>
            </header>

            <div className={s.resumen}>
              <div className={s.aficheMovil}>
                <Afiche pelicula={pelicula} tamano="tarjeta" />
              </div>
              <dl className={s.datos}>
                <div>
                  <dt>País</dt>
                  <dd>{pelicula.pais}</dd>
                </div>
                <div>
                  <dt>Año</dt>
                  <dd>{pelicula.anio}</dd>
                </div>
                <div>
                  <dt>Duración</dt>
                  <dd>{formatoDuracion(pelicula.duracionMin)}</dd>
                </div>
                <div>
                  <dt>Clasificación</dt>
                  <dd>{formatoClasificacion(pelicula.clasificacion)}</dd>
                </div>
                <div className={s.datoAncho}>
                  <dt>Estreno</dt>
                  <dd>{formatoEstreno(pelicula.estreno)}</dd>
                </div>
              </dl>
            </div>

            <p className={s.sinopsis}>{pelicula.sinopsis}</p>

            <section className={s.funciones} aria-labelledby="titulo-funciones">
              <h2 id="titulo-funciones" className={s.subtitulo}>
                {funciones.length === 1 ? "Función" : "Funciones"}
                <span className={s.cuenta}>{String(funciones.length).padStart(2, "0")}</span>
              </h2>
              <ol className={s.boletos}>
                {funciones.map((f, i) => (
                  <li key={f.id}>
                    <Boleto funcion={f} numero={i + 1} />
                  </li>
                ))}
              </ol>

              <aside className={s.entradas} aria-labelledby="titulo-entradas">
                <h3 id="titulo-entradas" className={s.entradasTitulo}>
                  Entradas
                </h3>
                <p>{festival.entradas.venta}</p>
                <ul className={s.tarifas}>
                  <li>
                    <span>General</span>
                    <strong>{formatoPrecio(festival.entradas.general)}</strong>
                  </li>
                  {aireLibre.map((sala) => (
                    <li key={sala.id}>
                      <span>{sala.nombre}, al aire libre</span>
                      <strong>{formatoPrecio(festival.entradas.aireLibre)}</strong>
                    </li>
                  ))}
                </ul>
              </aside>
            </section>
          </div>
        </div>

        {otras.length > 0 && (
          <section className={s.otras} aria-labelledby="titulo-otras">
            <div className={s.otrasCabecera}>
              <h2 id="titulo-otras" className={s.subtitulo}>
                Más de {seccion.nombre}
              </h2>
              <Link href={hrefSeccion} className={s.verSeccion}>
                Ver la sección en el programa
              </Link>
            </div>
            <p className={s.seccionDescripcion}>{seccion.descripcion}</p>
            <ul className={s.carrusel}>
              {otras.map((p) => {
                const fs = funcionesDePelicula(p.id);
                return (
                  <li key={p.id}>
                    <Link href={`/pelicula/${p.id}`} className={s.tarjeta}>
                      <span className={s.tarjetaAfiche} aria-hidden="true">
                        <Afiche pelicula={p} tamano="tarjeta" />
                      </span>
                      <span className="sr-only">{p.titulo}, funciones: </span>
                      <span className={s.tarjetaHoras}>
                        {fs.map((f) => (
                          <span key={f.id}>
                            {f.dia.corto} {f.dia.numero} · {f.horaInicio}
                          </span>
                        ))}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
