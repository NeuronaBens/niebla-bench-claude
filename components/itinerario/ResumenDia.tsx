import { plural } from '@/lib/formato'
import { etiquetaFinLarga, horaDe } from '@/lib/tiempo'
import type { DiaFestival, ResumenDia as ResumenDiaTipo } from '@/lib/tipos'
import estilos from './ResumenDia.module.css'

interface Props {
  resumen: ResumenDiaTipo
  dia: DiaFestival
}

export default function ResumenDia({ resumen, dia }: Props) {
  return (
    <p className={estilos.resumen}>
      {plural(resumen.cantidad, 'función', 'funciones')} · de {horaDe(resumen.primeraInicioMin)} a{' '}
      {etiquetaFinLarga(resumen.ultimaFinMin, dia)}
    </p>
  )
}
