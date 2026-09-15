"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useItinerario } from "@/lib/itinerario-store";
import styles from "./Cabecera.module.css";

function Marca() {
  return (
    <svg viewBox="0 0 36 36" width="30" height="30" aria-hidden="true" className={styles.marca}>
      <circle cx="18" cy="18" r="17" fill="currentColor" opacity="0.08" />
      <path
        d="M4 22c4-3 8-3 12 0s8 3 12 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M6 27c4-3 8-3 12 0s8 3 12 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <circle cx="24" cy="12" r="4" fill="currentColor" />
    </svg>
  );
}

const enlaces = [
  { href: "/", texto: "Inicio", icono: IconoInicio },
  { href: "/programa", texto: "Programa", icono: IconoPrograma },
  { href: "/itinerario", texto: "Mi itinerario", icono: IconoItinerario },
] as const;

export function Cabecera() {
  const ruta = usePathname();
  const { ids, cargado } = useItinerario();
  const enPortada = ruta === "/";

  return (
    <>
      <a href="#contenido" className={styles.saltar}>
        Ir al contenido
      </a>
      <header className={`${styles.cabecera} ${enPortada ? styles.sobreNoche : ""}`}>
        <div className={`contenedor ${styles.fila}`}>
          <Link href="/" className={styles.logo} aria-label="Festival de Cine Niebla, inicio">
            <Marca />
            <span className={styles.logoTexto}>
              Niebla <span className={styles.logoEdicion}>3ª edición</span>
            </span>
          </Link>
          <nav className={styles.nav} aria-label="Principal">
            {enlaces.map(({ href, texto, icono: Icono }) => {
              const activo = href === "/" ? ruta === "/" : ruta.startsWith(href);
              const esItinerario = href === "/itinerario";
              return (
                <Link
                  key={href}
                  href={href}
                  className={`${styles.enlace} ${activo ? styles.activo : ""}`}
                  aria-current={activo ? "page" : undefined}
                >
                  <Icono />
                  <span>{texto}</span>
                  {esItinerario && cargado && ids.length > 0 && (
                    <span className={styles.contador} aria-label={`${ids.length} funciones elegidas`}>
                      {ids.length}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
}

function IconoInicio() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M5.5 10.5V20h13v-9.5" />
    </svg>
  );
}

function IconoPrograma() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}

function IconoItinerario() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="M8.5 6H14a3 3 0 0 1 0 6h-4a3 3 0 0 0 0 6h5.5" />
    </svg>
  );
}
