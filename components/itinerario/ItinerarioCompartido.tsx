'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo } from 'react'
import { useAvisos } from '@/components/avisos/ProveedorAvisos'
import { textoFunciones } from '@/lib/formato'
import { decodificarItinerario } from '@/lib/itinerario/compartir'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import styles from './ItinerarioCompartido.module.css'
import { VistaItinerario } from './VistaItinerario'

export function ItinerarioCompartido() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { ids: idsPropios, listo, sumar, reemplazar } = useItinerario()
  const { anunciar, mostrarToast } = useAvisos()

  const { validos, cantidadInvalidos } = useMemo(
    () => decodificarItinerario(searchParams.get('f')),
    [searchParams]
  )

  const todasYaEstan = listo && validos.length > 0 && validos.every((id) => idsPropios.includes(id))
  const propioVacio = listo && idsPropios.length === 0

  const irAMiItinerario = useCallback(() => router.push('/itinerario'), [router])

  const alSumar = useCallback(() => {
    const nuevas = validos.filter((id) => !idsPropios.includes(id)).length
    sumar(validos)
    mostrarToast({
      texto: `Listo, copiamos ${textoFunciones(nuevas)} a tu itinerario.`,
      accion: { texto: 'Ver mi itinerario', accion: irAMiItinerario },
    })
    anunciar(`Copiamos ${textoFunciones(nuevas)} a tu itinerario.`)
  }, [validos, idsPropios, sumar, mostrarToast, anunciar, irAMiItinerario])

  const alReemplazar = useCallback(() => {
    const anterior = reemplazar(validos)
    mostrarToast({
      texto: `Listo, copiamos ${textoFunciones(validos.length)} a tu itinerario.`,
      accion: { texto: 'Deshacer', accion: () => reemplazar(anterior) },
    })
    anunciar(`Reemplazaste tu itinerario con ${textoFunciones(validos.length)}.`)
  }, [validos, reemplazar, mostrarToast, anunciar])

  if (validos.length === 0) {
    return (
      <div className={styles.vacio}>
        <p>Este link no trae funciones.</p>
        <Link href="/programa" className={styles.botonVacio}>
          Ver el programa
        </Link>
      </div>
    )
  }

  return (
    <div>
      {cantidadInvalidos > 0 && (
        <p className={styles.avisoInvalidos}>Algunas funciones del link ya no están en el programa.</p>
      )}

      <VistaItinerario ids={validos} modo="compartido" idsPropios={idsPropios} />

      {listo && (
        <div className={styles.acciones}>
          {propioVacio ? (
            <button type="button" className={styles.botonPrimario} onClick={alReemplazar}>
              Copiar a mi itinerario
            </button>
          ) : todasYaEstan ? (
            <p className={styles.todasEstan}>
              Ya tienes todas estas funciones. <Link href="/itinerario">Ir a Mi itinerario</Link>
            </p>
          ) : (
            <>
              <button type="button" className={styles.botonPrimario} onClick={alSumar}>
                Sumar al mío
              </button>
              <button type="button" className={styles.botonSecundario} onClick={alReemplazar}>
                Reemplazar el mío
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
