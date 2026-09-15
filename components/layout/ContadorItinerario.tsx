'use client'

import { useEffect, useRef, useState } from 'react'
import { useItinerario } from '@/components/itinerario/useItinerario'
import { useHidratado } from '@/components/ui/useHidratado'
import estilos from './ContadorItinerario.module.css'

export function ContadorItinerario({ flotante = false }: { flotante?: boolean }) {
  const hidratado = useHidratado()
  const { ids } = useItinerario()
  const [latir, setLatir] = useState(false)
  const anterior = useRef(ids.length)

  useEffect(() => {
    if (hidratado && anterior.current !== ids.length) {
      setLatir(true)
      const id = setTimeout(() => setLatir(false), 320)
      anterior.current = ids.length
      return () => clearTimeout(id)
    }
    anterior.current = ids.length
  }, [ids.length, hidratado])

  if (!hidratado || ids.length === 0) return null

  return (
    <span
      className={`${estilos.contador} ${latir ? estilos.latido : ''} ${flotante ? estilos.flotante : ''}`}
      aria-hidden="true"
    >
      {ids.length}
    </span>
  )
}
