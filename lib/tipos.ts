// Tipos del dominio del Festival de Cine Niebla.
// Fuente única de datos: `data/programa.json`, leído y enriquecido en `lib/programa.ts`.

export type SalaId = 'teatro' | 'muelle' | 'galpon' | 'terraza'

export type SeccionId = 'competencia' | 'panorama' | 'nocturna' | 'costa'

export type DiaId = 'jueves' | 'viernes' | 'sabado'

export type Clasificacion = 'TE' | '+14' | '+18'

export type TipoEstreno = 'mundial' | 'latinoamericano' | 'nacional'

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
  estreno: TipoEstreno
  sinopsis: string
}

/** Función tal como viene en `data/programa.json`, sin enriquecer. */
export interface FuncionDatos {
  id: string
  peliculaId: string
  salaId: SalaId
  inicio: string
  conversatorioMin?: number
  agotada?: boolean
  nota?: string
}

/** Función enriquecida con los datos de su película, su sala y el tiempo calculado. */
export interface Funcion {
  id: string
  pelicula: Pelicula
  sala: Sala
  /** Minutos absolutos del festival: días desde `festival.fechaInicio` por 1440, más hora y minuto. */
  inicioMin: number
  terminoMin: number
  /** Día del festival en que empieza la función. */
  dia: DiaId
  horaInicio: string
  horaTermino: string
  /** True si el término cae en un día calendario distinto al de inicio. */
  terminaOtroDia: boolean
  /** Nombre del día calendario en que termina (puede ser "domingo", que no es día de festival). */
  diaTermino: string
  conversatorioMin: number
  agotada: boolean
  nota?: string
  aireLibre: boolean
  precio: number
}

export interface Dia {
  id: DiaId
  fecha: string
  nombreLargo: string
  nombreCorto: string
  numero: number
  mes: string
}

export type Traslados = Record<SalaId, Record<SalaId, number>>

export interface Entradas {
  moneda: string
  general: number
  aireLibre: number
  venta: string
}

export interface Contacto {
  correo: string
  instagram: string
}

export interface Festival {
  nombre: string
  edicion: number
  ciudad: string
  region: string
  fechaInicio: string
  fechaFin: string
  zonaHoraria: string
  entradas: Entradas
  contacto: Contacto
}
