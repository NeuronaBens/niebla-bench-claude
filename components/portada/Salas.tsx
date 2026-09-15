import { Icono } from '@/components/ui/Icono'
import { programa } from '@/lib/programa'
import { rangoTraslados } from '@/lib/destacados'
import { nombreCortoSala } from '@/lib/formato'
import { portada as textosPortada } from '@/lib/textos'
import estilos from './Salas.module.css'

export function Salas() {
  const rango = rangoTraslados(programa)

  return (
    <div className={estilos.seccion}>
      <h2 className={estilos.titulo}>Dónde es</h2>
      <p className={estilos.subtitulo}>{textosPortada.todoQuedaCerca(rango.min, rango.max)}</p>

      <div className={estilos.lista}>
        {programa.salas.map((sala) => (
          <div key={sala.id} className={estilos.sala}>
            <p className={estilos.nombreSala}>
              {sala.aireLibre ? <Icono nombre="luna" tamano={18} /> : null}
              {sala.nombre}
            </p>
            <p className={estilos.direccion}>{sala.direccion}</p>
            {sala.nota ? <p className={estilos.notaLluvia}>{sala.nota}</p> : null}
          </div>
        ))}
      </div>

      <div className={estilos.tablaEnvoltura}>
        <table className={estilos.tabla}>
          <caption>Minutos caminando entre salas</caption>
          <thead>
            <tr>
              <th scope="col">
                <span className="solo-lectores">Desde / hacia</span>
              </th>
              {programa.salas.map((sala) => (
                <th key={sala.id} scope="col">
                  <abbr title={sala.nombre}>{nombreCortoSala(sala.id)}</abbr>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {programa.salas.map((desde) => (
              <tr key={desde.id}>
                <th scope="row">
                  <abbr title={desde.nombre}>{nombreCortoSala(desde.id)}</abbr>
                </th>
                {programa.salas.map((hasta) => (
                  <td key={hasta.id}>{desde.id === hasta.id ? '—' : programa.traslado(desde.id, hasta.id)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
