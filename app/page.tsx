import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import {
  dias,
  festival,
  formatoCLP,
  formatoDuracion,
  funciones,
  funcionesDelDia,
  getDia,
  getFuncion,
  peliculas,
  peliculasDeSeccion,
  salas,
  secciones,
  type Funcion,
} from "@/lib/datos";
import Afiche from "@/components/Afiche";
import BotonItinerario from "@/components/BotonItinerario";
import PortadaHero from "@/components/PortadaHero";
import PortadaMapa from "@/components/PortadaMapa";
import styles from "./page.module.css";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

/** "15, 16 y 17 de octubre" a partir de los datos. */
function fechasCortas(): string {
  const [, mes] = festival.fechaInicio.split("-").map(Number);
  const numeros = dias.map((d) => d.numero);
  const ultimo = numeros[numeros.length - 1];
  const primeros = numeros.slice(0, -1).join(", ");
  const diasTexto = numeros.length > 1 ? `${primeros} y ${ultimo}` : String(ultimo);
  return `${diasTexto} de ${MESES[mes - 1]}`;
}

const anioFestival = Number(festival.fechaInicio.split("-")[0]);

export const metadata: Metadata = {
  title: {
    absolute: `${festival.nombre} · ${fechasCortas()} de ${anioFestival} en ${festival.ciudad}`,
  },
  description: `${festival.edicion}ª edición del ${festival.nombre}: ${peliculas.length} películas y ${funciones.length} funciones en ${salas.length} salas de ${festival.ciudad}, ${fechasCortas()} de ${anioFestival}. Revisa el programa y arma tu itinerario.`,
};

function estiloSeccion(id: string): CSSProperties {
  return {
    "--color-sec": `var(--sec-${id}, var(--faro))`,
    "--color-sec-suave": `var(--sec-${id}-suave, var(--faro-suave))`,
  } as CSSProperties;
}

function Flecha() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false">
      <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Fila compacta para los destacados: afiche chico, día y hora, título, sala y botón. */
function FilaFuncion({ funcion, extra }: { funcion: Funcion; extra?: string }) {
  const dia = getDia(funcion.dia);
  return (
    <li className={styles.fila} style={estiloSeccion(funcion.seccion.id)}>
      <Link href={`/pelicula/${funcion.pelicula.id}`} className={styles.filaAfiche} tabIndex={-1} aria-hidden="true">
        <Afiche pelicula={funcion.pelicula} tamano="chico" />
      </Link>
      <div className={styles.filaCuerpo}>
        <p className={styles.filaCuando}>
          <span className={styles.filaDia}>{dia?.etiqueta ?? funcion.dia}</span>
          <time dateTime={funcion.inicio} className={styles.filaHora}>
            {funcion.horaInicio}
          </time>
          <span className={styles.filaFin}>– {funcion.horaFin}</span>
        </p>
        <h4 className={styles.filaTitulo}>
          <Link href={`/pelicula/${funcion.pelicula.id}`}>{funcion.pelicula.titulo}</Link>
        </h4>
        <p className={styles.filaMeta}>
          <span>{funcion.sala.corto}</span>
          {extra && <span>{extra}</span>}
          {funcion.agotada && <span className={styles.agotada}>Agotada</span>}
        </p>
      </div>
      <div className={styles.filaBoton}>
        <BotonItinerario funcion={funcion} compacto />
      </div>
    </li>
  );
}

