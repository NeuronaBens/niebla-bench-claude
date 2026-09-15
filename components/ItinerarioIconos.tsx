import type { SVGProps } from "react";
import type { TipoAviso } from "@/lib/itinerario";

/** Iconos SVG de trazo simple para el itinerario. Todos son decorativos (aria-hidden). */

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 20 20",
  width: 20,
  height: 20,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

/** Dos bloques superpuestos: choque. */
export function IconoChoque() {
  return (
    <svg {...base}>
      <rect x="3" y="3" width="9" height="9" rx="1.5" />
      <rect x="8" y="8" width="9" height="9" rx="1.5" />
    </svg>
  );
}

/** Persona caminando: traslado. */
export function IconoCaminar() {
  return (
    <svg {...base}>
      <circle cx="11" cy="3.5" r="1.7" />
      <path d="M10.5 6.5 8.5 11l-2.5 6M8.5 11l3.5 2 1.5 4.5M9 8.5 6 10.5M12.5 8l2.5 3" />
    </svg>
  );
}

/** Burbuja de conversación: conversatorio. */
export function IconoConversatorio() {
  return (
    <svg {...base}>
      <path d="M4 3.5h12a1.5 1.5 0 0 1 1.5 1.5v6.5a1.5 1.5 0 0 1-1.5 1.5H9.5L6 16.5V13H4a1.5 1.5 0 0 1-1.5-1.5V5A1.5 1.5 0 0 1 4 3.5z" />
      <path d="M6.5 8h7" />
    </svg>
  );
}

/** Marcador de lugar: misma sala. */
export function IconoSala() {
  return (
    <svg {...base}>
      <path d="M10 17.5s-5.5-5-5.5-9a5.5 5.5 0 0 1 11 0c0 4-5.5 9-5.5 9z" />
      <circle cx="10" cy="8.5" r="1.8" />
    </svg>
  );
}

/** Check dentro de un círculo: elegida. */
export function IconoElegida() {
  return (
    <svg {...base}>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M6.5 10.3l2.4 2.4L13.5 8" />
    </svg>
  );
}

/** Signo de alerta: avisos. */
export function IconoAlerta() {
  return (
    <svg {...base}>
      <path d="M10 3 2.8 15.5h14.4L10 3z" />
      <path d="M10 8v3.5M10 13.6v.2" />
    </svg>
  );
}

/** Caja con tapa: se guarda acá. */
export function IconoGuardar() {
  return (
    <svg {...base}>
      <rect x="3" y="4" width="14" height="12" rx="1.5" />
      <path d="M3 8h14M7 11.5h6" />
    </svg>
  );
}

/** Eslabones: link para compartir. */
export function IconoLink() {
  return (
    <svg {...base}>
      <path d="M8.5 11.5 11.5 8.5M7 13l-1.5 1.5a2.5 2.5 0 0 1-3.5-3.5L5.5 7.5a2.5 2.5 0 0 1 3.5 0M13 7l1.5-1.5a2.5 2.5 0 0 1 3.5 3.5L14.5 12.5a2.5 2.5 0 0 1-3.5 0" />
    </svg>
  );
}

/** Flecha hacia arriba desde una bandeja: compartir. */
export function IconoCompartir() {
  return (
    <svg {...base}>
      <path d="M10 12V3M6.5 6.5 10 3l3.5 3.5M4 11v4.5A1.5 1.5 0 0 0 5.5 17h9a1.5 1.5 0 0 0 1.5-1.5V11" />
    </svg>
  );
}

/** Cruz: vaciar. */
export function IconoCruz() {
  return (
    <svg {...base}>
      <path d="M5.5 5.5l9 9M14.5 5.5l-9 9" />
    </svg>
  );
}

export function IconoAviso({ tipo }: { tipo: TipoAviso }) {
  switch (tipo) {
    case "choque":
      return <IconoChoque />;
    case "traslado":
      return <IconoCaminar />;
    case "conversatorio":
      return <IconoConversatorio />;
  }
}
