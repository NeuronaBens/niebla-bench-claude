import { FilaFuncion } from './FilaFuncion'
import { dias } from '@/lib/programa'
import type { Funcion } from '@/lib/tipos'
import styles from './ListaFunciones.module.css'

interface Props {
  funciones: Funcion[]
  instancia: string
}

export function ListaFunciones({ funciones, instancia }: Props) {
  return (
    <div className={styles.lista}>
      {dias.map((dia) => {
        const deEseDia = funciones.filter((f) => f.dia === dia.id)
        if (deEseDia.length === 0) return null
        return (
          <section key={dia.id} aria-labelledby={`dia-${dia.id}-${instancia}`}>
            <h2 id={`dia-${dia.id}-${instancia}`} className={styles.encabezadoDia}>
              {dia.nombreLargo.toUpperCase()} {dia.numero} DE {dia.mes.toUpperCase()}
            </h2>
            <ul className={styles.funciones}>
              {deEseDia.map((f) => (
                <FilaFuncion key={f.id} funcion={f} instancia={`${instancia}-${f.id}`} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
