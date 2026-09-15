import Link from 'next/link'
import { Boton } from '@/components/ui/Boton'
import { programa } from '@/lib/programa'
import { portada as textosPortada, general, nav } from '@/lib/textos'
import estilos from './EscenaFaro.module.css'

function fechasFestival(): string {
  const [j, v, s] = programa.dias
  return `${j.numero}, ${v.numero} y ${s.numero} de ${s.mes} de ${s.fecha.slice(0, 4)}`
}

export function EscenaFaro() {
  const { festival } = programa

  return (
    <section className={estilos.escena} data-zona="noche">
      <div className={estilos.faroGrupo}>
        <svg className={estilos.faro} viewBox="0 0 80 200" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
          <polygon points="30,200 50,200 44,40 36,40" fill="#0B1116" stroke="var(--bruma)" strokeWidth="1" />
          <rect x="32" y="20" width="16" height="22" fill="#0B1116" stroke="var(--bruma)" strokeWidth="1" />
          <rect x="34" y="4" width="12" height="18" fill="#F2A33A" opacity="0.9" />
          <polygon points="30,20 50,20 40,4" fill="#0B1116" stroke="var(--bruma)" strokeWidth="1" />
        </svg>
        <div className={estilos.haz} aria-hidden="true" />
      </div>

      <div className={estilos.contenido}>
        <div className={estilos.marca}>
          <p className={estilos.rotulo}>Festival de Cine</p>
          <div className={estilos.tituloEnvoltura}>
            <h1 className={estilos.h1accesible}>Festival de Cine Niebla</h1>
            <span className={estilos.titulo} aria-hidden="true">
              NIEBLA
            </span>
            <span className={`${estilos.titulo} ${estilos.tituloIluminado}`} aria-hidden="true">
              NIEBLA
            </span>
          </div>
        </div>

        <div className={estilos.datos}>
          <span className={estilos.edicion}>{festival.edicion}ª edición</span>
          <span className={estilos.fechas}>{fechasFestival()}</span>
          <span className={estilos.ciudad}>
            {festival.ciudad}, {festival.region}
          </span>
        </div>

        <div className={estilos.acciones}>
          <Boton as="a" href="/programa" variante="principal" anchoCompleto>
            {general.verPrograma}
          </Boton>
          <Link href="/itinerario" className={estilos.enlaceItinerario}>
            {nav.itinerario}
          </Link>
        </div>
      </div>

      <div className={estilos.niebla} aria-hidden="true">
        <svg className={`${estilos.capa} ${estilos.capa1}`} viewBox="0 0 300 100" preserveAspectRatio="none">
          <ellipse cx="150" cy="90" rx="220" ry="40" fill="var(--blanco-niebla)" opacity="0.06" />
        </svg>
        <svg className={`${estilos.capa} ${estilos.capa2}`} viewBox="0 0 300 100" preserveAspectRatio="none">
          <ellipse cx="150" cy="70" rx="200" ry="34" fill="var(--blanco-niebla)" opacity="0.1" />
        </svg>
        <svg className={`${estilos.capa} ${estilos.capa3}`} viewBox="0 0 300 100" preserveAspectRatio="none">
          <ellipse cx="150" cy="50" rx="180" ry="28" fill="var(--blanco-niebla)" opacity="0.16" />
        </svg>
      </div>

      <div className={estilos.indicador}>
        <span className={estilos.lineaIndicador} aria-hidden="true" />
        {textosPortada.bajar}
      </div>
    </section>
  )
}
