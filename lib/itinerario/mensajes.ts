import type { Funcion, Tramo } from '../tipos'
import { etiquetaFinCompacta, horaDe } from '../tiempo'
import { formatoDuracion, plural } from '../formato'

// Todos los textos de los avisos del itinerario (choque, traslado,
// conversatorio) viven acá, para revisarlos en un solo lugar. Tono
// informativo, nunca alarmista salvo cuando de verdad no se alcanza.

function horaFinConMarca(f: Funcion): string {
  const { hora, terminaDiaSiguiente } = etiquetaFinCompacta(f.finMin, f.dia)
  return terminaDiaSiguiente ? `${hora} +1` : hora
}

// --- Choque (H4.2) ---

export function textoChoqueEnParada(otra: Funcion): string {
  return `Se topa con ${otra.pelicula.titulo}: ${horaDe(otra.inicioMin)} – ${horaFinConMarca(otra)}, ${otra.sala.nombre}.`
}

export function textoChoqueEnTramo(a: Funcion, b: Funcion): string {
  return `Estas dos funciones se topan: ${a.pelicula.titulo} termina a las ${horaDe(a.finMin)} y ${b.pelicula.titulo} empieza a las ${horaDe(b.inicioMin)}.`
}

export function pistaChoque(otra: Funcion): string {
  return `Se topa con ${otra.pelicula.titulo}, ${horaDe(otra.inicioMin)}.`
}

// --- Traslado (H4.3) ---

export function textoNoAlcanzaA(a: Funcion, b: Funcion, t: Tramo): string {
  return `No alcanzas a llegar a ${b.pelicula.titulo}: sales a las ${horaDe(a.finMin)} y son ${t.trasladoMin} min caminando a ${b.sala.nombre}. Llegarías ${horaDe(t.llegadaMin)}, ${plural(t.atrasoMin, 'minuto', 'minutos')} tarde.`
}

export function textoLlegaTardeDesde(a: Funcion, t: Tramo): string {
  return `Llegarías ${plural(t.atrasoMin, 'minuto', 'minutos')} tarde desde ${a.pelicula.titulo}.`
}

export function textoTramoTraslado(b: Funcion, t: Tramo): string {
  return `No alcanzas: ${t.trasladoMin} min caminando a ${b.sala.nombre}. Llegarías ${horaDe(t.llegadaMin)}, ${plural(t.atrasoMin, 'minuto', 'minutos')} tarde.`
}

export function pistaNoAlcanzaDesde(a: Funcion, atrasoMin: number): string {
  return `No alcanzas a llegar desde ${a.pelicula.titulo}: ${plural(atrasoMin, 'minuto', 'minutos')} tarde.`
}

export function pistaNoAlcanzaA(b: Funcion, atrasoMin: number): string {
  return `No alcanzas a llegar a ${b.pelicula.titulo}: ${plural(atrasoMin, 'minuto', 'minutos')} tarde.`
}

// --- Holgura, informativo (H4.3 CA3) ---

export function textoHolgura(a: Funcion, b: Funcion, t: Tramo): string {
  if (t.trasladoMin > 0 && t.sobraMin > 0) {
    const sufijo = a.conversatorioMin ? ' (después del conversatorio)' : ''
    return `Tienes ${formatoDuracion(t.disponibleMin)}; son ${t.trasladoMin} caminando a ${b.sala.nombre}.${sufijo}`
  }
  if (t.trasladoMin > 0 && t.sobraMin === 0) {
    return `Llegas justo: ${t.trasladoMin} min caminando a ${b.sala.nombre}, sin margen.`
  }
  if (t.trasladoMin === 0 && t.disponibleMin > 0) {
    return `Te quedas en ${a.sala.nombre}: ${formatoDuracion(t.disponibleMin)} hasta la siguiente.`
  }
  return `Te quedas en ${a.sala.nombre}: la siguiente empieza apenas termina, a las ${horaDe(b.inicioMin)}.`
}

// --- Conversatorio (H4.4) ---

export function textoPierdeConversatorio(b: Funcion, t: Tramo): string {
  const visto = t.conversatorioVistoMin ?? 0
  if (visto === 0) return `Si vas a ${b.pelicula.titulo} te pierdes el conversatorio.`
  const total = t.desde.conversatorioMin ?? 0
  return `Si vas a ${b.pelicula.titulo} te pierdes parte del conversatorio: alcanzas ${visto} de ${total} min y sales a las ${horaDe(t.salidaMaximaMin)}.`
}

export function textoTramoConversatorio(b: Funcion, t: Tramo): string {
  return `Sales durante el conversatorio: ${t.trasladoMin} min caminando a ${b.sala.nombre}.`
}

/** Pista mostrada en B, antes de marcarla, cuando perdería el conversatorio de A. */
export function pistaConversatorioDeA(a: Funcion): string {
  return `Te perderías el conversatorio de ${a.pelicula.titulo}.`
}

/** "Termina 19:24 · conversatorio hasta las 19:44" (CA4). */
export function textoTerminaYConversatorio(f: Funcion): string {
  const fin = horaFinConMarca(f)
  if (f.finConversatorioMin == null) return `Termina ${fin}`
  const { hora, terminaDiaSiguiente } = etiquetaFinCompacta(f.finConversatorioMin, f.dia)
  const finConv = terminaDiaSiguiente ? `${hora} +1` : hora
  return `Termina ${fin} · conversatorio hasta las ${finConv}`
}

// --- Misma película en otra función (H3.2 CA3) ---

export function pistaMismaPelicula(otra: Funcion): string {
  return `Ya tienes esta película el ${otra.dia.etiqueta.toLowerCase()} a las ${horaDe(otra.inicioMin)}.`
}

export function textoTambienLaTienes(otra: Funcion): string {
  return `También la tienes el ${otra.dia.etiqueta.toLowerCase()} a las ${horaDe(otra.inicioMin)}.`
}
