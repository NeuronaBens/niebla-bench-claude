// Arma las frases de cada aviso a partir del `Aviso` y las funciones involucradas.
// Tono cercano, español de Chile, sin tecnicismos ni emojis.
//
// Dos formas de leer un aviso de par (choque, traslado, conversatorio, repetida, lluvia):
// - `textoAvisoDesde`: para mostrarlo junto a UNA función (un boleto), y nombra siempre a
//   LA OTRA — nunca a la función que ya se está mirando.
// - `textoAvisoResumen`: para mostrarlo sin estar junto a ninguna de las dos (el resumen o
//   un tramo entre boletos), y nombra a las dos explícitamente.
import type { Funcion } from '../tipos'
import type { Aviso } from './avisos'
import { plural, textoMinutos } from '../formato'
import { diaPorId } from '../programa'

function etiquetaCorta(f: Funcion): string {
  return `${f.pelicula.titulo} (${diaCorto(f.dia)} ${f.horaInicio})`
}

function diaCorto(dia: Funcion['dia']): string {
  if (dia === 'jueves') return 'jue'
  if (dia === 'viernes') return 'vie'
  return 'sáb'
}

function diaHora(f: Funcion): string {
  const dia = diaPorId(f.dia)
  return `${dia?.nombreLargo ?? f.dia} a las ${f.horaInicio}`
}

