'use client'

import Link from 'next/link'
import { useState } from 'react'
import { AfichePelicula } from '@/components/afiche/AfichePelicula'
import { EtiquetasFuncion } from '@/components/funcion/EtiquetasFuncion'
import { estiloDeSeccion } from '@/lib/estiloSecciones'
import type { Aviso } from '@/lib/itinerario/avisos'
import { textoAvisoDesde } from '@/lib/itinerario/textos'
import { funcionesPorId } from '@/lib/programa'
import type { Funcion } from '@/lib/tipos'
import styles from './BoletoFuncion.module.css'

interface Props {
  funcion: Funcion
  indice: number
  modo: 'propio' | 'compartido'
  avisos: Aviso[]
  yaEnPropio?: boolean
  onQuitar?: () => void
}

const DURACION_SALIDA_MS = 220

export function BoletoFuncion({ funcion, indice, modo, avisos, yaEnPropio, onQuitar }: Props) {
  const [saliendo, setSaliendo] = useState(false)
  const estilo = estiloDeSeccion(funcion.pelicula.seccion)

  function manejarQuitar() {
    setSaliendo(true)
    window.setTimeout(() => onQuitar?.(), DURACION_SALIDA_MS)
  }

  const avisosInfo = avisos.filter((a) => a.nivel === 'info')
  const avisosSueltos = avisos.filter((a) => a.nivel !== 'info')

  return (
    <li className={styles.fila}>
      <div className={styles.lineaColumna} aria-hidden="true">
        <span className={styles.linea} />
        <span className={styles.nodo} style={{ background: estilo.colorTinta }} />
      </div>
      <div
        id={`funcion-${funcion.id}`}
        className={`${styles.boleto} ${saliendo ? styles.saliendo : ''}`}
        style={{ '--i': indice } as React.CSSProperties}
      >
        <div className={styles.contenidoColapsable}>
          <div className={styles.interior}>
            <div className={styles.talon}>
              <p className={`${styles.hora} numeros`}>{funcion.horaInicio}</p>
              <p className={styles.horaTermino}>a {funcion.horaTermino}</p>
            </div>
            <div className={styles.cuerpo}>
              <div className={styles.encabezadoCuerpo}>
                <span className={styles.miniAfiche}>
                  <AfichePelicula pelicula={funcion.pelicula} tamano="mini" instancia={`itinerario-${funcion.id}`} />
                </span>
                <div>
                  <Link href={`/pelicula/${funcion.pelicula.id}`} className={styles.titulo}>
                    {funcion.pelicula.titulo}
                  </Link>
                  <p className={styles.sala}>{funcion.sala.nombre}</p>
                </div>
              </div>

              <EtiquetasFuncion funcion={funcion} mostrarEstreno={false} mostrarNota={false} />

              {avisosInfo.length > 0 && (
                <ul className={styles.avisosInfo}>
                  {avisosInfo.map((a) => (
                    <li key={a.id}>{textoAvisoDesde(a, funcionesPorId, funcion.id)}</li>
                  ))}
                </ul>
              )}

              {avisosSueltos.length > 0 && (
                <ul className={styles.avisosSueltos}>
                  {avisosSueltos.map((a) => (
                    <li key={a.id} className={a.nivel === 'alerta' ? styles.avisoAlerta : styles.avisoCuidado}>
                      {textoAvisoDesde(a, funcionesPorId, funcion.id)}
                    </li>
                  ))}
                </ul>
              )}

              {modo === 'compartido' && yaEnPropio && <p className={styles.yaEnPropio}>Ya está en el tuyo</p>}

              {modo === 'propio' && (
                <button type="button" className={styles.botonQuitar} onClick={manejarQuitar}>
                  <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M1 1 L11 11 M11 1 L1 11" stroke="currentColor" strokeWidth="1.4" />
                  </svg>
                  Quitar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  )
}
