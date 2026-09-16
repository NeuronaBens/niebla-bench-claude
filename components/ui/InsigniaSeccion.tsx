import { getSeccion } from '@/lib/datos';
import styles from './InsigniaSeccion.module.css';

const COLORES: Record<string, string> = {
  competencia: 'var(--color-seccion-competencia)',
  panorama: 'var(--color-seccion-panorama)',
  nocturna: 'var(--color-seccion-nocturna)',
  costa: 'var(--color-seccion-costa)',
};

const TEXTOS: Record<string, string> = {
  competencia: 'var(--color-seccion-competencia-texto)',
  panorama: 'var(--color-seccion-panorama-texto)',
  nocturna: 'var(--color-seccion-nocturna-texto)',
  costa: 'var(--color-seccion-costa-texto)',
};

interface Props {
  id: string;
  como?: 'insignia' | 'borde';
}

export default function InsigniaSeccion({ id, como = 'insignia' }: Props) {
  const sec = getSeccion(id);
  if (!sec) return null;

  if (como === 'borde') {
    return <span style={{ display: 'inline-block', width: '4px', height: '16px', backgroundColor: COLORES[id] || COLORES.competencia }} />;
  }

  return (
    <span
      className={styles.insignia}
      style={{
        borderColor: COLORES[id] || COLORES.competencia,
        color: TEXTOS[id] || TEXTOS.competencia,
      }}
    >
      {sec.nombre}
    </span>
  );
}
