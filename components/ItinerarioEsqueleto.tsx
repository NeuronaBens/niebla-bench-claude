import styles from "./ItinerarioVista.module.css";

/** Esqueleto neutro mientras se lee el itinerario del navegador (evita mostrar el estado vacío por un instante). */
export default function ItinerarioEsqueleto() {
  return (
    <div className={styles.esqueleto} aria-busy="true" aria-label="Cargando itinerario">
      <div className={`${styles.hueso} ${styles.huesoEtiqueta}`} />
      <div className={`${styles.hueso} ${styles.huesoTitulo}`} />
      <div className={`${styles.hueso} ${styles.huesoLinea}`} />
      <div className={styles.huesoTarjetas}>
        <div className={`${styles.hueso} ${styles.huesoTarjeta}`} />
        <div className={`${styles.hueso} ${styles.huesoTarjeta}`} />
        <div className={`${styles.hueso} ${styles.huesoTarjeta}`} />
      </div>
    </div>
  );
}
