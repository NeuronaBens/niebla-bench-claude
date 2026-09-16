import { dias, festival } from '@/lib/datos'
import { instagramUrl } from '@/lib/etiquetas'
import { listaHumana, nombreMes, ordinalEdicion, precioTexto } from '@/lib/formato'
import estilos from './Pie.module.css'

export default function Pie() {
  const anio = festival.fechaInicio.slice(0, 4)
  const mes = nombreMes(Number(festival.fechaInicio.slice(5, 7)))
  const numerosDias = dias.map((d) => String(d.numero))

  return (
    <footer className={`${estilos.pie} noImprimir`}>
      <svg className={estilos.ola} viewBox="0 0 400 12" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 6 Q 25 0 50 6 T 100 6 T 150 6 T 200 6 T 250 6 T 300 6 T 350 6 T 400 6" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      <div className={estilos.contenido}>
        <div>
          <p className={estilos.nombre}>
            {festival.nombre} · {ordinalEdicion(festival.edicion)} edición
          </p>
          <p>
            {listaHumana(numerosDias)} de {mes} de {anio}
          </p>
          <p>
            {festival.ciudad}, {festival.region}
          </p>
        </div>
        <div className={estilos.lista}>
          <p>General {precioTexto(festival.entradas.general)} · Al aire libre {precioTexto(festival.entradas.aireLibre)}</p>
          <p>{festival.entradas.venta}</p>
        </div>
        <div className={estilos.lista}>
          <a href={`mailto:${festival.contacto.correo}`}>{festival.contacto.correo}</a>
          <a href={instagramUrl(festival.contacto.instagram)} target="_blank" rel="noopener noreferrer">
            {festival.contacto.instagram}
          </a>
        </div>
      </div>
    </footer>
  )
}
