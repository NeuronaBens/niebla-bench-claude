'use client'

import { useMemo } from 'react'
import { IconoCaminar, IconoChoque, IconoConversatorio, IconoNota } from '@/components/iconos/Iconos'
import { evaluarCandidata } from '@/lib/itinerario/reglas'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import type { AvisoCandidata, FuncionId } from '@/lib/tipos'
import estilos from './PistaFuncion.module.css'

interface Props {
  funcionId: FuncionId
}

const ICONOS: Record<AvisoCandidata['tipo'], typeof IconoChoque> = {
  choque: IconoChoque,
  traslado: IconoCaminar,
  conversatorio: IconoConversatorio,
  mismaPelicula: IconoNota,
}

/**
 * Pista breve bajo el botón de itinerario: el aviso más relevante (choque >
 * traslado > conversatorio > misma película), tanto antes de marcar como
 * para funciones ya marcadas (H4.2 CA6, H4.7 CA2).
 */
export default function PistaFuncion({ funcionId }: Props) {
  const { listo, ids } = useItinerario()
  const avisos = useMemo(
    () => (listo && ids.length > 0 ? evaluarCandidata(ids, funcionId) : []),
    [listo, ids, funcionId]
  )

  if (avisos.length === 0) return null

  const [primero, ...resto] = avisos
  const Icono = ICONOS[primero.tipo]
  const listaCompleta = avisos.map((a) => a.texto).join(' ')

  return (
    <p className={`${estilos.pista} ${estilos[primero.tipo]}`} title={resto.length > 0 ? listaCompleta : undefined}>
      <Icono />
      <span>
        {primero.texto}
        {resto.length > 0 && <span className={estilos.mas}> y {resto.length} más</span>}
      </span>
      {resto.length > 0 && <span className="soloLector">{listaCompleta}</span>}
    </p>
  )
}
