'use client'

import { useCallback } from 'react'
import { useAvisos } from '@/components/avisos/ProveedorAvisos'
import { textoFunciones } from '@/lib/formato'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import styles from './ItinerarioPropio.module.css'
import { VistaItinerario } from './VistaItinerario'

// El aviso de "no se puede guardar" (H-4.1) se muestra una sola vez desde
// components/navegacion/NavegacionPrincipal.tsx, que está montado en todas las páginas y
// detecta el fallo sin importar desde dónde se modificó el itinerario.
export function ItinerarioPropio() {
  const { ids, funciones, listo, quitar, reemplazar, vaciar } = useItinerario()
  const { anunciar, mostrarToast } = useAvisos()

  const alQuitar = useCallback(
    (id: string) => {
      const funcion = funciones.find((f) => f.id === id)
      const anterior = quitar(id)
      mostrarToast({
        texto: `Quitaste ${funcion?.pelicula.titulo ?? 'la función'}.`,
        accion: { texto: 'Deshacer', accion: () => reemplazar(anterior) },
      })
      anunciar(`Quitaste ${funcion?.pelicula.titulo ?? 'la función'} de tu itinerario.`)
    },
    [funciones, quitar, reemplazar, mostrarToast, anunciar]
  )

  const alVaciar = useCallback(() => {
    const cantidad = funciones.length
    const anterior = vaciar()
    mostrarToast({
      texto: `Vaciaste tu itinerario (${textoFunciones(cantidad)}).`,
      accion: { texto: 'Deshacer', accion: () => reemplazar(anterior) },
    })
    anunciar(`Vaciaste tu itinerario.`)
  }, [funciones, vaciar, reemplazar, mostrarToast, anunciar])

  if (!listo) {
    return (
      <div className={styles.esqueleto} aria-hidden="true">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className={styles.boletoEsqueleto} />
        ))}
      </div>
    )
  }

  return <VistaItinerario ids={ids} modo="propio" onQuitar={alQuitar} onVaciar={alVaciar} />
}
