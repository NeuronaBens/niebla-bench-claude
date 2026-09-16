'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useAvisos } from '@/components/avisos/ProveedorAvisos'
import { textoFunciones } from '@/lib/formato'
import { useItinerario } from '@/lib/itinerario/useItinerario'
import styles from './NavegacionPrincipal.module.css'

const DESTINOS = [
  { href: '/', etiqueta: 'Inicio' },
  { href: '/programa', etiqueta: 'Programa' },
  { href: '/itinerario', etiqueta: 'Mi itinerario' },
] as const

function IconoInicio() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path d="M12 3 L21 10 V21 H15 V14 H9 V21 H3 V10 Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function IconoPrograma() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 6 V12 L16.5 14.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function IconoItinerario() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <line x1="8.5" y1="6" x2="8.5" y2="18" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" />
    </svg>
  )
}

const ICONOS: Record<string, () => React.JSX.Element> = {
  '/': IconoInicio,
  '/programa': IconoPrograma,
  '/itinerario': IconoItinerario,
}

export function NavegacionPrincipal() {
  const pathname = usePathname()
  const { funciones, listo, persistible, consumirAvisoPersistencia } = useItinerario()
  const { mostrarToast } = useAvisos()
  const cantidad = funciones.length
  const [pulso, setPulso] = useState(false)
  // `null` hasta que se lee el valor real (tras `listo`): así la primera lectura del
  // itinerario guardado solo establece la base, sin hacer pulsar la insignia como si se
  // hubiera agregado algo.
  const anteriorRef = useRef<number | null>(null)

  useEffect(() => {
    if (!listo) return
    if (anteriorRef.current === null) {
      anteriorRef.current = cantidad
      return
    }
    if (cantidad > anteriorRef.current) {
      setPulso(true)
      anteriorRef.current = cantidad
      const t = setTimeout(() => setPulso(false), 260)
      return () => clearTimeout(t)
    }
    anteriorRef.current = cantidad
  }, [cantidad, listo])

  // Aviso único de "no se puede guardar": este componente vive en todas las páginas, así que
  // detecta el fallo sin importar desde dónde se modificó el itinerario (programa, ficha,
  // Mi itinerario o el itinerario compartido).
  useEffect(() => {
    if (!listo || persistible) return
    if (consumirAvisoPersistencia()) {
      mostrarToast({
        texto: 'Tu navegador no deja guardar el itinerario. Lo verás mientras no cierres esta pestaña.',
        duracionMs: 8000,
      })
    }
  }, [listo, persistible, consumirAvisoPersistencia, mostrarToast])

  function esActivo(href: string) {
    if (href === '/') return pathname === '/'
    // El itinerario compartido (`/itinerario/compartido`) no es "Mi itinerario": no debe
    // marcarse como la página actual en la navegación.
    if (href === '/itinerario') return pathname === '/itinerario'
    return pathname.startsWith(href)
  }

  const nombreItinerario = listo && cantidad > 0 ? `Mi itinerario, ${textoFunciones(cantidad)}` : 'Mi itinerario'

  return (
    <>
      <header className={styles.cabecera}>
        <div className={`${styles.cabeceraInterior} contenedor`}>
          <Link href="/" className={styles.wordmark} aria-label="Festival de Cine Niebla, ir a la portada">
            NIEBLA
          </Link>
          <nav aria-label="Navegación principal" className={styles.navDesktop}>
            <ul className={styles.listaDesktop}>
              {DESTINOS.map((d) => (
                <li key={d.href}>
                  <Link
                    href={d.href}
                    aria-current={esActivo(d.href) ? 'page' : undefined}
                    aria-label={d.href === '/itinerario' ? nombreItinerario : undefined}
                    className={styles.enlaceDesktop}
                  >
                    {d.etiqueta}
                    {d.href === '/itinerario' && listo && cantidad > 0 && (
                      <span className={`${styles.contador} ${pulso ? styles.pulso : ''}`} aria-hidden="true">
                        {cantidad}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <nav aria-label="Navegación principal" className={styles.navMovil}>
        <ul className={styles.listaMovil}>
          {DESTINOS.map((d) => {
            const Icono = ICONOS[d.href]
            const activo = esActivo(d.href)
            return (
              <li key={d.href} className={styles.itemMovil}>
                <Link
                  href={d.href}
                  aria-current={activo ? 'page' : undefined}
                  aria-label={d.href === '/itinerario' ? nombreItinerario : undefined}
                  className={`${styles.enlaceMovil} ${activo ? styles.activoMovil : ''}`}
                >
                  <span className={styles.iconoWrap}>
                    <Icono />
                    {d.href === '/itinerario' && listo && cantidad > 0 && (
                      <span
                        className={`${styles.contador} ${styles.contadorMovil} ${pulso ? styles.pulso : ''}`}
                        aria-hidden="true"
                      >
                        {cantidad}
                      </span>
                    )}
                  </span>
                  <span className={styles.etiquetaMovil}>{d.etiqueta}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </>
  )
}
