import Link from 'next/link';
import ContadorItinerario from './ContadorItinerario';
import styles from './NavPrincipal.module.css';

export default function NavPrincipal() {
  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.link}>Portada</Link>
      <Link href="/programa" className={styles.link}>Programa</Link>
      <Link href="/itinerario" className={styles.link}>Mi itinerario (<ContadorItinerario />)</Link>
    </nav>
  );
}
