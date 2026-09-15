'use client'

import { useEffect, useState } from 'react'
import { Boton } from '@/components/ui/Boton'
import { Icono } from '@/components/ui/Icono'
import { useAnunciar } from '@/components/ui/Anunciador'
import { Toast } from '@/components/ui/Toast'
import { codificarEnlace } from '@/lib/enlace-itinerario'
import { itinerarioTextos } from '@/lib/textos'
import estilos from './CompartirItinerario.module.css'

export function CompartirItinerario({ ids }: { ids: string[] }) {
  const anunciar = useAnunciar()
  const [nombre, setNombre] = useState('')
  const [mostrarCopiado, setMostrarCopiado] = useState(false)
  const [mostrarRespaldo, setMostrarRespaldo] = useState(false)
  const [urlRespaldo, setUrlRespaldo] = useState('')

  useEffect(() => {
    try {
      const guardado = localStorage.getItem('niebla:nombre')
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sincroniza con localStorage, solo tras montar
      if (guardado) setNombre(guardado)
    } catch {
      // Se ignora.
    }
  }, [])

  function guardarNombre(valor: string) {
    setNombre(valor)
    try {
      localStorage.setItem('niebla:nombre', valor)
    } catch {
      // Se ignora.
    }
  }

  function urlCompleta(): string {
    return window.location.origin + codificarEnlace(ids, nombre)
  }

  async function copiar(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setMostrarCopiado(true)
      anunciar(itinerarioTextos.linkCopiado)
    } catch {
      setUrlRespaldo(url)
      setMostrarRespaldo(true)
    }
  }

  async function compartir() {
    const url = urlCompleta()
    const datosCompartir = {
      title: 'Mi itinerario · Festival de Cine Niebla',
      text: 'Estas son las funciones a las que voy en el Festival de Cine Niebla:',
      url,
    }
    if (typeof navigator !== 'undefined' && navigator.share && (!navigator.canShare || navigator.canShare(datosCompartir))) {
      try {
        await navigator.share(datosCompartir)
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return
      }
    }
    await copiar(url)
  }

  if (ids.length === 0) {
    return <p className={estilos.ayuda}>{itinerarioTextos.compartirDeshabilitado}</p>
  }

  return (
    <div className={estilos.envoltura}>
      <div className={estilos.campo}>
        <label htmlFor="nombre-itinerario">{itinerarioTextos.tuNombre}</label>
        <input
          id="nombre-itinerario"
          type="text"
          maxLength={40}
          placeholder={itinerarioTextos.tuNombreEjemplo}
          value={nombre}
          onChange={(e) => guardarNombre(e.target.value)}
        />
      </div>
      <div className={estilos.acciones}>
        <Boton variante="principal" onClick={compartir}>
          <Icono nombre="compartir" tamano={18} />
          {itinerarioTextos.compartir}
        </Boton>
        <Boton variante="secundario" onClick={() => copiar(urlCompleta())}>
          <Icono nombre="copiar" tamano={18} />
          {itinerarioTextos.copiarLink}
        </Boton>
      </div>
      {mostrarRespaldo ? (
        <div className={estilos.respaldo}>
          <input readOnly value={urlRespaldo} onFocus={(e) => e.currentTarget.select()} aria-label="Link para copiar" />
        </div>
      ) : null}
      {mostrarCopiado ? <Toast mensaje={itinerarioTextos.linkCopiado} alCerrar={() => setMostrarCopiado(false)} duracionMs={3000} /> : null}
    </div>
  )
}
