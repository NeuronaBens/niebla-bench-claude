import type { ReactNode, SVGProps } from 'react'

// Un ícono por función, SVG 24×24, trazo `currentColor`, sin relleno salvo
// que se indique, extremos redondeados. Siempre `aria-hidden`: el texto que
// acompaña al ícono es el que lleva el significado.

type PropsIcono = SVGProps<SVGSVGElement>

function base(props: PropsIcono, contenido: ReactNode) {
  const { className } = props
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {contenido}
    </svg>
  )
}

export function IconoAgregar(props: PropsIcono) {
  return base(
    props,
    <>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </>
  )
}

export function IconoMarcada(props: PropsIcono) {
  return base(props, <polyline points="4,13 9,18 20,6" />)
}

export function IconoChoque(props: PropsIcono) {
  return base(
    props,
    <>
      <line x1="3" y1="6" x2="14" y2="14" />
      <line x1="3" y1="14" x2="14" y2="6" />
      <line x1="14" y1="10" x2="21" y2="10" />
    </>
  )
}

export function IconoCaminar(props: PropsIcono) {
  return base(
    props,
    <>
      <ellipse cx="8" cy="6" rx="2" ry="2.6" transform="rotate(-18 8 6)" />
      <ellipse cx="16" cy="12" rx="2" ry="2.6" transform="rotate(18 16 12)" />
      <ellipse cx="7" cy="15" rx="2" ry="2.6" transform="rotate(-18 7 15)" />
      <ellipse cx="15" cy="20.5" rx="2" ry="2.6" transform="rotate(18 15 20.5)" />
    </>
  )
}

export function IconoConversatorio(props: PropsIcono) {
  return base(
    props,
    <>
      <path d="M3 5h10v7H8l-3 3v-3H3z" />
      <path d="M13 9h8v6h-2v3l-3-3h-3" />
    </>
  )
}

export function IconoAgotada(props: PropsIcono) {
  return base(
    props,
    <>
      <path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 6v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-6z" />
      <line x1="7" y1="5" x2="17" y2="19" />
    </>
  )
}

export function IconoAireLibre(props: PropsIcono) {
  return base(
    props,
    <>
      <path d="M14 4a5 5 0 0 0-4.9 4H9a4 4 0 0 0 0 8" />
      <path d="M4 15a3.5 3.5 0 0 1 1.2-6.8" />
      <path d="M6 18h13a3.5 3.5 0 0 0 .4-6.98" />
    </>
  )
}

export function IconoNota(props: PropsIcono) {
  return base(
    props,
    <>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="4.4" y1="7" x2="19.6" y2="17" />
      <line x1="19.6" y1="7" x2="4.4" y2="17" />
    </>
  )
}

export function IconoCompartir(props: PropsIcono) {
  return base(
    props,
    <>
      <circle cx="18" cy="5" r="2.4" />
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="18" cy="19" r="2.4" />
      <line x1="8.1" y1="10.8" x2="15.9" y2="6.2" />
      <line x1="8.1" y1="13.2" x2="15.9" y2="17.8" />
    </>
  )
}

export function IconoCopiar(props: PropsIcono) {
  return base(
    props,
    <>
      <rect x="9" y="9" width="11" height="11" rx="1.5" />
      <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
    </>
  )
}

export function IconoDeshacer(props: PropsIcono) {
  return base(
    props,
    <>
      <polyline points="7,4 3,9 8,14" />
      <path d="M3 9h11a6 6 0 0 1 0 12H9" />
    </>
  )
}

export function IconoQuitar(props: PropsIcono) {
  return base(
    props,
    <>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </>
  )
}

export function IconoFlechaIzq(props: PropsIcono) {
  return base(
    props,
    <>
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="11,6 5,12 11,18" />
    </>
  )
}

export function IconoPrograma(props: PropsIcono) {
  return base(
    props,
    <>
      <rect x="3.5" y="4.5" width="17" height="16" rx="1.5" />
      <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
      <line x1="7" y1="2.5" x2="7" y2="6.5" />
      <line x1="17" y1="2.5" x2="17" y2="6.5" />
    </>
  )
}

export function IconoPortada(props: PropsIcono) {
  return base(
    props,
    <>
      <path d="M10 4h4l1.5 15h-7z" />
      <line x1="9.5" y1="9" x2="14.5" y2="9" />
      <line x1="8" y1="19" x2="16" y2="19" />
      <circle cx="12" cy="6" r="1" fill="currentColor" stroke="none" />
    </>
  )
}

export function IconoItinerario(props: PropsIcono) {
  return base(
    props,
    <>
      <circle cx="5" cy="18" r="2" />
      <circle cx="19" cy="6" r="2" />
      <line x1="7" y1="17" x2="17" y2="7" strokeDasharray="2 3" />
    </>
  )
}
