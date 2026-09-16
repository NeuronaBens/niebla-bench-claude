import { textoEstreno, textoMinutos } from '@/lib/formato'
import type { Funcion } from '@/lib/tipos'
import styles from './EtiquetasFuncion.module.css'

interface Props {
  funcion: Funcion
  mostrarEstreno?: boolean
  mostrarNota?: boolean
  sobrePapel?: boolean
}

export function EtiquetasFuncion({ funcion, mostrarEstreno = true, mostrarNota = true, sobrePapel = false }: Props) {
  const hayEtiquetas =
    funcion.agotada || funcion.aireLibre || funcion.conversatorioMin > 0 || mostrarEstreno
  if (!hayEtiquetas && !(mostrarNota && funcion.nota)) return null

  return (
    <div className={styles.contenedor}>
      {hayEtiquetas && (
        <ul className={`${styles.lista} ${sobrePapel ? styles.sobrePapel : ''}`}>
          {funcion.agotada && (
            <li className={`${styles.etiqueta} ${styles.agotada}`}>Agotada</li>
          )}
          {funcion.aireLibre && <li className={styles.etiqueta}>Aire libre · gratis</li>}
          {funcion.conversatorioMin > 0 && (
            <li className={styles.etiqueta}>Conversatorio {textoMinutos(funcion.conversatorioMin)}</li>
          )}
          {mostrarEstreno && <li className={`${styles.etiqueta} ${styles.estreno}`}>{textoEstreno(funcion.pelicula.estreno)}</li>}
        </ul>
      )}
      {mostrarNota && funcion.nota && <p className={styles.nota}>{funcion.nota}</p>}
    </div>
  )
}
