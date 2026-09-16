import { festival } from "@/lib/programa";
import styles from "./Footer.module.css";

export default function Footer() {
  const precioFormato = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(festival.entradas.general);

  return (
    <footer className={styles.footer}>
      <div className={styles.contenedor}>
        <div className={styles.seccion}>
          <h3>Contacto</h3>
          <div className={styles.contacto}>
            <a href={`mailto:${festival.contacto.correo}`}>{festival.contacto.correo}</a>
            <a href={`https://instagram.com/${festival.contacto.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer">
              {festival.contacto.instagram}
            </a>
          </div>
        </div>

        <div className={styles.seccion}>
          <h3>Entradas</h3>
          <div className={styles.entradas}>
            <strong>Función general</strong>
            <div className={styles.precio}>{precioFormato}</div>
            <div>Boletería de cada sala, una hora antes de cada función.</div>
            <div style={{ marginTop: "var(--espacio-md)" }}>
              <strong style={{ display: "block", marginBottom: "var(--espacio-xs)" }}>Aire libre</strong>
              Gratis
            </div>
          </div>
        </div>

        <div className={styles.seccion}>
          <h3>Festival de Cine Niebla</h3>
          <div style={{ fontSize: "0.9rem", lineHeight: 1.6 }}>
            3ª edición
            <br />
            Puerto Bruma, Chile
            <br />
            15–17 de octubre
          </div>
        </div>
      </div>

      <div className={styles.pie}>
        © 2026 Festival de Cine Niebla. Todos los derechos reservados.
      </div>
    </footer>
  );
}
