import { Aviso } from '@/lib/itinerario-reglas';
import styles from './AvisoInline.module.css';

interface Props {
  aviso: Aviso;
}

export default function AvisoInline({ aviso }: Props) {
  if (aviso.tipo === 'choque') {
    return (
      <div className={`${styles.aviso} ${styles.choque}`}>
        <span className={styles.icono}>▲</span>
        <span>Se topa con «<strong>{aviso.titulo}</strong>» ({aviso.horario})</span>
      </div>
    );
  }

  if (aviso.tipo === 'no-alcanza') {
    return (
      <div className={`${styles.aviso} ${styles.traslado}`}>
        <span className={styles.icono}>⏰</span>
        <span>No alcanzas a llegar a «<strong>{aviso.hacia.pelicula.titulo}</strong>»: faltan {aviso.faltanMin} min (termina {aviso.finPelicula} + {aviso.traslado} min caminando)</span>
      </div>
    );
  }

  if (aviso.tipo === 'conversatorio') {
    const textoTiempo = aviso.minutosQueVeria > 0
      ? `(verías ${aviso.minutosQueVeria} de ${aviso.conversatorioMin} min)`
      : '(te lo perderías completo)';
    return (
      <div className={`${styles.aviso} ${styles.conversatorio}`}>
        <span className={styles.icono}>◯</span>
        <span>Te perderías el conversatorio de «<strong>{aviso.desde.pelicula.titulo}</strong>» por ir a «<strong>{aviso.hacia.pelicula.titulo}</strong>» {textoTiempo}</span>
      </div>
    );
  }

  return null;
}
