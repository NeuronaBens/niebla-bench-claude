"use client";

/**
 * Resumen del itinerario: funciones, horas de cine y problemas por tipo con
 * salto directo al primero de cada tipo en la línea de tiempo.
 */
import type { Analisis, TipoAviso } from "@/lib/itinerario";
import { formatoDuracion } from "@/lib/programa";
import { anclaAviso, avisosEnOrden } from "./LineaDeTiempo";
import { NOMBRE_TIPO, plural } from "./textos";
import { IconoAgotada, IconoCheck, IconoChoque, IconoConversatorio, IconoFlecha, IconoNoAlcanza } from "./iconos";
import s from "./Itinerario.module.css";

const ORDEN: TipoAviso[] = ["choque", "traslado", "conversatorio", "agotada"];
const ICONO = { choque: IconoChoque, traslado: IconoNoAlcanza, conversatorio: IconoConversatorio, agotada: IconoAgotada };

export default function ResumenItinerario({ analisis }: { analisis: Analisis }) {
  const orden = avisosEnOrden(analisis);
  const dias = analisis.porDia.length;
  const justos = analisis.tramos.filter((t) => t.estado === "justo" && t.mismaJornada).length;

  const porTipo = ORDEN.map((tipo) => {
    const lista = orden.filter((a) => a.tipo === tipo);
    return { tipo, n: lista.length, ancla: lista[0] ? anclaAviso(lista[0], analisis) : null };
  }).filter((x) => x.n > 0);

  const primero = orden[0] ? anclaAviso(orden[0], analisis) : null;
  const serios = porTipo.filter((x) => x.tipo === "choque" || x.tipo === "traslado").reduce((acc, x) => acc + x.n, 0);

  return (
    <section className={s.resumen} aria-labelledby="resumen-titulo">
      <h2 id="resumen-titulo" className="sr-only">
        Resumen
      </h2>
      <dl className={s.cifras}>
        <div className={s.cifra}>
          <dt>{analisis.funciones.length === 1 ? "función" : "funciones"}</dt>
          <dd>{analisis.funciones.length}</dd>
        </div>
        <div className={s.cifra}>
          <dt>de cine</dt>
          <dd>{formatoDuracion(analisis.totalMinutosPelicula)}</dd>
        </div>
        <div className={s.cifra}>
          <dt>{dias === 1 ? "día" : "días"}</dt>
          <dd>{dias}</dd>
        </div>
      </dl>

      {porTipo.length === 0 ? (
        <p className={s.calza}>
          <span className={s.calzaSello} aria-hidden="true">
            <IconoCheck tamano={22} strokeWidth={2.6} />
          </span>
          <span>
            <strong>Todo calza.</strong>{" "}
            {analisis.funciones.length > 1
              ? justos > 0
                ? `Alcanzas a llegar a todo, aunque ${justos === 1 ? "en un tramo vas" : `en ${justos} tramos vas`} justo.`
                : "Alcanzas a llegar caminando a todas las funciones."
              : "Suma más funciones y te avisamos si algo se topa."}
          </span>
        </p>
      ) : (
        <div className={s.problemas} data-serios={serios > 0 ? "si" : "no"}>
          <p className={s.problemasTitulo}>
            {serios > 0 ? "Hay que revisar" : "Ojo con esto"}
          </p>
          <ul className={s.problemasLista}>
            {porTipo.map(({ tipo, n, ancla }) => {
              const Icono = ICONO[tipo];
              const [uno, varios] = NOMBRE_TIPO[tipo];
              return (
                <li key={tipo}>
                  <a href={`#${ancla}`} className={s.problema} data-tipo={tipo}>
                    <Icono tamano={18} />
                    <span>{plural(n, uno, varios)}</span>
                    <IconoFlecha tamano={16} className={s.problemaFlecha} />
                  </a>
                </li>
              );
            })}
          </ul>
          {primero && porTipo.length > 1 && (
            <a href={`#${primero}`} className={s.irPrimero}>
              Ir al primer problema
            </a>
          )}
        </div>
      )}
    </section>
  );
}
