import type { SalaId } from '@/lib/tipos'

interface Props {
  salaId: SalaId | string
  className?: string
}

/**
 * Cada sala se distingue por forma, nunca por color (el color es de las
 * secciones). SVG 20×20, trazo 2px, `currentColor`, `aria-hidden`.
 */
export default function GlifoSala({ salaId, className }: Props) {
  const comun = {
    viewBox: '0 0 20 20',
    width: 20,
    height: 20,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    className,
  }

  if (salaId === 'teatro') {
    return (
      <svg {...comun}>
        <path d="M4 17V9a6 6 0 0 1 12 0v8" />
        <line x1="2.5" y1="17" x2="17.5" y2="17" />
      </svg>
    )
  }
  if (salaId === 'muelle') {
    return (
      <svg {...comun}>
        <line x1="2" y1="8" x2="18" y2="8" />
        <line x1="5" y1="8" x2="5" y2="17" />
        <line x1="10" y1="8" x2="10" y2="17" />
        <line x1="15" y1="8" x2="15" y2="17" />
      </svg>
    )
  }
  if (salaId === 'galpon') {
    return (
      <svg {...comun}>
        <path d="M2.5 9 10 3l7.5 6" />
        <path d="M3.5 9v8h13V9" />
        <rect x="8.5" y="12" width="3" height="5" />
      </svg>
    )
  }
  if (salaId === 'terraza') {
    return (
      <svg {...comun}>
        <path d="M8.5 3h3l1.3 12h-5.6z" />
        <line x1="8" y1="6.6" x2="12" y2="6.6" />
        <line x1="6.5" y1="17" x2="13.5" y2="17" />
        <line x1="13.6" y1="6" x2="17" y2="4.5" />
        <line x1="13.6" y1="8.4" x2="17" y2="9" />
      </svg>
    )
  }
  return (
    <svg {...comun}>
      <circle cx="10" cy="10" r="7" />
    </svg>
  )
}
