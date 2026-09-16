import { salas } from '@/lib/datos'
import { horaDe } from '@/lib/tiempo'
import type { DiaFestival, Funcion } from '@/lib/tipos'
import GlifoSala from '@/components/marcas/GlifoSala'
import TarjetaFuncion from './TarjetaFuncion'
import estilos from './GrillaPrograma.module.css'

interface Props {
  funciones: Funcion[]
  diasVisibles: DiaFestival[]
  interactiva: boolean
}

const PX_POR_MIN = 2
const ANCHO_COLUMNA = 100 / salas.length

function BloqueDia({ dia, funciones, interactiva }: { dia: DiaFestival; funciones: Funcion[]; interactiva: boolean }) {
  const alto = (dia.ejeFinMin - dia.ejeInicioMin) * PX_POR_MIN
  const lineasHora: { min: number; esMedia: boolean }[] = []
  const primerHora = Math.ceil(dia.ejeInicioMin / 60) * 60
  for (let m = primerHora; m <= dia.ejeFinMin; m += 30) {
    lineasHora.push({ min: m, esMedia: m % 60 !== 0 })
  }

  return (
    <section className={estilos.bloqueDia} aria-labelledby={`dia-grilla-${dia.slug}`}>
      <h2 id={`dia-grilla-${dia.slug}`} className={estilos.tituloDia}>
        {dia.etiqueta}
      </h2>
      <div className={estilos.encabezado}>
        <div />
        {salas.map((sala) => (
          <div key={sala.id} className={estilos.columnaSala}>
            <GlifoSala salaId={sala.id} />
            <span className={estilos.nombreSala}>
              <span>{sala.nombre}</span>
              <span>{sala.direccion}</span>
            </span>
          </div>
        ))}
      </div>
      <div className={estilos.cuerpo} style={{ height: alto }}>
        <div className={estilos.eje}>
          {lineasHora
            .filter((l) => !l.esMedia)
            .map((l) => (
              <span
                key={l.min}
                className={estilos.etiquetaHora}
                style={{ top: (l.min - dia.ejeInicioMin) * PX_POR_MIN }}
              >
                {horaDe(l.min)}
                {l.min % 1440 === 0 && <span className={estilos.etiquetaHoraSiguiente}>día siguiente</span>}
              </span>
            ))}
        </div>
        <div className={estilos.pistas}>
          {lineasHora.map((l) => (
            <span
              key={l.min}
              className={l.esMedia ? estilos.lineaMedia : estilos.lineaHora}
              style={{ top: (l.min - dia.ejeInicioMin) * PX_POR_MIN }}
            />
          ))}
          {funciones.map((f) => {
            const idx = salas.findIndex((s) => s.id === f.salaId)
            const top = (f.inicioMin - dia.ejeInicioMin) * PX_POR_MIN
            const alto = Math.max(f.pelicula.duracionMin * PX_POR_MIN, 170)
            return (
              <div
                key={f.id}
                className={estilos.funcionAbsoluta}
                style={{
                  top,
                  height: alto,
                  left: `calc(${idx * ANCHO_COLUMNA}% + 4px)`,
                  width: `calc(${ANCHO_COLUMNA}% - 8px)`,
                }}
              >
                <TarjetaFuncion funcion={f} variante="grilla" interactiva={interactiva} />
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/** Programa en escritorio: una grilla por hora y sala, con orden cronológico en el DOM. */
export default function GrillaPrograma({ funciones, diasVisibles, interactiva }: Props) {
  return (
    <div>
      {diasVisibles.map((dia) => (
        <BloqueDia key={dia.fecha} dia={dia} funciones={funciones.filter((f) => f.dia.fecha === dia.fecha)} interactiva={interactiva} />
      ))}
    </div>
  )
}
