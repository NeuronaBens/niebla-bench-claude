"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useItinerario } from "@/lib/useItinerario";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();
  const { ids, listo } = useItinerario();

  const esActivo = (ruta: string): boolean => {
    return pathname === ruta;
  };

  return (
    <header className={styles.header}>
      <div className={styles.contenedor}>
        <div className={styles.logo}>
          <Link href="/">Festival Niebla</Link>
        </div>

        <nav className={styles.nav}>
          <Link
            href="/programa"
            className={`${styles.navLink} ${esActivo("/programa") ? styles.activo : ""}`}
          >
            Programa
          </Link>

          <Link
            href="/itinerario"
            className={`${styles.navLink} ${esActivo("/itinerario") ? styles.activo : ""}`}
          >
            Mi itinerario
            {listo && ids.length > 0 && <span className={styles.contador}>{ids.length}</span>}
          </Link>
        </nav>
      </div>
    </header>
  );
}
