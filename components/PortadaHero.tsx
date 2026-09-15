import Link from "next/link";
import styles from "./PortadaHero.module.css";

export interface PortadaHeroProps {
  edicion: number;
  fechas: string;
  ciudad: string;
}

/** Escena de fondo: horizonte, olas y un faro cuyo haz barre despacio sobre el título. */
function Faro() {
  return (
    <svg
      className={styles.escena}
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMaxYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="ph-haz" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="var(--faro)" stopOpacity="0.42" />
          <stop offset="0.35" stopColor="var(--faro)" stopOpacity="0.14" />
          <stop offset="1" stopColor="var(--faro)" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="ph-halo">
          <stop offset="0" stopColor="var(--faro)" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="var(--faro)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--faro)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ph-mar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5ec8e5" stopOpacity="0.1" />
          <stop offset="1" stopColor="#5ec8e5" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Estrellas */}
      <g fill="var(--niebla-100)">
        <circle cx="840" cy="70" r="1.1" opacity="0.5" />
        <circle cx="905" cy="140" r="0.8" opacity="0.4" />
        <circle cx="960" cy="52" r="1.3" opacity="0.55" />
        <circle cx="1030" cy="110" r="0.9" opacity="0.4" />
        <circle cx="1090" cy="40" r="1" opacity="0.5" />
        <circle cx="1140" cy="170" r="0.8" opacity="0.35" />
        <circle cx="1180" cy="90" r="1.2" opacity="0.5" />
        <circle cx="880" cy="230" r="0.8" opacity="0.3" />
        <circle cx="990" cy="200" r="1" opacity="0.4" />
        <circle cx="120" cy="80" r="1.1" opacity="0.45" />
        <circle cx="260" cy="150" r="0.8" opacity="0.35" />
        <circle cx="410" cy="60" r="1.2" opacity="0.5" />
        <circle cx="560" cy="120" r="0.9" opacity="0.4" />
        <circle cx="700" cy="40" r="1" opacity="0.45" />
        <circle cx="330" cy="240" r="0.8" opacity="0.3" />
        <circle cx="620" cy="210" r="1" opacity="0.35" />
      </g>

      {/* Mar y horizonte */}
      <rect x="0" y="730" width="1200" height="70" fill="url(#ph-mar)" />
      <line x1="0" y1="730" x2="1200" y2="730" stroke="var(--niebla-200)" strokeOpacity="0.16" />
      <path
        className={styles.ola}
        d="M0 756 Q 30 748 60 756 T 120 756 T 180 756 T 240 756 T 300 756 T 360 756 T 420 756 T 480 756 T 540 756 T 600 756 T 660 756 T 720 756 T 780 756 T 840 756 T 900 756 T 960 756 T 1020 756 T 1080 756 T 1140 756 T 1200 756"
        fill="none"
        stroke="var(--sec-panorama)"
        strokeOpacity="0.28"
        strokeWidth="1.2"
      />
      <path
        className={`${styles.ola} ${styles.ola2}`}
        d="M0 784 Q 40 776 80 784 T 160 784 T 240 784 T 320 784 T 400 784 T 480 784 T 560 784 T 640 784 T 720 784 T 800 784 T 880 784 T 960 784 T 1040 784 T 1120 784 T 1200 784"
        fill="none"
        stroke="var(--sec-panorama)"
        strokeOpacity="0.16"
        strokeWidth="1.2"
      />

      {/* Luces lejanas del puerto */}
      <g fill="var(--faro)">
        <circle cx="90" cy="727" r="1.6" opacity="0.7" />
        <circle cx="210" cy="727" r="1.2" opacity="0.5" />
        <circle cx="330" cy="727" r="1.8" opacity="0.6" />
        <circle cx="470" cy="727" r="1.2" opacity="0.45" />
        <circle cx="610" cy="727" r="1.6" opacity="0.6" />
        <circle cx="760" cy="727" r="1.2" opacity="0.5" />
      </g>
      <g fill="var(--sec-panorama)">
        <circle cx="150" cy="727" r="1.2" opacity="0.6" />
        <circle cx="400" cy="727" r="1.4" opacity="0.5" />
        <circle cx="690" cy="727" r="1.2" opacity="0.55" />
      </g>

      {/* Haz que barre */}
      <g className={styles.haz}>
        <polygon points="1150,420 -1600,60 -1600,780" fill="url(#ph-haz)" />
      </g>

      {/* Faro */}
      <circle className={styles.halo} cx="1150" cy="420" r="70" fill="url(#ph-halo)" />
      <polygon
        points="1132,428 1168,428 1186,730 1114,730"
        fill="var(--noche-950)"
        stroke="var(--niebla-200)"
        strokeOpacity="0.45"
        strokeWidth="1.5"
      />
      <rect x="1126" y="408" width="48" height="22" rx="3" fill="var(--noche-950)" stroke="var(--niebla-200)" strokeOpacity="0.45" strokeWidth="1.5" />
      <rect x="1134" y="396" width="32" height="12" rx="2" fill="var(--noche-950)" stroke="var(--niebla-200)" strokeOpacity="0.45" strokeWidth="1.5" />
      <line x1="1120" y1="560" x2="1180" y2="560" stroke="var(--niebla-200)" strokeOpacity="0.3" strokeWidth="1.5" />
      <circle cx="1150" cy="420" r="6" fill="var(--faro)" />
      <rect x="1108" y="730" width="84" height="6" rx="2" fill="var(--niebla-200)" fillOpacity="0.2" />
    </svg>
  );
}

export default function PortadaHero({ edicion, fechas, ciudad }: PortadaHeroProps) {
  return (
    <section className={styles.hero} aria-labelledby="portada-titulo">
      <Faro />
      <div className={`contenedor ${styles.contenido}`}>
        <p className={`etiqueta ${styles.edicion}`}>
          {edicion}ª edición
        </p>
        <h1 id="portada-titulo" className={styles.titulo}>
          <span className={styles.tituloLinea}>Festival de Cine</span>
          <em className={styles.tituloNiebla}>Niebla</em>
        </h1>
        <p className={styles.fechas}>
          <span className={styles.fechasDias}>{fechas}</span>
          <span className={styles.fechasLugar}>{ciudad}</span>
        </p>
        <p className={styles.frase}>
          Tres días de cine entre el muelle y el faro. Sales de la pega, te vienes caminando y la
          entrada la compras en la puerta.
        </p>
        <div className={styles.acciones}>
          <Link href="/programa" className="boton boton--primario">
            Ver el programa
          </Link>
          <Link href="/itinerario" className={`boton boton--fantasma ${styles.botonSecundario}`}>
            Armar mi itinerario
          </Link>
        </div>
      </div>
    </section>
  );
}
