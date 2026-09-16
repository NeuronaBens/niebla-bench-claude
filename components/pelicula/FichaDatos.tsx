import Link from 'next/link'
import Etiqueta from '@/components/marcas/Etiqueta'
import PuntoSeccion from '@/components/marcas/PuntoSeccion'
import { ETIQUETA_CLASIFICACION, ETIQUETA_ESTRENO } from '@/lib/etiquetas'
import { formatoDuracion } from '@/lib/formato'
import type { Pelicula } from '@/lib/tipos'
import estilos from './FichaDatos.module.css'

interface Props {
  pelicula: Pelicula
}

export default function FichaDatos({ pelicula }: Props) {
  return (
    <div data-seccion={pelicula.seccion}>
      <p className={estilos.rotuloSeccion}>
        <PuntoSeccion />
        <Link href={`/programa?seccion=${pelicula.seccion}`}>Ver en el programa</Link>
      </p>
      <h1>{pelicula.titulo}</h1>
      {pelicula.tituloOriginal && <p className={estilos.tituloOriginal}>Título original: {pelicula.tituloOriginal}</p>}
      <p className={estilos.estreno}>
        <Etiqueta tipo="estreno">{ETIQUETA_ESTRENO[pelicula.estreno]}</Etiqueta>
      </p>
      <dl className={estilos.datos}>
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
          <dd>{formatoDuracion(pelicula.duracionMin)}</dd>
        </div>
        <div>
          <dt>Clasificación</dt>
          <dd>{ETIQUETA_CLASIFICACION[pelicula.clasificacion]}</dd>
        </div>
      </dl>
      <p className={estilos.sinopsis}>{pelicula.sinopsis}</p>
    </div>
  )
}
