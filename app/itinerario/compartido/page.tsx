import { Suspense } from 'react'
import type { Metadata } from 'next'
import { ItinerarioCompartido } from '@/components/itinerario/ItinerarioCompartido'
import styles from './compartido.module.css'

export const metadata: Metadata = {
  title: 'Itinerario compartido',
  description: 'Revisa el itinerario que alguien armó para el Festival de Cine Niebla y cópialo al tuyo si te gusta.',
}

export default function ItinerarioCompartidoPage() {
  return (
    <div className={`${styles.pagina} contenedor`}>
      <p className={styles.rotulo}>Itinerario compartido</p>
      <h1 className={styles.titulo}>Itinerario compartido</h1>
      <p className={styles.bajada}>Alguien armó este recorrido. Revísalo y, si te gusta, cópialo al tuyo.</p>
      <Suspense fallback={<p className={styles.cargando}>Abriendo el itinerario compartido…</p>}>
        <ItinerarioCompartido />
      </Suspense>
    </div>
  )
}
