import { cifras } from '@/lib/destacados'
import { programa } from '@/lib/programa'
import { portada as textosPortada } from '@/lib/textos'
import estilos from './QueEs.module.css'

export function QueEs() {
  const c = cifras(programa)
  const items = [
    { numero: c.peliculas, etiqueta: 'Películas' },
    { numero: c.funciones, etiqueta: 'Funciones' },
    { numero: c.salas, etiqueta: 'Salas' },
    { numero: c.dias, etiqueta: 'Días' },
  ]

  return (
    <div className={estilos.seccion}>
      <p className={estilos.texto}>{textosPortada.queEs}</p>
      <div className={estilos.cifras}>
        {items.map((item) => (
          <div key={item.etiqueta} className={estilos.cifra}>
            <span className={estilos.numero}>{item.numero}</span>
            <span className={estilos.etiqueta}>{item.etiqueta}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
