import Link from 'next/link'
import NavegacionPrincipal from './NavegacionPrincipal'
import estilos from './Encabezado.module.css'

export default function Encabezado() {
  return (
    <header className={`${estilos.encabezado} noImprimir`}>
      <Link href="/" className={estilos.wordmark}>
        Niebla
      </Link>
      <span className={estilos.fechas}>15–17 oct</span>
      <NavegacionPrincipal variante="barra" />
    </header>
  )
}
