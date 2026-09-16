import type { AnalisisItinerario } from '@/lib/tipos'
import ParadaItinerario from './ParadaItinerario'
import ResumenDia from './ResumenDia'
import TramoItinerario from './TramoItinerario'
import estilos from './VistaItinerario.module.css'

interface Props {
  analisis: AnalisisItinerario
  modo: 'propio' | 'compartido'
}

/** El itinerario como un recorrido: por día, una parada tras otra con sus tramos. */
export default function VistaItinerario({ analisis, modo }: Props) {
  return (
    <div className={estilos.vista}>
      {analisis.porDia.map(({ dia, funciones, tramos, resumen }) => (
        <section key={dia.fecha} className={estilos.dia} aria-labelledby={`itin-dia-${dia.slug}`}>
          <h2 id={`itin-dia-${dia.slug}`}>{dia.etiqueta}</h2>
          <ResumenDia resumen={resumen} dia={dia} />
          <ol className={estilos.recorrido}>
            {funciones.map((funcion, i) => {
              const estado = analisis.estadoPorId.get(funcion.id)!
              const tramo = tramos[i]
              return (
                <li key={funcion.id}>
                  <ParadaItinerario funcion={funcion} estado={estado} modo={modo} />
                  {tramo && <TramoItinerario tramo={tramo} />}
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}
