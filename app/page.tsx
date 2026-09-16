import Link from 'next/link';
import { getFestival, getSecciones, getSalas, getDiasFestival } from '@/lib/datos';
import InsigniaSeccion from '@/components/ui/InsigniaSeccion';
import styles from './page.module.css';

export default function Home() {
  const festival = getFestival();
  const secciones = getSecciones();
  const salas = getSalas();
  const dias = getDiasFestival();

  // Formatear fechas
  const fechaInicio = `${dias[0].etiqueta}`;
  const fechaFin = `${dias[dias.length - 1].etiqueta}`;

  return (
    <div className={styles.contenedor}>
      <section className={styles.portada}>
        <svg className={styles.fondo} viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad-portada" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a4a5c" />
              <stop offset="100%" stopColor="#0b1420" />
            </linearGradient>
          </defs>
          <rect width="1000" height="600" fill="url(#grad-portada)" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x="0" y={100 + i * 100} width="1000" height="80" fill="rgba(99, 110, 114, 0.2)" opacity={0.4 - i * 0.05} />
          ))}
          <circle cx="400" cy="150" r="100" fill="rgba(255,255,255,0.1)" opacity="0.6" />
          <circle cx="400" cy="150" r="80" fill="rgba(255,255,255,0.05)" />
        </svg>

        <div className={styles.titulo}>
          <h1>{festival.nombre}</h1>
          <p className={styles.edicion}>3ª edición · {festival.ciudad}, {festival.region}</p>
          <p className={styles.fechas}>{fechaInicio} a {fechaFin}</p>
        </div>

        <div className={styles.ctas}>
          <Link href="/programa" className={styles.ctaPrincipal}>Ver el programa</Link>
          <Link href="/itinerario" className={styles.ctaSecundaria}>Mi itinerario</Link>
        </div>
      </section>

      <section className={styles.seccion}>
        <h2>Qué es</h2>
        <p>Festival chico de cine de Puerto Bruma, organizado por cuatro personas y muchos voluntarios. Tres días de películas latinoamericanas, internacionales, cine de género y producciones de la costa. Hecho de acá, sin pretensiones.</p>
      </section>

      <section className={styles.seccion}>
        <h2>Secciones</h2>
        <div className={styles.secciones}>
          {secciones.map(sec => (
            <Link key={sec.id} href={`/programa/${dias[0].slug}/${sec.id}`} className={styles.seccionCard}>
              <InsigniaSeccion id={sec.id} />
              <p>{sec.descripcion}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.seccion}>
        <h2>Dónde</h2>
        <div className={styles.salas}>
          {salas.map(sala => (
            <div key={sala.id} className={styles.sala}>
              <h3>{sala.nombre}</h3>
              <p>{sala.direccion}</p>
              {sala.aireLibre && <p style={{ fontSize: 'var(--texto-s)', color: 'var(--color-acento)' }}>Al aire libre · Entrada gratis</p>}
            </div>
          ))}
        </div>
      </section>

      <section className={styles.seccion}>
        <h2>Entradas</h2>
        <p>General: $4.000 CLP · Terraza Faro: Gratis</p>
        <p style={{ color: 'var(--color-niebla)', fontSize: 'var(--texto-s)' }}>Venta sólo en boletería de cada sala desde una hora antes de cada función. No hay venta en línea.</p>
      </section>

      <section className={styles.seccion}>
        <h2>Contacto</h2>
        <p>
          <a href={`mailto:${festival.contacto.correo}`}>{festival.contacto.correo}</a>
          {' · '}
          {festival.contacto.instagram}
        </p>
      </section>
    </div>
  );
}
