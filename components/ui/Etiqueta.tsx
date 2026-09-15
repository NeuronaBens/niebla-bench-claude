import type { ReactNode } from 'react'
import { Icono, type NombreIcono } from './Icono.tsx'
import estilos from './Etiqueta.module.css'

export type TonoEtiqueta = 'competencia' | 'panorama' | 'nocturna' | 'costa' | 'tope' | 'noAlcanza' | 'conversatorio' | 'agotada' | 'neutra'

export function Etiqueta({
  tono,
  icono,
  children,
}: {
  tono: TonoEtiqueta
  icono?: NombreIcono
  children: ReactNode
}) {
  return (
    <span className={`${estilos.etiqueta} ${estilos[tono]}`}>
      {icono ? <Icono nombre={icono} tamano={14} /> : null}
      {children}
    </span>
  )
}
