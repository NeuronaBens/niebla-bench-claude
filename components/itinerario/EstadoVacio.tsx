import Link from 'next/link'
import styles from './EstadoVacio.module.css'

export function EstadoVacio() {
  return (
    <div className={styles.contenedor}>
      <svg viewBox="0 0 120 90" width="120" height="90" aria-hidden="true" className={styles.dibujo}>
        <rect x="10" y="10" width="100" height="70" fill="none" stroke="var(--niebla-2)" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="34" y1="10" x2="34" y2="80" stroke="var(--niebla-2)" strokeWidth="1" strokeDasharray="2 3" />
      </svg>
      <p className={styles.frase}>Tu recorrido todavía está en la niebla.</p>
      <p className={styles.ayuda}>
        Marca el boleto de las funciones que quieres ver y aquí armamos tu recorrido, con los tiempos para llegar
        caminando.
      </p>
      <Link href="/programa" className={styles.boton}>
        Ir al programa
      </Link>
    </div>
  )
}
