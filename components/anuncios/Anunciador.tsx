'use client'

import { useEffect, useRef, useState } from 'react'
import { IconoQuitar } from '@/components/iconos/Iconos'
import { suscribirAnuncios, type Anuncio } from '@/lib/anuncios'
import estilos from './Anunciador.module.css'

/**
 * Montado una vez en el layout. Mantiene una región `aria-live="polite"`
 * visualmente oculta (para lectores de pantalla) y, aparte, una notificación
 * visible con acción opcional. Un anuncio nuevo reemplaza al anterior.
 */
export default function Anunciador() {
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null)
  const [textoLive, setTextoLive] = useState('')
  const temporizadorRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pausadoRef = useRef(false)

  useEffect(() => {
    function reprogramar(duracionMs: number) {
      if (temporizadorRef.current) clearTimeout(temporizadorRef.current)
      if (pausadoRef.current) return
      temporizadorRef.current = setTimeout(() => setAnuncio(null), duracionMs)
    }
    return suscribirAnuncios((nuevo) => {
      setAnuncio(nuevo)
      // Para que se pueda repetir el mismo texto, se vacía y se reescribe en
      // el siguiente cuadro.
      setTextoLive('')
      requestAnimationFrame(() => setTextoLive(nuevo.texto))
      reprogramar(nuevo.duracionMs)
    })
  }, [])

  function pausar() {
    pausadoRef.current = true
    if (temporizadorRef.current) clearTimeout(temporizadorRef.current)
  }

  function reanudar() {
    pausadoRef.current = false
    if (!anuncio) return
    temporizadorRef.current = setTimeout(() => setAnuncio(null), anuncio.duracionMs)
  }

  return (
    <>
      <p role="status" aria-live="polite" className="soloLector">
        {textoLive}
      </p>
      {anuncio && (
        <div className={`${estilos.notificacion} noImprimir`} onMouseEnter={pausar} onMouseLeave={reanudar} onFocus={pausar} onBlur={reanudar}>
          <p className={estilos.texto}>{anuncio.texto}</p>
          {anuncio.accion && (
            <button
              type="button"
              className={estilos.accion}
              onClick={() => {
                anuncio.accion?.alHacer()
                setAnuncio(null)
              }}
            >
              {anuncio.accion.etiqueta}
            </button>
          )}
          <button type="button" className={estilos.cerrar} aria-label="Cerrar aviso" onClick={() => setAnuncio(null)}>
            <IconoQuitar />
          </button>
        </div>
      )}
    </>
  )
}
