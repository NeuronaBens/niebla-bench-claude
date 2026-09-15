'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icono } from '@/components/ui/Icono'
import { ContadorItinerario } from './ContadorItinerario.tsx'
import estilos from './NavInferior.module.css'

export function NavInferior() {
  const pathname = usePathname()
  const enInicio = pathname === '/'
  const enPrograma = pathname.startsWith('/programa') || pathname.startsWith('/pelicula')
  const enItinerario = pathname.startsWith('/itinerario')

  return (
    <nav className={estilos.nav} aria-label="Principal">
      <Link href="/" className={estilos.enlace} aria-current={enInicio ? 'page' : undefined}>
        <Icono nombre="inicio" />
        Inicio
      </Link>
      <Link href="/programa" className={estilos.enlace} aria-current={enPrograma ? 'page' : undefined}>
        <Icono nombre="programa" />
        Programa
      </Link>
      <Link href="/itinerario" className={estilos.enlace} aria-current={enItinerario ? 'page' : undefined}>
        <span className={estilos.iconoEnvoltura}>
          <Icono nombre="ruta" />
          <ContadorItinerario flotante />
        </span>
        Mi itinerario
      </Link>
    </nav>
  )
}
