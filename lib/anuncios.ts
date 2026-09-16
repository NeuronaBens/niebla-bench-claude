// Emisor de módulo para anuncios de accesibilidad y notificaciones visibles.
// `Anunciador` (montado una vez en el layout) es el único suscriptor real;
// este módulo no toca el DOM.

export interface AccionAnuncio {
  etiqueta: string
  alHacer: () => void
}

export interface OpcionesAnuncio {
  accion?: AccionAnuncio
  duracionMs?: number
}

export interface Anuncio {
  id: number
  texto: string
  accion?: AccionAnuncio
  duracionMs: number
}

type Suscriptor = (anuncio: Anuncio) => void

let contador = 0
const suscriptores = new Set<Suscriptor>()

export function anunciar(texto: string, opciones?: OpcionesAnuncio): void {
  contador += 1
  const anuncio: Anuncio = {
    id: contador,
    texto,
    accion: opciones?.accion,
    duracionMs: opciones?.duracionMs ?? (opciones?.accion ? 8000 : 5000),
  }
  for (const fn of suscriptores) fn(anuncio)
}

export function suscribirAnuncios(fn: Suscriptor): () => void {
  suscriptores.add(fn)
  return () => {
    suscriptores.delete(fn)
  }
}
