import Link from "next/link";
import s from "./not-found.module.css";

export default function NoEncontrada() {
  return (
    <section className={s.pagina} aria-labelledby="titulo-404">
      <div className={s.escena} aria-hidden="true">
        <span className={s.numero}>404</span>
        <span className={`${s.banco} ${s.banco1}`} />
        <span className={`${s.banco} ${s.banco2}`} />
        <span className={`${s.banco} ${s.banco3}`} />
        <svg className={s.faro} viewBox="0 0 120 200" focusable="false">
          <g className={s.haz}>
            <path d="M60 58 L-900 0 L-900 130 Z" fill="var(--faro)" opacity="0.1" />
            <path d="M60 58 L-900 36 L-900 92 Z" fill="var(--faro)" opacity="0.14" />
            <path d="M60 58 L1000 0 L1000 130 Z" fill="var(--faro)" opacity="0.1" />
          </g>
          <circle cx="60" cy="58" r="14" fill="var(--faro)" opacity="0.25" className={s.destello} />
          <path d="M47 48 L60 36 L73 48 Z" fill="#0a1118" />
          <rect x="50" y="48" width="20" height="16" fill="var(--faro)" />
          <path d="M48 64 H72 L80 182 H40 Z" fill="#0a1118" />
          <path d="M45.6 100 H74.4 L75.8 120 H44.2 Z" fill="#3a1d22" />
          <path d="M20 182 Q60 170 100 182 L120 200 H0 Z" fill="#0a1118" />
        </svg>
      </div>

      <div className={s.texto}>
        <p className={s.codigo}>Error 404 · página no encontrada</p>
        <h1 id="titulo-404" className={s.titulo}>
          Se nos perdió en la niebla
        </h1>
        <p className={s.bajada}>
          Buscamos por todo el muelle y esta página no aparece. Puede que el link venga malo o que haya cambiado de
          lugar.
        </p>
        <div className={s.acciones}>
          <Link href="/programa" className={s.primario}>
            Ver el programa
          </Link>
          <Link href="/" className={s.secundario}>
            Volver a la portada
          </Link>
        </div>
      </div>
    </section>
  );
}
