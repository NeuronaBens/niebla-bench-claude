import type { Metadata } from 'next'
import { ItinerarioPropio } from '@/components/itinerario/ItinerarioPropio'
import styles from './itinerario.module.css'

export const metadata: Metadata = {
  title: 'Mi itinerario',
  description: 'Arma tu recorrido por el Festival de Cine Niebla: elige tus funciones y revisa choques y traslados.',
}

export default function ItinerarioPage() {
  return (
    <div className={`${styles.pagina} contenedor`}>
      <h1 className={styles.titulo}>Mi itinerario</h1>
      <ItinerarioPropio />
    </div>
  )
}
