import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ProgramaFallbackEstatico } from '@/components/programa/ProgramaFallbackEstatico'
import { ProgramaInteractivo } from '@/components/programa/ProgramaInteractivo'
import { funciones } from '@/lib/programa'
import styles from './programa.module.css'

export const metadata: Metadata = {
  title: 'Programa',
  description: 'Las 39 funciones del Festival de Cine Niebla, del jueves 15 al sábado 17 de octubre de 2026 en Puerto Bruma.',
}

export default function ProgramaPage() {
  return (
    <div className={`${styles.pagina} contenedor`}>
      <header className={styles.cabecera}>
        <h1 className={styles.titulo}>Programa</h1>
        <p className={styles.bajada}>{funciones.length} funciones del jueves 15 al sábado 17</p>
      </header>
      <Suspense fallback={<ProgramaFallbackEstatico />}>
        <ProgramaInteractivo />
      </Suspense>
    </div>
  )
}
