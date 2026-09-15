import type { Metadata, Viewport } from 'next'
import { fuenteStencil, fuenteRotulo, fuenteTexto, fuenteMono } from './fuentes.ts'
import { ProveedorAnunciador } from '@/components/ui/Anunciador'
import { Cabecera } from '@/components/layout/Cabecera'
import { NavInferior } from '@/components/layout/NavInferior'
import { Pie } from '@/components/layout/Pie'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Festival de Cine Niebla · 15 al 17 de octubre de 2026',
    template: '%s · Festival de Cine Niebla',
  },
  description:
    'Tercera edición del Festival de Cine Niebla en Puerto Bruma, Chile: 24 películas y 39 funciones en 4 salas, del jueves 15 al sábado 17 de octubre de 2026.',
  openGraph: {
    title: 'Festival de Cine Niebla',
    description:
      'Tercera edición del Festival de Cine Niebla en Puerto Bruma, Chile: 24 películas y 39 funciones en 4 salas, del jueves 15 al sábado 17 de octubre de 2026.',
    locale: 'es_CL',
    type: 'website',
    siteName: 'Festival de Cine Niebla',
  },
}

export const viewport: Viewport = {
  themeColor: '#0B1116',
  viewportFit: 'cover',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="es"
      className={`${fuenteStencil.variable} ${fuenteRotulo.variable} ${fuenteTexto.variable} ${fuenteMono.variable}`}
    >
      <body>
        <ProveedorAnunciador>
          <a href="#contenido" className="enlace-saltar">
            Saltar al contenido
          </a>
          <Cabecera />
          <main id="contenido">{children}</main>
          <Pie />
          <NavInferior />
        </ProveedorAnunciador>
      </body>
    </html>
  )
}
