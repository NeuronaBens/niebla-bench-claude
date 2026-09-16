import { IconoCaminar, IconoChoque, IconoConversatorio } from '@/components/iconos/Iconos'
import * as mensajes from '@/lib/itinerario/mensajes'
import type { Tramo } from '@/lib/tipos'
import estilos from './TramoItinerario.module.css'

interface Props {
  tramo: Tramo
}

/** El tramo entre dos paradas consecutivas: qué avisa, o cuánto tiempo hay para caminar. */
export default function TramoItinerario({ tramo }: Props) {
  if (!tramo.mismoDia && tramo.estado === 'holgura') return null

  let texto: string
  let Icono = IconoCaminar
  if (tramo.estado === 'choque') {
    texto = mensajes.textoChoqueEnTramo(tramo.desde, tramo.hacia)
    Icono = IconoChoque
  } else if (tramo.estado === 'traslado') {
    texto = mensajes.textoTramoTraslado(tramo.hacia, tramo)
  } else if (tramo.estado === 'conversatorio') {
    texto = mensajes.textoTramoConversatorio(tramo.hacia, tramo)
    Icono = IconoConversatorio
  } else {
    texto = mensajes.textoHolgura(tramo.desde, tramo.hacia, tramo)
  }

  return (
    <div className={`${estilos.tramo} ${estilos[tramo.estado]}`}>
      <span className={estilos.riel} aria-hidden="true" />
      <p className={estilos.texto}>
        <Icono aria-hidden="true" />
        <span>{texto}</span>
      </p>
    </div>
  )
}
