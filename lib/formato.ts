// Formato de texto derivado de datos: duraciones, precios, plurales y listas.
// Nunca se usa `Intl` para que el servidor y el cliente produzcan el mismo
// texto siempre (evita errores de hidratación).

const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
]

/** nombreMes(10) → "octubre" (1 = enero). */
export function nombreMes(mes: number): string {
  return MESES[mes - 1] ?? ''
}

const PALABRAS_CARDINALES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez']

/** cardinalPalabra(3) → "tres" (tabla de 1 a 10). */
export function cardinalPalabra(n: number): string {
  return PALABRAS_CARDINALES[n] ?? String(n)
}

const PALABRAS_ORDINALES = [
  '',
  'primera',
  'segunda',
  'tercera',
  'cuarta',
  'quinta',
  'sexta',
  'séptima',
  'octava',
  'novena',
  'décima',
]

/** 112 → "1 h 52 min", 60 → "1 h", 63 → "1 h 3 min", 45 → "45 min". */
export function formatoDuracion(min: number): string {
  const horas = Math.floor(min / 60)
  const minutos = min % 60
  if (horas === 0) return `${minutos} min`
  if (minutos === 0) return `${horas} h`
  return `${horas} h ${minutos} min`
}

/** 4000 → "$4.000". Separador de miles "." aplicado a mano, sin `Intl`. */
export function formatoPesos(n: number): string {
  const entero = Math.round(Math.abs(n))
  const digitos = String(entero)
  let agrupado = ''
  for (let i = 0; i < digitos.length; i++) {
    const posicionDesdeElFinal = digitos.length - i
    agrupado += digitos[i]
    if (posicionDesdeElFinal > 1 && posicionDesdeElFinal % 3 === 1) agrupado += '.'
  }
  return `${n < 0 ? '-' : ''}$${agrupado}`
}

/** 0 → "Gratis"; cualquier otro valor usa `formatoPesos`. */
export function precioTexto(n: number): string {
  return n === 0 ? 'Gratis' : formatoPesos(n)
}

/** plural(1, 'función', 'funciones') → "1 función"; plural(39, …) → "39 funciones". */
export function plural(n: number, singular: string, pluralTexto: string): string {
  return `${n} ${n === 1 ? singular : pluralTexto}`
}

/** listaHumana(['15','16','17']) → "15, 16 y 17". */
export function listaHumana(items: string[]): string {
  if (items.length === 0) return ''
  if (items.length === 1) return items[0]
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}

/** ordinalEdicion(3) → "3ª". */
export function ordinalEdicion(n: number): string {
  return `${n}ª`
}

/** ordinalPalabra(3) → "tercera" (tabla de 1 a 10). */
export function ordinalPalabra(n: number): string {
  return PALABRAS_ORDINALES[n] ?? `${ordinalEdicion(n)}`
}
