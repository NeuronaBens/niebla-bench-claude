'use client'

import { useMemo, useRef, useState } from 'react'
import { useItinerario } from './useItinerario.ts'
import { useHidratado } from '@/components/ui/useHidratado'
import { useAnunciar } from '@/components/ui/Anunciador'
import { Boton } from '@/components/ui/Boton'
import { Icono } from '@/components/ui/Icono'
import { Toast } from '@/components/ui/Toast'
import { VistaItinerario } from './VistaItinerario.tsx'
import { CompartirItinerario } from './CompartirItinerario.tsx'
import { AvisoAlmacenamiento } from './AvisoAlmacenamiento.tsx'
import { EsqueletoItinerario } from './EsqueletoItinerario.tsx'
import { programa } from '@/lib/programa'
import { evaluarItinerario } from '@/lib/reglas-itinerario'
import { itinerarioTextos, general } from '@/lib/textos'
import estilos from './MiItinerario.module.css'

export function MiItinerario() {
  const hidratado = useHidratado()
  const { ids, quitar, agregar, vaciar } = useItinerario()
  const anunciar = useAnunciar()
  const dialogoRef = useRef<HTMLDialogElement>(null)
  const cancelarRef = useRef<HTMLButtonElement>(null)
  const [ultimoQuitado, setUltimoQuitado] = useState<{ id: string; titulo: string } | null>(null)
  const [compartirAbierto, setCompartirAbierto] = useState(false)

  function abrirDialogo() {
    dialogoRef.current?.showModal()
    cancelarRef.current?.focus()
  }

  const resultado = useMemo(() => evaluarItinerario(ids, programa, { lluvia: true }), [ids])

  function manejarQuitar(id: string) {
    const funcion = programa.funcionPorId(id)
    quitar(id)
    if (funcion) {
      setUltimoQuitado({ id, titulo: funcion.pelicula.titulo })
      anunciar(itinerarioTextos.quitado(funcion.pelicula.titulo))
    }
  }

  function deshacer() {
    if (!ultimoQuitado) return
    agregar(ultimoQuitado.id)
    setUltimoQuitado(null)
  }

  function confirmarVaciar() {
    vaciar()
    dialogoRef.current?.close()
    anunciar('Vaciaste tu itinerario')
  }

  if (!hidratado) return <EsqueletoItinerario />

  if (ids.length === 0) {
    return (
      <div className={estilos.vacio}>
        <h1 className={estilos.vacioTitulo}>{itinerarioTextos.vacioTitulo}</h1>
        <p>{itinerarioTextos.vacioTexto}</p>
        <Boton as="a" href="/programa" variante="principal">
          {general.verPrograma}
        </Boton>
      </div>
    )
  }

  return (
    <div>
      <div className={estilos.cabecera}>
        <div className={estilos.filaTitulo}>
          <h1 className={estilos.titulo}>Mi itinerario</h1>
          <Boton
            variante="secundario"
            className={estilos.botonCompartirCompacto}
            aria-expanded={compartirAbierto}
            onClick={() => setCompartirAbierto((v) => !v)}
          >
            <Icono nombre="compartir" tamano={18} />
            {itinerarioTextos.compartir}
          </Boton>
        </div>
        {compartirAbierto ? (
          <div className={estilos.panelCompartir}>
            <CompartirItinerario ids={ids} />
          </div>
        ) : null}
      </div>

      <VistaItinerario resultado={resultado} modo="propio" alQuitar={manejarQuitar} />

      <div className={estilos.pie}>
        <Boton variante="texto" onClick={abrirDialogo}>
          {itinerarioTextos.vaciar}
        </Boton>
        <AvisoAlmacenamiento />
      </div>

      <dialog ref={dialogoRef} className={estilos.dialogo}>
        <p>{itinerarioTextos.vaciarPregunta(ids.length)}</p>
        <div className={estilos.dialogoAcciones}>
          <Boton ref={cancelarRef} variante="secundario" onClick={() => dialogoRef.current?.close()}>
            {itinerarioTextos.cancelar}
          </Boton>
          <Boton variante="principal" onClick={confirmarVaciar}>
            {itinerarioTextos.vaciarConfirmar}
          </Boton>
        </div>
      </dialog>

      {ultimoQuitado ? (
        <Toast
          mensaje={itinerarioTextos.quitado(ultimoQuitado.titulo)}
          accion={{ texto: itinerarioTextos.deshacer, alHacer: deshacer }}
          alCerrar={() => setUltimoQuitado(null)}
        />
      ) : null}
    </div>
  )
}
