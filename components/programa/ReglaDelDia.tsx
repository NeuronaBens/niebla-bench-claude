import type { Funcion } from '@/lib/tipos'
import estilos from './ReglaDelDia.module.css'

interface Props {
  funcion: Funcion
}

/**
 * Barra de 6px que ubica la función en el eje horario del día. Todas las
 * tarjetas del mismo día comparten el mismo eje, así que las funciones
 * simultáneas se ven con segmentos solapados al recorrer la lista.
 */
export default function ReglaDelDia({ funcion }: Props) {
  const { dia } = funcion
  const rango = dia.ejeFinMin - dia.ejeInicioMin
  if (rango <= 0) return null

  const desde = ((funcion.inicioMin - dia.ejeInicioMin) / rango) * 100
  const ancho = ((funcion.finMin - funcion.inicioMin) / rango) * 100
  const tieneConversatorio = funcion.conversatorioMin != null
  const desdeConv = ((funcion.finMin - dia.ejeInicioMin) / rango) * 100
  const anchoConv = tieneConversatorio ? ((funcion.conversatorioMin as number) / rango) * 100 : 0

  const ticks: number[] = []
  const primerTick = Math.ceil(dia.ejeInicioMin / 120) * 120
  for (let m = primerTick; m <= dia.ejeFinMin; m += 120) {
    ticks.push(((m - dia.ejeInicioMin) / rango) * 100)
  }
  const medianoche = Math.ceil((dia.ejeInicioMin + 1) / 1440) * 1440
  const posMedianoche = medianoche <= dia.ejeFinMin ? ((medianoche - dia.ejeInicioMin) / rango) * 100 : null

  return (
    <div className={estilos.regla} aria-hidden="true">
      {ticks.map((pos, i) => (
        <span key={i} className={estilos.tick} style={{ left: `${pos}%` }} />
      ))}
      {posMedianoche !== null && <span className={estilos.tickMedianoche} style={{ left: `${posMedianoche}%` }} />}
      <span className={estilos.segmento} style={{ left: `${desde}%`, width: `${Math.max(ancho, 0.6)}%` }} />
      {tieneConversatorio && (
        <span className={estilos.conversatorio} style={{ left: `${desdeConv}%`, width: `${anchoConv}%` }} />
      )}
    </div>
  )
}
