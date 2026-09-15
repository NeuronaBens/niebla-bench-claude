import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Afiche from "@/components/Afiche";
import FuncionFila from "@/components/FuncionFila";
import TarjetaPelicula from "@/components/TarjetaPelicula";
import {
  CLASIFICACION,
  funcionesDePelicula,
  peliculaPorId,
  peliculas,
  seccionPorId,
  textoEstreno,
} from "@/lib/programa";
import { duracion } from "@/lib/tiempo";
import s from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return peliculas.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: PageProps<"/pelicula/[id]">): Promise<Metadata> {
  const { id } = await params;
  const p = peliculaPorId.get(id);
  if (!p) return {};
  return {
    title: p.titulo,
    description: `${p.titulo}, de ${p.direccion} (${p.pais}, ${p.anio}). ${p.sinopsis}`,
  };
}

export default async function PaginaPelicula({ params }: PageProps<"/pelicula/[id]">) {
  const { id } = await params;
  const p = peliculaPorId.get(id);
  if (!p) notFound();

  const seccion = seccionPorId.get(p.seccion)!;
  const fs = funcionesDePelicula(p.id);
  const otras = peliculas.filter((x) => x.seccion === p.seccion && x.id !== p.id);

  const datos: [string, string][] = [
    ["Dirección", p.direccion],
    ["País", p.pais],
    ["Año", String(p.anio)],
    ["Duración", duracion(p.duracionMin)],
    ["Clasificación", CLASIFICACION[p.clasificacion] ?? p.clasificacion],
    ["Estreno", textoEstreno(p.estreno)],
  ];

  return (
    <article className={s.pagina} data-seccion={p.seccion}>
      <div className={`contenedor ${s.volverFila}`}>
        <Link href="/programa" className={s.volver}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M12 4 6 10l6 6" />
          </svg>
          Programa
        </Link>
      </div>

      <div className={`contenedor ${s.cabecera}`}>
        <div className={s.afiche}>
          <Afiche semilla={p.id} seccion={p.seccion} detalle="alto" />
          <span className={s.estreno}>{textoEstreno(p.estreno)}</span>
        </div>

        <div className={s.info}>
          <Link href={`/programa?seccion=${seccion.id}`} className={s.seccion}>
            <span className={s.punto} aria-hidden="true" />
            {seccion.nombre}
          </Link>
          <h1 className={s.titulo}>{p.titulo}</h1>
          {p.tituloOriginal && (
            <p className={s.original} lang="">
              {p.tituloOriginal}
            </p>
          )}
          <p className={s.sinopsis}>{p.sinopsis}</p>

          <dl className={s.datos}>
            {datos.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <section className={`contenedor ${s.funciones}`} aria-labelledby="titulo-funciones">
        <h2 id="titulo-funciones" className={s.subtitulo}>
          {fs.length === 1 ? "Una función" : `${fs.length} funciones`}
        </h2>
        <ol className={s.listaFunciones}>
          {fs.map((f) => (
            <li key={f.id}>
              <FuncionFila f={f} conPelicula={false} />
            </li>
          ))}
        </ol>
      </section>

      {otras.length > 0 && (
        <section className={`contenedor ${s.otras}`} aria-labelledby="titulo-otras">
          <h2 id="titulo-otras" className={s.subtitulo}>
            También en {seccion.nombre}
          </h2>
          <div className={s.grillaOtras}>
            {otras.map((o) => (
              <TarjetaPelicula key={o.id} p={o} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
