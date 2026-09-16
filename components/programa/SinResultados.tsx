import Link from 'next/link'
import { diaPorSlug, seccionPorId } from '@/lib/datos'
import type { FiltrosPrograma } from '@/lib/tipos'
import estilos from './SinResultados.module.css'

interface Props {
  filtros: FiltrosPrograma
}

/**
 * Sin `onClick`: es un enlace a `/programa` a propósito, para que este
 * componente pueda usarse tal cual desde el fallback de `Suspense` (server)
 * sin pasarle nunca una función de un Server Component a un Client Component.
 */
export default function SinResultados({ filtros }: Props) {
  const seccion = filtros.seccion ? seccionPorId.get(filtros.seccion)?.nombre : null
  const dia = filtros.dia ? diaPorSlug.get(filtros.dia)?.etiqueta.toLowerCase() : null

  const partes: string[] = []
  if (seccion) partes.push(seccion)
  if (dia) partes.push(`el ${dia}`)

  const texto = partes.length > 0 ? `No hay funciones de ${partes.join(' ')}.` : 'No hay funciones con estos filtros.'

  return (
    <div className={estilos.vacio} role="status">
      <p>{texto}</p>
      <Link href="/programa" className={estilos.boton}>
        Ver todo el programa
      </Link>
    </div>
  )
}
