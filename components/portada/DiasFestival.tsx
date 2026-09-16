import Link from 'next/link'
import { estiloDeSeccion } from '@/lib/estiloSecciones'
import { funcionesPorDia, resumenDia } from '@/lib/programa'
import type { DiaId } from '@/lib/tipos'
import styles from './DiasFestival.module.css'

const DIAS: DiaId[] = ['jueves', 'viernes', 'sabado']

// Regla de la portada: de 12:00 a 02:00 del día siguiente (840 minutos), solo para dibujar
// las marcas; no reemplaza los datos de horario reales.
const INICIO_REGLA_MIN = 12 * 60
const LARGO_REGLA_MIN = 14 * 60

export function DiasFestival() {
  return (
    <section className={`${styles.seccion} contenedor`} aria-labelledby="titulo-dias">
      <h2 id="titulo-dias" className={styles.titulo}>
        Cuándo
      </h2>
      <div className={styles.grilla}>
        {DIAS.map((diaId, indice) => {
          const resumen = resumenDia(diaId)
          const inicioDelDia = indice * 1440 + INICIO_REGLA_MIN
          const deEseDia = funcionesPorDia(diaId)
          const hitos = deEseDia.filter((f) => f.nota)

          return (
            <Link key={diaId} href={`/programa?dia=${diaId}`} className={styles.bloque}>
              <p className={styles.nombreDia}>
                {resumen.dia.nombreLargo.toUpperCase()} {resumen.dia.numero}
              </p>
              <div className={styles.regla} aria-hidden="true">
                {deEseDia.map((f) => {
                  const posicion = ((f.inicioMin - inicioDelDia) / LARGO_REGLA_MIN) * 100
                  const color = estiloDeSeccion(f.pelicula.seccion).colorTinta
                  return (
                    <span
                      key={f.id}
                      className={styles.marca}
                      style={{ left: `${Math.min(100, Math.max(0, posicion))}%`, background: color }}
                    />
                  )
                })}
              </div>
              <p className={styles.resumenTexto}>
                {resumen.cantidad} funciones · de {resumen.primeraHora} a {resumen.ultimoTermino}
              </p>
              {hitos.map((f) => (
                <p key={f.id} className={styles.hito}>
                  {f.pelicula.titulo}, {f.horaInicio}: {f.nota}
                </p>
              ))}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
