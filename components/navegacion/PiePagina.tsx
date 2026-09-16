import { dias, festival } from '@/lib/programa'
import styles from './PiePagina.module.css'

export function PiePagina() {
  const [anio] = festival.fechaInicio.split('-')
  const numeros = dias.map((d) => d.numero)
  const diasTexto =
    numeros.length > 1
      ? `${numeros.slice(0, -1).join(', ')} y ${numeros[numeros.length - 1]}`
      : String(numeros[0])

  return (
    <footer className={styles.pie}>
      <div className={`${styles.interior} contenedor`}>
        <p className={styles.wordmark}>NIEBLA</p>
        <p className={styles.fechas}>
          {festival.edicion}ª edición · {diasTexto} de {dias[0].mes} de {anio} · Puerto Bruma, Chile
        </p>
        <ul className={styles.datos}>
          <li>
            <a href={`mailto:${festival.contacto.correo}`}>{festival.contacto.correo}</a>
          </li>
          <li>{festival.contacto.instagram}</li>
          <li>{festival.entradas.venta}</li>
        </ul>
      </div>
    </footer>
  )
}
