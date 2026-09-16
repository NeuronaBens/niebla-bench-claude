import Link from 'next/link'
import { AfichePelicula } from '@/components/afiche/AfichePelicula'
import { estiloDeSeccion } from '@/lib/estiloSecciones'
import { conteoPorSeccion, peliculasPorSeccion, secciones } from '@/lib/programa'
import { textoPeliculas } from '@/lib/formato'
import styles from './SeccionesFestival.module.css'

export function SeccionesFestival() {
  return (
    <section className={`${styles.seccion} contenedor`} aria-labelledby="titulo-secciones">
      <h2 id="titulo-secciones" className={styles.titulo}>
        Secciones
      </h2>
      <div className={styles.grilla}>
        {secciones.map((seccion) => {
          const estilo = estiloDeSeccion(seccion.id)
          const cantidad = conteoPorSeccion(seccion.id)
          const pelis = peliculasPorSeccion(seccion.id).slice(0, 5)
          return (
            <Link
              key={seccion.id}
              href={`/programa?seccion=${seccion.id}`}
              className={styles.tarjeta}
              data-motivo={estilo.motivo}
              style={{ borderTopColor: estilo.colorTinta }}
            >
              <div className={styles.motivoFondo} aria-hidden="true" style={{ color: estilo.colorTinta }} />
              <div className={styles.contenidoTarjeta}>
                <h3 className={styles.nombreSeccion}>{seccion.nombre}</h3>
                <p className={styles.descripcion}>{seccion.descripcion}</p>
                <p className={styles.cantidad}>{textoPeliculas(cantidad)}</p>
                <div className={styles.miniaturas}>
                  {pelis.map((p) => (
                    <div key={p.id} className={styles.miniatura}>
                      <AfichePelicula pelicula={p} tamano="mini" instancia={`portada-${seccion.id}`} />
                    </div>
                  ))}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
