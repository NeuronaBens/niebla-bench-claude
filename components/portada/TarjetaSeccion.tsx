import Link from 'next/link'
import MarcaPelicula from '@/components/marcas/MarcaPelicula'
import { plural } from '@/lib/formato'
import type { Pelicula, Seccion } from '@/lib/tipos'
import estilos from './TarjetaSeccion.module.css'

interface Props {
  seccion: Seccion
  peliculas: Pelicula[]
}

export default function TarjetaSeccion({ seccion, peliculas }: Props) {
  return (
    <div className={estilos.tarjeta} data-seccion={seccion.id}>
      <h3>{seccion.nombre}</h3>
      <p className={estilos.descripcion}>{seccion.descripcion}</p>
      <p className={estilos.rotulo}>{plural(peliculas.length, 'película', 'películas')}</p>
      <div className={estilos.miniaturas} aria-hidden="true">
        {peliculas.map((p) => (
          <MarcaPelicula key={p.id} pelicula={p} tamano="mini" />
        ))}
      </div>
      <Link href={`/programa?seccion=${seccion.id}`} className={estilos.enlace}>
        Ver {seccion.nombre} en el programa
      </Link>
    </div>
  )
}
