import { peliculas } from "@/lib/programa";
import { colorSeccion } from "./derivados";
import s from "./Marquesina.module.css";

/** Cinta de títulos que corre como el letrero de un cine. Decorativa: los títulos están en el programa. */
export default function Marquesina() {
  const tira = (copia: number) => (
    <ul className={s.tira} aria-hidden="true" key={copia}>
      {peliculas.map((p, i) => (
        <li key={p.id} className={i % 2 ? s.hueco : s.lleno}>
          <span className={s.marca} style={{ background: colorSeccion(p.seccion) }} />
          {p.titulo}
        </li>
      ))}
    </ul>
  );

  return (
    <div className={s.marquesina}>
      <p className="sr-only">
        {peliculas.length} películas en el programa: {peliculas.map((p) => p.titulo).join(", ")}.
      </p>
      <div className={s.pista}>
        {tira(0)}
        {tira(1)}
      </div>
    </div>
  );
}
