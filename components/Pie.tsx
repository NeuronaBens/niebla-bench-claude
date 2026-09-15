import { dias, festival, formatoCLP, salas } from "@/lib/datos";
import styles from "./Pie.module.css";

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

/** "15, 16 y 17 de octubre de 2026" a partir de los datos. */
function fechasFestival(): string {
  const [anio, mes] = festival.fechaInicio.split("-").map(Number);
  const numeros = dias.map((d) => d.numero);
  const ultimo = numeros[numeros.length - 1];
  const primeros = numeros.slice(0, -1).join(", ");
  const diasTexto = numeros.length > 1 ? `${primeros} y ${ultimo}` : String(ultimo);
  return `${diasTexto} de ${MESES[mes - 1]} de ${anio}`;
}

export default function Pie() {
  const { entradas, contacto } = festival;

  return (
    <footer className={styles.pie}>
      <div className={`contenedor ${styles.grilla}`}>
        <div className={styles.bloque}>
          <p className={styles.nombre}>
            {festival.nombre}
            <span className={styles.edicion}> · {festival.edicion}ª edición</span>
          </p>
          <p>
            {fechasFestival()} · {festival.ciudad}
          </p>
          <p className={styles.tenue}>Horarios en hora local de Chile.</p>
        </div>

        <div className={styles.bloque}>
          <h2 className={`etiqueta ${styles.titulo}`}>Entradas</h2>
          <ul className={styles.lista}>
            <li>
              <span className={styles.valor}>{formatoCLP(entradas.general)}</span> entrada general
            </li>
            <li>
              <span className={styles.valor}>{formatoCLP(entradas.aireLibre)}</span> funciones al aire libre
            </li>
          </ul>
          <p className={styles.tenue}>{entradas.venta}</p>
        </div>

        <div className={styles.bloque}>
          <h2 className={`etiqueta ${styles.titulo}`}>Contacto</h2>
          <ul className={styles.lista}>
            <li>
              <a className={styles.enlace} href={`mailto:${contacto.correo}`}>
                {contacto.correo}
              </a>
            </li>
            <li>
              <span className={styles.tenue}>Instagram </span>
              {contacto.instagram}
            </li>
          </ul>
        </div>

        <div className={`${styles.bloque} ${styles.salas}`}>
          <h2 className={`etiqueta ${styles.titulo}`}>Salas</h2>
          <ul className={styles.listaSalas}>
            {salas.map((sala) => (
              <li key={sala.id} className={styles.sala}>
                <span className={styles.salaNombre}>{sala.nombre}</span>
                <span className={styles.tenue}>{sala.direccion}</span>
                {sala.nota && <span className={styles.nota}>{sala.nota}</span>}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
