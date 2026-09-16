'use client'

import { useEffect, useRef, useState } from 'react'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import estilos from './ContadorItinerario.module.css'

/**
 * Pastilla con la cantidad de funciones marcadas. Mientras `listo === false`
 * (servidor e hidratación) queda oculta con ancho reservado, para que nunca
 * se vea un "0" que después cambia (H4.5 CA5).
 */
export default function ContadorItinerario() {
  const { listo, ids } = useItinerario()
  const [animar, setAnimar] = useState(false)
  const anteriorRef = useRef<number | null>(null)

  useEffect(() => {
    if (!listo) return
    const anterior = anteriorRef.current
    anteriorRef.current = ids.length
    if (anterior !== null && anterior !== ids.length) {
      setAnimar(true)
      const temporizador = setTimeout(() => setAnimar(false), 220)
      return () => clearTimeout(temporizador)
    }
  }, [listo, ids.length])

  if (!listo) return <span className={estilos.hueco} aria-hidden="true" />

  return (
    <span className={`${estilos.pastilla} ${animar ? estilos.latido : ''}`} aria-hidden="true">
      {ids.length}
    </span>
  )
}
