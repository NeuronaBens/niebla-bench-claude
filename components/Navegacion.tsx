"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useItinerario } from "@/lib/useItinerario";
import Marca from "./Marca";
import s from "./Navegacion.module.css";

const ENLACES = [
  { href: "/", texto: "Inicio", icono: "inicio" },
  { href: "/programa", texto: "Programa", icono: "programa" },
  { href: "/itinerario", texto: "Mi itinerario", icono: "itinerario" },
] as const;

function Icono({ tipo }: { tipo: (typeof ENLACES)[number]["icono"] }) {
  if (tipo === "inicio") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M12 5v15M9 20h6M10 5h4l1 3H9z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M14.5 6.5 21 4M14.5 6.5 21 9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
      </svg>
    );
  }
  if (tipo === "programa") {
    return (
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <rect x="3.5" y="5" width="17" height="15" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3.5 9.5h17M8 3v4M16 3v4M7 13h4M7 16.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
      <path
        d="M4 7a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 0-2 2H6a2 2 0 0 0-2-2v-3a2 2 0 0 0 0-4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M10 5v14" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2 2" />
    </svg>
  );
}

export default function Navegacion() {
  const ruta = usePathname();
  const { ids } = useItinerario();
  const total = ids.length;

  const activo = (href: string) => (href === "/" ? ruta === "/" : ruta.startsWith(href));

  return (
    <>
      <header className={s.cabecera}>
        <div className={`contenedor ${s.fila}`}>
          <Link href="/" className={s.marca} aria-label="Festival de Cine Niebla, inicio">
            <Marca />
          </Link>
          <nav aria-label="Principal" className={s.escritorio}>
            {ENLACES.slice(1).map((e) => (
              <Link
                key={e.href}
                href={e.href}
                className={s.enlace}
                aria-current={activo(e.href) ? "page" : undefined}
              >
                {e.texto}
                {e.icono === "itinerario" && total > 0 && (
                  <span key={total} className={s.contador} aria-label={`${total} funciones`}>
                    {total}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <p className={s.fechas}>
            <span className="num">15·16·17</span> oct
          </p>
        </div>
      </header>

      <nav aria-label="Principal" className={s.movil}>
        {ENLACES.map((e) => (
          <Link
            key={e.href}
            href={e.href}
            className={s.tab}
            aria-current={activo(e.href) ? "page" : undefined}
          >
            <span className={s.tabIcono}>
              <Icono tipo={e.icono} />
              {e.icono === "itinerario" && total > 0 && (
                <span key={total} className={s.contadorMovil}>
                  {total}
                </span>
              )}
            </span>
            <span>{e.icono === "itinerario" ? "Itinerario" : e.texto}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