/** Tarjeta editorial grande para inauguración y premios. */
function Destacado({ funcion, rotulo }: { funcion: Funcion; rotulo: string }) {
  const dia = getDia(funcion.dia);
  const { pelicula, sala } = funcion;
  return (
    <article className={styles.destacado} style={estiloSeccion(funcion.seccion.id)} aria-labelledby={`dest-${funcion.id}`}>
      <Link href={`/pelicula/${pelicula.id}`} className={styles.destacadoAfiche} tabIndex={-1} aria-hidden="true">
        <Afiche pelicula={pelicula} tamano="mediano" />
      </Link>
      <div className={styles.destacadoCuerpo}>
        <p className={`etiqueta ${styles.destacadoRotulo}`}>{rotulo}</p>
        <p className={styles.destacadoCuando}>
          <span>{dia?.etiqueta ?? funcion.dia}</span>
          <time dateTime={funcion.inicio}>{funcion.horaInicio}</time>
          <span>{sala.corto}</span>
        </p>
        <h3 id={`dest-${funcion.id}`} className={styles.destacadoTitulo}>
          <Link href={`/pelicula/${pelicula.id}`}>{pelicula.titulo}</Link>
        </h3>
        <p className={styles.destacadoMeta}>
          {pelicula.direccion} · {pelicula.pais}, {pelicula.anio} · {formatoDuracion(pelicula.duracionMin)}
        </p>
        <p className={styles.destacadoSinopsis}>{pelicula.sinopsis}</p>
        {funcion.nota && <p className={styles.destacadoNota}>{funcion.nota}</p>}
        <div className={styles.destacadoAcciones}>
          <BotonItinerario funcion={funcion} />
          <Link href={`/pelicula/${pelicula.id}`} className={styles.enlaceFlecha}>
            Ver la ficha <Flecha />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Portada() {
  const inaugural = getFuncion("f05");
  const premios = getFuncion("f36");
  const aireLibre = funciones.filter((f) => f.sala.aireLibre);
  const conversatorios = funciones.filter((f) => f.conversatorioMin != null);
  const salaAireLibre = salas.find((s) => s.aireLibre);

  const cifras = [
    { n: peliculas.length, texto: "películas" },
    { n: funciones.length, texto: "funciones" },
    { n: salas.length, texto: "salas" },
    { n: dias.length, texto: "días" },
  ];

  return (
    <>
      <PortadaHero edicion={festival.edicion} fechas={fechasCortas()} ciudad={festival.ciudad} />

      {/* ---------- Cifras ---------- */}
      <section id="cifras" className={styles.cifras} aria-label="El festival en números">
        <div className={`contenedor ${styles.cifrasGrilla}`}>
          <ul className={styles.numeros}>
            {cifras.map((c) => (
              <li key={c.texto} className={styles.numero}>
                <span className={styles.numeroValor}>{c.n}</span>
                <span className={styles.numeroTexto}>{c.texto}</span>
              </li>
            ))}
          </ul>
          <div className={styles.entradas}>
            <p className={styles.entrada}>
              <span className={styles.entradaValor}>{formatoCLP(festival.entradas.general)}</span>
              <span>entrada general</span>
            </p>
            <p className={styles.entrada}>
              <span className={styles.entradaValor}>{formatoCLP(festival.entradas.aireLibre)}</span>
              <span>al aire libre</span>
            </p>
            <p className={styles.entradaVenta}>{festival.entradas.venta}</p>
          </div>
        </div>
      </section>

      {/* ---------- Secciones ---------- */}
      <section className={styles.seccion} aria-labelledby="secciones-titulo">
        <div className="contenedor">
          <header className={styles.encabezado}>
            <p className="etiqueta">Qué se ve</p>
            <h2 id="secciones-titulo">Cuatro secciones, cuatro colores</h2>
          </header>
        </div>
        <ul className={`${styles.tira} ${styles.tiraSecciones}`}>
          {secciones.map((s) => {
            const n = peliculasDeSeccion(s.id).length;
            return (
              <li key={s.id} className={styles.tiraItem} style={estiloSeccion(s.id)}>
                <Link href={`/programa?seccion=${s.id}`} className={styles.seccionTarjeta}>
                  <span className={styles.seccionBarra} aria-hidden="true" />
                  <span className={styles.seccionNombre}>{s.nombre}</span>
                  <span className={styles.seccionDescripcion}>{s.descripcion}</span>
                  <span className={styles.seccionPie}>
                    {n} {n === 1 ? "película" : "películas"} <Flecha />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ---------- Programa por día ---------- */}
      <section className={styles.seccion} aria-labelledby="dias-titulo">
        <div className="contenedor">
          <header className={`${styles.encabezado} ${styles.encabezadoConEnlace}`}>
            <div>
              <p className="etiqueta">De un vistazo</p>
              <h2 id="dias-titulo">El programa, día por día</h2>
            </div>
            <Link href="/programa" className={styles.enlaceFlecha}>
              Todo el programa <Flecha />
            </Link>
          </header>
        </div>

        {dias.map((dia) => {
          const lista = funcionesDelDia(dia.id);
          const primera = lista[0];
          const ultima = lista[lista.length - 1];
          return (
            <div key={dia.id} className={styles.dia}>
              <div className={`contenedor ${styles.diaCabecera}`}>
                <h3 className={styles.diaNombre}>
                  <Link href={`/programa?dia=${dia.id}`}>
                    {dia.nombre} <span className={styles.diaNumero}>{dia.numero}</span>
                  </Link>
                </h3>
                <p className={styles.diaResumen}>
                  {lista.length} funciones · primera a las {primera?.horaInicio}, última a las {ultima?.horaInicio}
                </p>
              </div>
              <ul className={`${styles.tira} ${styles.tiraAfiches}`} aria-label={`Funciones del ${dia.etiqueta}`}>
                {lista.map((f) => (
                  <li key={f.id} className={styles.aficheItem} style={estiloSeccion(f.seccion.id)}>
                    <Link href={`/pelicula/${f.pelicula.id}`} className={styles.aficheEnlace}>
                      <Afiche pelicula={f.pelicula} tamano="chico" />
                      <span className={styles.aficheHora}>
                        <time dateTime={f.inicio}>{f.horaInicio}</time>
                        {f.agotada && <span className={styles.aficheAgotada}>Agotada</span>}
                      </span>
                      <span className={styles.aficheSala}>{f.sala.corto}</span>
                      <span className="visually-hidden">, {f.pelicula.titulo}</span>
                    </Link>
                  </li>
                ))}
                <li className={styles.aficheItem}>
                  <Link href={`/programa?dia=${dia.id}`} className={styles.aficheMas}>
                    <span>Ver todo el {dia.nombre.toLowerCase()}</span>
                    <Flecha />
                  </Link>
                </li>
              </ul>
            </div>
          );
        })}
      </section>

      {/* ---------- Destacados ---------- */}
      <section className={styles.seccion} aria-labelledby="destacados-titulo">
        <div className="contenedor">
          <header className={styles.encabezado}>
            <p className="etiqueta">Para no perderse</p>
            <h2 id="destacados-titulo">Lo que pasa además de las películas</h2>
          </header>

          <div className={styles.destacados}>
            {inaugural && <Destacado funcion={inaugural} rotulo="Función inaugural" />}
            {premios && <Destacado funcion={premios} rotulo="Entrega de premios" />}
          </div>

          <div className={styles.listas}>
            <div className={styles.lista}>
              <h3 className={styles.listaTitulo}>
                Al aire libre
                <span className={styles.listaSub}>
                  {" "}
                  en {salaAireLibre?.nombre ?? "Terraza Faro"} · {formatoCLP(festival.entradas.aireLibre).toLowerCase()}
                </span>
              </h3>
              {salaAireLibre?.nota && <p className={styles.listaNota}>{salaAireLibre.nota}</p>}
              <ul className={styles.filas}>
                {aireLibre.map((f) => (
                  <FilaFuncion key={f.id} funcion={f} />
                ))}
              </ul>
            </div>

            <div className={styles.lista}>
              <h3 className={styles.listaTitulo}>
                Con conversatorio
                <span className={styles.listaSub}> después de la película</span>
              </h3>
              <p className={styles.listaNota}>
                Se conversa con quienes la hicieron. Si vas a otra función después, el itinerario te avisa si te lo
                perderías.
              </p>
              <ul className={styles.filas}>
                {conversatorios.map((f) => (
                  <FilaFuncion key={f.id} funcion={f} extra={`+${f.conversatorioMin} min de conversatorio`} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Salas ---------- */}
      <section className={styles.seccion} aria-labelledby="salas-titulo">
        <div className="contenedor">
          <header className={styles.encabezado}>
            <p className="etiqueta">Dónde</p>
            <h2 id="salas-titulo">Cuatro salas, todas a pie</h2>
          </header>
          <div className={styles.salas}>
            <PortadaMapa />
            <ol className={styles.listaSalas}>
              {salas.map((sala, i) => (
                <li key={sala.id} className={styles.sala}>
                  <span className={`${styles.salaNumero} ${sala.aireLibre ? styles.salaNumeroFaro : ""}`} aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className={styles.salaCuerpo}>
                    <h3 className={styles.salaNombre}>{sala.nombre}</h3>
                    <p className={styles.salaDireccion}>{sala.direccion}</p>
                    <p className={styles.salaMeta}>
                      {sala.capacidad} personas
                      {sala.aireLibre && <span> · al aire libre</span>}
                    </p>
                    {sala.nota && <p className={styles.salaNota}>{sala.nota}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- Mi itinerario ---------- */}
      <section className={`${styles.seccion} ${styles.itinerario}`} aria-labelledby="itinerario-titulo">
        <div className="contenedor">
          <header className={styles.encabezado}>
            <p className="etiqueta">Mi itinerario</p>
            <h2 id="itinerario-titulo">Arma tu recorrido sin sacar cuentas</h2>
          </header>
          <ol className={styles.pasos}>
            <li className={styles.paso}>
              <span className={styles.pasoNumero} aria-hidden="true">
                1
              </span>
              <h3 className={styles.pasoTitulo}>Marca las funciones</h3>
              <p className={styles.pasoTexto}>
                Desde el programa o la ficha de cada película. Se guarda en tu celular, sin cuentas ni registro.
              </p>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNumero} aria-hidden="true">
                2
              </span>
              <h3 className={styles.pasoTitulo}>Te avisamos si algo no calza</h3>
              <p className={styles.pasoTexto}>
                Si dos funciones se topan, si no alcanzas a llegar caminando de una sala a otra o si te perderías
                un conversatorio.
              </p>
            </li>
            <li className={styles.paso}>
              <span className={styles.pasoNumero} aria-hidden="true">
                3
              </span>
              <h3 className={styles.pasoTitulo}>Comparte el link</h3>
              <p className={styles.pasoTexto}>
                Tu itinerario es un enlace. Quien lo abre lo ve tal cual y puede copiarlo al suyo.
              </p>
            </li>
          </ol>
          <div className={styles.itinerarioAcciones}>
            <Link href="/itinerario" className="boton boton--primario">
              Armar mi itinerario
            </Link>
            <Link href="/programa" className="boton boton--fantasma">
              Ver el programa
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
