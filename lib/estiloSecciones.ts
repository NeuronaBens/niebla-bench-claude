// Color, nombre corto y motivo gráfico por sección. Fuente para las variables CSS
// `--sec-<id>` y `--sec-<id>-papel` que declara `app/globals.css`.
import type { SeccionId } from './tipos'

export type MotivoSeccion = 'competencia' | 'panorama' | 'nocturna' | 'costa'

export interface EstiloSeccion {
  id: SeccionId
  nombreCorto: string
  colorTinta: string
  colorPapel: string
  motivo: MotivoSeccion
  varTinta: string
  varPapel: string
}

export const ESTILOS_SECCION: Record<SeccionId, EstiloSeccion> = {
  competencia: {
    id: 'competencia',
    nombreCorto: 'Competencia',
    colorTinta: '#FF8A3D',
    colorPapel: '#9E3F00',
    motivo: 'competencia',
    varTinta: 'var(--sec-competencia)',
    varPapel: 'var(--sec-competencia-papel)',
  },
  panorama: {
    id: 'panorama',
    nombreCorto: 'Panorama',
    colorTinta: '#7CC4F0',
    colorPapel: '#1C5A85',
    motivo: 'panorama',
    varTinta: 'var(--sec-panorama)',
    varPapel: 'var(--sec-panorama-papel)',
  },
  nocturna: {
    id: 'nocturna',
    nombreCorto: 'Nocturna',
    colorTinta: '#FF5C7A',
    colorPapel: '#A31D3C',
    motivo: 'nocturna',
    varTinta: 'var(--sec-nocturna)',
    varPapel: 'var(--sec-nocturna-papel)',
  },
  costa: {
    id: 'costa',
    nombreCorto: 'Costa',
    colorTinta: '#6BD4A8',
    colorPapel: '#1E6E4E',
    motivo: 'costa',
    varTinta: 'var(--sec-costa)',
    varPapel: 'var(--sec-costa-papel)',
  },
}

export function estiloDeSeccion(id: SeccionId): EstiloSeccion {
  return ESTILOS_SECCION[id]
}
