import Link from 'next/link'
import { Cartel } from '@/components/cartel/Cartel.tsx'
import { programa } from '@/lib/programa'
import { plural } from '@/lib/formato'
import estilos from './SeccionesPortada.module.css'

export function SeccionesPortada() {
  return (
    <div className={estilos.seccion} data-zona="noche">
      <h2 className={estilos.titulo}>Cuatro luces: las secciones</h2>
      <div className={estilos.grilla}>
        {programa.secciones.map((seccion) => {
          const peliculas = programa.peliculasDeSeccion(seccion.id).slice(0, 3)
          const total = programa.peliculasDeSeccion(seccion.id).length
          return (
            <div key={seccion.id} className={`${estilos.bloque} luz-${seccion.id}`}>
              <h3 className={estilos.nombre}>{seccion.nombre}</h3>
              <p className={estilos.descripcion}>{seccion.descripcion}</p>
              <p className={estilos.cantidad}>{plural(total, 'película', 'películas')}</p>
              <Link href={`/programa?seccion=${seccion.id}`} className={estilos.enlace}>
                Ver en el programa
              </Link>
              <div className={estilos.carteles}>
                {peliculas.map((p) => (
                  <Cartel key={p.id} pelicula={p} variante="mini" idBase={`${p.id}-seccion-portada`} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
