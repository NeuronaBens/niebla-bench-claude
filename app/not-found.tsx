import type { Metadata } from 'next'
import { Boton } from '@/components/ui/Boton'
import estilos from './not-found.module.css'

export const metadata: Metadata = {
  title: 'Página no encontrada',
}

export default function NoEncontrado() {
  return (
    <div className={estilos.pagina} data-zona="noche">
      <div className={`contenedor ${estilos.contenido}`}>
        <h1 className={estilos.titulo}>Esta página se perdió en la niebla</h1>
        <p className={estilos.texto}>Puede que el link esté incompleto o que la dirección tenga un error.</p>
        <div className={estilos.acciones}>
          <Boton as="a" href="/programa" variante="principal">
            Ver el programa
          </Boton>
          <Boton as="a" href="/" variante="secundario">
            Ir al inicio
          </Boton>
        </div>
      </div>
    </div>
  )
}
