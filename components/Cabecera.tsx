"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useItinerario } from "@/lib/almacen";
import styles from "./Cabecera.module.css";

function HazDeFaro() {
  return (
    <svg className={styles.haz} viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path d="M8 12 L24 4 L24 20 Z" fill="var(--faro)" opacity="0.28" />
      <path d="M8 12 L24 8 L24 16 Z" fill="var(--faro)" opacity="0.5" />
      <rect x="4.5" y="10" width="4.5" height="10" rx="1" fill="currentColor" />
      <rect x="3.5" y="19" width="6.5" height="1.6" rx="0.8" fill="currentColor" opacity="0.7" />
      <circle cx="6.75" cy="11.6" r="1.9" fill="var(--faro)" />
    </svg>
  );
}

export default function Cabecera() {
  const pathname = usePathname();
  const { ids, listo } = useItinerario();
  const elegidas = listo ? ids.length : 0;

  const activo = (ruta: string) => (ruta === "/" ? pathname === "/" : pathname.startsWith(ruta));

  return (
    <header className={styles.cabecera}>
      <div className={`contenedor ${styles.fila}`}>
        <Link href="/" className={styles.logo} aria-label="Festival de Cine Niebla, portada">
          <HazDeFaro />
          <span className={styles.marca}>Niebla</span>
        </Link>

        <nav className={styles.nav} aria-label="Principal">
          <Link href="/" className={`${styles.enlace} ${styles.enlacePortada}`} aria-current={activo("/") ? "page" : undefined}>
            Portada
          </Link>
          <Link href="/programa" className={styles.enlace} aria-current={activo("/programa") ? "page" : undefined}>
            Programa
          </Link>
          <Link href="/itinerario" className={styles.enlace} aria-current={activo("/itinerario") ? "page" : undefined}>
            Mi itinerario
            {elegidas > 0 && (
              <span className={styles.contador}>
                {elegidas}
                <span className="visually-hidden">
                  {elegidas === 1 ? " función elegida" : " funciones elegidas"}
                </span>
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
