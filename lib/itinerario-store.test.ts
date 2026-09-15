import { test } from 'node:test'
import assert from 'node:assert/strict'
import { crearTienda, type AlmacenSimple } from './itinerario-store.ts'

function almacenSimulado(inicial: Record<string, string> = {}): AlmacenSimple {
  const datos = new Map(Object.entries(inicial))
  return {
    getItem: (k) => datos.get(k) ?? null,
    setItem: (k, v) => {
      datos.set(k, v)
    },
    removeItem: (k) => {
      datos.delete(k)
    },
  }
}

const IDS_VALIDOS = new Set(['f01', 'f05', 'f09', 'f13'])

test('agregar, quitar, alternar', () => {
  const tienda = crearTienda(almacenSimulado(), IDS_VALIDOS)
  assert.deepEqual(tienda.obtenerEstado().ids, [])
  tienda.agregar('f05')
  assert.deepEqual(tienda.obtenerEstado().ids, ['f05'])
  tienda.agregar('f05')
  assert.deepEqual(tienda.obtenerEstado().ids, ['f05'])
  tienda.quitar('f09')
  assert.deepEqual(tienda.obtenerEstado().ids, ['f05'])
  tienda.alternar('f09')
  assert.deepEqual(tienda.obtenerEstado().ids, ['f05', 'f09'])
  tienda.alternar('f09')
  assert.deepEqual(tienda.obtenerEstado().ids, ['f05'])
})

test('unir sin duplicar y reemplazar', () => {
  const tienda = crearTienda(almacenSimulado(), IDS_VALIDOS)
  tienda.agregar('f05')
  tienda.unir(['f05', 'f09'])
  assert.deepEqual(tienda.obtenerEstado().ids, ['f05', 'f09'])
  tienda.reemplazar(['f01', 'f13'])
  assert.deepEqual(tienda.obtenerEstado().ids, ['f01', 'f13'])
})

test('vaciar', () => {
  const tienda = crearTienda(almacenSimulado(), IDS_VALIDOS)
  tienda.agregar('f05')
  tienda.agregar('f09')
  tienda.vaciar()
  assert.deepEqual(tienda.obtenerEstado().ids, [])
})

test('datos corruptos: JSON inválido, versión distinta, ids no arreglo', () => {
  assert.deepEqual(crearTienda(almacenSimulado({ 'niebla:itinerario:v1': 'no es json' }), IDS_VALIDOS).obtenerEstado().ids, [])
  assert.deepEqual(
    crearTienda(almacenSimulado({ 'niebla:itinerario:v1': JSON.stringify({ v: 2, ids: ['f05'] }) }), IDS_VALIDOS).obtenerEstado()
      .ids,
    []
  )
  assert.deepEqual(
    crearTienda(almacenSimulado({ 'niebla:itinerario:v1': JSON.stringify({ v: 1, ids: 'f05' }) }), IDS_VALIDOS).obtenerEstado()
      .ids,
    []
  )
})

test('ids inexistentes y repetidos se descartan al leer', () => {
  const guardado = JSON.stringify({ v: 1, ids: ['f05', 'f99', 5, 'f05'] })
  const tienda = crearTienda(almacenSimulado({ 'niebla:itinerario:v1': guardado }), IDS_VALIDOS)
  assert.deepEqual(tienda.obtenerEstado().ids, ['f05'])
})

test('almacén que lanza en setItem: persistente false, sigue funcionando en memoria', () => {
  const base = almacenSimulado()
  const almacenQueLanza: AlmacenSimple = {
    ...base,
    setItem: () => {
      throw new Error('cuota excedida')
    },
  }
  const tienda = crearTienda(almacenQueLanza, IDS_VALIDOS)
  assert.equal(tienda.obtenerEstado().persistente, false)
  tienda.agregar('f05')
  assert.deepEqual(tienda.obtenerEstado().ids, ['f05'])
})

test('setItem falla después de la prueba inicial: persistente pasa a false y notifica', () => {
  const base = almacenSimulado()
  let fallar = false
  const almacenInestable: AlmacenSimple = {
    ...base,
    setItem: (k, v) => {
      if (fallar) throw new Error('cuota llena')
      base.setItem(k, v)
    },
  }
  const tienda = crearTienda(almacenInestable, IDS_VALIDOS)
  assert.equal(tienda.obtenerEstado().persistente, true)

  let notificaciones = 0
  tienda.suscribir(() => {
    notificaciones++
  })

  fallar = true
  tienda.agregar('f05')
  assert.equal(tienda.obtenerEstado().persistente, false)
  assert.deepEqual(tienda.obtenerEstado().ids, ['f05'])
  assert.equal(notificaciones, 1)
})

test('almacén null: persistente false, funciona en memoria', () => {
  const tienda = crearTienda(null, IDS_VALIDOS)
  assert.equal(tienda.obtenerEstado().persistente, false)
  tienda.agregar('f05')
  assert.deepEqual(tienda.obtenerEstado().ids, ['f05'])
})

test('obtenerEstado devuelve la misma referencia si no hubo cambios', () => {
  const tienda = crearTienda(almacenSimulado(), IDS_VALIDOS)
  const e1 = tienda.obtenerEstado()
  const e2 = tienda.obtenerEstado()
  assert.equal(e1, e2)
  tienda.agregar('f05')
  const e3 = tienda.obtenerEstado()
  assert.notEqual(e1, e3)
})

test('suscribir permite desuscribirse', () => {
  const tienda = crearTienda(almacenSimulado(), IDS_VALIDOS)
  let llamadas = 0
  const cancelar = tienda.suscribir(() => {
    llamadas++
  })
  tienda.agregar('f05')
  assert.equal(llamadas, 1)
  cancelar()
  tienda.agregar('f09')
  assert.equal(llamadas, 1)
})
