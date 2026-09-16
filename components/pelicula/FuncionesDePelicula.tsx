import { funcionesDePelicula } from '@/lib/datos'
import FilaFuncionFicha from './FilaFuncionFicha'
import estilos from './FuncionesDePelicula.module.css'

interface Props {
  peliculaId: string
}

export default function FuncionesDePelicula({ peliculaId }: Props) {
  const funciones = funcionesDePelicula(peliculaId)
  return (
    <section>
      <h2>Funciones</h2>
      <ol className={estilos.lista}>
        {funciones.map((f) => (
          <FilaFuncionFicha key={f.id} funcion={f} />
        ))}
      </ol>
    </section>
  )
}
