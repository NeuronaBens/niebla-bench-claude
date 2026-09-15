'use client'

import { ResumenAvisos } from './ResumenAvisos.tsx'
import { DiaItinerario } from './DiaItinerario.tsx'
import type { DiaFestival, Funcion, ResultadoItinerario } from '@/lib/tipos'

export function VistaItinerario({
  resultado,
  modo,
  alQuitar,
}: {
  resultado: ResultadoItinerario
  modo: 'propio' | 'compartido'
  alQuitar?: (id: string) => void
}) {
  const diasConFunciones = new Map<string, { dia: DiaFestival; funciones: Funcion[] }>()
  for (const funcion of resultado.funciones) {
    const actual = diasConFunciones.get(funcion.dia.slug)
    if (actual) {
      actual.funciones.push(funcion)
    } else {
      diasConFunciones.set(funcion.dia.slug, { dia: funcion.dia, funciones: [funcion] })
    }
  }

  const avisosLluvia = resultado.avisos.filter((a) => a.tipo === 'lluvia')

  return (
    <div>
      <ResumenAvisos resultado={resultado} modo={modo} />
      {[...diasConFunciones.values()].map(({ dia, funciones }) => (
        <DiaItinerario
          key={dia.slug}
          dia={dia}
          funciones={funciones}
          tramos={resultado.tramos}
          avisosPorFuncion={resultado.avisosPorFuncion}
          avisosLluvia={avisosLluvia}
          modo={modo}
          alQuitar={alQuitar}
        />
      ))}
    </div>
  )
}
