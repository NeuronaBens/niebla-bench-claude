import { totalDias, totalPeliculas, totalSalas } from '@/lib/datos'
import { plural } from '@/lib/formato'
import estilos from './CifrasFestival.module.css'

export default function CifrasFestival() {
  const cifras = [
    { numero: totalPeliculas, rotulo: plural(totalPeliculas, 'película', 'películas') },
    { numero: totalSalas, rotulo: plural(totalSalas, 'sala', 'salas') },
    { numero: totalDias, rotulo: plural(totalDias, 'día', 'días') },
  ]

  return (
    <div className={estilos.cifras}>
      {cifras.map((c) => (
        <div key={c.rotulo} className={estilos.cifra}>
          <span className={`horaGrande ${estilos.numero}`}>{c.numero}</span>
          <span className={`rotulo ${estilos.rotulo}`}>{c.rotulo}</span>
        </div>
      ))}
    </div>
  )
}
