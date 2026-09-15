import { plural } from '@/lib/formato'
import type { Aviso, DiaFestival, Funcion, Tramo as TramoTipo } from '@/lib/tipos'
import { ItemItinerario } from './ItemItinerario.tsx'
import { Tramo } from './Tramo.tsx'
import estilos from './DiaItinerario.module.css'

// Un tope, no-alcanza o conversatorio entre un par consecutivo ya se ve en su
// Tramo: no se repite en la tarjeta de la función. Solo los avisos de pares
// no consecutivos (por ejemplo f13→f17 cuando f16 está en medio) van en la tarjeta.
function avisosParaTarjeta(avisos: Aviso[], paresEnTramo: Set<string>): Aviso[] {
  return avisos.filter((a) => {
    if (a.tipo === 'tope' || a.tipo === 'noAlcanza' || a.tipo === 'conversatorio') {
      return !paresEnTramo.has(`${a.a}|${a.b}`)
    }
    return true
  })
}

export function DiaItinerario({
  dia,
  funciones,
  tramos,
  avisosPorFuncion,
  avisosLluvia,
  modo,
  alQuitar,
}: {
  dia: DiaFestival
  funciones: Funcion[]
  tramos: TramoTipo[]
  avisosPorFuncion: Record<string, Aviso[]>
  avisosLluvia?: Aviso[]
  modo: 'propio' | 'compartido'
  alQuitar?: (id: string) => void
}) {
  const paresEnTramo = new Set(tramos.filter((t) => t.aviso).map((t) => `${t.a}|${t.b}`))
  const lluviaPorPar = new Map(
    (avisosLluvia ?? [])
      .filter((a): a is Extract<Aviso, { tipo: 'lluvia' }> => a.tipo === 'lluvia')
      .map((a) => [`${a.a}|${a.b}`, a])
  )

  return (
    <section className={estilos.dia} aria-labelledby={`itinerario-dia-${dia.slug}`}>
      <h2 className={estilos.encabezado} id={`itinerario-dia-${dia.slug}`}>
        <span className={estilos.numero}>{dia.numero}</span>
        <span className={estilos.nombreDia}>{dia.nombre}</span>
        <span className={estilos.cantidad}>{plural(funciones.length, 'función', 'funciones')}</span>
      </h2>
      <div className={estilos.recorrido}>
        {funciones.map((funcion, i) => {
          const siguiente = funciones[i + 1]
          const tramo = siguiente ? tramos.find((t) => t.a === funcion.id && t.b === siguiente.id) : undefined
          return (
            <div key={funcion.id}>
              <ItemItinerario
                funcion={funcion}
                avisos={avisosParaTarjeta(avisosPorFuncion[funcion.id] ?? [], paresEnTramo)}
                modo={modo}
                alQuitar={alQuitar}
              />
              {tramo && siguiente ? (
                <Tramo
                  tramo={tramo}
                  desde={funcion}
                  hasta={siguiente}
                  avisoLluvia={lluviaPorPar.get(`${funcion.id}|${siguiente.id}`)}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}
