import { dias } from '@/lib/datos'
import type { Funcion } from '@/lib/tipos'
import TarjetaFuncion from './TarjetaFuncion'
import estilos from './ListaPrograma.module.css'

interface Props {
  funciones: Funcion[]
  interactiva: boolean
  mostrarDias: boolean
}

type Item = { tipo: 'rotulo'; clave: string; texto: string } | { tipo: 'funcion'; funcion: Funcion }

function itemsConFranjas(funcionesDia: Funcion[]): Item[] {
  const items: Item[] = []
  let franjaActual: number | null = null
  for (const f of funcionesDia) {
    const franja = Math.floor(f.inicioMin / 60) % 24
    if (franja !== franjaActual) {
      franjaActual = franja
      items.push({ tipo: 'rotulo', clave: `franja-${f.id}`, texto: `${franja} h` })
    }
    items.push({ tipo: 'funcion', funcion: f })
  }
  return items
}

function Lista({ funcionesDia, interactiva }: { funcionesDia: Funcion[]; interactiva: boolean }) {
  return (
    <ol className={estilos.lista}>
      {itemsConFranjas(funcionesDia).map((item) =>
        item.tipo === 'rotulo' ? (
          <li key={item.clave} className={estilos.rotulo} aria-hidden="true">
            {item.texto}
          </li>
        ) : (
          <li key={item.funcion.id}>
            <TarjetaFuncion funcion={item.funcion} variante="lista" interactiva={interactiva} />
          </li>
        )
      )}
    </ol>
  )
}

/** Programa en móvil y tablet: agrupado por día y, dentro, por franja horaria. */
export default function ListaPrograma({ funciones, interactiva, mostrarDias }: Props) {
  if (!mostrarDias) {
    // Ya hay un solo día por el filtro (visible en la barra de arriba): el
    // h2 sigue existiendo para la jerarquía de encabezados, pero queda
    // oculto visualmente para no repetir el dato.
    const dia = funciones[0]?.dia
    return (
      <section aria-labelledby={dia ? `dia-${dia.slug}` : undefined}>
        {dia && (
          <h2 id={`dia-${dia.slug}`} className="soloLector">
            {dia.etiqueta}
          </h2>
        )}
        <Lista funcionesDia={funciones} interactiva={interactiva} />
      </section>
    )
  }

  const diasConFunciones = dias.filter((d) => funciones.some((f) => f.dia.fecha === d.fecha))

  return (
    <div>
      {diasConFunciones.map((dia) => (
        <section key={dia.fecha} aria-labelledby={`dia-${dia.slug}`}>
          <h2 id={`dia-${dia.slug}`} className={estilos.tituloDia}>
            {dia.etiqueta}
          </h2>
          <Lista funcionesDia={funciones.filter((f) => f.dia.fecha === dia.fecha)} interactiva={interactiva} />
        </section>
      ))}
    </div>
  )
}
