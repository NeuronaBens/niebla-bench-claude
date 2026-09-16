import estilos from './PuntoSeccion.module.css'

interface Props {
  className?: string
}

/** Cuadrado de 10px rotado 45°, como una boya. Siempre junto al nombre de la sección. */
export default function PuntoSeccion({ className }: Props) {
  return <span className={`${estilos.punto} ${className ?? ''}`} aria-hidden="true" />
}
