'use client'

import { useSyncExternalStore } from 'react'

function suscribir() {
  return () => {}
}

export function useHidratado(): boolean {
  return useSyncExternalStore(
    suscribir,
    () => true,
    () => false
  )
}
