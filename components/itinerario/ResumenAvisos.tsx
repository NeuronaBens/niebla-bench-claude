'use client'

import { Icono } from '@/components/ui/Icono'
import { programa } from '@/lib/programa'
import { horaDe } from '@/lib/tiempo'
import { precio } from '@/lib/formato'
import { itinerarioTextos } from '@/lib/textos'
import type { ResultadoItinerario } from '@/lib/tipos'
import estilos from './ResumenAvisos.module.css'

function costoEstimado(resultado: ResultadoItinerario): string {
  const total = resultado.funciones.reduce((acc, f) => acc + f.precio, 0)
  return total === 0 ? itinerarioTextos.entradasGratis : itinerarioTextos.entradasTotal(precio(total))
}

function irA(id: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const destino = document.getElementById(id)
    if (destino) {
      destino.scrollIntoView({ block: 'center' })
      destino.focus()
    }
  }
}

export function ResumenAvisos({ resultado, modo = 'propio' }: { resultado: ResultadoItinerario; modo?: 'propio' | 'compartido' }) {
  const problemas = resultado.avisos.filter((a) => a.tipo === 'tope' || a.tipo === 'noAlcanza')
  const conversatorios = resultado.avisos.filter((a) => a.tipo === 'conversatorio')

  if (problemas.length === 0) {
    return (
      <div className={estilos.resumen}>
        <p className={estilos.ok}>
          <Icono nombre="check" tamano={20} />
          {itinerarioTextos.resumenOk(resultado.funciones.length)}
        </p>
        {conversatorios.length > 0 ? (
          <p className={estilos.extra}>{itinerarioTextos.avisoConversatorioExtra(conversatorios.length)}</p>
        ) : null}
        {modo === 'propio' ? <p className={estilos.extra}>{costoEstimado(resultado)}</p> : null}
      </div>
    )
  }

  return (
    <div className={estilos.resumen}>
      <h2 className={estilos.titulo}>{itinerarioTextos.resumenProblemas(problemas.length)}</h2>
      <div className={estilos.lista}>
        {problemas.map((aviso, i) => {
          if (aviso.tipo !== 'tope' && aviso.tipo !== 'noAlcanza') return null
          const funcionA = programa.funcionPorId(aviso.a)
          const funcionB = programa.funcionPorId(aviso.b)
          if (!funcionA || !funcionB) return null
          const texto =
            aviso.tipo === 'tope'
              ? `Tope: ${funcionA.pelicula.titulo} (${horaDe(funcionA.inicio)}) y ${funcionB.pelicula.titulo} (${horaDe(funcionB.inicio)})`
              : `No alcanzas: ${funcionA.pelicula.titulo} → ${funcionB.pelicula.titulo}`
          return (
            <a key={i} href={`#funcion-${aviso.a}`} onClick={irA(`funcion-${aviso.a}`)}>
              {texto}
            </a>
          )
        })}
      </div>
      {modo === 'propio' ? <p className={estilos.extra}>{costoEstimado(resultado)}</p> : null}
    </div>
  )
}
