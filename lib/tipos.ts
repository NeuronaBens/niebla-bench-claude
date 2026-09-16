export type SalaId = "teatro" | "muelle" | "galpon" | "terraza";
export type SeccionId = "competencia" | "panorama" | "nocturna" | "costa";

export interface Sala {
  id: SalaId;
  nombre: string;
  direccion: string;
  capacidad: number;
  aireLibre: boolean;
  nota?: string;
}

export interface Seccion {
  id: SeccionId;
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
  seccion: SeccionId;
  clasificacion: string;
  estreno: "mundial" | "latinoamericano" | "nacional";
  sinopsis: string;
}

export interface Funcion {
  id: string;
  peliculaId: string;
  salaId: SalaId;
  inicio: string; // ISO string
  conversatorioMin?: number;
  nota?: string;
  agotada?: boolean;
}

export interface FuncionExpandida {
  id: string;
  pelicula: Pelicula;
  sala: Sala;
  seccion: Seccion;
  inicioMin: number;
  finMin: number; // inicio + duracionMin
  finConversatorioMin: number; // finMin + conversatorioMin o igual a finMin
  conversatorioMin?: number;
  nota?: string;
  agotada?: boolean;
  dia: 0 | 1 | 2;
}

export interface Programa {
  festival: {
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
  };
  salas: Sala[];
  trasladosMin: Record<SalaId, Record<SalaId, number>>;
  secciones: Seccion[];
  peliculas: Pelicula[];
  funciones: Funcion[];
}

export type TipoAviso = "choque" | "traslado" | "conversatorio";

export interface Aviso {
  tipo: TipoAviso;
  a: string; // id de función
  b?: string; // id de función (opcional para algunos avisos)
  minutosFaltan?: number;
  texto: string;
}

export interface AnalizarItinerarioResult {
  funciones: FuncionExpandida[];
  avisos: Aviso[];
}
