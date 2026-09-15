import Link from "next/link";
import { IconoAlerta, IconoElegida, IconoGuardar, IconoLink } from "./ItinerarioIconos";
import styles from "./ItinerarioVista.module.css";

/** Estado vacío: cómo funciona el itinerario y CTA al programa. */
export default function ItinerarioVacio() {
  return (
    <div className={styles.cuerpo}>
      <header className={styles.cabeza}>
        <p className={`etiqueta ${styles.sobretitulo}`}>Festival de Cine Niebla · 15, 16 y 17 de octubre</p>
        <h1 className={styles.titulo}>Mi itinerario</h1>
        <p className={styles.resumen}>Todavía no has elegido ninguna función.</p>
      </header>

      <section className={`tarjeta ${styles.vacio}`} aria-labelledby="it-vacio-titulo">
        <h2 id="it-vacio-titulo" className={styles.vacioTitulo}>
          Arma tu recorrido
        </h2>
        <ul className={styles.comoFunciona}>
          <li className={styles.paso}>
            <span className={styles.pasoIcono} aria-hidden="true">
              <IconoElegida />
            </span>
            <span>Marca las funciones que quieras ver desde el programa o desde la ficha de cada película.</span>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoIcono} aria-hidden="true">
              <IconoAlerta />
            </span>
            <span>
              Te avisamos si dos se topan, si no alcanzas a llegar caminando de una sala a otra o si te perderías un
              conversatorio.
            </span>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoIcono} aria-hidden="true">
              <IconoGuardar />
            </span>
            <span>Se guarda en este navegador. Sin cuentas ni registro.</span>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoIcono} aria-hidden="true">
              <IconoLink />
            </span>
            <span>Lo compartes con un link: quien lo abra puede copiarlo al suyo.</span>
          </li>
        </ul>
        <Link href="/programa" className={`boton boton--primario ${styles.vacioCta}`}>
          Ver el programa
        </Link>
      </section>
    </div>
  );
}
