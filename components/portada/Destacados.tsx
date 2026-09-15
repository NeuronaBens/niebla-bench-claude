import Link from 'next/link'
import { Cartel } from '@/components/cartel/Cartel.tsx'
import { Etiqueta } from '@/components/ui/Etiqueta'
import { programa } from '@/lib/programa'
import { destacados as calcularDestacados } from '@/lib/destacados'
import { horaDe } from '@/lib/tiempo'
import { portada as textosPortada, marcas as textosMarcas } from '@/lib/textos'
import type { Funcion } from '@/lib/tipos'
import estilos from './Destacados.module.css'

function motivoDestacado(funcion: Funcion): string {
  if (funcion.nota) return funcion.nota
  if (funcion.conversatorioMin > 0) return `Conversatorio de ${funcion.conversatorioMin} min`
  if (funcion.sala.aireLibre) return 'Al aire libre y gratis'
  return ''
}

export function Destacados() {
  const d = calcularDestacados(programa)
  const ordenadas: Funcion[] = [...d.conNota, ...d.conConversatorio, ...d.alAireLibre]
  const vistos = new Set<string>()
  const unicas = ordenadas.filter((f) => {
    if (vistos.has(f.id)) return false
    vistos.add(f.id)
    return true
  })

  return (
    <div className={estilos.seccion}>
      <h2 className={estilos.titulo}>{textosPortada.paraAnotar}</h2>
      <div className={estilos.grilla}>
        {unicas.map((funcion) => (
          <Link key={funcion.id} href={`/pelicula/${funcion.pelicula.id}`} className={estilos.tarjeta}>
            <Cartel pelicula={funcion.pelicula} variante="tarjeta" idBase={`${funcion.id}-destacado`} />
            <span className={estilos.motivo}>{funcion.pelicula.titulo}</span>
            <span className={estilos.detalle}>
              {funcion.dia.nombre} {horaDe(funcion.inicio)} · {motivoDestacado(funcion)}
            </span>
            {funcion.agotada ? <Etiqueta tono="agotada">{textosMarcas.agotada}</Etiqueta> : null}
          </Link>
        ))}
      </div>
    </div>
  )
}
