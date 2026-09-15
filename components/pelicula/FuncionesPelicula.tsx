import { HorarioFuncion } from '@/components/funcion/HorarioFuncion.tsx'
import { MarcasFuncion } from '@/components/funcion/MarcasFuncion.tsx'
import { BotonItinerario } from '@/components/funcion/BotonItinerario.tsx'
import { Icono } from '@/components/ui/Icono'
import { precio, plural } from '@/lib/formato'
import type { Funcion } from '@/lib/tipos'
import estilos from './FuncionesPelicula.module.css'

export function FuncionesPelicula({ funciones }: { funciones: Funcion[] }) {
  return (
    <div className={estilos.seccion}>
      <h2 className={estilos.titulo}>{plural(funciones.length, 'Función', 'Funciones')}</h2>
      <div className={estilos.lista}>
        {funciones.map((funcion) => (
          <article key={funcion.id} className={`${estilos.tarjeta} luz-${funcion.seccion.id}`}>
            <HorarioFuncion funcion={funcion} formato="completo" />
            <div>
              <p className={estilos.sala}>
                <Icono nombre="ubicacion" tamano={16} />
                {funcion.sala.nombre}, {funcion.sala.direccion}
              </p>
              <p className={estilos.precio}>{precio(funcion.precio)}</p>
              <MarcasFuncion funcion={funcion} />
            </div>
            <div className={estilos.accion}>
              <BotonItinerario funcion={funcion} variante="ancho" />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
