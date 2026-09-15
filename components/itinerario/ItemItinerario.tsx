import Link from 'next/link'
import { Cartel } from '@/components/cartel/Cartel.tsx'
import { HorarioFuncion } from '@/components/funcion/HorarioFuncion.tsx'
import { MarcasFuncion } from '@/components/funcion/MarcasFuncion.tsx'
import { Icono } from '@/components/ui/Icono'
import { programa } from '@/lib/programa'
import { horaDe } from '@/lib/tiempo'
import { avisos as textosAvisos } from '@/lib/textos'
import type { Aviso, Funcion } from '@/lib/tipos'
import estilos from './ItemItinerario.module.css'

export function ItemItinerario({
  funcion,
  avisos,
  modo,
  alQuitar,
}: {
  funcion: Funcion
  avisos: Aviso[]
  modo: 'propio' | 'compartido'
  alQuitar?: (id: string) => void
}) {
  const previos = avisos.filter((a) => a.tipo === 'tope' || a.tipo === 'noAlcanza')
  const repetida = avisos.find((a) => a.tipo === 'peliculaRepetida')

  return (
    <div className={`${estilos.item} luz-${funcion.seccion.id}`} id={`funcion-${funcion.id}`} tabIndex={-1}>
      <div className={estilos.punto} aria-hidden="true" />
      <HorarioFuncion funcion={funcion} />
      <div className={estilos.columnaMedia}>
        <h3 className={estilos.titulo}>
          <Link href={`/pelicula/${funcion.pelicula.id}`}>{funcion.pelicula.titulo}</Link>
        </h3>
        <p className={estilos.sala}>
          {funcion.sala.nombre}, {funcion.sala.direccion}
        </p>
        <MarcasFuncion funcion={funcion} avisosPrevios={previos} />
        {repetida && repetida.tipo === 'peliculaRepetida'
          ? (() => {
              const otraId = repetida.funciones.find((id) => id !== funcion.id)
              const otra = otraId ? programa.funcionPorId(otraId) : undefined
              if (!otra) return null
              return <p className={estilos.informativo}>{textosAvisos.repetida(otra.dia.nombre, horaDe(otra.inicio))}</p>
            })()
          : null}
      </div>
      <div className={estilos.columnaFinal}>
        <Cartel pelicula={funcion.pelicula} variante="mini" idBase={`${funcion.id}-itinerario`} />
        {modo === 'propio' && alQuitar ? (
          <button
            type="button"
            className={estilos.botonQuitar}
            aria-label={`Quitar ${funcion.pelicula.titulo}, ${funcion.dia.nombre} ${horaDe(funcion.inicio)}`}
            onClick={() => alQuitar(funcion.id)}
          >
            <Icono nombre="quitar" tamano={18} />
          </button>
        ) : null}
      </div>
    </div>
  )
}
