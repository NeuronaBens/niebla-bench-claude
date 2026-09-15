import Link from "next/link";
import Afiche from "@/components/afiche/Afiche";
import { funciones, peliculasDeSeccion, secciones } from "@/lib/programa";
import Flecha from "./Flecha";
import { cifras, colorSeccion, enPalabras, mayuscula } from "./derivados";
import c from "./comun.module.css";
import s from "./Secciones.module.css";

export default function Secciones() {
  return (
    <section className={`${c.contenedor} ${c.bloque}`} aria-labelledby="titulo-secciones">
      <div className={c.encabezado}>
        <p className={c.rotulo}>Secciones</p>
        <h2 id="titulo-secciones" className={c.titulo}>
          {mayuscula(enPalabras(cifras.secciones))} maneras de ver el festival
        </h2>
      </div>

      <ol className={s.lista}>
        {secciones.map((sec, i) => {
          const pelis = peliculasDeSeccion(sec.id);
          const nFunciones = funciones.filter((f) => f.seccion.id === sec.id).length;
          return (
            <li key={sec.id} className={s.item} style={{ ["--c" as string]: colorSeccion(sec.id) }}>
              <Link href={`/programa?seccion=${sec.id}`} className={s.fila}>
                <span className={s.indice} aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className={s.texto}>
                  <h3 className={s.nombre}>{sec.nombre}</h3>
                  <span className={s.descripcion}>{sec.descripcion}</span>
                  <span className={s.cuenta}>
                    {pelis.length} {pelis.length === 1 ? "película" : "películas"} · {nFunciones}{" "}
                    {nFunciones === 1 ? "función" : "funciones"}
                  </span>
                </div>
                <div className={s.afiches} aria-hidden="true">
                  {pelis.slice(0, 6).map((p) => (
                    <div key={p.id} className={s.afiche}>
                      <Afiche pelicula={p} tamano="mini" />
                    </div>
                  ))}
                </div>
                <span className={s.ir}>
                  <span className={s.irTexto}>Ver en el programa</span>
                  <Flecha className={s.flecha} />
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
