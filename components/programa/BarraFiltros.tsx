'use client'

import { useEffect } from 'react'
import PuntoSeccion from '@/components/marcas/PuntoSeccion'
import { dias, secciones } from '@/lib/datos'
import { escribirFiltros, leerFiltros } from '@/lib/filtros'
import { plural } from '@/lib/formato'
import type { FiltrosPrograma } from '@/lib/tipos'
import estilos from './BarraFiltros.module.css'

interface Props {
  filtros: FiltrosPrograma
  interactiva: boolean
  conteo: number
}

const CLAVE_SESSION = 'festival-niebla:programa-query'

function guardarQuery(query: string) {
  try {
    window.sessionStorage.setItem(CLAVE_SESSION, query)
  } catch {
    // Sin sessionStorage, "Volver al programa" cae al programa completo.
  }
}

function actualizarUrl(filtros: FiltrosPrograma) {
  const query = escribirFiltros(filtros)
  window.history.replaceState(null, '', `/programa${query}`)
  guardarQuery(query)
}

/** Filtros de día y sección del programa, reflejados en la URL (H2.2, H2.3). */
export default function BarraFiltros({ filtros, interactiva, conteo }: Props) {
  useEffect(() => {
    if (!interactiva) return
    const { huboInvalidos, filtros: limpios } = leerFiltros(new URLSearchParams(window.location.search))
    if (huboInvalidos) actualizarUrl(limpios)
    else guardarQuery(escribirFiltros(filtros))
    // Solo al montar: cada cambio de filtro ya actualiza la URL por su cuenta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactiva])

  return (
    <div className={estilos.barra}>
      <div className={`${estilos.fila} contenedor`}>
        <div className={estilos.segmentado} role="group" aria-label={`Filtrar por día, ${plural(conteo, 'función', 'funciones')} en total`}>
          <button type="button" aria-pressed={filtros.dia === null} onClick={() => actualizarUrl({ ...filtros, dia: null })}>
            Todos
          </button>
          {dias.map((dia) => (
            <button
              key={dia.slug}
              type="button"
              aria-pressed={filtros.dia === dia.slug}
              aria-label={dia.etiqueta}
              onClick={() => actualizarUrl({ ...filtros, dia: dia.slug })}
            >
              <span className={estilos.corta} aria-hidden="true">
                {dia.corta}
              </span>
              <span className={estilos.completa} aria-hidden="true">
                {dia.etiqueta}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className={`${estilos.fila} ${estilos.filaSecciones} contenedor filaDesplazable`} role="group" aria-label="Filtrar por sección">
        <button type="button" className={estilos.chip} aria-pressed={filtros.seccion === null} onClick={() => actualizarUrl({ ...filtros, seccion: null })}>
          Todas
        </button>
        {secciones.map((seccion) => (
          <button
            key={seccion.id}
            type="button"
            className={estilos.chip}
            data-seccion={seccion.id}
            aria-pressed={filtros.seccion === seccion.id}
            onClick={() => actualizarUrl({ ...filtros, seccion: seccion.id })}
          >
            <PuntoSeccion />
            {seccion.nombre}
          </button>
        ))}
      </div>
    </div>
  )
}
