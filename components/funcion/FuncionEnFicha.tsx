import { BotonItinerario } from '@/components/funcion/BotonItinerario'
import { EtiquetasFuncion } from '@/components/funcion/EtiquetasFuncion'
import { formatearPrecio } from '@/lib/formato'
import { diaPorId } from '@/lib/programa'
import type { Funcion } from '@/lib/tipos'
import styles from './FuncionEnFicha.module.css'

interface Props {
  funcion: Funcion
}

export function FuncionEnFicha({ funcion }: Props) {
  const dia = diaPorId(funcion.dia)

  return (
    <li className={styles.boleto}>
      <div className={styles.talon}>
        <p className={styles.diaCorto}>{dia?.nombreCorto}</p>
        <p className={`${styles.hora} numeros`}>{funcion.horaInicio}</p>
      </div>
      <div className={styles.cuerpo}>
        <p className={styles.diaLargo}>
          {dia?.nombreLargo} {dia?.numero} de {dia?.mes}
        </p>
        <p className={`${styles.rango} numeros`}>
          {funcion.horaInicio} a {funcion.horaTermino}
          {funcion.terminaOtroDia && ` (madrugada del ${funcion.diaTermino})`}
        </p>
        <p className={styles.sala}>
          {funcion.sala.nombre} · {funcion.sala.direccion}
        </p>
        <p className={styles.precio}>{funcion.aireLibre ? 'Gratis, al aire libre' : formatearPrecio(funcion.precio)}</p>
        <EtiquetasFuncion funcion={funcion} mostrarEstreno={false} sobrePapel />
        <div className={styles.boton}>
          <BotonItinerario funcion={funcion} variante="amplio" sobrePapel />
        </div>
      </div>
    </li>
  )
}
