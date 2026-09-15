import type { CSSProperties } from "react";
import Link from "next/link";
import BotonItinerario from "@/components/itinerario/BotonItinerario";
import { formatoHora, salas, type Dia, type Funcion, type SeccionId } from "@/lib/programa";
import { cortoDiaFin, cortoDiaSiguiente } from "./filtros";
import s from "./GrillaSalas.module.css";

/*
 * Grilla horaria por sala (escritorio): columnas = salas, eje vertical = tiempo.
 * Todo se posiciona con minutos absolutos del festival, así las funciones que cruzan
 * la medianoche siguen siendo un bloque continuo.
 */

type Estilo = CSSProperties & Record<`--${string}`, number | string>;

export interface GrillaSalasProps {
  dia: Dia;
  /** Todas las funciones del día (las que no calzan con las secciones elegidas se atenúan). */
  funciones: readonly Funcion[];
  seccionesElegidas: readonly SeccionId[];
  elegidas: ReadonlySet<string>;
  ahora: number | null;
  idTitulo: string;
}

export default function GrillaSalas({ dia, funciones, seccionesElegidas, elegidas, ahora, idTitulo }: GrillaSalasProps) {
  if (funciones.length === 0) return null;

  const inicio = Math.floor(Math.min(...funciones.map((f) => f.inicioMin)) / 60) * 60;
  const fin = Math.ceil(Math.max(...funciones.map((f) => f.finConversatorioMin)) / 60) * 60;
  const horas: number[] = [];
  for (let h = inicio; h <= fin; h += 60) horas.push(h);
  const medianoche = (dia.indice + 1) * 1440;
  const verAhora = ahora !== null && ahora >= inicio && ahora <= fin;

  return (
    <div className={s.marco} role="region" aria-labelledby={idTitulo} aria-describedby={`${idTitulo}-ayuda`}>
      <p className={s.ayuda} id={`${idTitulo}-ayuda`}>
        Grilla por sala: cada columna es una sala y la altura de cada bloque es la duración de la película.
      </p>
      <div className={s.grilla} style={{ "--minutos": fin - inicio } as Estilo}>
        <div className={s.cabecera} aria-hidden="true">
          <span className={s.esquina} />
          {salas.map((sala) => (
            <span key={sala.id} className={s.sala}>
              {sala.nombre}
              {sala.aireLibre && <small className={s.salaNota}>Al aire libre</small>}
            </span>
          ))}
        </div>

        <div className={s.lienzo}>
          <div className={s.regla} aria-hidden="true">
            {horas.map((h) => (
              <span key={h} className={s.hora} data-medianoche={h === medianoche ? "" : undefined} style={{ "--y": h - inicio } as Estilo}>
                {formatoHora(h)}
                {h === medianoche && <small>{cortoDiaSiguiente(dia)}</small>}
              </span>
            ))}
          </div>

          {medianoche > inicio && medianoche < fin && (
            <div className={s.lineaMedianoche} style={{ "--y": medianoche - inicio } as Estilo} aria-hidden="true" />
          )}

          {salas.map((sala) => (
            <ul key={sala.id} className={s.columna} aria-label={sala.nombre}>
              {funciones
                .filter((f) => f.salaId === sala.id)
                .map((f) => {
                  const fuera = seccionesElegidas.length > 0 && !seccionesElegidas.includes(f.seccion.id);
                  return (
                    <li
                      key={f.id}
                      className={s.bloque}
                      data-seccion={f.seccion.id}
                      data-fuera={fuera ? "" : undefined}
                      data-agotada={f.agotada ? "" : undefined}
                      data-elegida={elegidas.has(f.id) ? "" : undefined}
                      data-terminada={ahora !== null && ahora >= f.finMin ? "" : undefined}
                      style={
                        {
                          "--y": f.inicioMin - inicio,
                          "--h": f.pelicula.duracionMin,
                        } as Estilo
                      }
                    >
                      <p className={s.bloqueHora}>
                        <time dateTime={f.inicio}>{f.horaInicio}</time>–{f.horaFin}
                        {f.terminaDiaSiguiente && <span className={s.diaSig}> ({cortoDiaFin(f)})</span>}
                      </p>
                      <p className={s.bloqueTitulo}>
                        <Link href={`/pelicula/${f.pelicula.id}`} className={s.enlace}>
                          {f.pelicula.titulo}
                        </Link>
                      </p>
                      {f.nota && <p className={s.bloqueNota}>{f.nota}</p>}
                      <p className={s.bloqueMarcas}>
                        {f.agotada && <span className={s.agotada}>Agotada</span>}
                        {elegidas.has(f.id) && <span className={s.enItinerario}>En tu itinerario</span>}
                      </p>
                      <div className={s.bloqueBoton}>
                        <BotonItinerario funcionId={f.id} variante="compacto" />
                      </div>
                      {f.conversatorioMin ? (
                        <p className={s.cola} style={{ "--c": f.conversatorioMin } as Estilo}>
                          + Conversatorio {f.conversatorioMin} min
                        </p>
                      ) : null}
                    </li>
                  );
                })}
            </ul>
          ))}

          {verAhora && (
            <div className={s.ahora} style={{ "--y": ahora - inicio } as Estilo} aria-hidden="true">
              <span>Ahora {formatoHora(ahora)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
