'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IconoItinerario, IconoPortada, IconoPrograma } from '@/components/iconos/Iconos'
import { plural } from '@/lib/formato'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import ContadorItinerario from './ContadorItinerario'
import estilos from './NavegacionPrincipal.module.css'

interface Props {
  variante: 'barra' | 'inferior'
}

/** Portada, Programa y Mi itinerario, con `aria-current` según la ruta. */
export default function NavegacionPrincipal({ variante }: Props) {
  const pathname = usePathname()
  const { listo, ids } = useItinerario()

  const enPortada = pathname === '/'
  const enPrograma = pathname === '/programa' || pathname.startsWith('/peliculas/')
  const enItinerario = pathname === '/itinerario'

  const etiquetaItinerario = listo ? `Mi itinerario, ${plural(ids.length, 'función', 'funciones')}` : 'Mi itinerario'

  return (
    <nav className={`${estilos.nav} ${estilos[variante]} noImprimir`} aria-label="Navegación principal">
      <Link href="/" className={estilos.enlace} aria-current={enPortada ? 'page' : undefined}>
        <IconoPortada />
        <span>Portada</span>
      </Link>
      <Link href="/programa" className={estilos.enlace} aria-current={enPrograma ? 'page' : undefined}>
        <IconoPrograma />
        <span>Programa</span>
      </Link>
      <Link href="/itinerario" className={estilos.enlace} aria-current={enItinerario ? 'page' : undefined} aria-label={etiquetaItinerario}>
        <IconoItinerario />
        <span aria-hidden="true">Mi itinerario</span>
        <ContadorItinerario />
      </Link>
    </nav>
  )
}
