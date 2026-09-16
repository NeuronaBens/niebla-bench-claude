import { dias, funcionesDelDia } from '@/lib/datos'
import { plural } from '@/lib/formato'
import { horaDe } from '@/lib/tiempo'
import estilos from './HorariosPorDia.module.css'

export default function HorariosPorDia() {
  const filas = dias.map((dia) => {
    const funcionesDia = funcionesDelDia(dia.fecha)
    return {
      dia,
      primeraInicioMin: funcionesDia[0].inicioMin,
      ultimaInicioMin: funcionesDia[funcionesDia.length - 1].inicioMin,
      cantidad: funcionesDia.length,
    }
  })

  const [jueves, viernes, sabado] = filas
  const cumpleElPatron =
    jueves && viernes && sabado && jueves.primeraInicioMin % 1440 >= 900 && viernes.primeraInicioMin % 1440 >= 900 && sabado.primeraInicioMin % 1440 < 900

  return (
    <section>
      <h2>Pensado para después de la pega</h2>
      {cumpleElPatron && (
        <p className={estilos.intro}>
          Jueves y viernes el programa parte en la tarde; el sábado arranca al mediodía.
        </p>
      )}
      <div className={estilos.filas}>
        {filas.map((f) => (
          <div key={f.dia.fecha} className={estilos.fila}>
            <span className={estilos.dia}>{f.dia.etiqueta}</span>
            <span className={estilos.detalle}>desde las {horaDe(f.primeraInicioMin)}</span>
            <span className={estilos.detalle}>{plural(f.cantidad, 'función', 'funciones')}</span>
            <span className={estilos.detalle}>última a las {horaDe(f.ultimaInicioMin)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
