'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { FiltrosPrograma } from './FiltrosPrograma'
import { ListaFunciones } from './ListaFunciones'
import { construirQuery, leerFiltros, type Filtros } from './filtros'
import { funciones } from '@/lib/programa'
import type { DiaId, SeccionId } from '@/lib/tipos'
import styles from './ProgramaInteractivo.module.css'

const CLAVE_QUERY_SESION = 'niebla.programa.query'

export function ProgramaInteractivo() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const listaRef = useRef<HTMLDivElement>(null)
  const diaAnteriorRef = useRef<DiaId | null | undefined>(undefined)

  const filtros = useMemo(() => leerFiltros(searchParams), [searchParams])

  useEffect(() => {
    try {
      const query = searchParams.toString()
      window.sessionStorage.setItem(CLAVE_QUERY_SESION, query ? `?${query}` : '')
    } catch {
      // Si sessionStorage no está disponible, "Volver al programa" usará /programa.
    }
  }, [searchParams])

  const funcionesFiltradas = useMemo(() => {
    return funciones.filter((f) => {
      if (filtros.dia && f.dia !== filtros.dia) return false
      if (filtros.secciones.length > 0 && !filtros.secciones.includes(f.pelicula.seccion)) return false
      return true
    })
  }, [filtros])

  // Cambia la URL con la History API nativa: Next la sincroniza con useSearchParams sin
  // pedir el RSC de nuevo al servidor (el filtrado ocurre entero en el navegador).
  const actualizarUrl = useCallback(
    (nuevosFiltros: Filtros) => {
      const query = construirQuery(nuevosFiltros)
      window.history.replaceState(null, '', `${pathname}${query}`)
    },
    [pathname]
  )

  const alCambiarDia = useCallback(
    (dia: DiaId | null) => {
      actualizarUrl({ ...filtros, dia })
    },
    [actualizarUrl, filtros]
  )

  const alAlternarSeccion = useCallback(
    (id: SeccionId) => {
      const yaEsta = filtros.secciones.includes(id)
      const nuevas = yaEsta ? filtros.secciones.filter((s) => s !== id) : [...filtros.secciones, id]
      actualizarUrl({ ...filtros, secciones: nuevas })
    },
    [actualizarUrl, filtros]
  )

  const alLimpiarSecciones = useCallback(() => {
    actualizarUrl({ ...filtros, secciones: [] })
  }, [actualizarUrl, filtros])

  const alLimpiarTodo = useCallback(() => {
    window.history.replaceState(null, '', pathname)
  }, [pathname])

  // El scroll al inicio de la lista corre DESPUÉS de que la lista filtrada ya se pintó con
  // el nuevo día (no en el mismo clic), para que no se quede a mitad de una lista vieja.
  useEffect(() => {
    if (diaAnteriorRef.current === undefined) {
      diaAnteriorRef.current = filtros.dia
      return
    }
    if (diaAnteriorRef.current === filtros.dia) return
    diaAnteriorRef.current = filtros.dia

    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    listaRef.current?.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' })
  }, [filtros.dia])

  return (
    <div className={styles.disposicion}>
      <FiltrosPrograma
        filtros={filtros}
        cantidad={funcionesFiltradas.length}
        onCambiarDia={alCambiarDia}
        onAlternarSeccion={alAlternarSeccion}
        onLimpiarSecciones={alLimpiarSecciones}
      />
      <div ref={listaRef} className={styles.lista}>
        {funcionesFiltradas.length === 0 ? (
          <div className={styles.vacio}>
            <p className={styles.vacioTitulo}>No hay funciones con esos filtros</p>
            <button type="button" className={styles.botonVacio} onClick={alLimpiarTodo}>
              Ver todo el programa
            </button>
          </div>
        ) : (
          <ListaFunciones funciones={funcionesFiltradas} instancia="programa" />
        )}
      </div>
    </div>
  )
}
