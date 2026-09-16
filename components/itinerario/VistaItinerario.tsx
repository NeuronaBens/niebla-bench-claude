'use client'

import { Fragment, useMemo } from 'react'
import { BoletoFuncion } from './BoletoFuncion'
import { EstadoVacio } from './EstadoVacio'
import { ResumenItinerario } from './ResumenItinerario'
import { TramoEntreFunciones } from './TramoEntreFunciones'
import { agruparAvisosPorFuncion } from '@/lib/itinerario/agrupar'
import { calcularAvisos } from '@/lib/itinerario/avisos'
import { dias, funcionesPorId, traslados } from '@/lib/programa'
import styles from './VistaItinerario.module.css'

interface Props {
  ids: string[]
  modo: 'propio' | 'compartido'
  idsPropios?: string[]
  onQuitar?: (id: string) => void
  onVaciar?: () => void
}

export function VistaItinerario({ ids, modo, idsPropios, onQuitar, onVaciar }: Props) {
  const funciones = useMemo(
    () => ids.map((id) => funcionesPorId.get(id)).filter((f): f is NonNullable<typeof f> => Boolean(f)),
    [ids]
  )

  const { avisos, tramos } = useMemo(() => calcularAvisos(funciones, traslados), [funciones])
  const avisosPorFuncion = useMemo(() => agruparAvisosPorFuncion(avisos, tramos), [avisos, tramos])
  const idsPropiosSet = useMemo(() => new Set(idsPropios ?? []), [idsPropios])

  if (funciones.length === 0) {
    return modo === 'propio' ? <EstadoVacio /> : null
  }

  return (
    <div className={styles.disposicion}>
      <div className={styles.columnaResumen}>
        <ResumenItinerario funciones={funciones} avisos={avisos} modo={modo} onVaciar={onVaciar} />
      </div>
      <div className={styles.columnaBoletos}>
        {dias.map((dia) => {
          const deEseDia = funciones.filter((f) => f.dia === dia.id)
          if (deEseDia.length === 0) return null
          return (
            <section key={dia.id} className={styles.bloqueDia} aria-labelledby={`itin-dia-${dia.id}`}>
              <h2 id={`itin-dia-${dia.id}`} className={styles.encabezadoDia}>
                {dia.nombreLargo.toUpperCase()} {dia.numero}
              </h2>
              <ul className={styles.lista}>
                {deEseDia.map((funcion, indice) => {
                  const siguiente = deEseDia[indice + 1]
                  const tramo = siguiente ? tramos.find((t) => t.desde === funcion.id && t.hasta === siguiente.id) : undefined
                  const avisoDelTramo =
                    tramo && siguiente
                      ? avisos.find(
                          (a) =>
                            a.ids.length === 2 &&
                            a.ids[0] === tramo.desde &&
                            a.ids[1] === tramo.hasta &&
                            (a.tipo === 'choque' || a.tipo === 'traslado' || a.tipo === 'conversatorio')
                        )
                      : undefined
                  return (
                    <Fragment key={funcion.id}>
                      <BoletoFuncion
                        funcion={funcion}
                        indice={indice}
                        modo={modo}
                        avisos={avisosPorFuncion.get(funcion.id) ?? []}
                        yaEnPropio={modo === 'compartido' && idsPropiosSet.has(funcion.id)}
                        onQuitar={onQuitar ? () => onQuitar(funcion.id) : undefined}
                      />
                      {tramo && siguiente && (
                        <TramoEntreFunciones tramo={tramo} aviso={avisoDelTramo} funcionB={siguiente} />
                      )}
                    </Fragment>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>
    </div>
  )
}
