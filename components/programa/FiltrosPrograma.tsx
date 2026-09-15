'use client'

import { Icono } from '@/components/ui/Icono'
import { general, filtros as textosFiltros } from '@/lib/textos'
import { nombreCortoSeccion } from '@/lib/formato'
import type { DiaFestival, FiltrosPrograma as FiltrosProgramaTipo, Seccion } from '@/lib/tipos'
import estilos from './FiltrosPrograma.module.css'

export function FiltrosPrograma({
  filtros,
  dias,
  secciones,
  total,
  alCambiar,
}: {
  filtros: FiltrosProgramaTipo
  dias: DiaFestival[]
  secciones: Seccion[]
  total: number
  alCambiar: (f: FiltrosProgramaTipo) => void
}) {
  const hayFiltro = filtros.dia !== null || filtros.seccion !== null

  return (
    <div className={estilos.filtros}>
      <fieldset className={estilos.grupo}>
        <legend className={estilos.leyenda}>{textosFiltros.dia}</legend>
        <div className={estilos.segmentado}>
          <button
            type="button"
            className={estilos.opcionDia}
            aria-pressed={filtros.dia === null}
            onClick={() => alCambiar({ ...filtros, dia: null })}
          >
            {textosFiltros.todos}
          </button>
          {dias.map((dia) => (
            <button
              key={dia.slug}
              type="button"
              className={estilos.opcionDia}
              aria-pressed={filtros.dia === dia.slug}
              onClick={() => alCambiar({ ...filtros, dia: filtros.dia === dia.slug ? null : dia.slug })}
            >
              {dia.corto}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className={estilos.grupo}>
        <legend className={estilos.leyenda}>{textosFiltros.seccion}</legend>
        <div className={estilos.envoltura}>
          <button
            type="button"
            className={estilos.opcionSeccion}
            aria-pressed={filtros.seccion === null}
            onClick={() => alCambiar({ ...filtros, seccion: null })}
          >
            {textosFiltros.todas}
          </button>
          {secciones.map((seccion) => {
            const activa = filtros.seccion === seccion.id
            return (
              <button
                key={seccion.id}
                type="button"
                className={`${estilos.opcionSeccion} luz-${seccion.id}`}
                aria-pressed={activa}
                aria-label={seccion.nombre}
                onClick={() => alCambiar({ ...filtros, seccion: activa ? null : seccion.id })}
              >
                {activa ? <Icono nombre="check" tamano={14} /> : <span className={estilos.punto} style={{ background: 'var(--luz)' }} />}
                {nombreCortoSeccion(seccion.id)}
              </button>
            )
          })}
        </div>
      </fieldset>

      <p className={estilos.estado} aria-live="polite">
        {textosFiltros.mostrando(total)}
        {hayFiltro ? (
          <button type="button" onClick={() => alCambiar({ dia: null, seccion: null })} style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'inherit', fontWeight: 700 }}>
            {general.quitarFiltros}
          </button>
        ) : null}
      </p>
    </div>
  )
}
