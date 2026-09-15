import Link from "next/link";
import { MapaSalas } from "@/components/MapaSalas";
import { TarjetaPelicula } from "@/components/TarjetaPelicula";
import { ChipSeccion } from "@/components/Etiquetas";
import {
  festival,
  formatoCLP,
  funciones,
  pelicula,
  peliculas,
  peliculasDeSeccion,
  sala,
  salas,
  secciones,
  traslado,
} from "@/lib/datos";
import { calcularFuncion, dias, ordenarPorInicio, rangoFechas } from "@/lib/tiempo";
import styles from "./page.module.css";

function Momentos() {
  const calc = ordenarPorInicio(funciones.map(calcularFuncion));
  const conNota = calc.filter((f) => f.nota);
  const conConversatorio = calc.filter((f) => f.conversatorioMin);
  const aireLibre = calc.filter((f) => sala(f.salaId).aireLibre);

  const bloques = [
    ...conNota.map((f) => ({
      clave: f.id,
      sobre: f.nota!.toLowerCase().includes("inaugural") ? "Apertura" : "Cierre",
      f,
      texto: f.nota!,
    })),
    {
      clave: "conversatorios",
      sobre: "Conversatorios",
      f: null,
      texto: `Después de ${conConversatorio.length} funciones nos quedamos conversando con quienes hicieron la película. El itinerario te avisa si te lo perderías por correr a la siguiente.`,
      lista: conConversatorio,
    },
    {
      clave: "aire-libre",
      sobre: "Al aire libre",
      f: null,
      texto: `${aireLibre.length} funciones gratis en la Terraza Faro, con el mar al lado. Si llueve, se trasladan al Galpón 7 a la misma hora.`,
      lista: aireLibre,
    },
  ];

  return (
    <div className={styles.momentos}>
      {bloques.map((b) => {
        const p = b.f ? pelicula(b.f.peliculaId) : null;
        return (
          <article key={b.clave} className={styles.momento}>
            <p className="sobreimpreso">{b.sobre}</p>
            {b.f && p ? (
              <>
                <h3 className={styles.momentoTitulo}>
                  <Link href={`/pelicula/${p.id}`}>{p.titulo}</Link>
                </h3>
                <p className={`mono ${styles.momentoHora}`}>
                  {b.f.dia.etiqueta} · {b.f.horaInicio} · {sala(b.f.salaId).nombre}
                </p>
                <p className={styles.momentoTexto}>{b.texto}</p>
              </>
            ) : (
              <>
                <p className={styles.momentoTexto}>{b.texto}</p>
                <ul className={styles.momentoLista}>
                  {"lista" in b &&
                    b.lista?.map((f) => {
                      const pf = pelicula(f.peliculaId);
                      if (!pf) return null;
                      return (
                        <li key={f.id}>
                          <span className="mono">
                            {f.dia.nombreCorto} {f.horaInicio}
                          </span>{" "}
                          <Link href={`/pelicula/${pf.id}`}>{pf.titulo}</Link>
                        </li>
                      );
                    })}
                </ul>
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}

export default function Portada() {
  const trayectos = salas.flatMap((a) =>
    salas.filter((b) => b.id !== a.id).map((b) => traslado(a.id, b.id)),
  );
  const trayectoMin = Math.min(...trayectos);
  const trayectoMax = Math.max(...trayectos);

  return (
    <>
      <section className={styles.hero} aria-labelledby="hero-titulo">
        <div className={styles.cielo} aria-hidden="true">
          <div className={`${styles.haz}`} />
          <div className={`${styles.nieblaCapa} ${styles.niebla1}`} />
          <div className={`${styles.nieblaCapa} ${styles.niebla2}`} />
          <div className={`${styles.nieblaCapa} ${styles.niebla3}`} />
        </div>
        <div className={`contenedor ${styles.heroContenido}`}>
          <p className={`${styles.heroSobre} aparece`}>
            Festival de cine · {festival.ciudad} · {festival.edicion}ª edición
          </p>
          <h1 id="hero-titulo" className={`${styles.heroTitulo} aparece`}>
            Niebla
          </h1>
          <p className={`${styles.heroFecha} aparece`}>
            {dias.map((d, i) => (
              <span key={d.fecha}>
                {i > 0 && (i === dias.length - 1 ? " y " : ", ")}
                <span className={styles.heroDia}>{d.nombre}</span> {d.numero}
              </span>
            ))}{" "}
            de octubre de 2026
          </p>
          <p className={`${styles.heroTexto} aparece`}>
            Tres días de cine en un puerto donde la niebla llega antes que la noche. Salas chicas,
            películas que no pasan por el cine comercial, entradas a {formatoCLP(festival.entradas.general)} y
            conversaciones que siguen en la calle.
          </p>
          <div className={`${styles.heroAcciones} aparece`}>
            <Link href="/programa" className="boton boton--faro">
              Ver el programa
            </Link>
            <Link href="/itinerario" className="boton boton--claro">
              Armar mi itinerario
            </Link>
          </div>
          <dl className={`${styles.cifras} aparece`}>
            <div>
              <dt>Películas</dt>
              <dd className="mono">{peliculas.length}</dd>
            </div>
            <div>
              <dt>Funciones</dt>
              <dd className="mono">{funciones.length}</dd>
            </div>
            <div>
              <dt>Salas</dt>
              <dd className="mono">{salas.length}</dd>
            </div>
            <div>
              <dt>Días</dt>
              <dd className="mono">{dias.length}</dd>
            </div>
          </dl>
        </div>
        <svg className={styles.orilla} viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 60c120-30 240-30 360 0s240 30 360 0 240-30 360 0 240 30 360 0v30H0z" />
        </svg>
      </section>

      <section className={`contenedor ${styles.bloque}`} aria-labelledby="que-es">
        <div className={styles.dosColumnas}>
          <div>
            <p className="sobreimpreso">Qué es esto</p>
            <h2 id="que-es" className="seccion-titulo">
              Un festival chico, del puerto, hecho a pulso.
            </h2>
          </div>
          <div className={styles.prosa}>
            <p>
              El Festival de Cine Niebla lo organizamos cuatro personas de {festival.ciudad}, con
              fondos concursables y la ayuda de mucha gente voluntaria. Esta es la tercera edición:{" "}
              {rangoFechas()}, con {peliculas.length} películas en {salas.length} salas a distancia
              caminable.
            </p>
            <p>
              El jueves y el viernes las funciones parten en la tarde, para llegar después de la
              pega. El sábado es el día fuerte: cine desde el mediodía hasta pasada la medianoche.
            </p>
            <p>
              No calificamos películas ni repartimos estrellas. Elegimos las que queremos ver con
              ustedes y las ponemos en pantalla.
            </p>
          </div>
        </div>
      </section>

      <section className={`contenedor ${styles.bloque}`} aria-labelledby="secciones-titulo">
        <p className="sobreimpreso">Cuatro secciones</p>
        <h2 id="secciones-titulo" className="seccion-titulo">
          Lo que vas a ver
        </h2>
        <div className={styles.secciones}>
          {secciones.map((s) => {
            const lista = peliculasDeSeccion(s.id);
            return (
              <article key={s.id} className={`${styles.seccionTarjeta} ${styles[`sec_${s.id}`]}`}>
                <div className={styles.seccionTexto}>
                  <ChipSeccion id={s.id} />
                  <h3 className={styles.seccionNombre}>{s.nombre}</h3>
                  <p className={styles.seccionDesc}>{s.descripcion}</p>
                  <Link href={`/programa?seccion=${s.id}`} className={styles.seccionEnlace}>
                    {lista.length} películas en el programa
                  </Link>
                </div>
                <div className={styles.seccionAfiches}>
                  {lista.slice(0, 3).map((p) => (
                    <TarjetaPelicula key={p.id} pelicula={p} />
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className={`${styles.bloqueOscuro}`} aria-labelledby="momentos-titulo">
        <div className="contenedor">
          <p className="sobreimpreso">Para no perderse</p>
          <h2 id="momentos-titulo" className="seccion-titulo">
            Momentos del festival
          </h2>
          <Momentos />
        </div>
      </section>

      <section className={`contenedor ${styles.bloque}`} aria-labelledby="salas-titulo">
        <div className={styles.dosColumnas}>
          <div>
            <p className="sobreimpreso">Dónde</p>
            <h2 id="salas-titulo" className="seccion-titulo">
              Cuatro salas, todo a pie
            </h2>
            <p className="seccion-sub">
              Entre una sala y otra hay entre {trayectoMin} y {trayectoMax} minutos caminando. Tu
              itinerario usa estos tiempos para avisarte si no alcanzas a llegar.
            </p>
            <ul className={styles.listaSalas}>
              {salas.map((s) => (
                <li key={s.id}>
                  <strong>{s.nombre}</strong>
                  <span>
                    {s.direccion} · {s.capacidad} butacas
                    {s.aireLibre ? " · al aire libre" : ""}
                  </span>
                  {s.nota && <span className={styles.salaNota}>{s.nota}</span>}
                </li>
              ))}
            </ul>
          </div>
          <MapaSalas />
        </div>
      </section>

      <section className={`contenedor ${styles.bloque}`} aria-labelledby="entradas-titulo">
        <div className={styles.entradas}>
          <div>
            <p className="sobreimpreso">Entradas</p>
            <h2 id="entradas-titulo" className="seccion-titulo">
              {formatoCLP(festival.entradas.general)} la función.
              <br />
              Al aire libre, {festival.entradas.aireLibre === 0 ? "gratis" : formatoCLP(festival.entradas.aireLibre)}.
            </h2>
          </div>
          <p className={styles.entradasTexto}>{festival.entradas.venta}</p>
        </div>
      </section>

      <section className={`contenedor ${styles.cierre}`}>
        <h2 className={styles.cierreTitulo}>¿Qué vas a ver?</h2>
        <p className={styles.cierreTexto}>
          Marca las funciones que te tincan y el itinerario te dice si se topan, si alcanzas a
          llegar caminando y si te perderías un conversatorio. Después compártelo con un enlace.
        </p>
        <div className={styles.heroAcciones}>
          <Link href="/programa" className="boton">
            Ver el programa completo
          </Link>
        </div>
      </section>
    </>
  );
}
