import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ItinerarioCompartido } from '@/components/itinerario/ItinerarioCompartido.tsx'
import { EsqueletoItinerario } from '@/components/itinerario/EsqueletoItinerario.tsx'

export const metadata: Metadata = {
  title: 'Itinerario compartido',
  description: 'Mira a qué funciones del Festival de Cine Niebla va esta persona y copia el itinerario al tuyo.',
}

export default function ItinerarioCompartidoPage() {
  return (
    <Suspense fallback={<EsqueletoItinerario />}>
      <ItinerarioCompartido />
    </Suspense>
  )
}
