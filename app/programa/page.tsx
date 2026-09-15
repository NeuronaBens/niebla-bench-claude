import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ListaProgramaDias } from '@/components/programa/ListaProgramaDias.tsx'
import { ProgramaCliente } from '@/components/programa/ProgramaCliente.tsx'
import { programa } from '@/lib/programa'
import estilos from './programa.module.css'

export const metadata: Metadata = {
  title: 'Programa',
  description: 'Las 39 funciones del Festival de Cine Niebla, filtrables por día y por sección.',
}

export default function ProgramaPage() {
  return (
    <div>
      <div className={estilos.cabecera}>
        <h1 className={estilos.titulo}>Programa</h1>
        <p className={estilos.intro}>Las funciones de los tres días. Filtra por día o por sección para ir al grano.</p>
      </div>
      <Suspense fallback={<ListaProgramaDias funciones={programa.funciones} dias={programa.dias} />}>
        <ProgramaCliente funciones={programa.funciones} dias={programa.dias} secciones={programa.secciones} />
      </Suspense>
    </div>
  )
}
