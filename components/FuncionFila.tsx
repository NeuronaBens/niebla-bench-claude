"use client";

import Link from "next/link";
import { useMemo } from "react";
import { analizar, avisosAlAgregar, esGrave, funcionesDe, nombreSalaCorto } from "@/lib/itinerario";
import type { Funcion } from "@/lib/programa";
import { avisoCorto } from "@/lib/textos";
import { duracion, etiquetaDia, hora, horaFin } from "@/lib/tiempo";
import { useAhora } from "@/lib/useAhora";
import { useItinerario } from "@/lib/useItinerario";
import Afiche from "./Afiche";
import BotonMarcar from "./BotonMarcar";
import Etiquetas from "./Etiquetas";
import s from "./FuncionFila.module.css";

type Props = {
  f: Funcion;
  /** En la ficha de la película no hace falta repetir el título. */
  conPelicula?: boolean;
};

export default function FuncionFila({ f, conPelicula = true }: Props) {
  const { ids } = useItinerario();
  const ahora = useAhora();
  const marcada = ids.includes(f.id);
  const fin = horaFin(f.fin, f.dia);
  const termino = ahora !== null && ahora >= f.fin;
  const enCurso = ahora !== null && ahora >= f.ini && ahora < f.fin;

  const avisos = useMemo(() => {
    if (marcada) {
      return analizar(funcionesDe(ids)).filter((x) => x.a.id === f.id || x.b.id === f.id);
    }
    return avisosAlAgregar(f, ids);
  }, [f, ids, marcada]);

  return (
    <article
      className={s.fila}
      data-seccion={f.seccion.id}
      data-marcada={marcada || undefined}
      data-termino={termino || undefined}
    >
      <div className={s.hora}>
        <span className={`${s.ini} num`}>{hora(f.ini)}</span>
        <span className={`${s.fin} num`}>
          hasta {fin.hora}
          {fin.otroDia && <span className={s.madrugada}>madrugada</span>}
        </span>
      </div>

      {conPelicula && (
        <Link href={`/pelicula/${f.pelicula.id}`} className={s.mini} tabIndex={-1} aria-hidden="true">
          <Afiche semilla={f.pelicula.id} seccion={f.seccion.id} detalle="mini" />
        </Link>
      )}

      <div className={s.cuerpo}>
        {conPelicula ? (
          <h3 className={s.titulo}>
            <Link href={`/pelicula/${f.pelicula.id}`}>{f.pelicula.titulo}</Link>
          </h3>
        ) : (
          <h3 className={s.titulo}>{etiquetaDia(f.dia)}</h3>
        )}
        <p className={s.meta}>
          <span className={s.sala}>{nombreSalaCorto(f.salaId)}</span>
          <span aria-hidden="true"> · </span>
          <span>{duracion(f.pelicula.duracionMin)}</span>
          {conPelicula && (
            <>
              <span aria-hidden="true"> · </span>
              <span className={s.seccion}>{f.seccion.nombre}</span>
            </>
          )}
        </p>
        <Etiquetas f={f} />
        {(termino || enCurso) && (
          <p className={s.estado}>{enCurso ? "En curso ahora" : "Esta función ya terminó"}</p>
        )}
        {avisos.length > 0 && (
          <ul className={s.avisos}>
            {avisos.map((x) => (
              <li key={`${x.tipo}${x.a.id}${x.b.id}`} data-grave={esGrave(x) || undefined}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M8 1.5 15 14H1z" />
                  <path d="M8 6v4M8 11.6v.2" className={s.signo} />
                </svg>
                <span>
                  {marcada ? "" : "Si la agregas: "}
                  {avisoCorto(x, f.id)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={s.accion}>
        <BotonMarcar f={f} />
      </div>
    </article>
  );
}
