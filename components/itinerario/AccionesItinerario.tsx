'use client'

import { useState } from 'react'
import { IconoCompartir, IconoCopiar } from '@/components/iconos/Iconos'
import { anunciar } from '@/lib/anuncios'
import { plural } from '@/lib/formato'
import { crearEnlace } from '@/lib/itinerario/enlace'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import estilos from './AccionesItinerario.module.css'

/** Compartir el itinerario y vaciarlo, con confirmación y deshacer (H4.1 CA4, H4.6). */
export default function AccionesItinerario() {
  const { ids, vaciar, reemplazar } = useItinerario()
  const [confirmando, setConfirmando] = useState(false)
  const [linkVisible, setLinkVisible] = useState<string | null>(null)

  if (ids.length === 0) return null

  function obtenerUrl(): string {
    return crearEnlace(ids, window.location.origin)
  }

  async function copiarLink() {
    const url = obtenerUrl()
    try {
      await navigator.clipboard.writeText(url)
      setLinkVisible(null)
      anunciar('Link copiado. Quien lo abra verá tu itinerario.')
    } catch {
      setLinkVisible(url)
    }
  }

  async function compartir() {
    const url = obtenerUrl()
    const esTactil = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches
    if (esTactil && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Mi itinerario · Festival de Cine Niebla', text: 'Mi recorrido por el Festival de Cine Niebla', url })
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
    }
    await copiarLink()
  }

  function iniciarVaciado() {
    setConfirmando(true)
    setTimeout(() => setConfirmando(false), 6000)
  }

  function confirmarVaciado() {
    const previos = vaciar()
    setConfirmando(false)
    anunciar('Vaciaste tu itinerario.', { accion: { etiqueta: 'Deshacer', alHacer: () => reemplazar(previos) } })
  }

  return (
    <div className={`${estilos.acciones} noImprimir`}>
      <div className={estilos.fila}>
        <button type="button" className={estilos.principal} onClick={compartir}>
          <IconoCompartir /> Compartir
        </button>
        <button type="button" className={estilos.secundario} onClick={copiarLink}>
          <IconoCopiar /> Copiar link
        </button>
      </div>
      {linkVisible && (
        <div className={estilos.linkManual}>
          <label htmlFor="link-itinerario">Copia este link:</label>
          <input
            id="link-itinerario"
            readOnly
            value={linkVisible}
            onFocus={(evento) => evento.currentTarget.select()}
          />
        </div>
      )}
      {!confirmando ? (
        <button type="button" className={estilos.vaciar} onClick={iniciarVaciado}>
          Vaciar itinerario
        </button>
      ) : (
        <div className={estilos.confirmar}>
          <p>¿Vaciar las {plural(ids.length, 'función', 'funciones')}?</p>
          <div className={estilos.fila}>
            <button type="button" className={estilos.confirmarSi} onClick={confirmarVaciado}>
              Sí, vaciar
            </button>
            <button type="button" className={estilos.secundario} onClick={() => setConfirmando(false)}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
