'use client'

import { useState } from 'react'
import { useItinerario } from '@/components/itinerario/useItinerario'
import { useHidratado } from '@/components/ui/useHidratado'
import { useAnunciar } from '@/components/ui/Anunciador'
import { Icono } from '@/components/ui/Icono'
import { avisosAlAgregar } from '@/lib/reglas-itinerario'
import { programa } from '@/lib/programa'
import { horaDe } from '@/lib/tiempo'
import { general, itinerarioTextos } from '@/lib/textos'
import type { Funcion } from '@/lib/tipos'
import estilos from './BotonItinerario.module.css'

export function BotonItinerario({ funcion, variante = 'tarjeta' }: { funcion: Funcion; variante?: 'tarjeta' | 'ancho' }) {
  const hidratado = useHidratado()
  const { ids, alternar } = useItinerario()
  const anunciar = useAnunciar()
  const [animando, setAnimando] = useState(false)

  const marcada = ids.includes(funcion.id)
  const hora = horaDe(funcion.inicio)
  const diaCorto = `${funcion.dia.nombre} ${funcion.dia.numero}`

  function manejarClic() {
    if (!marcada) {
      const nuevos = avisosAlAgregar(ids, funcion.id, programa)
      alternar(funcion.id)
      let mensaje = itinerarioTextos.agregado(funcion.pelicula.titulo, funcion.dia.nombre, hora)
      const primero = nuevos[0]
      if (primero && primero.tipo === 'tope') {
        const otroId = primero.a === funcion.id ? primero.b : primero.a
        const otra = programa.funcionPorId(otroId)
        if (otra) mensaje += `. Se topa con ${otra.pelicula.titulo}`
      } else if (primero && primero.tipo === 'noAlcanza') {
        mensaje += '. No alcanzas a llegar a esta función'
      }
      anunciar(mensaje)
    } else {
      alternar(funcion.id)
      anunciar(itinerarioTextos.quitado(funcion.pelicula.titulo))
    }
    setAnimando(true)
    setTimeout(() => setAnimando(false), 260)
  }

  // Nombre accesible fijo (no cambia con el estado) para que aria-pressed no contradiga
  // el nombre que anuncia el lector de pantalla ("Quitar… presionado" sería contradictorio).
  const etiquetaAccesible = itinerarioTextos.iraAAccion(funcion.pelicula.titulo, diaCorto, hora)

  return (
    <button
      type="button"
      className={[
        estilos.boton,
        estilos[variante],
        !hidratado ? estilos.neutro : '',
        marcada ? estilos.marcado : '',
        animando ? estilos.animando : '',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-pressed={hidratado ? marcada : undefined}
      aria-disabled={!hidratado}
      aria-label={etiquetaAccesible}
      onClick={hidratado ? manejarClic : undefined}
    >
      <Icono nombre={marcada ? 'check' : 'mas'} tamano={18} />
      {marcada ? general.voy : general.quieroIr}
    </button>
  )
}
