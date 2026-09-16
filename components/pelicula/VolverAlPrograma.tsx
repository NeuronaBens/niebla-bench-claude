'use client'

import Link from 'next/link'
import { useSyncExternalStore } from 'react'
import styles from './VolverAlPrograma.module.css'

const CLAVE_QUERY_SESION = 'niebla.programa.query'

function suscribirse(): () => void {
  return () => {}
}

function obtenerHref(): string {
  try {
    const query = window.sessionStorage.getItem(CLAVE_QUERY_SESION)
    return query ? `/programa${query}` : '/programa'
  } catch {
    return '/programa'
  }
}

function obtenerHrefServidor(): string {
  return '/programa'
}

export function VolverAlPrograma() {
  const href = useSyncExternalStore(suscribirse, obtenerHref, obtenerHrefServidor)

  return (
    <Link href={href} className={styles.volver}>
      Volver al programa
    </Link>
  )
}
