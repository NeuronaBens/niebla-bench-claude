// Agrupa los avisos por función, para que cada boleto muestre lo que le corresponde.
// Los avisos de choque/traslado/conversatorio entre funciones consecutivas del mismo día ya
// se muestran con el tramo entre boletos; solo se agregan "sueltos" al boleto cuando el par
// no es consecutivo (una función larga que cubre otras dos, por ejemplo).
import type { Aviso, Tramo } from './avisos'

function clavePar(idA: string, idB: string): string {
  return `${idA}|${idB}`
}

export function agruparAvisosPorFuncion(avisos: Aviso[], tramos: Tramo[]): Map<string, Aviso[]> {
  const clavesConTramo = new Set(
    tramos.filter((t) => t.estado !== 'ok' && t.estado !== 'justo').map((t) => clavePar(t.desde, t.hasta))
  )

  const mapa = new Map<string, Aviso[]>()
  const agregar = (id: string, aviso: Aviso) => {
    const lista = mapa.get(id) ?? []
    lista.push(aviso)
    mapa.set(id, lista)
  }

  for (const aviso of avisos) {
    if (aviso.nivel === 'info') {
      for (const id of aviso.ids) agregar(id, aviso)
      continue
    }
    if (aviso.ids.length === 2) {
      const [a, b] = aviso.ids
      if (clavesConTramo.has(clavePar(a, b))) continue
      agregar(a, aviso)
      agregar(b, aviso)
    }
  }

  return mapa
}
