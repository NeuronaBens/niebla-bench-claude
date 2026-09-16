import Link from 'next/link'
import { festival, textoFechasFestival } from '@/lib/programa'
import styles from './HeroNiebla.module.css'

const LETRAS = 'NIEBLA'.split('')

export function HeroNiebla() {
  return (
    <section className={styles.hero} aria-labelledby="titulo-festival">
      <div className={styles.cielo} aria-hidden="true" />
      <div className={styles.horizonte} aria-hidden="true">
        <svg viewBox="0 0 800 60" preserveAspectRatio="none" width="100%" height="100%">
          {Array.from({ length: 5 }).map((_, i) => (
            <path
              key={i}
              d={`M0 ${10 + i * 10} Q 100 ${4 + i * 10}, 200 ${10 + i * 10} T 400 ${10 + i * 10} T 600 ${10 + i * 10} T 800 ${10 + i * 10}`}
              fill="none"
              stroke="var(--niebla)"
              strokeOpacity={0.12}
              strokeWidth={1}
            />
          ))}
        </svg>
      </div>

      <div className={styles.faro} aria-hidden="true">
        <svg viewBox="0 0 60 240" width="100%" height="100%" preserveAspectRatio="xMidYMax meet">
          <rect x="24" y="80" width="12" height="150" fill="var(--tinta-3)" />
          <polygon points="18,90 42,90 34,50 26,50" fill="var(--tinta-3)" />
          <rect x="22" y="40" width="16" height="14" fill="var(--tinta-2)" stroke="var(--niebla-2)" strokeWidth="1" />
          <circle cx="30" cy="47" r="5" fill="var(--faro)" />
        </svg>
        <div className={styles.haz} />
      </div>

      {/* Bandas detrás del título: quedan por debajo de .contenido en el mismo apilamiento. */}
      <div className={styles.nieblaDetras} aria-hidden="true">
        <span className={`${styles.banda} ${styles.banda1}`} />
        <span className={`${styles.banda} ${styles.banda3}`} />
      </div>

      <div className={`${styles.contenido} contenedor`}>
        <h1 id="titulo-festival" className={styles.titulo}>
          <span className={styles.tituloChico}>Festival de Cine</span>
          <span className={styles.tituloGrande} aria-hidden="true">
            {LETRAS.map((letra, i) => (
              <span key={i} className={styles.letra} style={{ '--i': i } as React.CSSProperties}>
                {letra}
              </span>
            ))}
          </span>
          <span className="visualmente-oculto">Niebla</span>
        </h1>

        <div className={styles.datos}>
          <p className={styles.edicion}>{festival.edicion}ª edición</p>
          <p className={styles.fechas}>{textoFechasFestival()}</p>
          <p className={styles.lugar}>Puerto Bruma, Chile</p>
        </div>

        <div className={styles.acciones}>
          <Link href="/programa" className={styles.botonPrimario}>
            Ver el programa
          </Link>
          <Link href="/itinerario" className={styles.botonSecundario}>
            Armar mi itinerario
          </Link>
        </div>
      </div>

      {/* Banda del medio: pasa por delante del título para que la palabra "salga de la
          niebla" (docs/DETALLE.md 4), por eso va después de .contenido en el DOM. */}
      <div className={styles.nieblaDelante} aria-hidden="true">
        <span className={`${styles.banda} ${styles.banda2} ${styles.bandaMedio}`} />
      </div>
    </section>
  )
}
