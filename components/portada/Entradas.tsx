import { Icono } from '@/components/ui/Icono'
import { programa } from '@/lib/programa'
import { precio } from '@/lib/formato'
import estilos from './Entradas.module.css'

export function Entradas() {
  const { entradas } = programa.festival

  return (
    <div className={estilos.seccion}>
      <h2 className={estilos.titulo}>
        <Icono nombre="entrada" tamano={22} />
        Entradas
      </h2>
      <p className={estilos.linea}>Entrada general {precio(entradas.general)}</p>
      <p className={estilos.linea}>Funciones al aire libre: gratis</p>
      <p className={estilos.venta}>{entradas.venta}</p>
    </div>
  )
}
