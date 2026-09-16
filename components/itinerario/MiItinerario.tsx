'use client'

import Link from 'next/link'
import { IconoNota } from '@/components/iconos/Iconos'
import GlifoSala from '@/components/marcas/GlifoSala'
import { analizarItinerario } from '@/lib/itinerario/reglas'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import AccionesItinerario from './AccionesItinerario'
import VistaItinerario from './VistaItinerario'
import estilos from './MiItinerario.module.css'

/** Cuerpo de `/itinerario`: esqueleto, estado vacío, o el recorrido armado. */
export default function MiItinerario() {
  const { listo, ids, persistente } = useItinerario()

  if (!listo) {
    return (
      <div className={estilos.esqueleto} aria-hidden="true">
        <div />
        <div />
        <div />
      </div>
    )
  }

  if (ids.length === 0) {
    return (
      <div className={estilos.vacio}>
        <div className={estilos.dibujo} aria-hidden="true">
          <span className={estilos.nodo}>
            <GlifoSala salaId="teatro" />
          </span>
          <span className={estilos.linea} />
          <span className={estilos.nodo}>
            <GlifoSala salaId="galpon" />
          </span>
          <span className={estilos.linea} />
          <span className={estilos.nodo}>
            <GlifoSala salaId="terraza" />
          </span>
        </div>
        <p>
          Todavía no marcas funciones. En el programa o en la ficha de cada película toca «Agregar» y aquí se arma tu
          recorrido: a qué hora sales de cada sala y cuánto caminas hasta la siguiente.
        </p>
        <Link href="/programa" className={estilos.boton}>
          Ir al programa
        </Link>
      </div>
    )
  }

  const analisis = analizarItinerario(ids)

  return (
    <div>
      {!persistente && (
        <p className={estilos.avisoPersistencia}>
          <IconoNota />
          Tu navegador no permite guardar datos: este itinerario se perderá al cerrar la pestaña. Usa «Compartir»
          para guardarte el link.
        </p>
      )}
      <div className={estilos.layout}>
        <VistaItinerario analisis={analisis} modo="propio" />
        <AccionesItinerario />
      </div>
    </div>
  )
}
