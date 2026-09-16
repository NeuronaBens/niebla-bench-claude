import Link from 'next/link';
import { getSecciones } from '@/lib/datos';
import styles from './SelectorSeccion.module.css';

interface Props {
  diaSlug: string;
  seccionActual?: string;
}

export default function SelectorSeccion({ diaSlug, seccionActual }: Props) {
  const secciones = getSecciones();

  return (
    <nav className={styles.selector}>
      <Link
        href={`/programa/${diaSlug}`}
        className={`${styles.link} ${!seccionActual ? styles.activa : ''}`}
        aria-current={!seccionActual ? 'page' : undefined}
      >
        Todas
      </Link>
      {secciones.map(sec => {
        const href = `/programa/${diaSlug}/${sec.id}`;
        const activa = sec.id === seccionActual;

        return (
          <Link
            key={sec.id}
            href={href}
            className={`${styles.link} ${activa ? styles.activa : ''}`}
            aria-current={activa ? 'page' : undefined}
          >
            {sec.nombre}
          </Link>
        );
      })}
    </nav>
  );
}
