'use client'

import { useRef, useState } from 'react'
import { useAvisos } from '@/components/avisos/ProveedorAvisos'
import { textoFunciones } from '@/lib/formato'
import { urlItinerarioCompartido } from '@/lib/itinerario/compartir'
import styles from './BotonCompartir.module.css'

interface Props {
  ids: string[]
}

export function BotonCompartir({ ids }: Props) {
  const { mostrarToast } = useAvisos()
  const [urlVisible, setUrlVisible] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  if (ids.length === 0) return null

  async function compartir() {
    const url = urlItinerarioCompartido(ids)
    const texto = `Mi itinerario en el Festival de Cine Niebla: ${textoFunciones(ids.length)}.`

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Mi itinerario en el Festival de Cine Niebla', text: texto, url })
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
      return
    }

    try {
      await navigator.clipboard.writeText(url)
      mostrarToast({ texto: 'Link copiado.' })
    } catch {
      setUrlVisible(url)
      window.setTimeout(() => {
        inputRef.current?.select()
      }, 0)
    }
  }

  return (
    <div className={styles.contenedor}>
      <button type="button" className={styles.boton} onClick={compartir}>
        Compartir
      </button>
      {urlVisible && (
        <div className={styles.campoWrap}>
          <label className={styles.etiqueta} htmlFor="campo-link-compartido">
            Copia este link
          </label>
          <input id="campo-link-compartido" ref={inputRef} className={styles.campo} readOnly value={urlVisible} onFocus={(e) => e.currentTarget.select()} />
        </div>
      )}
    </div>
  )
}
