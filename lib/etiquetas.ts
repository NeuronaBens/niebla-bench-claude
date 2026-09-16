import type { Clasificacion, Estreno } from './tipos'

export const ETIQUETA_ESTRENO: Record<Estreno, string> = {
  mundial: 'Estreno mundial',
  nacional: 'Estreno nacional',
  latinoamericano: 'Estreno latinoamericano',
}

export const ETIQUETA_CLASIFICACION: Record<Clasificacion, string> = {
  TE: 'Todo espectador',
  '+14': '+14',
  '+18': '+18',
}

/** Solo para `aria-label` / `title`, no se muestra como texto principal. */
export const DESCRIPCION_CLASIFICACION: Record<Clasificacion, string> = {
  TE: 'Apta para todo espectador',
  '+14': 'Para mayores de 14 años',
  '+18': 'Para mayores de 18 años',
}

export function instagramUrl(handle: string): string {
  return `https://www.instagram.com/${handle.replace(/^@/, '')}`
}
