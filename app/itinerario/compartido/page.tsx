import type { Metadata } from 'next'
import { Suspense } from 'react'
import ItinerarioCompartido from '@/components/itinerario/ItinerarioCompartido'
import estilos from './page.module.css'

export const metadata: Metadata = {
  title: 'Itinerario compartido',
  description: 'Arma tu recorrido por las salas del festival.',
  robots: { index: false },
}

export default function ItinerarioCompartidoPage() {
  return (
    <div className="contenedor">
      <h1 className={estilos.h1}>Itinerario compartido</h1>
      <Suspense fallback={<p className={estilos.cargando}>Cargando itinerario compartido…</p>}>
        <ItinerarioCompartido />
      </Suspense>
    </div>
  )
}
