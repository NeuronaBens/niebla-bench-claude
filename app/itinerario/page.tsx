import type { Metadata } from 'next'
import MiItinerario from '@/components/itinerario/MiItinerario'
import estilos from './page.module.css'

export const metadata: Metadata = {
  title: 'Mi itinerario',
  description: 'Arma tu recorrido por las salas del festival.',
}

export default function ItinerarioPage() {
  return (
    <div className="contenedor">
      <h1 className={estilos.h1}>Mi itinerario</h1>
      <MiItinerario />
    </div>
  )
}
