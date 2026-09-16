import type { Metadata } from 'next'
import Link from 'next/link'
import estilos from './not-found.module.css'

export const metadata: Metadata = {
  title: 'Página no encontrada',
}

export default function NoEncontrada() {
  return (
    <div className={estilos.pagina}>
      <svg className={estilos.faro} viewBox="0 0 96 128" aria-hidden="true">
        <path d="M38 20h20l7 88H31z" fill="#E8EEF0" opacity="0.5" />
        <rect x="36" y="36" width="24" height="10" fill="#3A5566" />
        <rect x="36" y="56" width="24" height="10" fill="#3A5566" />
        <line x1="60" y1="30" x2="90" y2="10" stroke="#F4C15D" strokeWidth="2" opacity="0.4" />
      </svg>
      <h1>No encontramos esa página</h1>
      <p className={estilos.texto}>
        Puede que el enlace esté incompleto o que esa película no sea parte de esta edición.
      </p>
      <div className={estilos.acciones}>
        <Link href="/programa" className={estilos.principal}>
          Ver el programa
        </Link>
        <Link href="/" className={estilos.secundario}>
          Ir a la portada
        </Link>
      </div>
    </div>
  )
}
