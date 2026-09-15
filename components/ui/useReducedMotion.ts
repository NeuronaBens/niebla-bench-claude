'use client'

import { useSyncExternalStore } from 'react'

const CONSULTA = '(prefers-reduced-motion: reduce)'

function suscribir(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const media = window.matchMedia(CONSULTA)
  media.addEventListener('change', callback)
  return () => media.removeEventListener('change', callback)
}

function obtenerEstado() {
  if (typeof window === 'undefined') return false
  return window.matchMedia(CONSULTA).matches
}

function obtenerEstadoServidor() {
  return false
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(suscribir, obtenerEstado, obtenerEstadoServidor)
}
