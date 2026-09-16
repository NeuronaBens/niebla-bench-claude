import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { AfichePelicula } from '@/components/afiche/AfichePelicula'
import { FuncionEnFicha } from '@/components/funcion/FuncionEnFicha'
import { VolverAlPrograma } from '@/components/pelicula/VolverAlPrograma'
import { estiloDeSeccion } from '@/lib/estiloSecciones'
import { formatearDuracion, textoClasificacion, textoEstreno } from '@/lib/formato'
import { funcionesDePelicula, peliculaPorId, peliculas, peliculasPorSeccion } from '@/lib/programa'
import styles from './ficha.module.css'

export function generateStaticParams() {
  return peliculas.map((p) => ({ id: p.id }))
}

export const dynamicParams = false

export async function generateMetadata(props: PageProps<'/pelicula/[id]'>): Promise<Metadata> {
  const { id } = await props.params
  const pelicula = peliculaPorId(id)
  if (!pelicula) return {}
  const primeraFrase = pelicula.sinopsis.split('. ')[0]
  return {
    title: pelicula.titulo,
    description: `${primeraFrase}.`,
  }
}

export default async function FichaPelicula(props: PageProps<'/pelicula/[id]'>) {
  const { id } = await props.params
  const pelicula = peliculaPorId(id)
  if (!pelicula) notFound()

  const estilo = estiloDeSeccion(pelicula.seccion)
  const funciones = funcionesDePelicula(pelicula.id)
  const otrasDeLaSeccion = peliculasPorSeccion(pelicula.seccion)
    .filter((p) => p.id !== pelicula.id)
    .slice(0, 4)

  return (
    <div className={`${styles.pagina} contenedor`}>
      <VolverAlPrograma />
      <div className={styles.disposicion}>
        <div className={styles.columnaAfiche}>
          <div className={styles.afiche}>
            <AfichePelicula pelicula={pelicula} tamano="grande" instancia="ficha" />
          </div>
        </div>

        <div className={styles.columnaInfo}>
          <Link href={`/programa?seccion=${pelicula.seccion}`} className={styles.seccionLink} style={{ color: estilo.colorTinta }}>
            {estilo.nombreCorto}
          </Link>
          <h1 className={styles.titulo}>{pelicula.titulo}</h1>
          {pelicula.tituloOriginal && <p className={styles.tituloOriginal}>{pelicula.tituloOriginal}</p>}

          <dl className={styles.fichaTecnica}>
            <div>
              <dt>Dirección</dt>
              <dd>{pelicula.direccion}</dd>
            </div>
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
              <dd>{formatearDuracion(pelicula.duracionMin)}</dd>
            </div>
            <div>
              <dt>Clasificación</dt>
              <dd>{textoClasificacion(pelicula.clasificacion)}</dd>
            </div>
            <div>
              <dt>Estreno</dt>
              <dd>{textoEstreno(pelicula.estreno)}</dd>
            </div>
          </dl>

          <p className={styles.sinopsis}>{pelicula.sinopsis}</p>
        </div>
      </div>

      <section className={styles.seccionFunciones} aria-labelledby="titulo-funciones">
        <h2 id="titulo-funciones" className={styles.tituloFunciones}>
          Funciones
        </h2>
        <ul className={styles.listaFunciones}>
          {funciones.map((f) => (
            <FuncionEnFicha key={f.id} funcion={f} />
          ))}
        </ul>
      </section>

      {otrasDeLaSeccion.length > 0 && (
        <section className={styles.seccionOtras} aria-labelledby="titulo-otras">
          <h2 id="titulo-otras" className={styles.tituloFunciones}>
            Más de {estilo.nombreCorto}
          </h2>
          <ul className={styles.listaOtras}>
            {otrasDeLaSeccion.map((p) => (
              <li key={p.id}>
                <Link href={`/pelicula/${p.id}`} className={styles.otraPelicula}>
                  <span className={styles.otraAfiche}>
                    <AfichePelicula pelicula={p} tamano="medio" instancia="ficha-relacionadas" />
                  </span>
                  <span>{p.titulo}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
