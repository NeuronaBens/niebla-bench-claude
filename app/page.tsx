import Link from "next/link";
import {
  festival,
  peliculas,
  salas,
  secciones,
  funcionesExpandidas,
  traslado,
  nombreCorto,
} from "@/lib/programa";
import { DIAS } from "@/lib/tiempo";
import TarjetaFuncion from "@/components/TarjetaFuncion";
import styles from "./page.module.css";

function generarSvgOlas(): string {
  return `
    <svg viewBox="0 0 1200 400" xmlns="http://www.w3.org/2000/svg" style="position: absolute; bottom: 0; left: 0; right: 0; width: 100%; height: auto;">
      <path d="M0,200 Q300,150 600,200 T1200,200" stroke="var(--mar)" stroke-width="1" fill="none" opacity="0.2" />
      <path d="M0,240 Q300,180 600,240 T1200,240" stroke="var(--mar)" stroke-width="1" fill="none" opacity="0.15" />
      <path d="M0,280 Q300,220 600,280 T1200,280" stroke="var(--mar)" stroke-width="1.5" fill="none" opacity="0.25" />
    </svg>
  `;
}

export default function Home() {
  // Películas con nota o conversatorio para destacar
  const funcionesDestacadas = funcionesExpandidas.filter(
    (f) => f.nota || f.conversatorioMin
  );

  // Contar traslados para tabla
  const salaIds: Array<"teatro" | "muelle" | "galpon" | "terraza"> = [
    "teatro",
    "muelle",
    "galpon",
    "terraza",
  ];

  return (
    <>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroFondo}>
          <div className={styles.nieblaLayer1} />
          <div className={styles.nieblaLayer2} />
          <div className={styles.nieblaLayer3} />
          <div className={styles.faro}>
            <div className={styles.faroLuz} />
          </div>
          <div
            dangerouslySetInnerHTML={{ __html: generarSvgOlas() }}
            style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%", height: "auto" }}
          />
        </div>

        <div className={styles.heroContenido}>
          <p className={styles.sobretitulo}>Tercera edición · Puerto Bruma</p>
          <h1 className={styles.titulo}>Festival de Cine Niebla</h1>
          <p className={styles.fechas}>15, 16 y 17 de octubre de 2026</p>
          <p className={styles.frase}>Tres días de cine en el puerto, con niebla o sin ella.</p>

          <div className={styles.botones}>
            <Link href="/programa" className={styles.botonPrimario}>
              Ver el programa
            </Link>
            <Link href="/itinerario" className={styles.botonSecundario}>
              Armar mi itinerario
            </Link>
          </div>
        </div>
      </section>

      {/* DATOS */}
      <section className={styles.franjaDatos}>
        <div className={styles.datosContenedor}>
          <div className={styles.datosNumeros}>
            <div className={styles.datosItem}>
              <strong>{peliculas.length}</strong>
              <span>películas</span>
            </div>
            <div className={styles.datosItem}>
              <strong>{salas.length}</strong>
              <span>salas</span>
            </div>
            <div className={styles.datosItem}>
              <strong>{DIAS.length}</strong>
              <span>días</span>
            </div>
          </div>

          <div className={styles.datosEntradas}>
            <div className={styles.datosItem}>
              <strong>${festival.entradas.general.toLocaleString("es-CL")}</strong>
              <span>entrada general</span>
            </div>
            <div className={styles.datosItem}>
              <span>Aire libre gratis</span>
            </div>
            <div className={styles.datosItem}>
              <span>Solo en boletería de cada sala</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUÉ ES */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Qué es Festival Niebla</h2>
        <div className={styles.seccionTexto}>
          <p>
            Somos un festival de cine chico de Puerto Bruma, un puerto de la costa de
            Chile. Lo organizamos entre cuatro personas, con fondos concursables y mucha ayuda
            de voluntarios. Esta es nuestra tercera edición.
          </p>
          <p>
            Nuestro público es gente del puerto y de la región. La mayoría trabaja, así que el
            jueves y el viernes llegan corriendo después de la pega. El sábado es el día fuerte.
          </p>
          <p>
            Casi todos revisan el programa desde el celular, muchas veces caminando de una sala a
            otra.
          </p>
        </div>
      </section>

      {/* SECCIONES */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Las cuatro secciones</h2>
        <div className={styles.tarjetasSecciones}>
          {secciones.map((seccion) => {
            const conteo = peliculas.filter((p) => p.seccion === seccion.id).length;
            return (
              <Link
                key={seccion.id}
                href={`/programa?seccion=${seccion.id}`}
                className={`${styles.tarjetaSeccion} sec-${seccion.id}`}
              >
                <h3 className={styles.tarjetaSeccionNombre}>{seccion.nombre}</h3>
                <p className={styles.tarjetaSeccionDesc}>{seccion.descripcion}</p>
                <p className={styles.tarjetaSeccionCuenta}>
                  {conteo} película{conteo !== 1 ? "s" : ""}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* SALAS */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>Las cuatro salas</h2>
        <div className={styles.tarjetasSalas}>
          {salas.map((sala) => (
            <div key={sala.id} className={styles.tarjetaSala}>
              <h3 className={styles.tarjetaSalaNombre}>{sala.nombre}</h3>
              <div className={styles.tarjetaSalaDatos}>
                <div>{sala.direccion}</div>
                <div>{sala.capacidad} lugares</div>
                {sala.aireLibre && <div>Aire libre</div>}
              </div>
              {sala.nota && <div className={styles.tarjetaSalaNota}>{sala.nota}</div>}
            </div>
          ))}
        </div>

        <h3 className={styles.seccionTitulo} style={{ marginTop: "var(--espacio-2xl)", fontSize: "1.5rem" }}>
          Tiempos caminando entre salas
        </h3>
        <table className={styles.trasladosTabla}>
          <thead>
            <tr>
              <th>Desde / Hasta</th>
              {salaIds.map((id) => (
                <th key={id}>{nombreCorto(salas.find((s) => s.id === id)!)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {salaIds.map((desde) => (
              <tr key={desde}>
                <th>{nombreCorto(salas.find((s) => s.id === desde)!)}</th>
                {salaIds.map((hasta) => {
                  const tramos = traslado(desde, hasta);
                  return (
                    <td key={hasta}>
                      {tramos > 0 ? `${tramos} min` : "–"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FUNCIONES DESTACADAS */}
      {funcionesDestacadas.length > 0 && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Lo que no te puedes perder</h2>
          <div className={styles.funciones}>
            {funcionesDestacadas.slice(0, 4).map((funcion) => (
              <TarjetaFuncion
                key={funcion.id}
                funcion={funcion}
                mostrarDia={true}
              />
            ))}
          </div>
        </section>
      )}

      {/* CIERRE */}
      <section className={styles.seccion} style={{ textAlign: "center" }}>
        <Link href="/programa" className={styles.botonFinal}>
          Ver el programa completo
        </Link>
      </section>
    </>
  );
}
