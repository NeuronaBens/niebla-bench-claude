'use client'

import Link from 'next/link'
import { IconoCaminar, IconoChoque, IconoConversatorio, IconoNota, IconoQuitar } from '@/components/iconos/Iconos'
import Etiqueta from '@/components/marcas/Etiqueta'
import GlifoSala from '@/components/marcas/GlifoSala'
import MarcaPelicula from '@/components/marcas/MarcaPelicula'
import { anunciar } from '@/lib/anuncios'
import { festival } from '@/lib/datos'
import * as mensajes from '@/lib/itinerario/mensajes'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import { horaDe } from '@/lib/tiempo'
import type { EstadoFuncionItinerario, Funcion } from '@/lib/tipos'
import estilos from './ParadaItinerario.module.css'

interface Props {
  funcion: Funcion
  estado: EstadoFuncionItinerario
  modo: 'propio' | 'compartido'
}

interface AvisoParada {
  tipo: 'choque' | 'traslado' | 'conversatorio'
  texto: string
}

const ICONOS = { choque: IconoChoque, traslado: IconoCaminar, conversatorio: IconoConversatorio }

/** Una función marcada, con su hora, sala y los avisos que la afectan. */
export default function ParadaItinerario({ funcion, estado, modo }: Props) {
  const { agregar, quitar } = useItinerario()

  const avisos: AvisoParada[] = []
  for (const otra of estado.choquesCon) avisos.push({ tipo: 'choque', texto: mensajes.textoChoqueEnParada(otra) })
  if (estado.noAlcanzaA) {
    avisos.push({ tipo: 'traslado', texto: mensajes.textoNoAlcanzaA(estado.noAlcanzaA.desde, estado.noAlcanzaA.hacia, estado.noAlcanzaA) })
  }
  if (estado.llegaTardeDesde) {
    avisos.push({ tipo: 'traslado', texto: mensajes.textoLlegaTardeDesde(estado.llegaTardeDesde.desde, estado.llegaTardeDesde) })
  }
  if (estado.pierdeConversatorioPor) {
    avisos.push({ tipo: 'conversatorio', texto: mensajes.textoPierdeConversatorio(estado.pierdeConversatorioPor.hacia, estado.pierdeConversatorioPor) })
  }

  const claseBorde =
    estado.choquesCon.length > 0
      ? estilos.bordeChoque
      : estado.noAlcanzaA || estado.llegaTardeDesde
        ? estilos.bordeTraslado
        : estado.pierdeConversatorioPor
          ? estilos.bordeConversatorio
          : ''

  function manejarQuitar() {
    quitar(funcion.id)
    anunciar(`Quitaste ${funcion.pelicula.titulo}.`, {
      accion: { etiqueta: 'Deshacer', alHacer: () => agregar(funcion.id) },
    })
  }

  return (
    <div className={estilos.parada}>
      <span className={estilos.nodo} data-seccion={funcion.pelicula.seccion}>
        <GlifoSala salaId={funcion.salaId} />
      </span>
      <div className={`${estilos.cuerpo} ${claseBorde}`}>
        <span className={`horaGrande ${estilos.hora}`}>{horaDe(funcion.inicioMin)}</span>
        <p className={estilos.sala}>{funcion.sala.nombre}</p>
        <p className={estilos.direccion}>{funcion.sala.direccion}</p>
        <div className={estilos.filaTitulo}>
          <MarcaPelicula pelicula={funcion.pelicula} tamano="mini" />
          <Link href={`/peliculas/${funcion.peliculaId}`} className={estilos.titulo}>
            {funcion.pelicula.titulo}
          </Link>
        </div>
        <p className={estilos.termina}>{mensajes.textoTerminaYConversatorio(funcion)}</p>
        {(funcion.agotada || funcion.aireLibre) && (
          <div className={estilos.chips}>
            {funcion.agotada && <Etiqueta tipo="agotada">Agotada</Etiqueta>}
            {funcion.aireLibre && <Etiqueta tipo="aireLibre">Al aire libre</Etiqueta>}
          </div>
        )}
        {funcion.nota && (
          <p className={estilos.nota}>
            <IconoNota />
            <span>{funcion.nota}</span>
          </p>
        )}
        {funcion.agotada && <p className={estilos.avisoAgotada}>Agotada. {festival.entradas.venta}</p>}
        {funcion.aireLibre && funcion.sala.nota && <p className={estilos.notaAireLibre}>{funcion.sala.nota}</p>}
        {avisos.length > 0 && (
          <div className={estilos.avisos}>
            {avisos.map((aviso, i) => {
              const Icono = ICONOS[aviso.tipo]
              return (
                <p key={i} className={`${estilos.aviso} ${estilos[aviso.tipo]}`}>
                  <Icono />
                  <span>{aviso.texto}</span>
                </p>
              )
            })}
          </div>
        )}
        {modo === 'propio' && (
          <div className={estilos.acciones}>
            <button
              type="button"
              className={estilos.quitar}
              aria-label={`Quitar ${funcion.pelicula.titulo} de mi itinerario`}
              onClick={manejarQuitar}
            >
              <IconoQuitar />
              Quitar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
