'use client'

import BotonItinerario from '@/components/itinerario/BotonItinerario'
import PistaFuncion from '@/components/itinerario/PistaFuncion'
import Etiqueta from '@/components/marcas/Etiqueta'
import GlifoSala from '@/components/marcas/GlifoSala'
import { festival, funcionPorId } from '@/lib/datos'
import { precioTexto } from '@/lib/formato'
import { pistaMismaPelicula, textoTambienLaTienes } from '@/lib/itinerario/mensajes'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import { etiquetaFinLarga, horaDe, preposicionHora } from '@/lib/tiempo'
import type { Funcion } from '@/lib/tipos'
import estilos from './FilaFuncionFicha.module.css'

interface Props {
  funcion: Funcion
}

/** Una función en la ficha de la película: boleto con toda su información. */
export default function FilaFuncionFicha({ funcion }: Props) {
  const { listo, ids } = useItinerario()
  const tiene = listo && ids.includes(funcion.id)

  const otrasDeLaMisma = listo
    ? (ids
        .map((id) => funcionPorId.get(id))
        .filter((f): f is Funcion => !!f && f.peliculaId === funcion.peliculaId && f.id !== funcion.id))
    : []

  return (
    <li className={estilos.fila}>
      <div className={estilos.horaBloque}>
        <span className={estilos.dia}>{funcion.dia.etiqueta}</span>
        <span className={`horaGrande ${estilos.hora}`}>
          {horaDe(funcion.inicioMin)} – {horaDe(funcion.finMin)}
          {funcion.terminaDiaSiguiente && <span className="soloLector"> del día siguiente</span>}
        </span>
        {funcion.terminaDiaSiguiente && (
          <span className={estilos.finLargo}>
            Termina {preposicionHora(funcion.finMin)} {etiquetaFinLarga(funcion.finMin, funcion.dia)}
          </span>
        )}
        {funcion.conversatorioMin != null && (
          <span className={estilos.finLargo}>
            Conversatorio después: {funcion.conversatorioMin} min, hasta las {horaDe(funcion.finConversatorioMin as number)}
          </span>
        )}
      </div>

      <div>
        <p className={estilos.sala}>
          <GlifoSala salaId={funcion.salaId} />
          <span>
            <span>{funcion.sala.nombre}</span>
            <br />
            <span className={estilos.direccionSala}>{funcion.sala.direccion}</span>
          </span>
        </p>
        <p className={estilos.precio}>{precioTexto(funcion.precio)}</p>
        {(funcion.agotada || funcion.aireLibre) && (
          <div className={estilos.chips}>
            {funcion.agotada && <Etiqueta tipo="agotada">Agotada</Etiqueta>}
            {funcion.aireLibre && <Etiqueta tipo="aireLibre">Al aire libre</Etiqueta>}
          </div>
        )}
        {funcion.nota && <p className={estilos.nota}>{funcion.nota}</p>}
        {funcion.agotada && (
          <p className={estilos.avisoAgotada}>Agotada. {festival.entradas.venta}</p>
        )}
        {funcion.aireLibre && funcion.sala.nota && <p className={estilos.notaAireLibre}>{funcion.sala.nota}</p>}
        {otrasDeLaMisma.map((otra) => (
          <p key={otra.id} className={estilos.mismaPelicula}>
            {tiene ? textoTambienLaTienes(otra) : pistaMismaPelicula(otra)}
          </p>
        ))}
      </div>

      <div className={estilos.acciones}>
        <BotonItinerario funcionId={funcion.id} variante="completo" />
        <PistaFuncion funcionId={funcion.id} />
      </div>
    </li>
  )
}
