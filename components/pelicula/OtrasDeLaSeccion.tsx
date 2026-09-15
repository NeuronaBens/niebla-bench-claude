import Link from 'next/link'
import { Cartel } from '@/components/cartel/Cartel.tsx'
import type { Pelicula, Seccion } from '@/lib/tipos'
import estilos from './OtrasDeLaSeccion.module.css'

export function OtrasDeLaSeccion({ pelicula, peliculas }: { pelicula: Pelicula; peliculas: Pelicula[]; seccion?: Seccion }) {
  const otras = peliculas.filter((p) => p.id !== pelicula.id)
  if (otras.length === 0) return null

  return (
    <div className={estilos.seccion}>
      <h2 className={estilos.titulo}>Más de esta sección</h2>
      <div className={estilos.lista}>
        {otras.map((otra) => (
          <Link key={otra.id} href={`/pelicula/${otra.id}`} className={estilos.item}>
            <Cartel pelicula={otra} variante="mini" idBase={`${otra.id}-otras`} />
            {otra.titulo}
          </Link>
        ))}
      </div>
    </div>
  )
}
