'use client'

import { estiloDeSeccion } from '@/lib/estiloSecciones'
import { secciones } from '@/lib/programa'
import { textoFunciones } from '@/lib/formato'
import type { DiaId, SeccionId } from '@/lib/tipos'
import type { Filtros } from './filtros'
import styles from './FiltrosPrograma.module.css'

const DIAS_BOTON: { id: DiaId | null; etiqueta: string }[] = [
  { id: null, etiqueta: 'Todos' },
  { id: 'jueves', etiqueta: 'Jue 15' },
  { id: 'viernes', etiqueta: 'Vie 16' },
  { id: 'sabado', etiqueta: 'Sáb 17' },
]

interface Props {
  filtros: Filtros
  cantidad: number
  onCambiarDia: (dia: DiaId | null) => void
  onAlternarSeccion: (id: SeccionId) => void
  onLimpiarSecciones: () => void
}

export function FiltrosPrograma({ filtros, cantidad, onCambiarDia, onAlternarSeccion, onLimpiarSecciones }: Props) {
  return (
    <div className={styles.contenedor}>
      <div className={styles.filtroDia}>
        <span className="visualmente-oculto" id="etiqueta-dia">
          Filtrar por día
        </span>
        <div role="group" aria-labelledby="etiqueta-dia" className={styles.grupoDia}>
          {DIAS_BOTON.map((d) => {
            const activo = filtros.dia === d.id
            return (
              <button
                key={d.etiqueta}
                type="button"
                className={`${styles.botonDia} ${activo ? styles.activo : ''}`}
                aria-pressed={activo}
                onClick={() => onCambiarDia(d.id)}
              >
                {d.etiqueta}
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.filtroSeccion}>
        <span className="visualmente-oculto" id="etiqueta-seccion">
          Filtrar por sección
        </span>
        <div role="group" aria-labelledby="etiqueta-seccion" className={styles.grupoSeccion}>
          {secciones.map((s) => {
            const estilo = estiloDeSeccion(s.id)
            const activo = filtros.secciones.includes(s.id)
            return (
              <button
                key={s.id}
                type="button"
                className={`${styles.botonSeccion} ${activo ? styles.activo : ''}`}
                aria-pressed={activo}
                onClick={() => onAlternarSeccion(s.id)}
              >
                <span className={styles.punto} style={{ background: estilo.colorTinta }} aria-hidden="true" />
                {estilo.nombreCorto}
              </button>
            )
          })}
          {filtros.secciones.length > 0 && (
            <button type="button" className={styles.botonLimpiar} onClick={onLimpiarSecciones}>
              Limpiar
            </button>
          )}
        </div>
      </div>

      <p className={styles.contador} aria-live="polite">
        {textoFunciones(cantidad)}
      </p>
    </div>
  )
}
