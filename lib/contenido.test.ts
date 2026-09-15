import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = path.resolve(fileURLToPath(new URL('..', import.meta.url)))

function listarArchivos(dir: string, extensiones: string[]): string[] {
  const resultado: string[] = []
  let entradas: string[]
  try {
    entradas = readdirSync(dir)
  } catch {
    return resultado
  }
  for (const entrada of entradas) {
    const ruta = path.join(dir, entrada)
    const info = statSync(ruta)
    if (info.isDirectory()) {
      resultado.push(...listarArchivos(ruta, extensiones))
    } else if (extensiones.some((ext) => entrada.endsWith(ext))) {
      resultado.push(ruta)
    }
  }
  return resultado
}

function archivosDeInterfaz(): string[] {
  const archivos = [
    ...listarArchivos(path.join(RAIZ, 'app'), ['.ts', '.tsx']),
    ...listarArchivos(path.join(RAIZ, 'components'), ['.ts', '.tsx']),
    path.join(RAIZ, 'lib', 'textos.ts'),
  ]
  return archivos.filter((a) => statSync(a).isFile())
}

test('T-CONT-1: sin emojis en app/, components/ ni lib/textos.ts', () => {
  const patronEmoji = /\p{Extended_Pictographic}|\u{FE0F}/u
  for (const archivo of archivosDeInterfaz()) {
    const contenido = readFileSync(archivo, 'utf8')
    assert.equal(patronEmoji.test(contenido), false, `emoji encontrado en ${archivo}`)
  }
})

test('T-CONT-2: sin palabras prohibidas de puntuación/venta', () => {
  const prohibidas = /estrella|puntaje|ranking|imperdible|comprar/i
  for (const archivo of archivosDeInterfaz()) {
    const contenido = readFileSync(archivo, 'utf8')
    const match = contenido.match(prohibidas)
    assert.equal(match, null, `palabra prohibida "${match?.[0]}" en ${archivo}`)
  }
})

test('T-CONT-3: sin Date locales ni new Date con string ISO fuera de tests', () => {
  const prohibido = /toLocaleTimeString|toLocaleDateString|new Date\(["']20/
  const archivos = [
    ...listarArchivos(path.join(RAIZ, 'app'), ['.ts', '.tsx']),
    ...listarArchivos(path.join(RAIZ, 'components'), ['.ts', '.tsx']),
    ...listarArchivos(path.join(RAIZ, 'lib'), ['.ts']),
  ].filter((a) => !a.endsWith('.test.ts'))
  for (const archivo of archivos) {
    const contenido = readFileSync(archivo, 'utf8')
    const match = contenido.match(prohibido)
    assert.equal(match, null, `uso prohibido "${match?.[0]}" en ${archivo}`)
  }
})

test('T-CONT-4: sin dependencias nuevas', () => {
  const pkg = JSON.parse(readFileSync(path.join(RAIZ, 'package.json'), 'utf8'))
  const deps = Object.keys(pkg.dependencies ?? {})
  assert.deepEqual(deps.sort(), ['next', 'react', 'react-dom'])
})
