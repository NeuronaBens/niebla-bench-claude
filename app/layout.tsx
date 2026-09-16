import type { Metadata, Viewport } from 'next'
import { Big_Shoulders, Instrument_Sans, Instrument_Serif } from 'next/font/google'
import { ProveedorAvisos } from '@/components/avisos/ProveedorAvisos'
import { NavegacionPrincipal } from '@/components/navegacion/NavegacionPrincipal'
import { PiePagina } from '@/components/navegacion/PiePagina'
import './globals.css'

const bigShoulders = Big_Shoulders({
  subsets: ['latin', 'latin-ext'],
  weight: 'variable',
  axes: ['opsz'],
  variable: '--font-big-shoulders',
  display: 'swap',
  // Next no tiene métricas propias para generar un fallback ajustado de esta fuente (avisa
  // "Failed to find font override values" en el build). Se apaga ese ajuste automático y se
  // usa un fallback manual razonable, ya declarado en `--font-display` (globals.css).
  adjustFontFallback: false,
  fallback: ['Arial Narrow', 'sans-serif'],
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: 'variable',
  axes: ['wdth'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

const instrumentSerif = Instrument_Serif({
  subsets: ['latin', 'latin-ext'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s · Festival de Cine Niebla',
    default: 'Festival de Cine Niebla · 15 al 17 de octubre de 2026, Puerto Bruma',
  },
  description:
    'Tercera edición del Festival de Cine Niebla en Puerto Bruma, Chile: 24 películas en 4 salas, del jueves 15 al sábado 17 de octubre de 2026.',
  icons: {
    icon: '/icon.svg',
  },
}

export const viewport: Viewport = {
  themeColor: '#0e1a24',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CL" className={`${bigShoulders.variable} ${instrumentSans.variable} ${instrumentSerif.variable}`}>
      <body>
        <a href="#contenido" className="saltar-al-contenido">
          Saltar al contenido
        </a>
        <div className="grano" aria-hidden="true" />
        <ProveedorAvisos>
          <NavegacionPrincipal />
          <main id="contenido">{children}</main>
          <PiePagina />
        </ProveedorAvisos>
      </body>
    </html>
  )
}
