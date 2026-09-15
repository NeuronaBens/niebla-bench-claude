import Link from "next/link";
import { dias, festival } from "@/lib/programa";
import Escena from "./Escena";
import Flecha from "./Flecha";
import Tablero from "./Tablero";
import { anio, cifras, enPalabras, mayuscula, nombre, ultimoDia } from "./derivados";
import c from "./comun.module.css";
import s from "./Hero.module.css";

export default function Hero() {
  const letras = nombre.marca.toUpperCase().split("");
  return (
    <section className={s.hero} aria-labelledby="titulo-portada">
      <Escena />

      <div className={s.contenido}>
        <p className={s.kicker}>
          <span className={s.edicion}>{festival.edicion}ª edición</span>
          <span>
            {festival.ciudad}, {festival.region}
          </span>
        </p>

        <h1 id="titulo-portada" className={s.titulo}>
          <span className={s.antes}>{nombre.antes}</span>
          <span className="sr-only">{nombre.marca}</span>
          <span className={s.marca} aria-hidden="true">
            {letras.map((l, i) => (
              <span key={i} className={s.letra} style={{ animationDelay: `${180 + i * 110}ms` }}>
                {l}
              </span>
            ))}
          </span>
        </h1>

        <div className={s.fechas}>
          <ol className={s.dias} aria-label="Días del festival">
            {dias.map((d) => (
              <li key={d.fecha} className={s.dia}>
                <span className={s.diaNombre}>{d.nombre}</span>
                <span className={s.diaNumero}>{d.numero}</span>
              </li>
            ))}
          </ol>
          <p className={s.mes}>
            de {ultimoDia.mes}
            <br />
            {anio}
          </p>
        </div>

        <p className={s.lead}>
          {mayuscula(enPalabras(cifras.dias))} días de cine en el puerto: {cifras.peliculas} películas y{" "}
          {cifras.funciones} funciones repartidas en {enPalabras(cifras.salas)} salas de {festival.ciudad}.
        </p>

        <div className={s.acciones}>
          <Link href="/programa" className={c.boton}>
            Ver el programa
            <Flecha className={c.flecha} />
          </Link>
          <Link href="/itinerario" className={c.botonFantasma}>
            Armar mi itinerario
          </Link>
        </div>

        <div className={s.tablero}>
          <Tablero />
        </div>
      </div>
    </section>
  );
}
