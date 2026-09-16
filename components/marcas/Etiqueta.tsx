import type { ReactNode } from 'react'
import { IconoAgotada, IconoAireLibre, IconoConversatorio, IconoNota } from '@/components/iconos/Iconos'
import estilos from './Etiqueta.module.css'

type TipoEtiqueta = 'agotada' | 'aireLibre' | 'conversatorio' | 'nota' | 'estreno'

interface Props {
  tipo: TipoEtiqueta
  children: ReactNode
}

const ICONOS: Partial<Record<TipoEtiqueta, typeof IconoAgotada>> = {
  agotada: IconoAgotada,
  aireLibre: IconoAireLibre,
  conversatorio: IconoConversatorio,
  nota: IconoNota,
}

export default function Etiqueta({ tipo, children }: Props) {
  const Icono = ICONOS[tipo]
  return (
    <span className={`${estilos.chip} ${estilos[tipo]}`}>
      {Icono ? <Icono /> : null}
      {children}
    </span>
  )
}
