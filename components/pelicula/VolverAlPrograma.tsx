'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/ui/Icono'
import { volver } from '@/lib/textos'

export function VolverAlPrograma() {
  const [href, setHref] = useState('/programa')

  useEffect(() => {
    try {
      const filtros = sessionStorage.getItem('niebla:programa:filtros')
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con sessionStorage, solo tras montar
      if (filtros) setHref(`/programa${filtros}`)
    } catch {
      // Se ignora: sessionStorage no disponible.
    }
  }, [])

  return (
    <Link href={href} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'inherit' }}>
      <Icono nombre="flecha-izq" tamano={18} />
      {volver}
    </Link>
  )
}
