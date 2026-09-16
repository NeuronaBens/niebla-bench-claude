'use client';

import Link from 'next/link';
import { getDiasFestival } from '@/lib/datos';
import styles from './SelectorDia.module.css';

interface Props {
  diaSlugActual?: string;
  seccionActual?: string;
}

export default function SelectorDia({ diaSlugActual, seccionActual }: Props) {
  const dias = getDiasFestival();

  return (
    <nav className={styles.selector}>
      {dias.map(dia => {
        const href = seccionActual
          ? `/programa/${dia.slug}/${seccionActual}`
          : `/programa/${dia.slug}`;
        const activa = dia.slug === diaSlugActual;

        return (
          <Link
            key={dia.slug}
            href={href}
            className={`${styles.link} ${activa ? styles.activa : ''}`}
            aria-current={activa ? 'page' : undefined}
          >
            {dia.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
