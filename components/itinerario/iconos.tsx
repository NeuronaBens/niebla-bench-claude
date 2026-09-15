/**
 * Íconos SVG del itinerario (trazo, heredan currentColor). Siempre acompañan a un
 * texto: nunca comunican un estado solo con color o solo con ícono.
 */
import type { ReactNode, SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { tamano?: number };

function Base({ tamano = 18, children, ...rest }: P & { children: ReactNode }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Dos boletos cruzados: se topan. */
export function IconoChoque(p: P) {
  return (
    <Base {...p}>
      <path d="M4 7h9l-2 5 2 5H4z" />
      <path d="M20 7h-4l2 5-2 5h4" />
      <path d="M12.5 3.5l-1 2M12.5 20.5l-1-2" />
    </Base>
  );
}

/** Persona caminando. */
export function IconoCaminar(p: P) {
  return (
    <Base {...p}>
      <circle cx="13" cy="4" r="1.8" />
      <path d="M10 21l2-6 3 3v3" />
      <path d="M12 15l-1-5 4 1 2 3" />
      <path d="M11 10l-3 2-1 3" />
    </Base>
  );
}

/** Reloj con alerta: no alcanza. */
export function IconoNoAlcanza(p: P) {
  return (
    <Base {...p}>
      <circle cx="11" cy="13" r="7.5" />
      <path d="M11 9v4l2.5 2" />
      <path d="M9 2.5h4" />
      <path d="M20.5 6.5l-2 2" />
    </Base>
  );
}

/** Globo de diálogo: conversatorio. */
export function IconoConversatorio(p: P) {
  return (
    <Base {...p}>
      <path d="M4 5h16v10H10l-4 4v-4H4z" />
      <path d="M8 9h8M8 12h5" />
    </Base>
  );
}

/** Boleto tachado: agotada. */
export function IconoAgotada(p: P) {
  return (
    <Base {...p}>
      <path d="M3 8a2 2 0 0 0 0 4v4h18v-4a2 2 0 0 1 0-4V4H3z" transform="translate(0 2)" />
      <path d="M5 19L19 5" />
    </Base>
  );
}

/** Luna sobre horizonte: al aire libre. */
export function IconoAireLibre(p: P) {
  return (
    <Base {...p}>
      <path d="M15 3a6 6 0 1 0 6 8 5 5 0 0 1-6-8z" />
      <path d="M2 20h20M5 17h6" />
    </Base>
  );
}

/** Nota / aviso de la organización. */
export function IconoNota(p: P) {
  return (
    <Base {...p}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6M12 7.5v.01" />
    </Base>
  );
}

export function IconoCheck(p: P) {
  return (
    <Base {...p}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </Base>
  );
}

export function IconoMas(p: P) {
  return (
    <Base {...p}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  );
}

export function IconoCerrar(p: P) {
  return (
    <Base {...p}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Base>
  );
}

export function IconoCompartir(p: P) {
  return (
    <Base {...p}>
      <circle cx="18" cy="5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="19" r="2.5" />
      <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
    </Base>
  );
}

export function IconoCopiar(p: P) {
  return (
    <Base {...p}>
      <rect x="8" y="8" width="12" height="12" rx="1.5" />
      <path d="M16 8V4H4v12h4" />
    </Base>
  );
}

export function IconoFlecha(p: P) {
  return (
    <Base {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Base>
  );
}

export function IconoDeshacer(p: P) {
  return (
    <Base {...p}>
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
    </Base>
  );
}

/** Ancla: la misma sala, sin moverse. */
export function IconoAncla(p: P) {
  return (
    <Base {...p}>
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v14M8 11h8" />
      <path d="M4 14a8 8 0 0 0 16 0" />
    </Base>
  );
}
