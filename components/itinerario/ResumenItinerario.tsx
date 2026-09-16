import { BotonCompartir } from '@/components/itinerario/BotonCompartir'
import { formatearDuracion, formatearPrecio } from '@/lib/formato'
import type { Aviso } from '@/lib/itinerario/avisos'
import { textoAvisoResumen } from '@/lib/itinerario/textos'
import { festival, funcionesPorId } from '@/lib/programa'
import type { Funcion } from '@/lib/tipos'
import styles from './ResumenItinerario.module.css'

interface Props {
  funciones: Funcion[]
  avisos: Aviso[]
  modo: 'propio' | 'compartido'
  onVaciar?: () => void
}

export function ResumenItinerario({ funciones, avisos, modo, onVaciar }: Props) {
  const cantidadFunciones = funciones.length
  const peliculasDistintas = new Set(funciones.map((f) => f.pelicula.id)).size
  const minutosTotales = funciones.reduce((acum, f) => acum + f.pelicula.duracionMin, 0)
  const avisosRelevantes = avisos.filter((a) => a.nivel === 'alerta' || a.nivel === 'cuidado')
  const funcionesPagadas = funciones.filter((f) => !f.aireLibre).length
  const totalEntradas = funcionesPagadas * festival.entradas.general

  return (
    <div className={styles.resumen}>
      <dl className={styles.cifras}>
        <div>
          <dt>Funciones</dt>
          <dd>{cantidadFunciones}</dd>
        </div>
        <div>
          <dt>Películas</dt>
          <dd>{peliculasDistintas}</dd>
        </div>
        <div>
          <dt>Horas de cine</dt>
          <dd>{formatearDuracion(minutosTotales)}</dd>
        </div>
        <div>
          <dt>Avisos</dt>
          <dd>{avisosRelevantes.length}</dd>
        </div>
      </dl>

      <p className={styles.entradas}>
        Entradas estimadas: {formatearPrecio(totalEntradas)}, se pagan en boletería.
      </p>

      {avisosRelevantes.length > 0 && (
        <ul className={styles.listaAvisos}>
          {avisosRelevantes.map((a) => (
            <li key={a.id}>
              <a href={`#funcion-${a.ids[0]}`} className={a.nivel === 'alerta' ? styles.enlaceAlerta : styles.enlaceCuidado}>
                {textoAvisoResumen(a, funcionesPorId)}
              </a>
            </li>
          ))}
        </ul>
      )}

      {modo === 'propio' && (
        <div className={`${styles.acciones} no-imprimir`}>
          <BotonCompartir ids={funciones.map((f) => f.id)} />
          {onVaciar && cantidadFunciones > 0 && (
            <button type="button" className={styles.botonSecundario} onClick={onVaciar}>
              Vaciar itinerario
            </button>
          )}
        </div>
      )}
    </div>
  )
}
