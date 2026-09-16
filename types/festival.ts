export interface Festival {
  nombre: string;
  edicion: number;
  ciudad: string;
  region: string;
  fechaInicio: string;
  fechaFin: string;
  zonaHoraria: string;
  entradas: {
    moneda: string;
    general: number;
    aireLibre: number;
    venta: string;
  };
  contacto: {
    correo: string;
    instagram: string;
  };
}

export interface Sala {
  id: string;
  nombre: string;
  direccion: string;
  capacidad: number;
  aireLibre: boolean;
  nota?: string;
}

export interface Seccion {
  id: string;
  nombre: string;
  descripcion: string;
}

export interface Pelicula {
  id: string;
  titulo: string;
  tituloOriginal?: string;
  direccion: string;
  pais: string;
  anio: number;
  duracionMin: number;
  seccion: string;
  clasificacion: string;
  estreno: string;
  sinopsis: string;
}

export interface Funcion {
  id: string;
  peliculaId: string;
  salaId: string;
  inicio: string;
  conversatorioMin?: number;
  nota?: string;
  agotada?: boolean;
}

export interface FuncionEnriquecida extends Funcion {
  pelicula: Pelicula;
  sala: Sala;
  inicioMin: number;
  finMin: number;
  finConConversatorioMin: number;
  cruzaMedianoche: boolean;
  diaIndice: number;
}

export interface Programa {
  festival: Festival;
  salas: Sala[];
  trasladosMin: Record<string, Record<string, number>>;
  secciones: Seccion[];
  peliculas: Pelicula[];
  funciones: Funcion[];
}

export interface DiaFestival {
  indice: number;
  fecha: string;
  nombreDia: string;
  slug: string;
  etiqueta: string;
}