function minutosAHora(minutosAbsolutos: number): string {
  const minutoDelDia = ((minutosAbsolutos % 1440) + 1440) % 1440
  const h = Math.floor(minutoDelDia / 60)
  const m = minutoDelDia % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function textoAvisoIndividual(aviso: Aviso, funcionesPorId: Map<string, Funcion>): string {
  if (aviso.tipo === 'agotada') return 'Agotada: te sirve solo si ya tienes entrada.'
  if (aviso.tipo === 'aireLibre') {
    const f = funcionesPorId.get(aviso.ids[0])
    return f?.sala.nota ?? ''
  }
  return ''
}

/** La función que da el conversatorio en un aviso de choque o traslado es siempre `ids[0]`. */
function funcionConConversatorio(aviso: Aviso, funcionesPorId: Map<string, Funcion>): Funcion | undefined {
  return funcionesPorId.get(aviso.ids[0])
}

/**
 * Frase de un aviso de par para mostrar junto a la función `desdeId`: nombra siempre a la
 * otra función del par, nunca a `desdeId`.
 */
export function textoAvisoDesde(aviso: Aviso, funcionesPorId: Map<string, Funcion>, desdeId: string): string {
  if (aviso.ids.length < 2) return textoAvisoIndividual(aviso, funcionesPorId)

  const [idA, idB] = aviso.ids as [string, string]
  const esA = desdeId === idA
  const otra = funcionesPorId.get(esA ? idB : idA)
  if (!otra) return ''

  switch (aviso.tipo) {
    case 'choque': {
      const desdeTexto = minutosAHora(aviso.solapeDesde!)
      const hastaTexto = minutosAHora(aviso.solapeHasta!)
      let texto = `Se topa con ${etiquetaCorta(otra)}. Las dos se cruzan de ${desdeTexto} a ${hastaTexto}.`
      if (aviso.pierdeConversatorio) {
        const conConversatorio = funcionConConversatorio(aviso, funcionesPorId)
        texto += ` Y se pierde el conversatorio de ${conConversatorio?.pelicula.titulo ?? ''}.`
      }
      return texto
    }
    case 'traslado': {
      let texto: string
      if (esA) {
        texto =
          aviso.tieneMin === 0
            ? `No alcanzas a llegar a ${otra.sala.nombre}: sales justo cuando empieza.`
            : `No alcanzas a llegar a ${otra.sala.nombre}: son ${aviso.necesitaMin} min caminando y tienes ${aviso.tieneMin}.`
      } else {
        texto =
          aviso.tieneMin === 0
            ? `No alcanzas a llegar desde ${otra.sala.nombre} (${etiquetaCorta(otra)}): sales justo cuando empieza esta función.`
            : `No alcanzas a llegar desde ${otra.sala.nombre} (${etiquetaCorta(otra)}): son ${aviso.necesitaMin} min caminando y tienes ${aviso.tieneMin}.`
      }
      if (aviso.pierdeConversatorio) {
        const conConversatorio = funcionConConversatorio(aviso, funcionesPorId)
        texto += ` Y se pierde el conversatorio de ${conConversatorio?.pelicula.titulo ?? ''}.`
      }
      return texto
    }
    case 'conversatorio': {
      if (esA) {
        if (aviso.alcanzaMin === 0) return `Te pierdes el conversatorio para llegar a ${otra.pelicula.titulo}.`
        return `Te pierdes parte del conversatorio: alcanzas ${textoMinutos(aviso.alcanzaMin!)} de ${aviso.conversatorioMin} antes de salir a ${otra.sala.nombre}.`
      }
      if (aviso.alcanzaMin === 0) return `Sales antes de que empiece el conversatorio de ${otra.pelicula.titulo}.`
      return `El conversatorio de ${otra.pelicula.titulo} sigue cuando sales a esta función: alcanzas a ver ${textoMinutos(aviso.alcanzaMin!)} de ${aviso.conversatorioMin}.`
    }
    case 'repetida':
      return `También tienes esta película el ${diaHora(otra)}.`
    case 'lluvia': {
      const conTerraza = otra.sala.id === 'terraza' ? otra : funcionesPorId.get(esA ? idA : idB)
      if (conTerraza && conTerraza.id === desdeId) {
        return `Si llueve y esta función pasa a Galpón 7, no alcanzas a llegar a ${otra.sala.nombre} para ${otra.pelicula.titulo}.`
      }
      return `Si llueve y ${otra.pelicula.titulo} pasa a Galpón 7, no alcanzas a llegar desde ahí.`
    }
    default:
      return ''
  }
}

/**
 * Frase de un aviso de par para mostrarlo sin estar junto a ninguna de las dos funciones
 * (el resumen, o el tramo entre dos boletos): nombra a las dos explícitamente.
 */
export function textoAvisoResumen(aviso: Aviso, funcionesPorId: Map<string, Funcion>): string {
  if (aviso.ids.length < 2) return textoAvisoIndividual(aviso, funcionesPorId)

  const [idA, idB] = aviso.ids as [string, string]
  const a = funcionesPorId.get(idA)
  const b = funcionesPorId.get(idB)
  if (!a || !b) return ''

  switch (aviso.tipo) {
    case 'choque': {
      const desdeTexto = minutosAHora(aviso.solapeDesde!)
      const hastaTexto = minutosAHora(aviso.solapeHasta!)
      let texto = `${a.pelicula.titulo} y ${b.pelicula.titulo} se topan. Las dos se cruzan de ${desdeTexto} a ${hastaTexto}.`
      if (aviso.pierdeConversatorio) texto += ` Se pierde el conversatorio de ${a.pelicula.titulo}.`
      return texto
    }
    case 'traslado': {
      let texto = `No alcanzas a llegar de ${a.pelicula.titulo} (${a.sala.nombre}) a ${b.pelicula.titulo} (${b.sala.nombre}): necesitas ${aviso.necesitaMin} min caminando y tienes ${aviso.tieneMin}.`
      if (aviso.pierdeConversatorio) texto += ` Se pierde el conversatorio de ${a.pelicula.titulo}.`
      return texto
    }
    case 'conversatorio': {
      if (aviso.alcanzaMin === 0) {
        return `Te pierdes el conversatorio de ${a.pelicula.titulo} para llegar a ${b.pelicula.titulo}.`
      }
      return `Te pierdes parte del conversatorio de ${a.pelicula.titulo}: alcanzas ${textoMinutos(aviso.alcanzaMin!)} de ${aviso.conversatorioMin} antes de salir a ${b.sala.nombre} para ${b.pelicula.titulo}.`
    }
    case 'repetida':
      return `${a.pelicula.titulo} está repetida en tu itinerario: ${diaHora(a)} y ${diaHora(b)}.`
    case 'lluvia': {
      const conTerraza = a.sala.id === 'terraza' ? a : b
      const otra = conTerraza === a ? b : a
      return `Si llueve, ${conTerraza.pelicula.titulo} pasaría a Galpón 7 y no alcanzarías a llegar a ${otra.sala.nombre} para ${otra.pelicula.titulo}.`
    }
    default:
      return ''
  }
}

export function textoTramoOk(caminataMin: number, margenMin: number, salaHasta: string): string {
  if (caminataMin === 0) {
    return `Te quedas en ${salaHasta}. Tienes ${margenMin} ${plural(margenMin, 'minuto', 'min')}.`
  }
  return `${caminataMin} min caminando a ${salaHasta}. Te sobran ${margenMin}.`
}

export function textoTramoJusto(caminataMin: number, margenMin: number): string {
  return `Llegas justo: ${caminataMin} min caminando y te sobran ${margenMin}.`
}
