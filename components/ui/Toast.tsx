'use client'

import { useEffect, useRef } from 'react'
import estilos from './Toast.module.css'

export function Toast({
  mensaje,
  accion,
  duracionMs = 6000,
  alCerrar,
}: {
  mensaje: string
  accion?: { texto: string; alHacer: () => void }
  duracionMs?: number
  alCerrar: () => void
}) {
  const pausado = useRef(false)
  const restante = useRef(duracionMs)
  const inicio = useRef(0)

  useEffect(() => {
    restante.current = duracionMs
    inicio.current = Date.now()
    pausado.current = false

    const intervalo = setInterval(() => {
      if (pausado.current) return
      const transcurrido = Date.now() - inicio.current
      if (transcurrido >= restante.current) {
        clearInterval(intervalo)
        alCerrar()
      }
    }, 250)

    return () => clearInterval(intervalo)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensaje])

  function pausar() {
    if (pausado.current) return
    pausado.current = true
    restante.current -= Date.now() - inicio.current
  }

  function reanudar() {
    if (!pausado.current) return
    pausado.current = false
    inicio.current = Date.now()
  }

  return (
    <div
      className={estilos.toast}
      role="status"
      onMouseEnter={pausar}
      onMouseLeave={reanudar}
      onFocus={pausar}
      onBlur={reanudar}
    >
      <span className={estilos.mensaje}>{mensaje}</span>
      {accion ? (
        <button type="button" className={estilos.accion} onClick={accion.alHacer}>
          {accion.texto}
        </button>
      ) : null}
    </div>
  )
}
