import Link from 'next/link'
import { funciones } from '@/lib/datos'
import { horaDe } from '@/lib/tiempo'
import estilos from './MomentosEspeciales.module.css'

export default function MomentosEspeciales() {
  const conNota = funciones.filter((f) => f.nota)
  if (conNota.length === 0) return null

  return (
    <section>
      <h2>Momentos especiales</h2>
      <div className={estilos.lista}>
        {conNota.map((f) => (
          <div key={f.id} className={estilos.momento}>
            <span className={estilos.fecha}>
              {f.dia.etiqueta} · {horaDe(f.inicioMin)}
            </span>
            <Link href={`/peliculas/${f.peliculaId}`} className={estilos.titulo}>
              {f.pelicula.titulo}
            </Link>
            <span className={estilos.sala}>{f.sala.nombre}</span>
            <p className={estilos.nota}>{f.nota}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
