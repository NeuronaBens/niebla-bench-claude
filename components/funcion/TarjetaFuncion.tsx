import Link from 'next/link'
import { Cartel } from '@/components/cartel/Cartel.tsx'
import { Etiqueta } from '@/components/ui/Etiqueta'
import { HorarioFuncion } from './HorarioFuncion.tsx'
import { MarcasFuncion } from './MarcasFuncion.tsx'
import { BotonItinerario } from './BotonItinerario.tsx'
import { nombreCortoSala, nombreCortoSeccion } from '@/lib/formato'
import type { Aviso, Funcion } from '@/lib/tipos'
import estilos from './TarjetaFuncion.module.css'

export function TarjetaFuncion({
  funcion,
  avisosPrevios,
  mostrarDia = false,
  enlazarPelicula = true,
  seleccionada = false,
}: {
  funcion: Funcion
  avisosPrevios?: Aviso[]
  mostrarDia?: boolean
  enlazarPelicula?: boolean
  seleccionada?: boolean
}) {
  const titulo = enlazarPelicula ? (
    <Link href={`/pelicula/${funcion.pelicula.id}`}>{funcion.pelicula.titulo}</Link>
  ) : (
    funcion.pelicula.titulo
  )

  return (
    <article
      className={`${estilos.tarjeta} luz-${funcion.seccion.id} ${seleccionada ? estilos.seleccionada : ''}`}
      aria-labelledby={`titulo-${funcion.id}`}
    >
      <HorarioFuncion funcion={funcion} formato={mostrarDia ? 'completo' : 'compacto'} />
      <div className={estilos.columnaMedia}>
        <Etiqueta tono={funcion.seccion.id}>{nombreCortoSeccion(funcion.seccion.id)}</Etiqueta>
        <h3 id={`titulo-${funcion.id}`} className={estilos.titulo}>
          {titulo}
        </h3>
        <p className={estilos.sala}>{nombreCortoSala(funcion.sala.id)}</p>
        <MarcasFuncion funcion={funcion} avisosPrevios={avisosPrevios} />
      </div>
      <div className={estilos.columnaFinal}>
        <Cartel pelicula={funcion.pelicula} variante="tarjeta" idBase={`${funcion.id}-tarjeta`} />
        <BotonItinerario funcion={funcion} variante="tarjeta" />
      </div>
    </article>
  )
}
