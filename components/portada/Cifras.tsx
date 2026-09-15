import { festival, secciones } from "@/lib/programa";
import { cifras, enPalabras, mayuscula, rangoFechas } from "./derivados";
import c from "./comun.module.css";
import s from "./Cifras.module.css";

function listaNatural(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

/** Qué es el festival, con sus cifras pintadas como contenedores en el muelle. */
export default function Cifras() {
  const carga = [
    { n: cifras.peliculas, uno: "película", varios: "películas", codigo: "PEL" },
    { n: cifras.funciones, uno: "función", varios: "funciones", codigo: "FUN" },
    { n: cifras.salas, uno: "sala", varios: "salas", codigo: "SAL" },
    { n: cifras.dias, uno: "día", varios: "días", codigo: "DIA" },
    { n: cifras.estrenosMundiales, uno: "estreno mundial", varios: "estrenos mundiales", codigo: "EST" },
  ].filter((x) => x.n > 0);

  return (
    <section className={`${c.contenedor} ${c.bloque}`} aria-labelledby="titulo-que-es">
      <div className={s.grilla}>
        <div className={c.encabezado}>
          <p className={c.rotulo}>Qué es</p>
          <h2 id="titulo-que-es" className={c.titulo}>
            Cine en el puerto, {enPalabras(cifras.dias)} días seguidos
          </h2>
          <p className={c.bajada}>
            El {festival.nombre} vuelve a {festival.ciudad} para su {festival.edicion}ª edición, del {rangoFechas}.{" "}
            {mayuscula(enPalabras(cifras.secciones))} secciones: {listaNatural(secciones.map((x) => x.nombre))}.
          </p>
        </div>

        <ul className={s.carga}>
          {carga.map((item, i) => (
            <li key={item.codigo} className={s.contenedor} data-tono={i % 5}>
              <span className={s.codigo} aria-hidden="true">
                NBL{festival.edicion} {item.codigo} {String(i + 1).padStart(2, "0")}
              </span>
              <span className={s.numero}>{item.n}</span>
              <span className={s.etiqueta}>{item.n === 1 ? item.uno : item.varios}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
