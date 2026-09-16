import { getFestival } from '@/lib/datos';
import styles from './Pie.module.css';

export default function Pie() {
  const festival = getFestival();

  return (
    <footer className={styles.pie}>
      <a href={`mailto:${festival.contacto.correo}`}>{festival.contacto.correo}</a>
      <span>{festival.contacto.instagram}</span>
    </footer>
  );
}
