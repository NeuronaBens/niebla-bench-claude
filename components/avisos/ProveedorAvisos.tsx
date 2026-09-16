'use client'

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import styles from './ProveedorAvisos.module.css'

interface AccionToast {
  texto: string
  accion: () => void
}

interface Toast {
  id: number
  texto: string
  accion?: AccionToast
  duracionMs: number
}

interface OpcionesToast {
  texto: string
  accion?: AccionToast
  duracionMs?: number
}

interface ContextoAvisos {
  anunciar: (mensaje: string) => void
  mostrarToast: (opciones: OpcionesToast) => void
}

const Contexto = createContext<ContextoAvisos | null>(null)

export function useAvisos(): ContextoAvisos {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useAvisos debe usarse dentro de <ProveedorAvisos>')
  return ctx
}

let contadorId = 0

export function ProveedorAvisos({ children }: { children: ReactNode }) {
  const [mensajeVivo, setMensajeVivo] = useState('')
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<number, number>())

  const anunciar = useCallback((mensaje: string) => {
    setMensajeVivo('')
    // Doble paso para que un mensaje igual al anterior también se anuncie.
    window.setTimeout(() => setMensajeVivo(mensaje), 30)
  }, [])

  const quitarToast = useCallback((id: number) => {
    setToasts((actuales) => actuales.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const mostrarToast = useCallback(
    (opciones: OpcionesToast) => {
      const id = (contadorId += 1)
      const duracionMs = opciones.duracionMs ?? 6000
      setToasts((actuales) => [...actuales, { id, texto: opciones.texto, accion: opciones.accion, duracionMs }])
      anunciar(opciones.texto)
      const timer = window.setTimeout(() => quitarToast(id), duracionMs)
      timers.current.set(id, timer)
    },
    [anunciar, quitarToast]
  )

  const pausar = useCallback((id: number) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
  }, [])

  const reanudar = useCallback(
    (id: number, duracionMs: number) => {
      const timer = window.setTimeout(() => quitarToast(id), duracionMs)
      timers.current.set(id, timer)
    },
    [quitarToast]
  )

  const valor = useMemo(() => ({ anunciar, mostrarToast }), [anunciar, mostrarToast])

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div aria-live="polite" role="status" className="visualmente-oculto">
        {mensajeVivo}
      </div>
      <div className={styles.pila} aria-live="off">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={styles.toast}
            onMouseEnter={() => pausar(toast.id)}
            onMouseLeave={() => reanudar(toast.id, toast.duracionMs)}
            onFocus={() => pausar(toast.id)}
            onBlur={() => reanudar(toast.id, toast.duracionMs)}
          >
            <p className={styles.texto}>{toast.texto}</p>
            <div className={styles.acciones}>
              {toast.accion && (
                <button
                  type="button"
                  className={styles.botonAccion}
                  onClick={() => {
                    toast.accion?.accion()
                    quitarToast(toast.id)
                  }}
                >
                  {toast.accion.texto}
                </button>
              )}
              <button
                type="button"
                className={styles.cerrar}
                aria-label="Cerrar aviso"
                onClick={() => quitarToast(toast.id)}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.6" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </Contexto.Provider>
  )
}
