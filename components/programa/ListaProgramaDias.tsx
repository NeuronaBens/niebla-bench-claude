import { TarjetaFuncion } from '@/components/funcion/TarjetaFuncion.tsx'
import { filtros as textosFiltros } from '@/lib/textos'
import { plural } from '@/lib/formato'
import type { Aviso, DiaFestival, Funcion } from '@/lib/tipos'
import estilos from './ListaProgramaDias.module.css'

export function ListaProgramaDias({
  funciones,
  dias,
  avisosPorFuncion,
  seleccion,
}: {
  funciones: Funcion[]
  dias: DiaFestival[]
  avisosPorFuncion?: Map<string, Aviso[]>
  seleccion?: string[]
}) {
  if (funciones.length === 0) {
    return <p className={estilos.vacio}>{textosFiltros.sinResultados}</p>
  }

  const seleccionadas = new Set(seleccion ?? [])

  return (
    <div>
      {dias.map((dia) => {
        const delDia = funciones.filter((f) => f.dia.slug === dia.slug)
        if (delDia.length === 0) return null
        return (
          <section key={dia.slug} aria-labelledby={`dia-${dia.slug}`}>
            <h2 className={estilos.encabezado} id={`dia-${dia.slug}`}>
              <span className={estilos.numero}>{dia.numero}</span>
              <span className={estilos.nombreDia}>{dia.nombre}</span>
              <span className={estilos.cantidad}>{plural(delDia.length, 'función', 'funciones')}</span>
            </h2>
            <div className={estilos.lista}>
              {delDia.map((funcion) => (
                <TarjetaFuncion
                  key={funcion.id}
                  funcion={funcion}
                  avisosPrevios={avisosPorFuncion?.get(funcion.id)}
                  seleccionada={seleccionadas.has(funcion.id)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
