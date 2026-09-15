'use client'

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'

const ContextoAnunciador = createContext<((mensaje: string) => void) | null>(null)

export function ProveedorAnunciador({ children }: { children: ReactNode }) {
  const [mensaje, setMensaje] = useState('')
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)

  const anunciar = useCallback((texto: string) => {
    setMensaje('')
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(() => setMensaje(texto), 50)
  }, [])

  return (
    <ContextoAnunciador.Provider value={anunciar}>
      {children}
      <div role="status" aria-live="polite" className="solo-lectores">
        {mensaje}
      </div>
    </ContextoAnunciador.Provider>
  )
}

export function useAnunciar(): (mensaje: string) => void {
  const anunciar = useContext(ContextoAnunciador)
  if (!anunciar) {
    return () => {}
  }
  return anunciar
}
