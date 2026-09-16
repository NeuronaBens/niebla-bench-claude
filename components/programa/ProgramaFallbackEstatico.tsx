'use client'

// Fallback del `Suspense` que envuelve a `ProgramaInteractivo` (que usa `useSearchParams`).
// Se sirve tal cual en el HTML inicial (sin filtrar, "Todos" activo): así la barra de filtros
// ya está ahí desde el primer momento y la lista no salta hacia abajo cuando la hidratación
// termina y `ProgramaInteractivo` la reemplaza. Es un componente de cliente solo porque
// `FiltrosPrograma` espera funciones como props (no serializables desde un componente de
// servidor); no depende de ningún estado del navegador ni de JavaScript para su HTML inicial.
import { FiltrosPrograma } from './FiltrosPrograma'
import { ListaFunciones } from './ListaFunciones'
import estilosInteractivo from './ProgramaInteractivo.module.css'
import { funciones } from '@/lib/programa'
import type { Filtros } from './filtros'

const SIN_FILTROS: Filtros = { dia: null, secciones: [] }

function sinAccion() {}

export function ProgramaFallbackEstatico() {
  return (
    <div className={estilosInteractivo.disposicion}>
      <FiltrosPrograma
        filtros={SIN_FILTROS}
        cantidad={funciones.length}
        onCambiarDia={sinAccion}
        onAlternarSeccion={sinAccion}
        onLimpiarSecciones={sinAccion}
      />
      <div className={estilosInteractivo.lista}>
        <ListaFunciones funciones={funciones} instancia="programa-estatico" />
      </div>
    </div>
  )
}
