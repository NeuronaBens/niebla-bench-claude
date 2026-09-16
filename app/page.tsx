import type { Metadata } from 'next'
import Link from 'next/link'
import CifrasFestival from '@/components/portada/CifrasFestival'
import EscenaPuerto from '@/components/portada/EscenaPuerto'
import HorariosPorDia from '@/components/portada/HorariosPorDia'
import InfoEntradas from '@/components/portada/InfoEntradas'
import MapaPuerto from '@/components/portada/MapaPuerto'
import MomentosEspeciales from '@/components/portada/MomentosEspeciales'
import TablaTraslados from '@/components/portada/TablaTraslados'
import TarjetaSeccion from '@/components/portada/TarjetaSeccion'
import GlifoSala from '@/components/marcas/GlifoSala'
import Etiqueta from '@/components/marcas/Etiqueta'
import { dias, festival, peliculasDeSeccion, secciones, salas, totalDias } from '@/lib/datos'
import { cardinalPalabra, nombreMes, ordinalPalabra } from '@/lib/formato'
import estilos from './page.module.css'

const anioFestival = festival.fechaInicio.slice(0, 4)
const mesFestival = nombreMes(Number(festival.fechaInicio.slice(5, 7)))
const primerDia = dias[0]?.numero
const ultimoDia = dias[dias.length - 1]?.numero

export const metadata: Metadata = {
  title: {
    absolute: `${festival.nombre} · ${primerDia} al ${ultimoDia} de ${mesFestival} de ${anioFestival}, ${festival.ciudad}`,
  },
}

export default function PortadaPage() {
  return (
    <>
      <EscenaPuerto />

      <section className={`${estilos.seccion} contenedor`}>
        <h2>Cine chico, de puerto</h2>
        <p className={estilos.introSeccion}>
          {cardinalPalabra(totalDias).charAt(0).toUpperCase() + cardinalPalabra(totalDias).slice(1)} días de películas
          repartidas entre un teatro, un cine arte, un galpón y una terraza frente al mar. Lo organizamos entre cuatro
          personas, con fondos concursables y la mano de muchos voluntarios. Esta es la {ordinalPalabra(festival.edicion)}{' '}
          edición.
        </p>
        <CifrasFestival />
      </section>

      <section className={`${estilos.seccion} contenedor`}>
        <h2>Secciones</h2>
        <div className={estilos.grillaSecciones}>
          {secciones.map((seccion) => (
            <TarjetaSeccion key={seccion.id} seccion={seccion} peliculas={peliculasDeSeccion(seccion.id)} />
          ))}
        </div>
      </section>

      <section className={`${estilos.seccion} contenedor`}>
        <MomentosEspeciales />
      </section>

      <section className={`${estilos.seccion} contenedor`}>
        <HorariosPorDia />
      </section>

      <section className={`${estilos.seccion} contenedor`}>
        <h2>Dónde es</h2>
        <div className={estilos.salasLayout}>
          <MapaPuerto />
          <div>
            <div className={estilos.listaSalas}>
              {salas.map((sala) => (
                <div key={sala.id} className={estilos.sala}>
                  <GlifoSala salaId={sala.id} />
                  <div>
                    <p className={estilos.salaNombre}>{sala.nombre}</p>
                    <p className={estilos.salaDireccion}>{sala.direccion}</p>
                    <p className={estilos.salaCapacidad}>Capacidad: {sala.capacidad} personas</p>
                    {sala.aireLibre && (
                      <p className={estilos.notaAireLibre}>
                        <Etiqueta tipo="aireLibre">Al aire libre · entrada gratis</Etiqueta>
                        {sala.nota && <span className={estilos.salaDireccion}>{sala.nota}</span>}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <TablaTraslados />
          </div>
        </div>
      </section>

      <section className={`${estilos.seccion} contenedor`}>
        <InfoEntradas />
      </section>

      <section className={`${estilos.cierre} contenedor`}>
        <h2>Arma tu recorrido</h2>
        <div className={estilos.recorridoEjemplo} aria-hidden="true">
          <span />
          <span className={estilos.linea} />
          <span />
          <span className={estilos.linea} />
          <span />
        </div>
        <Link href="/programa" className={estilos.botonCierre}>
          Ir al programa
        </Link>
      </section>
    </>
  )
}
