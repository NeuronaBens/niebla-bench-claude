import { generarMarca } from '@/lib/marca'
import type { Forma, Pelicula } from '@/lib/tipos'
import estilos from './MarcaPelicula.module.css'

type Tamano = 'mini' | 'tarjeta' | 'protagonista'

interface Props {
  pelicula: Pelicula
  tamano: Tamano
  className?: string
}

function formaAElemento(forma: Forma, indice: number) {
  const { tipo, atributos } = forma
  const key = `${tipo}-${indice}`
  switch (tipo) {
    case 'rect':
      return <rect key={key} {...atributos} />
    case 'circle':
      return <circle key={key} {...atributos} />
    case 'ellipse':
      return <ellipse key={key} {...atributos} />
    case 'path':
      return <path key={key} {...atributos} />
    case 'line':
      return <line key={key} {...atributos} />
    case 'polyline':
      return <polyline key={key} {...atributos} />
    default:
      return null
  }
}

/**
 * Representación visual determinista de una película, sin afiches: la misma
 * película siempre se ve igual, generada con `lib/marca.ts`. Sin texto,
 * números ni ids, para poder repetirse varias veces en la misma página.
 */
export default function MarcaPelicula({ pelicula, tamano, className }: Props) {
  const marca = generarMarca(pelicula)
  const omitirDetalle = tamano === 'mini'
  const formas = omitirDetalle ? marca.formas.filter((f) => f.capa !== 'niebla' && f.capa !== 'marco') : marca.formas

  return (
    <svg
      viewBox={marca.viewBox}
      className={`${estilos.marca} ${estilos[tamano]} ${className ?? ''}`}
      aria-hidden="true"
      shapeRendering="geometricPrecision"
    >
      {formas.map(formaAElemento)}
    </svg>
  )
}
