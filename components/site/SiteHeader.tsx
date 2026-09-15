import Link from "next/link";
import ContadorItinerario from "@/components/itinerario/ContadorItinerario";
import { dias, festival } from "@/lib/programa";
import Isotipo from "./Isotipo";
import NavEnlace from "./NavEnlace";
import s from "./SiteHeader.module.css";

const primero = dias[0];
const ultimo = dias[dias.length - 1];
const marca = festival.nombre.trim().split(/\s+/).pop() ?? festival.nombre;

export default function SiteHeader() {
  return (
    <header className={s.header}>
      <a href="#contenido" className={s.saltar}>
        Saltar al contenido
      </a>
      <div className={s.barra}>
        <Link href="/" className={s.marca} aria-label={`${festival.nombre}, ir a la portada`}>
          <Isotipo className={s.isotipo} />
          <span className={s.nombre}>{marca}</span>
          <span className={s.fechas} aria-hidden="true">
            {primero.numero}–{ultimo.numero} {ultimo.mes.slice(0, 3)}
            <span className={s.sep}>/</span>
            {festival.edicion}ª ed.
          </span>
        </Link>

        <nav className={s.nav} aria-label="Principal">
          <ul className={s.lista}>
            <li className={s.soloAncho}>
              <NavEnlace href="/" className={s.enlace}>
                Portada
              </NavEnlace>
            </li>
            <li>
              <NavEnlace href="/programa" className={s.enlace}>
                Programa
              </NavEnlace>
            </li>
            <li>
              <NavEnlace href="/itinerario" className={s.enlace}>
                <span className={s.mi}>Mi </span>
                <span className={s.itinerario}>itinerario</span>
                <ContadorItinerario className={s.contador} />
              </NavEnlace>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
