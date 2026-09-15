import Link from "next/link";
import { festival, salas } from "@/lib/datos";
import { rangoFechas } from "@/lib/tiempo";
import styles from "./Pie.module.css";

export function Pie() {
  return (
    <footer className={styles.pie}>
      <div className={`contenedor ${styles.grilla}`}>
        <div>
          <p className={styles.nombre}>{festival.nombre}</p>
          <p className={styles.texto}>
            {festival.edicion}ª edición · {rangoFechas()}
            <br />
            {festival.ciudad}, {festival.region}. Horarios en hora local de Chile.
          </p>
        </div>
        <div>
          <p className={styles.titulo}>Salas</p>
          <ul className={styles.lista}>
            {salas.map((s) => (
              <li key={s.id}>
                <span className={styles.salaNombre}>{s.nombre}</span>
                <span className={styles.texto}>{s.direccion}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className={styles.titulo}>Contacto</p>
          <ul className={styles.lista}>
            <li>
              <a href={`mailto:${festival.contacto.correo}`}>{festival.contacto.correo}</a>
            </li>
            <li>
              <span>Instagram {festival.contacto.instagram}</span>
            </li>
          </ul>
          <p className={styles.titulo} style={{ marginTop: 20 }}>
            Navegar
          </p>
          <ul className={styles.lista}>
            <li>
              <Link href="/programa">Programa</Link>
            </li>
            <li>
              <Link href="/itinerario">Mi itinerario</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className={`contenedor ${styles.final}`}>
        <p>Hecho en {festival.ciudad} por cuatro personas y muchas voluntarias y voluntarios.</p>
        <p>El festival no califica películas. Esta página tampoco.</p>
      </div>
    </footer>
  );
}
