import type { Aviso, Tramo } from '@/lib/itinerario/avisos'
import { textoAvisoResumen, textoTramoJusto, textoTramoOk } from '@/lib/itinerario/textos'
import { funcionesPorId } from '@/lib/programa'
import type { Funcion } from '@/lib/tipos'
import styles from './TramoEntreFunciones.module.css'

interface Props {
  tramo: Tramo
  aviso?: Aviso
  funcionB: Funcion
}

export function TramoEntreFunciones({ tramo, aviso, funcionB }: Props) {
  if (tramo.estado === 'ok' || tramo.estado === 'justo') {
    const puntos = Math.max(3, Math.min(6, Math.round(tramo.caminataMin / 4) || 3))
    const texto =
      tramo.estado === 'justo'
        ? textoTramoJusto(tramo.caminataMin, tramo.margenMin)
        : textoTramoOk(tramo.caminataMin, tramo.margenMin, funcionB.sala.nombre)
    return (
      <li className={styles.tramo}>
        <div className={styles.lineaColumna} aria-hidden="true">
          <span className={`${styles.linea} ${tramo.estado === 'justo' ? styles.lineaJusto : ''}`} />
        </div>
        <p className={`${styles.texto} ${tramo.estado === 'justo' ? styles.textoJusto : ''}`}>
          <span className={styles.pasos} aria-hidden="true">
            {Array.from({ length: puntos }).map((_, i) => (
              <span key={i} className={styles.paso} />
            ))}
          </span>
          {texto}
        </p>
      </li>
    )
  }

  const textoCompleto = aviso ? textoAvisoResumen(aviso, funcionesPorId) : ''

  if (tramo.estado === 'traslado') {
    return (
      <li className={styles.tramo}>
        <div className={styles.lineaColumna} aria-hidden="true">
          <span className={`${styles.linea} ${styles.lineaAlerta}`} />
        </div>
        <div className={`${styles.caja} ${styles.cajaAlerta}`}>
          <p className={styles.etiqueta}>No alcanzas</p>
          <p>{textoCompleto}</p>
        </div>
      </li>
    )
  }

  if (tramo.estado === 'choque') {
    return (
      <li className={styles.tramo}>
        <div className={styles.lineaColumna} aria-hidden="true">
          <span className={`${styles.linea} ${styles.lineaAlerta}`} />
        </div>
        <div className={`${styles.caja} ${styles.cajaAlerta}`}>
          <p className={styles.etiqueta}>Se topan</p>
          <p>{textoCompleto}</p>
        </div>
      </li>
    )
  }

  return (
    <li className={styles.tramo}>
      <div className={styles.lineaColumna} aria-hidden="true">
        <span className={`${styles.linea} ${styles.lineaCuidado}`} />
      </div>
      <div className={`${styles.caja} ${styles.cajaCuidado}`}>
        <p className={styles.etiqueta}>Conversatorio</p>
        <p>{textoCompleto}</p>
      </div>
    </li>
  )
}
