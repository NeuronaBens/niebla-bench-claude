'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { IconoFlechaIzq } from '@/components/iconos/Iconos'
import { leerFiltros } from '@/lib/filtros'
import estilos from './VolverAlPrograma.module.css'

const CLAVE_SESSION = 'festival-niebla:programa-query'

/** Vuelve al programa conservando el filtro desde el que se llegó, cuando es posible. */
export default function VolverAlPrograma() {
  const [href, setHref] = useState('/programa')

  useEffect(() => {
    try {
      const guardado = window.sessionStorage.getItem(CLAVE_SESSION)
      if (!guardado) return
      const { huboInvalidos } = leerFiltros(new URLSearchParams(guardado))
      // Se actualiza después de la hidratación a propósito: el href inicial
      // (servidor e hidratación) debe ser "/programa" para no depender de
      // sessionStorage, que no existe en el servidor.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!huboInvalidos) setHref(`/programa${guardado}`)
    } catch {
      // Sin sessionStorage, "Volver al programa" va al programa completo.
    }
  }, [])

  return (
    <Link href={href} className={estilos.enlace}>
      <IconoFlechaIzq />
      Volver al programa
    </Link>
  )
}
