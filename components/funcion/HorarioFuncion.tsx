import { fechaDe, horaDe, describirFin } from '@/lib/tiempo'
import type { Funcion } from '@/lib/tipos'
import estilos from './HorarioFuncion.module.css'

export function HorarioFuncion({
  funcion,
  formato = 'compacto',
  pasada = false,
}: {
  funcion: Funcion
  formato?: 'compacto' | 'completo'
  pasada?: boolean
}) {
  const horaInicio = horaDe(funcion.inicio)
  const isoInicio = `${fechaDe(funcion.inicio)}T${horaInicio}`
  const fin = describirFin(funcion)

  return (
    <div className={estilos.horario}>
      {formato === 'completo' ? <span className={estilos.dia}>{funcion.dia.largo}</span> : null}
      <time dateTime={isoInicio} className={`${estilos.inicio} ${pasada ? estilos.pasada : ''}`}>
        {horaInicio}
      </time>
      <span className={estilos.fin}>
        → {fin.hora}
        {fin.sufijo ? ` ${fin.sufijo}` : ''}
      </span>
    </div>
  )
}
