import { festival } from "@/lib/programa";
import Marca from "./Marca";
import s from "./PieDePagina.module.css";

export default function PieDePagina() {
  const ig = festival.contacto.instagram.replace(/^@/, "");
  return (
    <footer className={s.pie}>
      <div className={`contenedor ${s.grilla}`}>
        <div>
          <Marca />
          <p className={s.lema}>
            {festival.nombre}, {festival.edicion}ª edición. {festival.ciudad}, {festival.region}.
          </p>
        </div>
        <ul className={s.contacto}>
          <li>
            <a href={`mailto:${festival.contacto.correo}`}>{festival.contacto.correo}</a>
          </li>
          <li>
            <a href={`https://instagram.com/${ig}`} rel="noopener noreferrer" target="_blank">
              {festival.contacto.instagram}
            </a>
          </li>
        </ul>
        <p className={s.nota}>
          Horarios en hora de Chile. Entradas sólo en la boletería de cada sala. El festival no califica
          películas: todas están aquí porque queremos que las veas.
        </p>
      </div>
    </footer>
  );
}
