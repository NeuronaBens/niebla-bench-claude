import { programa } from '@/lib/programa'
import { precio, instagramUrl } from '@/lib/formato'
import estilos from './Pie.module.css'

export function Pie() {
  const { festival } = programa
  return (
    <footer className={estilos.pie} data-zona="noche">
      <div className={`contenedor ${estilos.contenido}`}>
        <p className={estilos.marca}>Festival de Cine Niebla</p>
        <p>
          {festival.nombre} · {festival.edicion}ª edición · {festival.ciudad}, {festival.region}
        </p>
        <p className={estilos.linea}>
          <a href={`mailto:${festival.contacto.correo}`}>{festival.contacto.correo}</a>
          <a href={instagramUrl(festival.contacto.instagram)} rel="noopener noreferrer">
            {festival.contacto.instagram}
          </a>
        </p>
        <p className={estilos.linea}>
          Entrada general {precio(festival.entradas.general)} · Al aire libre gratis · {festival.entradas.venta}
        </p>
        <p className={estilos.lema}>Hecho en la costa, con fondos concursables y mucha ayuda de voluntarios.</p>
      </div>
    </footer>
  )
}
