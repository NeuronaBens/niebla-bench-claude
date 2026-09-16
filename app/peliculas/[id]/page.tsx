import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import FichaDatos from '@/components/pelicula/FichaDatos'
import FuncionesDePelicula from '@/components/pelicula/FuncionesDePelicula'
import VolverAlPrograma from '@/components/pelicula/VolverAlPrograma'
import MarcaPelicula from '@/components/marcas/MarcaPelicula'
import { peliculaPorId, peliculas } from '@/lib/datos'
import estilos from './page.module.css'

export const dynamicParams = false

export function generateStaticParams() {
  return peliculas.map((p) => ({ id: p.id }))
}

export async function generateMetadata(props: PageProps<'/peliculas/[id]'>): Promise<Metadata> {
  const { id } = await props.params
  const pelicula = peliculaPorId.get(id)
  if (!pelicula) return {}
  return {
    title: pelicula.titulo,
    description: pelicula.sinopsis,
  }
}

export default async function PeliculaPage(props: PageProps<'/peliculas/[id]'>) {
  const { id } = await props.params
  const pelicula = peliculaPorId.get(id)
  if (!pelicula) notFound()

  return (
    <div data-seccion={pelicula.seccion}>
      <div className={estilos.franja} />
      <div className="contenedor">
        <div className={estilos.volver}>
          <VolverAlPrograma />
        </div>
        <div className={estilos.contenido}>
          <div className={estilos.columnaMarca}>
            <MarcaPelicula pelicula={pelicula} tamano="protagonista" />
          </div>
          <div>
            <FichaDatos pelicula={pelicula} />
            <FuncionesDePelicula peliculaId={pelicula.id} />
            <div className={estilos.cierre}>
              <Link href="/itinerario">Ver mi itinerario</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
