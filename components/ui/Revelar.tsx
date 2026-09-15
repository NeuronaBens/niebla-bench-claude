'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import estilos from './Revelar.module.css'

export function Revelar({ children, retrasoMs = 0 }: { children: ReactNode; retrasoMs?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [estado, setEstado] = useState<'inicial' | 'esperando' | 'visible'>('inicial')

  useEffect(() => {
    const nodo = ref.current
    if (!nodo) return
    const rect = nodo.getBoundingClientRect()
    const yaVisible = rect.top < window.innerHeight
    if (yaVisible) {
      setEstado('visible')
      return
    }
    setEstado('esperando')
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          const id = setTimeout(() => setEstado('visible'), retrasoMs)
          observador.disconnect()
          return () => clearTimeout(id)
        }
      },
      { threshold: 0.15 }
    )
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [retrasoMs])

  return (
    <div
      ref={ref}
      className={estilos.revelar}
      data-esperando={estado === 'esperando' ? '' : undefined}
      data-visible={estado !== 'esperando' ? '' : undefined}
    >
      {children}
    </div>
  )
}
