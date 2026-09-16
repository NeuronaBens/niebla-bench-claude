import GlifoSala from '@/components/marcas/GlifoSala'
import { salas, traslado } from '@/lib/datos'
import estilos from './TablaTraslados.module.css'

export default function TablaTraslados() {
  return (
    <div className={estilos.envoltorio}>
      <table className={estilos.tabla}>
        <caption>Minutos caminando entre salas</caption>
        <thead>
          <tr>
            <th scope="col" />
            {salas.map((sala) => (
              <th key={sala.id} scope="col">
                <span className={estilos.encabezadoSala}>
                  <GlifoSala salaId={sala.id} />
                  <abbr title={sala.nombre}>{sala.nombre.split(' ')[0]}</abbr>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {salas.map((filaSala) => (
            <tr key={filaSala.id}>
              <th scope="row">
                <span className={estilos.filaSala}>
                  <GlifoSala salaId={filaSala.id} />
                  {filaSala.nombre}
                </span>
              </th>
              {salas.map((columnaSala) =>
                filaSala.id === columnaSala.id ? (
                  <td key={columnaSala.id}>—</td>
                ) : (
                  <td key={columnaSala.id}>{traslado(filaSala.id, columnaSala.id)} min</td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
