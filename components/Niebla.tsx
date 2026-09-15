import styles from "./Niebla.module.css";

/** Fondo decorativo: capas de niebla que derivan despacio sobre la noche. */
export default function Niebla() {
  return (
    <div className={styles.niebla} aria-hidden="true">
      <div className={`${styles.capa} ${styles.capa1}`} />
      <div className={`${styles.capa} ${styles.capa2}`} />
      <div className={`${styles.capa} ${styles.capa3}`} />
      <div className={`${styles.capa} ${styles.capa4}`} />
      <div className={styles.vineta} />
    </div>
  );
}
