import Link from 'next/link'
import { Etiqueta } from '@/components/ui/Etiqueta'
import { programa } from '@/lib/programa'
import { resumenDia } from '@/lib/destacados'
import { horaDe } from '@/lib/tiempo'
import { plural } from '@/lib/formato'
import { portada as textosPortada } from '@/lib/textos'
import estilos from './TresDias.module.css'

export function TresDias() {
  return (
    <div className={estilos.seccion}>
      <h2 className={estilos.titulo}>Tres días</h2>
      {programa.dias.map((dia) => {
        const resumen = resumenDia(programa, dia.slug)
        const notas = programa.funcionesDelDia(dia.slug).filter((f) => f.nota)
        return (
          <div key={dia.slug} className={estilos.banda}>
            <span className={estilos.numero}>{dia.numero}</span>
            <div className={estilos.info}>
              <span className={estilos.nombre}>
                {dia.nombre}
                {dia.slug === 'sabado' ? <Etiqueta tono="neutra">{textosPortada.diaFuerte}</Etiqueta> : null}
              </span>
              <span className={estilos.resumen}>
                {plural(resumen.cantidad, 'función', 'funciones')} · de {horaDe(programa.funcionesDelDia(dia.slug)[0].inicio)} a{' '}
                {resumen.finMasTarde.hora}
                {resumen.finMasTarde.sufijo ? ` ${resumen.finMasTarde.sufijo}` : ''}
              </span>
              {notas.map((f) => (
                <span key={f.id} className={estilos.nota}>
                  {horaDe(f.inicio)} ·{' '}
                  <Link href={`/pelicula/${f.pelicula.id}`} className={estilos.enlaceNota}>
                    {f.pelicula.titulo}
                  </Link>
                  : {f.nota}
                </span>
              ))}
            </div>
            <Link href={`/programa?dia=${dia.slug}`} className={estilos.enlace}>
              Ver el programa
            </Link>
          </div>
        )
      })}
    </div>
  )
}
