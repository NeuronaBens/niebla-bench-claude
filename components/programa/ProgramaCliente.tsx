'use client'

import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { useItinerario } from '@/components/itinerario/useItinerario'
import { programa } from '@/lib/programa'
import { leerFiltros, escribirFiltros, filtrarFunciones } from '@/lib/filtros'
import { avisosAlAgregar } from '@/lib/reglas-itinerario'
import type { Aviso, DiaFestival, FiltrosPrograma as FiltrosProgramaTipo, Funcion, Seccion } from '@/lib/tipos'
import { FiltrosPrograma } from './FiltrosPrograma.tsx'
import { ListaProgramaDias } from './ListaProgramaDias.tsx'
import estilos from './programa.module.css'

export function ProgramaCliente({
  funciones,
  dias,
  secciones,
}: {
  funciones: Funcion[]
  dias: DiaFestival[]
  secciones: Seccion[]
}) {
  const searchParams = useSearchParams()
  const { ids } = useItinerario()

  const filtros: FiltrosProgramaTipo = useMemo(
    () => leerFiltros(searchParams as unknown as URLSearchParams, programa),
    [searchParams]
  )

  useEffect(() => {
    const canonica = escribirFiltros(filtros)
    const actual = searchParams.toString() ? `?${searchParams.toString()}` : ''
    if (canonica !== actual) {
      window.history.replaceState(null, '', `/programa${canonica}`)
    }
    try {
      sessionStorage.setItem('niebla:programa:filtros', canonica)
    } catch {
      // Se ignora: sesionStorage no disponible.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.dia, filtros.seccion])

  const filtradas = useMemo(() => filtrarFunciones(funciones, filtros), [funciones, filtros])

  const avisosPorFuncion = useMemo(() => {
    const mapa = new Map<string, Aviso[]>()
    if (ids.length === 0) return mapa
    for (const funcion of filtradas) {
      if (ids.includes(funcion.id)) continue
      const avisos = avisosAlAgregar(ids, funcion.id, programa)
      if (avisos.length > 0) mapa.set(funcion.id, avisos)
    }
    return mapa
  }, [filtradas, ids])

  function alCambiar(nuevo: FiltrosProgramaTipo) {
    const canonica = escribirFiltros(nuevo)
    window.history.replaceState(null, '', `/programa${canonica}`)
    try {
      sessionStorage.setItem('niebla:programa:filtros', canonica)
    } catch {
      // Se ignora.
    }
    // Forzamos una relectura disparando un evento popstate simulado no es necesario:
    // Next intercepta history.replaceState y actualiza useSearchParams automáticamente.
  }

  return (
    <div className={estilos.envoltura}>
      <FiltrosPrograma filtros={filtros} dias={dias} secciones={secciones} total={filtradas.length} alCambiar={alCambiar} />
      <div className={estilos.lista}>
        <ListaProgramaDias funciones={filtradas} dias={dias} avisosPorFuncion={avisosPorFuncion} seleccion={ids} />
      </div>
    </div>
  )
}
