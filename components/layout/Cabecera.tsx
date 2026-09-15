'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icono } from '@/components/ui/Icono'
import { ContadorItinerario } from './ContadorItinerario.tsx'
import estilos from './Cabecera.module.css'

export function Cabecera() {
  const pathname = usePathname()
  const enProgramaOFicha = pathname.startsWith('/programa') || pathname.startsWith('/pelicula')
  const enItinerario = pathname.startsWith('/itinerario')
  const zonaNoche = pathname === '/' || pathname.startsWith('/pelicula')

  return (
    <header className={`${estilos.cabecera} ${zonaNoche ? estilos.noche : estilos.papel}`} data-zona={zonaNoche ? 'noche' : undefined}>
      <Link href="/" className={estilos.marca}>
        <Icono nombre="faro" />
        Festival de Cine Niebla
      </Link>
      <nav className={estilos.nav} aria-label="Principal">
        <Link href="/programa" className={estilos.enlace} aria-current={enProgramaOFicha ? 'page' : undefined}>
          Programa
        </Link>
        <Link href="/itinerario" className={estilos.enlace} aria-current={enItinerario ? 'page' : undefined}>
          Mi itinerario
          <ContadorItinerario />
        </Link>
      </nav>
    </header>
  )
}
