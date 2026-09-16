import type { Metadata, Viewport } from 'next'
import { Big_Shoulders, Fraunces, IBM_Plex_Sans } from 'next/font/google'
import Anunciador from '@/components/anuncios/Anunciador'
import Encabezado from '@/components/layout/Encabezado'
import NavegacionPrincipal from '@/components/layout/NavegacionPrincipal'
import Pie from '@/components/layout/Pie'
import SaltarAlContenido from '@/components/layout/SaltarAlContenido'
import { dias, festival } from '@/lib/datos'
import { listaHumana, nombreMes } from '@/lib/formato'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz', 'SOFT', 'WONK'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--f-titular',
})

const bigShoulders = Big_Shoulders({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz'],
  display: 'swap',
  variable: '--f-rotulo',
  // Next no encuentra métricas de reemplazo automáticas para esta fuente;
  // se declara un respaldo a mano para que el build quede sin warnings y
  // el salto de layout mientras carga sea mínimo.
  fallback: ['system-ui', 'sans-serif'],
  adjustFontFallback: false,
})

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: 'variable',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--f-texto',
})

const anioFestival = festival.fechaInicio.slice(0, 4)
const mesFestival = nombreMes(Number(festival.fechaInicio.slice(5, 7)))
const numerosDias = dias.map((d) => String(d.numero))

export const metadata: Metadata = {
  title: {
    template: `%s, ${festival.nombre}`,
    default: festival.nombre,
  },
  description: `Tercera edición del ${festival.nombre} en ${festival.ciudad}, ${festival.region}: ${listaHumana(numerosDias)} de ${mesFestival} de ${anioFestival}.`,
}

export const viewport: Viewport = {
  themeColor: '#0B141B',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${bigShoulders.variable} ${ibmPlexSans.variable}`}>
      <body>
        <SaltarAlContenido />
        <Encabezado />
        <main id="contenido">{children}</main>
        <Pie />
        <NavegacionPrincipal variante="inferior" />
        <Anunciador />
      </body>
    </html>
  )
}
