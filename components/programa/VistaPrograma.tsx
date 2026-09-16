import { dias, diaPorSlug, funciones as todasLasFunciones, seccionPorId } from '@/lib/datos'
import { filtrarFunciones } from '@/lib/filtros'
import { plural } from '@/lib/formato'
import type { FiltrosPrograma } from '@/lib/tipos'
import BarraFiltros from './BarraFiltros'
import GrillaPrograma from './GrillaPrograma'
import ListaPrograma from './ListaPrograma'
import SinResultados from './SinResultados'
import estilos from './VistaPrograma.module.css'

interface Props {
  filtros: FiltrosPrograma
  interactiva: boolean
}

/** Programa filtrado: barra de filtros, conteo y las dos vistas (lista y grilla). */
export default function VistaPrograma({ filtros, interactiva }: Props) {
  const funciones = filtrarFunciones(todasLasFunciones, filtros)
  const mostrarDias = filtros.dia === null
  const diasVisibles = mostrarDias ? dias : dias.filter((d) => d.slug === filtros.dia)

  const partesConteo = [plural(funciones.length, 'función', 'funciones')]
  if (filtros.dia) partesConteo.push(diaPorSlug.get(filtros.dia)?.etiqueta ?? '')
  if (filtros.seccion) partesConteo.push(seccionPorId.get(filtros.seccion)?.nombre ?? '')

  return (
    <div>
      <BarraFiltros filtros={filtros} interactiva={interactiva} conteo={funciones.length} />
      <p className={`${estilos.conteo} contenedor`} role="status" aria-live="polite">
        {partesConteo.join(' · ')}
      </p>
      {funciones.length === 0 ? (
        <div className="contenedor">
          <SinResultados filtros={filtros} />
        </div>
      ) : (
        <>
          <div className={`${estilos.vistaMovil} contenedor`}>
            <ListaPrograma funciones={funciones} interactiva={interactiva} mostrarDias={mostrarDias} />
          </div>
          <div className={`${estilos.vistaEscritorio} contenedor`}>
            <GrillaPrograma funciones={funciones} diasVisibles={diasVisibles} interactiva={interactiva} />
          </div>
        </>
      )}
    </div>
  )
}
