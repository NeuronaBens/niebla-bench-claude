// Tipos del dominio del Festival de Cine Niebla.
// Los tipos "Datos" reflejan el JSON tal cual viene; los demás son derivados
// y son los que usa la interfaz.

export type SalaId = 'teatro' | 'muelle' | 'galpon' | 'terraza'
export type SeccionId = 'competencia' | 'panorama' | 'nocturna' | 'costa'
export type Estreno = 'mundial' | 'nacional' | 'latinoamericano'
export type Clasificacion = 'TE' | '+14' | '+18'

/** Alias documental. Formato validado: `^[a-z0-9]+$`. */
export type FuncionId = string

export interface Festival {
  nombre: string
  edicion: number
  ciudad: string
  region: string
  fechaInicio: string
  fechaFin: string
  zonaHoraria: string
  entradas: {
    moneda: string
    general: number
    aireLibre: number
    venta: string
  }
  contacto: {
    correo: string
    instagram: string
  }
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

export interface FuncionDatos {
  id: FuncionId
  peliculaId: string
  salaId: SalaId
  inicio: string
  conversatorioMin?: number
  nota?: string
  agotada?: boolean
}

export type TrasladosMin = { descripcion: string } & Record<SalaId, Record<SalaId, number>>

export interface Programa {
  festival: Festival
  salas: Sala[]
  trasladosMin: TrasladosMin
  secciones: Seccion[]
  peliculas: Pelicula[]
  funciones: FuncionDatos[]
}

/** Un día del festival, con su eje horario para la grilla y la regla del día. */
export interface DiaFestival {
  /** '2026-10-15' */
  fecha: string
  slug: 'jueves' | 'viernes' | 'sabado' | string
  /** 'Jueves' */
  nombre: string
  /** 15 */
  numero: number
  /** 'Jueves 15' */
  etiqueta: string
  /** 'Jue 15' */
  corta: string
  /** 00:00 de ese día, en minutos flotantes desde el calendario neutro. */
  inicioDiaMin: number
  ejeInicioMin: number
  ejeFinMin: number
}

/** Función enriquecida con los datos de su película, sala, sección y día. */
export interface Funcion extends FuncionDatos {
  pelicula: Pelicula
  sala: Sala
  seccion: Seccion
  dia: DiaFestival
  inicioMin: number
  finMin: number
  finConversatorioMin: number | null
  terminaDiaSiguiente: boolean
  conversatorioTerminaDiaSiguiente: boolean
  agotada: boolean
  aireLibre: boolean
  precio: number
}

// --- Itinerario ---

export type EstadoTramo = 'choque' | 'traslado' | 'conversatorio' | 'holgura'

export interface Tramo {
  desde: Funcion
  hacia: Funcion
  estado: EstadoTramo
  mismoDia: boolean
  trasladoMin: number
  /** = desde.finMin */
  salidaMin: number
  /** finMin + traslado */
  llegadaMin: number
  /** max(0, llegada − hacia.inicio) */
  atrasoMin: number
  /** hacia.inicio − (finConversatorio ?? fin); puede ser negativo */
  disponibleMin: number
  /** disponible − traslado */
  sobraMin: number
  conversatorioVistoMin: number | null
  /** hacia.inicio − traslado */
  salidaMaximaMin: number
}

export interface Choque {
  a: Funcion
  b: Funcion
  /** min(a.fin, b.fin) − b.inicio */
  solapeMin: number
}

export interface EstadoFuncionItinerario {
  choquesCon: Funcion[]
  llegaTardeDesde: Tramo | null
  noAlcanzaA: Tramo | null
  pierdeConversatorioPor: Tramo | null
  mismaPeliculaEn: Funcion[]
}

export interface ResumenDia {
  cantidad: number
  primeraInicioMin: number
  /** max(finConversatorioMin ?? finMin) */
  ultimaFinMin: number
  terminaDiaSiguiente: boolean
}

export interface AnalisisItinerario {
  /** válidas, únicas, ordenadas */
  funciones: Funcion[]
  porDia: {
    dia: DiaFestival
    funciones: Funcion[]
    tramos: Tramo[]
    resumen: ResumenDia
  }[]
  choques: Choque[]
  tramos: Tramo[]
  estadoPorId: Map<FuncionId, EstadoFuncionItinerario>
  idsInvalidos: string[]
}

export interface AvisoCandidata {
  tipo: 'choque' | 'traslado' | 'conversatorio' | 'mismaPelicula'
  texto: string
  otra: Funcion
}

export interface EstadoItinerario {
  ids: FuncionId[]
  listo: boolean
  persistente: boolean
}

// --- Marca visual de película ---

export type CapaForma = 'fondo' | 'niebla' | 'motivo' | 'marco'

export type Forma = {
  capa: CapaForma
} & (
  | { tipo: 'rect'; atributos: Record<string, string | number> }
  | { tipo: 'circle'; atributos: Record<string, string | number> }
  | { tipo: 'ellipse'; atributos: Record<string, string | number> }
  | { tipo: 'path'; atributos: Record<string, string | number> }
  | { tipo: 'line'; atributos: Record<string, string | number> }
  | { tipo: 'polyline'; atributos: Record<string, string | number> }
)

export interface Marca {
  viewBox: string
  fondo: { colorBase: string; colorHorizonte: string }
  horizonteY: number
  formas: Forma[]
}

// --- Filtros del programa ---

export interface FiltrosPrograma {
  dia: string | null
  seccion: SeccionId | null
}
