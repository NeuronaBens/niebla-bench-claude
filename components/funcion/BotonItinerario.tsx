'use client'

import { useCallback } from 'react'
import { useAvisos } from '@/components/avisos/ProveedorAvisos'
import { calcularAvisos } from '@/lib/itinerario/avisos'
import { textoAvisoDesde } from '@/lib/itinerario/textos'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import { diaPorId, funcionesPorId, traslados } from '@/lib/programa'
import type { Funcion } from '@/lib/tipos'
import styles from './BotonItinerario.module.css'

interface Props {
  funcion: Funcion
  variante?: 'compacto' | 'amplio'
  sobrePapel?: boolean
}

function diaCortoMinuscula(dia: Funcion['dia']): string {
  if (dia === 'jueves') return 'jue'
  if (dia === 'viernes') return 'vie'
  return 'sáb'
}

export function BotonItinerario({ funcion, variante = 'compacto', sobrePapel = false }: Props) {
  const { funciones, listo, estaEn, alternar, reemplazar } = useItinerario()
  const { anunciar, mostrarToast } = useAvisos()
  const marcada = listo && estaEn(funcion.id)
  const dia = diaPorId(funcion.dia)

  const manejarClic = useCallback(() => {
    if (!listo) return

    if (marcada) {
      const anterior = alternar(funcion.id)
      mostrarToast({
        texto: `Quitaste ${funcion.pelicula.titulo} de tu itinerario.`,
        accion: { texto: 'Deshacer', accion: () => reemplazar(anterior) },
      })
      anunciar(`Quitaste ${funcion.pelicula.titulo} de tu itinerario.`)
      return
    }

    const seleccionConNueva = [...funciones, funcion]
    const { avisos } = calcularAvisos(seleccionConNueva, traslados)
    const avisosNuevos = avisos.filter(
      (a) =>
        a.ids.length === 2 &&
        a.ids.includes(funcion.id) &&
        (a.tipo === 'choque' || a.tipo === 'traslado' || a.tipo === 'conversatorio')
    )

    alternar(funcion.id)

    if (avisosNuevos.length > 0) {
      const principal = avisosNuevos.find((a) => a.nivel === 'alerta') ?? avisosNuevos[0]
      const resumen = textoAvisoDesde(principal, funcionesPorId, funcion.id) || `Agregaste ${funcion.pelicula.titulo}.`
      mostrarToast({ texto: resumen })
      anunciar(resumen)
    } else {
      anunciar(`Agregaste ${funcion.pelicula.titulo}, ${diaCortoMinuscula(funcion.dia)} ${funcion.horaInicio}.`)
    }
  }, [listo, marcada, funcion, funciones, alternar, reemplazar, anunciar, mostrarToast])

  const nombreAccesible = `${marcada ? 'Quitar' : 'Agregar'} ${funcion.pelicula.titulo}, ${dia?.nombreLargo} ${dia?.numero} a las ${funcion.horaInicio}, ${marcada ? 'de' : 'a'} mi itinerario`

  return (
    <button
      type="button"
      className={`${styles.boton} ${variante === 'amplio' ? styles.amplio : ''} ${marcada ? styles.marcado : ''} ${!listo ? styles.cargando : ''} ${sobrePapel ? styles.sobrePapel : ''}`}
      onClick={manejarClic}
      aria-pressed={marcada}
      aria-label={nombreAccesible}
      disabled={!listo}
    >
      <span className={styles.icono} aria-hidden="true">
        <svg viewBox="0 0 24 24" width="24" height="24">
          <rect x="3" y="6" width="18" height="12" rx="0" fill={marcada ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" />
          <circle className={styles.perforacion} cx="12" cy="12" r="2.4" fill={marcada ? 'var(--tinta)' : 'none'} />
          <line x1="7.5" y1="6" x2="7.5" y2="18" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" opacity="0.6" />
        </svg>
      </span>
      {variante === 'amplio' && <span className={styles.texto}>{marcada ? 'En mi itinerario' : 'Agregar a mi itinerario'}</span>}
      <span className="visualmente-oculto">{marcada ? 'En tu itinerario' : ''}</span>
    </button>
  )
}
