import { Suspense } from 'react'
import type { Metadata } from 'next'
import ProgramaConFiltros from '@/components/programa/ProgramaConFiltros'
import VistaPrograma from '@/components/programa/VistaPrograma'
import { totalFunciones } from '@/lib/datos'
import estilos from './page.module.css'

export const metadata: Metadata = {
  title: 'Programa',
  description: `Las ${totalFunciones} funciones de los tres días, por día y por sección.`,
}

export default function ProgramaPage() {
  return (
    <div>
      <h1 className={`${estilos.h1} contenedor`}>Programa</h1>
      <Suspense fallback={<VistaPrograma filtros={{ dia: null, seccion: null }} interactiva={false} />}>
        <ProgramaConFiltros />
      </Suspense>
    </div>
  )
}
