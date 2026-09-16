import Link from 'next/link'
import { AfichePelicula } from '@/components/afiche/AfichePelicula'
import { BotonItinerario } from '@/components/funcion/BotonItinerario'
import { EtiquetasFuncion } from '@/components/funcion/EtiquetasFuncion'
import { estiloDeSeccion } from '@/lib/estiloSecciones'
import { formatearDuracion } from '@/lib/formato'
import type { Funcion } from '@/lib/tipos'
import styles from './FilaFuncion.module.css'

interface Props {
  funcion: Funcion
  instancia: string
}

export function FilaFuncion({ funcion, instancia }: Props) {
  const estilo = estiloDeSeccion(funcion.pelicula.seccion)

  return (
    <li className={styles.fila} style={{ borderLeftColor: estilo.colorTinta }}>
      <div className={styles.hora}>
        <p className={`${styles.horaInicio} numeros ${funcion.agotada ? styles.horaTachada : ''}`}>{funcion.horaInicio}</p>
        <p className="numeros">a {funcion.horaTermino}</p>
        {funcion.terminaOtroDia && <p className={styles.madrugada}>madrugada</p>}
      </div>

      <div className={styles.centro}>
        <Link href={`/pelicula/${funcion.pelicula.id}`} className={styles.enlacePelicula}>
          <span className={styles.miniAfiche}>
            <AfichePelicula pelicula={funcion.pelicula} tamano="mini" instancia={instancia} />
          </span>
          <span className={styles.titulo}>{funcion.pelicula.titulo}</span>
        </Link>
        <p className={styles.seccionLinea} style={{ color: estilo.colorTinta }}>
          {estilo.nombreCorto}
        </p>
        <p className={styles.meta}>
          {funcion.sala.nombre} · {formatearDuracion(funcion.pelicula.duracionMin)}
        </p>
        <EtiquetasFuncion funcion={funcion} />
      </div>

      <div className={styles.boton}>
        <BotonItinerario funcion={funcion} />
      </div>
    </li>
  )
}
