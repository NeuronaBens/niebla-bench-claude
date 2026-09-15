import { Big_Shoulders_Stencil, Big_Shoulders, Atkinson_Hyperlegible_Next, Atkinson_Hyperlegible_Mono } from 'next/font/google'

export const fuenteStencil = Big_Shoulders_Stencil({
  variable: '--f-stencil',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: false,
})

export const fuenteRotulo = Big_Shoulders({
  variable: '--f-rotulo',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
})

export const fuenteTexto = Atkinson_Hyperlegible_Next({
  variable: '--f-texto',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: true,
  weight: ['400', '600', '700'],
})

export const fuenteMono = Atkinson_Hyperlegible_Mono({
  variable: '--f-mono',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  preload: false,
  weight: ['400', '700'],
})
