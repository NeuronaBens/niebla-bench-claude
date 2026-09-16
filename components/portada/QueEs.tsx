import { funciones, peliculas, salas } from '@/lib/programa'
import styles from './QueEs.module.css'

export function QueEs() {
  return (
    <section className={`${styles.seccion} contenedor`} aria-label="Qué es el festival">
      <p className={styles.frase}>
        Tres días de cine en Puerto Bruma: {peliculas.length} películas en {salas.length} salas, del muelle al faro.
      </p>
      <dl className={styles.cifras}>
        <div className={styles.cifra}>
          <dt className={styles.numero}>{peliculas.length}</dt>
          <dd className={styles.etiqueta}>películas</dd>
        </div>
        <div className={styles.cifra}>
          <dt className={styles.numero}>{funciones.length}</dt>
          <dd className={styles.etiqueta}>funciones</dd>
        </div>
        <div className={styles.cifra}>
          <dt className={styles.numero}>{salas.length}</dt>
          <dd className={styles.etiqueta}>salas</dd>
        </div>
      </dl>
    </section>
  )
}
