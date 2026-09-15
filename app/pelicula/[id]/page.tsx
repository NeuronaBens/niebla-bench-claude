import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DatosPelicula } from '@/components/pelicula/DatosPelicula.tsx'
import { FuncionesPelicula } from '@/components/pelicula/FuncionesPelicula.tsx'
import { OtrasDeLaSeccion } from '@/components/pelicula/OtrasDeLaSeccion.tsx'
import { programa } from '@/lib/programa'
import estilos from './pelicula.module.css'

export function generateStaticParams() {
  return programa.peliculas.map((p) => ({ id: p.id }))
}

export const dynamicParams = false

export async function generateMetadata(props: PageProps<'/pelicula/[id]'>): Promise<Metadata> {
  const { id } = await props.params
  const pelicula = programa.peliculaPorId(id)
  if (!pelicula) return {}
  return {
    title: pelicula.titulo,
    description: pelicula.sinopsis,
    openGraph: { title: pelicula.titulo, description: pelicula.sinopsis },
  }
}

export default async function PeliculaPage(props: PageProps<'/pelicula/[id]'>) {
  const { id } = await props.params
  const pelicula = programa.peliculaPorId(id)
  if (!pelicula) notFound()

  const seccion = programa.seccionPorId(pelicula.seccion)
  const funciones = programa.funcionesDePelicula(pelicula.id)
  const otras = programa.peliculasDeSeccion(seccion.id)

  return (
    <div className={estilos.pagina}>
      <DatosPelicula pelicula={pelicula} seccion={seccion} />
      <FuncionesPelicula funciones={funciones} />
      <OtrasDeLaSeccion pelicula={pelicula} peliculas={otras} seccion={seccion} />
    </div>
  )
}
