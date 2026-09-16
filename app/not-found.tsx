import Link from 'next/link'
import styles from './not-found.module.css'

export default function NoEncontrado() {
  return (
    <div className={`${styles.pagina} contenedor`}>
      <p className={styles.numero} aria-hidden="true">
        404
      </p>
      <h1 className={styles.titulo}>Esta función se perdió en la niebla</h1>
      <p className={styles.frase}>No encontramos lo que buscabas. Puede que el link esté mal escrito o que la página ya no exista.</p>
      <div className={styles.enlaces}>
        <Link href="/programa" className={styles.botonPrimario}>
          Ver el programa
        </Link>
        <Link href="/" className={styles.botonSecundario}>
          Ir a la portada
        </Link>
      </div>
    </div>
  )
}
