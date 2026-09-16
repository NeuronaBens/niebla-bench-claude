import { formatearPrecio } from '@/lib/formato'
import { festival } from '@/lib/programa'
import styles from './InfoEntradas.module.css'

export function InfoEntradas() {
  return (
    <section className={`${styles.seccion} contenedor`} aria-labelledby="titulo-entradas">
      <h2 id="titulo-entradas" className={styles.titulo}>
        Entradas
      </h2>
      <div className={styles.boleto}>
        <div className={styles.talon}>
          <p className={styles.precio}>{formatearPrecio(festival.entradas.general)}</p>
          <p className={styles.precioEtiqueta}>Entrada general</p>
        </div>
        <div className={styles.cuerpo}>
          <p className={styles.linea}>
            <strong>Funciones al aire libre:</strong> gratis
          </p>
          <p className={styles.linea}>{festival.entradas.venta}</p>
          <p className={styles.contacto}>
            <a href={`mailto:${festival.contacto.correo}`}>{festival.contacto.correo}</a> · {festival.contacto.instagram}
          </p>
        </div>
      </div>
    </section>
  )
}
