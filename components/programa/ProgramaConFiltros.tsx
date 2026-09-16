'use client'

import { useSearchParams } from 'next/navigation'
import { leerFiltros } from '@/lib/filtros'
import VistaPrograma from './VistaPrograma'

/** Lee los filtros de la URL y renderiza el programa interactivo. */
export default function ProgramaConFiltros() {
  const searchParams = useSearchParams()
  const { filtros } = leerFiltros(searchParams)
  return <VistaPrograma filtros={filtros} interactiva />
}
