'use client'

import { useMemo, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Boton } from '@/components/ui/Boton'
import { Toast } from '@/components/ui/Toast'
import { VistaItinerario } from './VistaItinerario.tsx'
import { CopiarItinerario } from './CopiarItinerario.tsx'
import { programa } from '@/lib/programa'
import { decodificarEnlace } from '@/lib/enlace-itinerario'
import { evaluarItinerario } from '@/lib/reglas-itinerario'
import { itinerarioTextos, general } from '@/lib/textos'
import estilos from './ItinerarioCompartido.module.css'

export function ItinerarioCompartido() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const decodificado = useMemo(() => decodificarEnlace(searchParams as unknown as URLSearchParams, programa), [searchParams])
  const resultado = useMemo(() => evaluarItinerario(decodificado.ids, programa, { lluvia: true }), [decodificado.ids])
  const [copiado, setCopiado] = useState(false)

  if (decodificado.malFormado) {
    return (
      <div className={estilos.roto}>
        <h1 className={estilos.rotoTitulo}>{itinerarioTextos.linkRotoTitulo}</h1>
        <p>{itinerarioTextos.linkRotoTexto}</p>
        <div className={estilos.rotoAcciones}>
          <Boton as="a" href="/programa" variante="principal">
            {general.verPrograma}
          </Boton>
          <Boton as="a" href="/itinerario" variante="secundario">
            {itinerarioTextos.verMiItinerario}
          </Boton>
        </div>
      </div>
    )
  }

  const titulo = decodificado.nombre
    ? itinerarioTextos.itinerarioDeTitulo(decodificado.nombre)
    : itinerarioTextos.itinerarioCompartidoTitulo

  return (
    <div>
      <div className={estilos.cabecera} data-zona="noche">
        <h1 className={estilos.titulo}>{titulo}</h1>
        <p className={estilos.texto}>{itinerarioTextos.itinerarioCompartidoTexto}</p>
      </div>
      <CopiarItinerario idsCompartidos={decodificado.ids} alCopiar={() => setCopiado(true)} />
      {decodificado.invalidos > 0 ? (
        <p className={estilos.avisoInvalidos}>{itinerarioTextos.algunasInvalidas(decodificado.invalidos)}</p>
      ) : null}
      <VistaItinerario resultado={resultado} modo="compartido" />
      <CopiarItinerario idsCompartidos={decodificado.ids} alCopiar={() => setCopiado(true)} />

      {copiado ? (
        <Toast
          mensaje={itinerarioTextos.copiado}
          accion={{ texto: itinerarioTextos.ver, alHacer: () => router.push('/itinerario') }}
          alCerrar={() => setCopiado(false)}
        />
      ) : null}
    </div>
  )
}
