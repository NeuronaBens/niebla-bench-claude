export type NombreIcono =
  | 'faro'
  | 'programa'
  | 'ruta'
  | 'inicio'
  | 'mas'
  | 'check'
  | 'quitar'
  | 'pasos'
  | 'tope'
  | 'conversatorio'
  | 'luna'
  | 'lluvia'
  | 'agotada'
  | 'compartir'
  | 'copiar'
  | 'flecha-izq'
  | 'flecha-der'
  | 'ubicacion'
  | 'entrada'
  | 'correo'
  | 'instagram'
  | 'deshacer'

const TRAZO = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }

function Trazos({ nombre }: { nombre: NombreIcono }) {
  switch (nombre) {
    case 'faro':
      return (
        <>
          <path d="M10 21h4" {...TRAZO} />
          <path d="M9 17h6l-1-9H10z" {...TRAZO} />
          <path d="M9.5 8h5" {...TRAZO} />
          <path d="M12 3v2" {...TRAZO} />
          <path d="M9 5l1.5 3M15 5l-1.5 3" {...TRAZO} />
        </>
      )
    case 'programa':
      return (
        <>
          <rect x="5" y="3" width="14" height="18" rx="1" {...TRAZO} />
          <path d="M8 8h8M8 12h8M8 16h5" {...TRAZO} />
        </>
      )
    case 'ruta':
      return (
        <>
          <circle cx="6" cy="7" r="2" {...TRAZO} />
          <circle cx="18" cy="17" r="2" {...TRAZO} />
          <path d="M8 8l3 3M13 13l3 3" strokeDasharray="2 3" {...TRAZO} />
        </>
      )
    case 'inicio':
      return (
        <>
          <path d="M4 11l8-6 8 6" {...TRAZO} />
          <path d="M6 10v9h12v-9" {...TRAZO} />
        </>
      )
    case 'mas':
      return <path d="M12 5v14M5 12h14" {...TRAZO} />
    case 'check':
      return <path d="M4 12.5l5 5L20 6.5" {...TRAZO} />
    case 'quitar':
      return <path d="M6 6l12 12M18 6L6 18" {...TRAZO} />
    case 'pasos':
      return (
        <>
          <ellipse cx="8" cy="8" rx="2" ry="3" transform="rotate(-20 8 8)" {...TRAZO} />
          <ellipse cx="16" cy="16" rx="2" ry="3" transform="rotate(-20 16 16)" {...TRAZO} />
        </>
      )
    case 'tope':
      return (
        <>
          <path d="M12 4l9 16H3z" {...TRAZO} />
          <path d="M12 10v4M12 17v.01" {...TRAZO} />
        </>
      )
    case 'conversatorio':
      return (
        <>
          <path d="M4 6h9v6H8l-3 3v-3H4z" {...TRAZO} />
          <path d="M12 11h8v5h-2v3l-3-3h-3z" {...TRAZO} />
        </>
      )
    case 'luna':
      return <path d="M16 4a8 8 0 100 16 7 7 0 01-7-8 7 7 0 017-8z" {...TRAZO} />
    case 'lluvia':
      return (
        <>
          <path d="M6 12a4 4 0 010-8 5 5 0 019.5-1A4.5 4.5 0 0118 12H6z" {...TRAZO} />
          <path d="M8 16l-1 3M12 16l-1 3M16 16l-1 3" {...TRAZO} />
        </>
      )
    case 'agotada':
      return (
        <>
          <circle cx="12" cy="12" r="8" {...TRAZO} />
          <path d="M7 7l10 10" {...TRAZO} />
        </>
      )
    case 'compartir':
      return (
        <>
          <path d="M13 3h6v6" {...TRAZO} />
          <path d="M10 14L19 5" {...TRAZO} />
          <path d="M18 13v6H5V6h6" {...TRAZO} />
        </>
      )
    case 'copiar':
      return (
        <>
          <rect x="8" y="8" width="11" height="12" rx="1" {...TRAZO} />
          <path d="M5 15V5a1 1 0 011-1h9" {...TRAZO} />
        </>
      )
    case 'flecha-izq':
      return <path d="M14 5l-7 7 7 7" {...TRAZO} />
    case 'flecha-der':
      return <path d="M10 5l7 7-7 7" {...TRAZO} />
    case 'ubicacion':
      return (
        <>
          <path d="M12 21s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z" {...TRAZO} />
          <circle cx="12" cy="9" r="2.25" {...TRAZO} />
        </>
      )
    case 'entrada':
      return (
        <>
          <path d="M4 9a2 2 0 000 4v3a1 1 0 001 1h14a1 1 0 001-1v-3a2 2 0 000-4V6a1 1 0 00-1-1H5a1 1 0 00-1 1z" {...TRAZO} />
          <path d="M14 5v14" strokeDasharray="2 3" {...TRAZO} />
        </>
      )
    case 'correo':
      return (
        <>
          <rect x="3" y="5" width="18" height="14" rx="1" {...TRAZO} />
          <path d="M3.5 6.5L12 13l8.5-6.5" {...TRAZO} />
        </>
      )
    case 'instagram':
      return (
        <>
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" {...TRAZO} />
          <circle cx="12" cy="12" r="4.25" {...TRAZO} />
          <circle cx="17" cy="7" r="0.75" fill="currentColor" stroke="none" />
        </>
      )
    case 'deshacer':
      return (
        <>
          <path d="M6 9H5V4" {...TRAZO} />
          <path d="M5.5 9A8 8 0 1113 20" {...TRAZO} />
        </>
      )
  }
}

export function Icono({ nombre, tamano = 24 }: { nombre: NombreIcono; tamano?: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <Trazos nombre={nombre} />
    </svg>
  )
}
