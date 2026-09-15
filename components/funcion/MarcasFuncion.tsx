import { programa } from '@/lib/programa'
import { horaDe } from '@/lib/tiempo'
import { nombreCortoSala } from '@/lib/formato'
import type { Aviso, Funcion } from '@/lib/tipos'
import { Etiqueta } from '@/components/ui/Etiqueta'
import { Icono } from '@/components/ui/Icono'
import { avisos as textosAvisos, marcas as textosMarcas } from '@/lib/textos'
import estilos from './MarcasFuncion.module.css'

function textoAvisoPrevio(aviso: Aviso, funcion: Funcion): string | null {
  if (aviso.tipo !== 'tope' && aviso.tipo !== 'noAlcanza' && aviso.tipo !== 'conversatorio') return null
  const otroId = aviso.a === funcion.id ? aviso.b : aviso.a
  const otra = programa.funcionPorId(otroId)
  if (!otra) return null
  if (aviso.tipo === 'tope') {
    return textosAvisos.topeTarjeta(otra.pelicula.titulo, horaDe(otra.inicio), nombreCortoSala(otra.sala.id))
  }
  if (aviso.tipo === 'conversatorio') {
    // El aviso es de la función de origen (la que tiene el conversatorio): solo se muestra ahí.
    if (funcion.id !== aviso.a) return null
    return textosAvisos.conversatorioTarjeta(otra.pelicula.titulo)
  }
  return funcion.id === aviso.a
    ? textosAvisos.noAlcanzaHasta(otra.pelicula.titulo)
    : textosAvisos.noAlcanzaDesde(otra.pelicula.titulo)
}

function claseTono(tipo: Aviso['tipo']) {
  if (tipo === 'tope') return estilos.previoTope
  if (tipo === 'conversatorio') return estilos.previoConversatorio
  return estilos.previoNoAlcanza
}

function iconoTono(tipo: Aviso['tipo']) {
  if (tipo === 'tope') return 'tope' as const
  if (tipo === 'conversatorio') return 'conversatorio' as const
  return 'pasos' as const
}

export function MarcasFuncion({ funcion, avisosPrevios }: { funcion: Funcion; avisosPrevios?: Aviso[] }) {
  const previos = (avisosPrevios ?? []).filter(
    (a) => a.tipo === 'tope' || a.tipo === 'noAlcanza' || (a.tipo === 'conversatorio' && a.a === funcion.id)
  )
  const mostrados = previos.slice(0, 2)
  const restantes = previos.length - mostrados.length

  return (
    <div className={estilos.marcas}>
      <div className={estilos.fila} style={{ gap: 6, flexWrap: 'wrap' }}>
        {funcion.agotada ? <Etiqueta tono="agotada">{textosMarcas.agotada}</Etiqueta> : null}
        {funcion.sala.aireLibre ? (
          <Etiqueta tono="neutra" icono="luna">
            {textosMarcas.aireLibre}
          </Etiqueta>
        ) : null}
        {funcion.conversatorioMin > 0 ? (
          <Etiqueta tono="conversatorio" icono="conversatorio">
            {textosMarcas.conversatorio(funcion.conversatorioMin)}
          </Etiqueta>
        ) : null}
      </div>
      {funcion.nota ? <p className={estilos.nota}>{funcion.nota}</p> : null}
      {funcion.sala.aireLibre && funcion.sala.nota ? (
        <p className={estilos.lluvia}>
          <Icono nombre="lluvia" tamano={16} />
          {funcion.sala.nota}
        </p>
      ) : null}
      {mostrados.map((aviso, i) => {
        const texto = textoAvisoPrevio(aviso, funcion)
        if (!texto) return null
        return (
          <p key={i} className={`${estilos.previo} ${claseTono(aviso.tipo)}`}>
            <Icono nombre={iconoTono(aviso.tipo)} tamano={16} />
            {texto}
          </p>
        )
      })}
      {restantes > 0 ? <p className={estilos.mas}>+{restantes} choques más</p> : null}
    </div>
  )
}
