import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import estilos from './Boton.module.css'

type VarianteBoton = 'principal' | 'secundario' | 'texto'

type PropsComoBoton = { as?: 'button'; ref?: Ref<HTMLButtonElement> } & ButtonHTMLAttributes<HTMLButtonElement>
type PropsComoEnlace = { as: 'a'; ref?: Ref<HTMLAnchorElement> } & AnchorHTMLAttributes<HTMLAnchorElement>

type PropsBoton = {
  variante?: VarianteBoton
  anchoCompleto?: boolean
  children: ReactNode
  className?: string
} & (PropsComoBoton | PropsComoEnlace)

export function Boton({ variante = 'secundario', anchoCompleto, children, className, as, ref, ...resto }: PropsBoton) {
  const clase = [estilos.boton, estilos[variante], anchoCompleto ? estilos.anchoCompleto : '', className]
    .filter(Boolean)
    .join(' ')

  if (as === 'a') {
    return (
      <a className={clase} ref={ref as Ref<HTMLAnchorElement>} {...(resto as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    )
  }

  return (
    <button className={clase} ref={ref as Ref<HTMLButtonElement>} {...(resto as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}
