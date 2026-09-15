import type { Metadata } from 'next'
import { MiItinerario } from '@/components/itinerario/MiItinerario.tsx'
import estilos from './itinerario.module.css'

export const metadata: Metadata = {
  title: 'Mi itinerario',
  description: 'Arma tu recorrido por el Festival de Cine Niebla: te avisamos si se topan las funciones o si no alcanzas a llegar caminando.',
}

export default function ItinerarioPage() {
  return (
    <div className={estilos.pagina}>
      <MiItinerario />
    </div>
  )
}
