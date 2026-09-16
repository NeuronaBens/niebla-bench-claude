'use client'

import { IconoAgregar, IconoMarcada } from '@/components/iconos/Iconos'
import { anunciar } from '@/lib/anuncios'
import { funcionPorId } from '@/lib/datos'
import { evaluarCandidata } from '@/lib/itinerario/reglas'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import { horaDe } from '@/lib/tiempo'
import type { FuncionId } from '@/lib/tipos'
import estilos from './BotonItinerario.module.css'

interface Props {
  funcionId: FuncionId
  variante: 'completo' | 'compacto'
}

/** Marca o quita una función del itinerario, con respuesta inmediata (H4.1, H4.7). */
export default function BotonItinerario({ funcionId, variante }: Props) {
  const { listo, ids, alternar } = useItinerario()
  const funcion = funcionPorId.get(funcionId)
  if (!funcion) return null

  const tiene = listo && ids.includes(funcionId)
  const estado: 'pendiente' | 'dentro' | 'fuera' = !listo ? 'pendiente' : tiene ? 'dentro' : 'fuera'
  const diaHora = `${funcion.dia.etiqueta} a las ${horaDe(funcion.inicioMin)}`

  function manejarClic() {
    if (!listo || !funcion) return
    if (tiene) {
      alternar(funcionId)
      anunciar(`Quitaste ${funcion.pelicula.titulo}.`, {
        accion: { etiqueta: 'Deshacer', alHacer: () => alternar(funcionId) },
      })
      return
    }
    const avisos = evaluarCandidata(ids, funcionId)
    alternar(funcionId)
    const sufijo = avisos.length > 0 ? ` ${avisos[0].texto}` : ''
    anunciar(`Agregaste ${funcion.pelicula.titulo}, ${diaHora}.${sufijo}`)
  }

  const etiquetaAccion =
    estado === 'dentro'
      ? `Quitar ${funcion.pelicula.titulo}, ${diaHora}, de mi itinerario`
      : `Agregar ${funcion.pelicula.titulo}, ${diaHora}, a mi itinerario`

  const texto = estado === 'pendiente' ? 'Itinerario' : estado === 'dentro' ? 'En mi itinerario' : 'Agregar'

  return (
    <button
      type="button"
      className={`${estilos.boton} ${estilos[variante]} ${estilos[estado]}`}
      aria-pressed={estado === 'dentro'}
      aria-disabled={estado === 'pendiente' ? true : undefined}
      aria-label={estado === 'pendiente' ? undefined : etiquetaAccion}
      onClick={estado === 'pendiente' ? undefined : manejarClic}
    >
      {estado === 'dentro' ? <IconoMarcada /> : <IconoAgregar />}
      <span>{texto}</span>
    </button>
  )
}
