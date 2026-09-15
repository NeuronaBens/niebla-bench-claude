'use client'

import { useItinerario } from './useItinerario.ts'
import { useHidratado } from '@/components/ui/useHidratado'
import { itinerarioTextos } from '@/lib/textos'

export function AvisoAlmacenamiento() {
  const hidratado = useHidratado()
  const { persistente } = useItinerario()

  if (!hidratado) return null

  return <p style={{ fontSize: 'var(--t-chico)', color: 'var(--tinta-2)', marginTop: 'var(--e-2)' }}>{persistente ? itinerarioTextos.guardado : itinerarioTextos.sinGuardado}</p>
}
