import { Icono } from '@/components/ui/Icono'
import { Etiqueta } from '@/components/ui/Etiqueta'
import { horaDe, describirFin } from '@/lib/tiempo'
import { nombreCortoSala } from '@/lib/formato'
import { avisos as textosAvisos } from '@/lib/textos'
import type { Aviso, Funcion, Tramo as TramoTipo } from '@/lib/tipos'
import estilos from './Tramo.module.css'

function horaConSufijo(funcion: Funcion): string {
  const fin = describirFin(funcion)
  return fin.sufijo ? `${fin.hora} ${fin.sufijo}` : fin.hora
}

export function Tramo({
  tramo,
  desde,
  hasta,
  avisoLluvia,
}: {
  tramo: TramoTipo
  desde: Funcion
  hasta: Funcion
  avisoLluvia?: Aviso
}) {
  const aviso = tramo.aviso

  let contenido: React.ReactNode
  let claseLinea = ''

  if (aviso?.tipo === 'tope') {
    claseLinea = estilos.lineaProblema
    contenido = (
      <>
        <p className={`${estilos.texto} ${estilos.problema}`}>
          <Icono nombre="tope" tamano={16} />
          <Etiqueta tono="tope">{textosAvisos.seTopan}</Etiqueta>
        </p>
        <p className={`${estilos.detalle} ${estilos.problema}`}>
          {textosAvisos.tope(hasta.pelicula.titulo, horaDe(hasta.inicio), desde.pelicula.titulo, horaConSufijo(desde), aviso.solapeMin)}
        </p>
      </>
    )
  } else if (aviso?.tipo === 'noAlcanza') {
    claseLinea = estilos.lineaProblema
    contenido = (
      <>
        <p className={`${estilos.texto} ${estilos.avisoNoAlcanza}`}>
          <Icono nombre="pasos" tamano={16} />
          <Etiqueta tono="noAlcanza">{textosAvisos.noAlcanzasEtiqueta}</Etiqueta>
        </p>
        <p className={`${estilos.detalle} ${estilos.avisoNoAlcanza}`}>
          {textosAvisos.noAlcanza(
            horaConSufijo(desde),
            nombreCortoSala(desde.sala.id),
            horaDe(hasta.inicio),
            nombreCortoSala(hasta.sala.id),
            aviso.margenMin,
            aviso.trasladoMin
          )}
        </p>
      </>
    )
  } else if (aviso?.tipo === 'conversatorio') {
    claseLinea = estilos.lineaConversatorio
    const salidaTexto = horaDe(aviso.salidaMax)
    contenido = (
      <>
        <p className={`${estilos.texto} ${estilos.avisoConversatorio}`}>
          <Icono nombre="conversatorio" tamano={16} />
          <Etiqueta tono="conversatorio">{textosAvisos.conversatorioEtiqueta}</Etiqueta>
        </p>
        <p className={`${estilos.detalle} ${estilos.avisoConversatorio}`}>
          {aviso.minutosDeConversatorio > 0
            ? textosAvisos.conversatorioConMargen(desde.pelicula.titulo, aviso.conversatorioMin, salidaTexto, aviso.minutosDeConversatorio)
            : textosAvisos.conversatorio(desde.pelicula.titulo, aviso.conversatorioMin, salidaTexto)}
        </p>
      </>
    )
  } else if (tramo.mismaSala) {
    contenido = <p className={estilos.texto}><Icono nombre="pasos" tamano={16} />{textosAvisos.sinAvisoMismaSala(tramo.margenMin)}</p>
  } else {
    contenido = (
      <p className={estilos.texto}>
        <Icono nombre="pasos" tamano={16} />
        {textosAvisos.sinAvisoOtraSala(tramo.trasladoMin, tramo.margenMin)}
      </p>
    )
  }

  return (
    <div className={estilos.tramo} id={`aviso-${tramo.a}-${tramo.b}`}>
      <div className={`${estilos.linea} ${claseLinea}`} aria-hidden="true" />
      {contenido}
      {avisoLluvia && avisoLluvia.tipo === 'lluvia' ? (
        <p className={estilos.detalleLluvia}>
          <Icono nombre="lluvia" tamano={16} />
          {avisoLluvia.alcanzaConLluvia
            ? textosAvisos.lluviaIgualAlcanzas(avisoLluvia.trasladoConLluvia)
            : textosAvisos.lluviaNoAlcanzarias(avisoLluvia.trasladoConLluvia)}
        </p>
      ) : null}
    </div>
  )
}
