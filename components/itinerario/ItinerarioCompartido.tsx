'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { IconoItinerario } from '@/components/iconos/Iconos'
import { leerEnlace } from '@/lib/itinerario/enlace'
import { analizarItinerario } from '@/lib/itinerario/reglas'
import CopiarCompartido from './CopiarCompartido'
import VistaItinerario from './VistaItinerario'
import estilos from './ItinerarioCompartido.module.css'

/** Lee `?f=` y muestra el itinerario de otra persona, sin tocar el propio. */
export default function ItinerarioCompartido() {
  const searchParams = useSearchParams()
  const { validos, invalidos, estado } = leerEnlace(searchParams.get('f'))

  if (estado === 'vacio' || estado === 'invalido') {
    return (
      <div className={estilos.mensaje}>
        <p>
          {estado === 'vacio'
            ? 'Este link no trae funciones.'
            : 'No reconocemos las funciones de este link. Puede estar incompleto o ser de otra edición del festival.'}
        </p>
        <div className={estilos.enlaces}>
          <Link href="/programa">Ver el programa</Link>
          <Link href="/itinerario">Ir a mi itinerario</Link>
        </div>
      </div>
    )
  }

  const ids = validos.map((f) => f.id)
  const analisis = analizarItinerario(ids)

  return (
    <div>
      <div className={estilos.banner}>
        <IconoItinerario />
        <p>Estás viendo un itinerario que te compartieron. Tu itinerario no cambia a menos que lo copies.</p>
      </div>
      {estado === 'parcial' && (
        <p className={estilos.aviso}>
          {invalidos.length === 1
            ? '1 función del link no existe y se omitió.'
            : `${invalidos.length} funciones del link no existen y se omitieron.`}
        </p>
      )}
      <VistaItinerario analisis={analisis} modo="compartido" />
      <CopiarCompartido ids={ids} />
    </div>
  )
}
