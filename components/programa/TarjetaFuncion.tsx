import Link from 'next/link'
import BotonItinerario from '@/components/itinerario/BotonItinerario'
import PistaFuncion from '@/components/itinerario/PistaFuncion'
import { IconoNota } from '@/components/iconos/Iconos'
import Etiqueta from '@/components/marcas/Etiqueta'
import GlifoSala from '@/components/marcas/GlifoSala'
import MarcaPelicula from '@/components/marcas/MarcaPelicula'
import PuntoSeccion from '@/components/marcas/PuntoSeccion'
import { DESCRIPCION_CLASIFICACION, ETIQUETA_CLASIFICACION } from '@/lib/etiquetas'
import { formatoDuracion } from '@/lib/formato'
import { etiquetaFinCompacta, horaDe } from '@/lib/tiempo'
import type { Funcion } from '@/lib/tipos'
import ReglaDelDia from './ReglaDelDia'
import estilos from './TarjetaFuncion.module.css'

interface Props {
  funcion: Funcion
  variante: 'lista' | 'grilla'
  interactiva: boolean
}

/** Una función del programa, en formato de boleto. Sirve para la lista móvil y la grilla de escritorio. */
export default function TarjetaFuncion({ funcion, variante, interactiva }: Props) {
  const fin = etiquetaFinCompacta(funcion.finMin, funcion.dia)
  const hayChips = funcion.agotada || funcion.aireLibre || funcion.conversatorioMin != null

  return (
    <article className={`${estilos.tarjeta} ${estilos[variante]}`} data-seccion={funcion.pelicula.seccion} data-funcion={funcion.id}>
      <div className={estilos.talon}>
        <span className={`horaGrande ${estilos.horaInicio}`}>{horaDe(funcion.inicioMin)}</span>
        <span className={estilos.horaFin}>
          – {fin.hora}
          {fin.terminaDiaSiguiente && (
            <span className={estilos.masUno}>
              +1<span className="soloLector"> del día siguiente</span>
            </span>
          )}
        </span>
      </div>
      <div className={estilos.cuerpo}>
        {variante === 'grilla' && (
          <span className={`horaGrande ${estilos.horaGrilla}`}>
            {horaDe(funcion.inicioMin)} – {fin.hora}
            {fin.terminaDiaSiguiente && <span className="soloLector"> del día siguiente</span>}
          </span>
        )}
        <p className={estilos.sala}>
          <GlifoSala salaId={funcion.salaId} />
          <span>{funcion.sala.nombre}</span>
        </p>
        <div className={estilos.filaTitulo}>
          {variante === 'lista' && <MarcaPelicula pelicula={funcion.pelicula} tamano="tarjeta" />}
          <div className={estilos.datosTitulo}>
            <h3 className={estilos.titulo}>
              <Link href={`/peliculas/${funcion.peliculaId}`} className={estilos.enlaceTitulo}>
                {funcion.pelicula.titulo}
              </Link>
            </h3>
            <p className={estilos.seccion}>
              <PuntoSeccion />
              <span>{funcion.seccion.nombre}</span>
            </p>
            <p className={estilos.metaLinea}>
              {formatoDuracion(funcion.pelicula.duracionMin)} ·{' '}
              <span title={DESCRIPCION_CLASIFICACION[funcion.pelicula.clasificacion]}>
                {ETIQUETA_CLASIFICACION[funcion.pelicula.clasificacion]}
              </span>
            </p>
          </div>
        </div>
        {hayChips && (
          <div className={estilos.chips}>
            {funcion.agotada && <Etiqueta tipo="agotada">Agotada</Etiqueta>}
            {funcion.aireLibre && <Etiqueta tipo="aireLibre">Al aire libre</Etiqueta>}
            {funcion.conversatorioMin != null && (
              <Etiqueta tipo="conversatorio">Conversatorio después ({funcion.conversatorioMin} min)</Etiqueta>
            )}
          </div>
        )}
        {funcion.nota && (
          <p className={estilos.nota}>
            <IconoNota />
            <span>{funcion.nota}</span>
          </p>
        )}
        {variante === 'lista' && <ReglaDelDia funcion={funcion} />}
        {interactiva && variante === 'grilla' && (
          <div className={estilos.accionCompacta}>
            <BotonItinerario funcionId={funcion.id} variante="compacto" />
          </div>
        )}
        {interactiva && variante === 'lista' && (
          <div className={estilos.accion}>
            <BotonItinerario funcionId={funcion.id} variante="completo" />
            <PistaFuncion funcionId={funcion.id} />
          </div>
        )}
        {interactiva && variante === 'grilla' && (
          <div className={estilos.pistaGrilla}>
            <PistaFuncion funcionId={funcion.id} />
          </div>
        )}
      </div>
    </article>
  )
}
