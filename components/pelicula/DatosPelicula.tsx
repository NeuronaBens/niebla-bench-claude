import Link from 'next/link'
import { Cartel } from '@/components/cartel/Cartel.tsx'
import { Etiqueta } from '@/components/ui/Etiqueta'
import { VolverAlPrograma } from './VolverAlPrograma.tsx'
import { clasificacionLarga, estrenoTexto, nombreCortoSeccion } from '@/lib/formato'
import { duracionLarga } from '@/lib/tiempo'
import type { Pelicula, Seccion } from '@/lib/tipos'
import estilos from './DatosPelicula.module.css'

export function DatosPelicula({ pelicula, seccion }: { pelicula: Pelicula; seccion: Seccion }) {
  return (
    <>
      <div className={estilos.cabecera} data-zona="noche">
        <div className={`contenedor ${estilos.envoltura}`}>
          <div className={estilos.cartelEnvoltura}>
            <Cartel pelicula={pelicula} variante="grande" idBase={`${pelicula.id}-ficha`} />
          </div>
          <div className={estilos.info}>
            <VolverAlPrograma />
            <Etiqueta tono={seccion.id}>{nombreCortoSeccion(seccion.id)}</Etiqueta>
            <h1 className={estilos.titulo}>{pelicula.titulo}</h1>
            {pelicula.tituloOriginal ? (
              <p className={estilos.tituloOriginal}>Título original: {pelicula.tituloOriginal}</p>
            ) : null}
            <p className={estilos.direccion}>Dirección: {pelicula.direccion}</p>
          </div>
        </div>
      </div>
      <div className={estilos.datos}>
        <div className="contenedor">
          <dl className={estilos.grillaDatos}>
            <dt>País</dt>
            <dd>{pelicula.pais}</dd>
            <dt>Año</dt>
            <dd>{pelicula.anio}</dd>
            <dt>Duración</dt>
            <dd>{duracionLarga(pelicula.duracionMin)}</dd>
            <dt>Clasificación</dt>
            <dd>{clasificacionLarga(pelicula.clasificacion)}</dd>
            <dt>Estreno</dt>
            <dd>{estrenoTexto(pelicula.estreno)}</dd>
            <dt>Sección</dt>
            <dd>
              <Link href={`/programa?seccion=${seccion.id}`}>{seccion.nombre}</Link>
            </dd>
          </dl>
          <p className={estilos.sinopsis}>{pelicula.sinopsis}</p>
        </div>
      </div>
    </>
  )
}
