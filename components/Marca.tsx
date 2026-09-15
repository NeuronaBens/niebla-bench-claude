import s from "./Marca.module.css";

/** Logotipo: un faro chico y la palabra NIEBLA. */
export default function Marca() {
  return (
    <span className={s.marca}>
      <svg viewBox="0 0 40 40" className={s.faro} aria-hidden="true">
        <polygon className={s.haz} points="20,12 40,4 40,20" />
        <polygon points="17,15 23,15 26,36 14,36" fill="currentColor" />
        <rect x="15.6" y="21" width="8.8" height="2.6" fill="var(--noche)" />
        <rect x="14.8" y="28" width="10.4" height="2.6" fill="var(--noche)" />
        <circle cx="20" cy="12" r="3.4" fill="var(--faro)" />
      </svg>
      <span className={s.texto}>Niebla</span>
    </span>
  );
}
