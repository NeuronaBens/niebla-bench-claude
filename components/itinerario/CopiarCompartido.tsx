'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { anunciar } from '@/lib/anuncios'
import { plural } from '@/lib/formato'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import type { FuncionId } from '@/lib/tipos'
import estilos from './CopiarCompartido.module.css'

interface Props {
  ids: FuncionId[]
}

/** "Copiar a mi itinerario": reemplaza, suma, o simplemente confirma que ya lo tiene todo (H4.6 CA4). */
export default function CopiarCompartido({ ids }: Props) {
  const router = useRouter()
  const { listo, ids: propios, reemplazar, sumar } = useItinerario()
  const [panelAbierto, setPanelAbierto] = useState(false)

  if (!listo) {
    return (
      <button type="button" className={`${estilos.principal} ${estilos.contenedorAccion}`} disabled aria-disabled="true">
        Copiar a mi itinerario
      </button>
    )
  }

  const nuevas = ids.filter((id) => !propios.includes(id))

  function copiarDirecto() {
    const previos = [...propios]
    reemplazar(ids)
    anunciar('Listo: ahora es tu itinerario.', { accion: { etiqueta: 'Deshacer', alHacer: () => reemplazar(previos) } })
    router.replace('/itinerario')
  }

  function sumarLasNuevas() {
    const previos = [...propios]
    sumar(nuevas)
    anunciar('Sumaste las funciones nuevas a tu itinerario.', { accion: { etiqueta: 'Deshacer', alHacer: () => reemplazar(previos) } })
    router.replace('/itinerario')
  }

  function reemplazarLasMias() {
    const previos = [...propios]
    reemplazar(ids)
    anunciar('Reemplazaste tu itinerario.', { accion: { etiqueta: 'Deshacer', alHacer: () => reemplazar(previos) } })
    router.replace('/itinerario')
  }

  if (propios.length === 0) {
    return (
      <button type="button" className={`${estilos.principal} ${estilos.contenedorAccion}`} onClick={copiarDirecto}>
        Copiar a mi itinerario
      </button>
    )
  }

  if (nuevas.length === 0) {
    return (
      <div className={estilos.contenedorAccion}>
        <p>Ya tienes todas estas funciones en tu itinerario.</p>
        <button type="button" className={estilos.principal} onClick={() => router.replace('/itinerario')}>
          Ir a mi itinerario
        </button>
      </div>
    )
  }

  if (!panelAbierto) {
    return (
      <button type="button" className={`${estilos.principal} ${estilos.contenedorAccion}`} onClick={() => setPanelAbierto(true)}>
        Copiar a mi itinerario
      </button>
    )
  }

  return (
    <div className={`${estilos.panel} ${estilos.contenedorAccion}`}>
      <p>Ya tienes {plural(propios.length, 'función', 'funciones')} en tu itinerario. ¿Qué hacemos?</p>
      <div className={estilos.fila}>
        <button type="button" className={estilos.principal} onClick={sumarLasNuevas} autoFocus>
          Sumar {plural(nuevas.length, 'nueva', 'nuevas')} a las mías
        </button>
        <button type="button" className={estilos.secundario} onClick={reemplazarLasMias}>
          Reemplazar las mías
        </button>
        <button type="button" className={estilos.secundario} onClick={() => setPanelAbierto(false)}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
