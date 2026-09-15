// Tipos del dominio del Festival de Cine Niebla.
// Los tipos "Crudo" son un espejo exacto de data/programa.json.

export type SeccionId = 'competencia' | 'panorama' | 'nocturna' | 'costa'
export type SalaId = 'teatro' | 'muelle' | 'galpon' | 'terraza'
export type Clasificacion = 'TE' | '+14' | '+18'
export type Estreno = 'mundial' | 'latinoamericano' | 'nacional'

export interface FestivalCrudo {
  nombre: string
  edicion: number
  ciudad: string
  region: string
  fechaInicio: string // YYYY-MM-DD
  fechaFin: string // YYYY-MM-DD
  zonaHoraria: string
  entradas: { moneda: string; general: number; aireLibre: number; venta: string }
  contacto: { correo: string; instagram: string }
}

export interface Sala {
  id: SalaId
  nombre: string
  direccion: string
  capacidad: number
  aireLibre: boolean
  nota?: string
}

export interface Seccion {
  id: SeccionId
  nombre: string
  descripcion: string
}

export interface Pelicula {
  id: string
  titulo: string
  tituloOriginal?: string
  direccion: string
  pais: string
  anio: number
  duracionMin: number
  seccion: SeccionId
  clasificacion: Clasificacion
  estreno: Estreno
  sinopsis: string
}

export interface FuncionCruda {
  id: string
  peliculaId: string
  salaId: SalaId
  inicio: string // YYYY-MM-DDTHH:mm, hora de pared en Chile
  conversatorioMin?: number
  agotada?: boolean
  nota?: string
}

export type TrasladosMin = { descripcion: string } & Record<SalaId, Record<SalaId, number>>

export interface ProgramaCrudo {
  festival: FestivalCrudo
  salas: Sala[]
  trasladosMin: TrasladosMin
  secciones: Seccion[]
  peliculas: Pelicula[]
  funciones: FuncionCruda[]
}

// --- Tipos derivados ---

export type Minutos = number // minutos absolutos "de pared", ver lib/tiempo.ts

export type DiaSlug = 'jueves' | 'viernes' | 'sabado'

export interface DiaFestival {
  slug: DiaSlug
  fecha: string // YYYY-MM-DD
  nombre: string // "jueves"
  numero: number // 15
  mes: string // "octubre"
  corto: string // "Jue 15"
  largo: string // "jueves 15 de octubre"
}

export interface Funcion {
  id: string
  pelicula: Pelicula
  sala: Sala
  seccion: Seccion
  inicio: Minutos
  fin: Minutos
  finConversatorio: Minutos | null
  conversatorioMin: number
  agotada: boolean
  nota: string | null
  dia: DiaFestival
  cruzaMedianoche: boolean
  precio: number
}

export type TipoAviso = 'tope' | 'noAlcanza' | 'conversatorio' | 'agotada' | 'peliculaRepetida' | 'lluvia'
export type Gravedad = 'problema' | 'informativo'

export type Aviso =
  | { tipo: 'tope'; gravedad: 'problema'; a: string; b: string; solapeMin: number }
  | {
      tipo: 'noAlcanza'
      gravedad: 'problema'
      a: string
      b: string
      margenMin: number
      trasladoMin: number
      faltanMin: number
    }
  | {
      tipo: 'conversatorio'
      gravedad: 'informativo'
      a: string
      b: string
      margenMin: number
      trasladoMin: number
      conversatorioMin: number
      salidaMax: Minutos
      minutosDeConversatorio: number
    }
  | { tipo: 'agotada'; gravedad: 'informativo'; funcion: string }
  | { tipo: 'peliculaRepetida'; gravedad: 'informativo'; peliculaId: string; funciones: string[] }
  | {
      tipo: 'lluvia'
      gravedad: 'informativo'
      a: string
      b: string
      trasladoNormal: number
      trasladoConLluvia: number
      alcanzaNormal: boolean
      alcanzaConLluvia: boolean
    }

export interface Tramo {
  a: string
  b: string
  margenMin: number
  trasladoMin: number
  mismaSala: boolean
  aviso: Aviso | null
}

export interface ResultadoItinerario {
  funciones: Funcion[]
  avisos: Aviso[]
  tramos: Tramo[]
  problemas: number
  avisosPorFuncion: Record<string, Aviso[]>
}

export interface FiltrosPrograma {
  dia: DiaSlug | null
  seccion: SeccionId | null
}

export interface EnlaceDecodificado {
  ids: string[]
  invalidos: number
  nombre: string | null
  malFormado: boolean
}

export interface EstadoItinerario {
  ids: string[]
  persistente: boolean
}
