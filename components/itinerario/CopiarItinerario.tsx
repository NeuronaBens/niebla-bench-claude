'use client'

import { useRef } from 'react'
import { useItinerario } from './useItinerario.ts'
import { useHidratado } from '@/components/ui/useHidratado'
import { useAnunciar } from '@/components/ui/Anunciador'
import { Boton } from '@/components/ui/Boton'
import { itinerarioTextos } from '@/lib/textos'
import estilos from './CopiarItinerario.module.css'

export function CopiarItinerario({
  idsCompartidos,
  alCopiar,
}: {
  idsCompartidos: string[]
  alCopiar: (mensaje: string) => void
}) {
  const hidratado = useHidratado()
  const { ids: propios, reemplazar, unir } = useItinerario()
  const anunciar = useAnunciar()
  const dialogoRef = useRef<HTMLDialogElement>(null)
  const cancelarRef = useRef<HTMLButtonElement>(null)

  if (!hidratado) return null

  const todasIncluidas = idsCompartidos.every((id) => propios.includes(id))
  const nuevas = idsCompartidos.filter((id) => !propios.includes(id)).length

  function confirmar(mensaje: string) {
    anunciar(mensaje)
    alCopiar(mensaje)
  }

  if (todasIncluidas) {
    return (
      <div className={estilos.envoltura}>
        <p>{itinerarioTextos.yaTienesTodas}</p>
        <Boton as="a" href="/itinerario" variante="secundario">
          {itinerarioTextos.verMiItinerario}
        </Boton>
      </div>
    )
  }

  if (propios.length === 0) {
    return (
      <div className={estilos.envoltura}>
        <Boton
          variante="principal"
          onClick={() => {
            reemplazar(idsCompartidos)
            confirmar(itinerarioTextos.copiado)
          }}
        >
          {itinerarioTextos.copiarAMio}
        </Boton>
      </div>
    )
  }

  return (
    <div className={estilos.envoltura}>
      <p>{itinerarioTextos.nuevasNoEstan(nuevas)}</p>
      <div className={estilos.acciones}>
        <Boton
          variante="principal"
          onClick={() => {
            unir(idsCompartidos)
            confirmar(itinerarioTextos.copiado)
          }}
        >
          {itinerarioTextos.agregarAlMio}
        </Boton>
        <Boton
          variante="secundario"
          onClick={() => {
            dialogoRef.current?.showModal()
            cancelarRef.current?.focus()
          }}
        >
          {itinerarioTextos.reemplazarMio}
        </Boton>
      </div>

      <dialog ref={dialogoRef} className={estilos.dialogo}>
        <p>{itinerarioTextos.reemplazarPregunta(propios.length, idsCompartidos.length)}</p>
        <div className={estilos.dialogoAcciones}>
          <Boton ref={cancelarRef} variante="secundario" onClick={() => dialogoRef.current?.close()}>
            {itinerarioTextos.cancelar}
          </Boton>
          <Boton
            variante="principal"
            onClick={() => {
              reemplazar(idsCompartidos)
              dialogoRef.current?.close()
              confirmar(itinerarioTextos.copiado)
            }}
          >
            {itinerarioTextos.reemplazar}
          </Boton>
        </div>
      </dialog>
    </div>
  )
}
