import Link from "next/link";
import type { CSSProperties } from "react";
import Afiche from "@/components/Afiche";
import Cuenta from "@/components/portada/Cuenta";
import { nombreSalaCorto } from "@/lib/itinerario";
import {
  dias,
  festival,
  funciones,
  peliculas,
  salas,
  secciones,
  traslado,
} from "@/lib/programa";
import { capitalizar, diaSemana, hora, horaFin, mes, numeroDia } from "@/lib/tiempo";
import s from "./page.module.css";

const LETRAS = "NIEBLA".split("");
const TEXTO_DIAS = capitalizar(
  dias
    .map((d) => `${diaSemana(d)} ${numeroDia(d)}`)
    .join(", ")
    .replace(/, ([^,]+)$/, " y $1"),
);
const MAX_TRASLADO = Math.max(...salas.flatMap((a) => salas.map((b) => traslado(a.id, b.id))));

export default function Portada() {
  const e = festival.entradas;
  return (
    <>
      {/* ------------------------------ Portada ------------------------------ */}
      <section className={s.hero} aria-labelledby="titulo-festival">
        <div className={s.cielo} aria-hidden="true">
          <div className={s.estrellas} />
          <div className={`${s.niebla} ${s.niebla1}`} />
        </div>

        <div className={`contenedor ${s.heroInterior}`}>
          <p className={s.heroAntes}>
            <span>Festival de Cine</span>
            <span className={s.sep} aria-hidden="true" />
            <span>
              {festival.ciudad}, {festival.region}
            </span>
            <span className={s.sep} aria-hidden="true" />
            <span>{festival.edicion}ª edición</span>
          </p>

          <h1 id="titulo-festival" className={s.palabra}>
            <span className="solo-lector">{festival.nombre}</span>
            <span className={s.letras} aria-hidden="true">
              {LETRAS.map((l, i) => (
                <span key={i} className={s.letra} style={{ "--i": i } as CSSProperties}>
                  {l}
                </span>
              ))}
            </span>
          </h1>

          <div className={s.heroDespues}>
            <p className={s.fechas}>
              {TEXTO_DIAS} <em>de {mes(festival.fechaInicio)} de {festival.fechaInicio.slice(0, 4)}</em>
            </p>
            <p className={s.cifras}>
              <span className="num">{peliculas.length}</span> películas
              <span className={s.sep} aria-hidden="true" />
              <span className="num">{salas.length}</span> salas
              <span className={s.sep} aria-hidden="true" />
              <span className="num">{funciones.length}</span> funciones
            </p>
            <div className={s.botones}>
              <Link href="/programa" className={s.botonPrincipal}>
                Ver el programa
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M4 10h12M11 5l5 5-5 5" />
                </svg>
              </Link>
              <Link href="/itinerario" className={s.botonSecundario}>
                Armar mi itinerario
              </Link>
            </div>
            <Cuenta className={s.cuenta} />
          </div>
        </div>

        <div className={s.costa} aria-hidden="true">
          <svg viewBox="0 0 1440 260" preserveAspectRatio="none" className={s.mar}>
            <path d="M0 150 C 240 130 420 170 720 150 S 1200 130 1440 150 V260 H0Z" fill="#101c24" />
            <path d="M0 190 C 300 175 520 205 820 188 S 1250 175 1440 192 V260 H0Z" fill="#0d171e" />
            <path d="M0 226 C 260 214 600 238 900 224 S 1300 214 1440 228 V260 H0Z" fill="#0b131a" />
          </svg>
          <div className={s.faroCaja}>
            <div className={s.hazPivote}>
              <div className={s.haz} />
            </div>
            <svg viewBox="0 0 120 220" className={s.faro}>
            <polygon points="48,40 72,40 84,210 36,210" fill="#1a262f" />
            <rect x="44" y="84" width="32" height="14" fill="#0b131a" />
            <rect x="40" y="140" width="40" height="14" fill="#0b131a" />
            <rect x="42" y="24" width="36" height="18" rx="2" fill="#1a262f" />
            <circle cx="60" cy="32" r="7" className={s.lampara} />
            <polygon points="36,24 60,6 84,24" fill="#1a262f" />
            </svg>
          </div>
          <div className={`${s.niebla} ${s.niebla3}`} />
        </div>
        <div className={s.nieblaFrente} aria-hidden="true">
          <div className={`${s.niebla} ${s.niebla2}`} />
        </div>
      </section>

      {/* ------------------------------ Qué es ------------------------------ */}
      <section className={`contenedor ${s.manifiesto}`} aria-labelledby="que-es">
        <h2 id="que-es" className={s.etiquetaSeccion}>
          Qué es
        </h2>
        <p className={s.manifiestoTexto}>
          Tres días de cine en {festival.ciudad}, un puerto de la costa de Chile donde la niebla entra sin pedir permiso.
          Películas latinoamericanas en competencia, cine de otros continentes que no llega a las salas comerciales,
          terror pasada la medianoche y lo que se filma <em>acá mismo</em>, en nuestra costa.
        </p>
        <p className={s.manifiestoNota}>
          Lo hacemos entre cuatro personas, con fondos concursables y la ayuda de muchos voluntarios. Esta es la{" "}
          {festival.edicion}ª edición.
        </p>
      </section>

      {/* ------------------------------ Secciones ------------------------------ */}
      <section className={`contenedor ${s.secciones}`} aria-labelledby="titulo-secciones">
        <div className={s.encabezado}>
          <h2 id="titulo-secciones" className={s.tituloGrande}>
            Cuatro secciones
          </h2>
          <p className={s.encabezadoTexto}>
            Cada sección tiene su propio dibujo. Como no tenemos afiches, cada película tiene uno hecho con código a partir
            de su sección.
          </p>
        </div>
        <ol className={s.listaSecciones}>
          {secciones.map((sec, i) => {
            const pelis = peliculas.filter((p) => p.seccion === sec.id);
            return (
              <li key={sec.id} className={s.seccion} data-seccion={sec.id}>
                <div className={s.seccionArte}>
                  <Afiche semilla={`seccion-${sec.id}`} seccion={sec.id} />
                </div>
                <div className={s.seccionTexto}>
                  <p className={`${s.seccionNum} num`}>
                    {String(i + 1).padStart(2, "0")} · {pelis.length} películas
                  </p>
                  <h3 className={s.seccionNombre}>{sec.nombre}</h3>
                  <p className={s.seccionDesc}>{sec.descripcion}</p>
                  <ul className={s.seccionPelis}>
                    {pelis.map((p) => (
                      <li key={p.id}>
                        <Link href={`/pelicula/${p.id}`}>{p.titulo}</Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={`/programa?seccion=${sec.id}`} className={s.seccionEnlace}>
                    Ver sus funciones
                    <svg viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M4 10h12M11 5l5 5-5 5" />
                    </svg>
                  </Link>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ------------------------------ Días ------------------------------ */}
      <section className={`contenedor ${s.dias}`} aria-labelledby="titulo-dias">
        <h2 id="titulo-dias" className={s.tituloGrande}>
          Tres días
        </h2>
        <ol className={s.listaDias}>
          {dias.map((d) => {
            const fs = funciones.filter((f) => f.dia === d);
            const primera = fs[0];
            const ultima = [...fs].sort((a, b) => b.fin - a.fin)[0];
            const fin = horaFin(ultima.fin, d);
            const especiales = fs.filter((f) => f.nota);
            const nocturnas = fs.filter((f) => f.seccion.id === "nocturna");
            return (
              <li key={d} className={s.dia}>
                <p className={s.diaSemana}>{capitalizar(diaSemana(d))}</p>
                <p className={`${s.diaNumero} num`}>{numeroDia(d)}</p>
                <dl className={s.diaDatos}>
                  <div>
                    <dt>Funciones</dt>
                    <dd className="num">{fs.length}</dd>
                  </div>
                  <div>
                    <dt>Primera</dt>
                    <dd className="num">{hora(primera.ini)}</dd>
                  </div>
                  <div>
                    <dt>Termina</dt>
                    <dd className="num">
                      {fin.hora}
                      {fin.otroDia && <small> madrugada</small>}
                    </dd>
                  </div>
                </dl>
                <ul className={s.diaHitos}>
                  {especiales.map((f) => (
                    <li key={f.id}>
                      <span className="num">{hora(f.ini)}</span>
                      <span>
                        <Link href={`/pelicula/${f.pelicula.id}`}>{f.pelicula.titulo}</Link> ·{" "}
                        {nombreSalaCorto(f.salaId)}. {f.nota}
                      </span>
                    </li>
                  ))}
                  {nocturnas.length > 0 && (
                    <li>
                      <span className="num">{hora(nocturnas[0].ini)}</span>
                      <span>
                        Bruma Nocturna:{" "}
                        {nocturnas.map((f, i) => (
                          <span key={f.id}>
                            {i > 0 && (i === nocturnas.length - 1 ? " y " : ", ")}
                            <Link href={`/pelicula/${f.pelicula.id}`}>{f.pelicula.titulo}</Link>
                          </span>
                        ))}
                        .
                      </span>
                    </li>
                  )}
                </ul>
                <Link href={`/programa?dia=${d}`} className={s.diaEnlace}>
                  Programa del {diaSemana(d)}
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ------------------------------ Salas ------------------------------ */}
      <section className={`contenedor ${s.salas}`} aria-labelledby="titulo-salas">
        <h2 id="titulo-salas" className={s.tituloGrande}>
          Cuatro salas, a pie
        </h2>
        <div className={s.salasGrilla}>
          <ul className={s.listaSalas}>
            {salas.map((sala) => (
              <li key={sala.id} className={s.sala} data-aire={sala.aireLibre || undefined}>
                <h3>{sala.nombre}</h3>
                <p className={s.salaDir}>{sala.direccion}</p>
                <p className={`${s.salaCap} num`}>
                  {sala.capacidad} {sala.aireLibre ? "personas" : "butacas"}
                  {sala.aireLibre && <span> · aire libre y gratis</span>}
                </p>
                {sala.nota && <p className={s.salaNota}>{sala.nota}</p>}
              </li>
            ))}
          </ul>

          <figure className={s.traslados}>
            <figcaption>
              <strong>Minutos caminando</strong> entre salas. Con esto el itinerario calcula si alcanzas a llegar.
            </figcaption>
            <div className={s.tablaScroll}>
              <table className={s.tabla}>
                <thead>
                  <tr>
                    <td />
                    {salas.slice(0, -1).map((c) => (
                      <th key={c.id} scope="col">
                        {nombreSalaCorto(c.id)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {salas.slice(1).map((fila, i) => (
                    <tr key={fila.id}>
                      <th scope="row">{nombreSalaCorto(fila.id)}</th>
                      {salas.slice(0, -1).map((col, j) =>
                        j <= i ? (
                          <td
                            key={col.id}
                            className="num"
                            style={{ "--t": traslado(fila.id, col.id) / MAX_TRASLADO } as CSSProperties}
                          >
                            {traslado(fila.id, col.id)}
                          </td>
                        ) : (
                          <td key={col.id} aria-hidden="true" className={s.celdaVacia} />
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>
        </div>
      </section>

      {/* ------------------------------ Entradas ------------------------------ */}
      <section className={`contenedor ${s.entradas}`} aria-labelledby="titulo-entradas">
        <div className={s.boleto}>
          <div className={s.boletoIzq}>
            <h2 id="titulo-entradas" className={s.etiquetaSeccion}>
              Entradas
            </h2>
            <p className={`${s.precio} num`}>${e.general.toLocaleString("es-CL")}</p>
            <p className={s.precioNota}>
              Entrada general. Las funciones al aire libre en la Terraza Faro son{" "}
              {e.aireLibre === 0 ? "gratis" : `$${e.aireLibre.toLocaleString("es-CL")}`}.
            </p>
          </div>
          <div className={s.boletoDer}>
            <p>{e.venta}</p>
            <p className={s.boletoCta}>
              Como se compra en la puerta, arma tu recorrido antes y llega con tiempo.
            </p>
            <Link href="/itinerario" className={s.botonOscuro}>
              Armar mi itinerario
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
