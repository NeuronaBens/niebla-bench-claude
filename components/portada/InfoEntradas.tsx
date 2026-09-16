import { festival } from '@/lib/datos'
import { precioTexto } from '@/lib/formato'
import estilos from './InfoEntradas.module.css'

export default function InfoEntradas() {
  return (
    <section>
      <h2>Entradas</h2>
      <div className={estilos.boletos}>
        <div className={estilos.boleto}>
          <p className={estilos.precio}>{precioTexto(festival.entradas.general)}</p>
          <p>General</p>
        </div>
        <div className={estilos.boleto}>
          <p className={estilos.precio}>{precioTexto(festival.entradas.aireLibre)}</p>
          <p>Al aire libre</p>
        </div>
      </div>
      <p className={estilos.venta}>{festival.entradas.venta}</p>
      <p className={estilos.aclaracion}>El sitio no vende ni reserva entradas.</p>
    </section>
  )
}
