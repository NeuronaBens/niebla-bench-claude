"use client";

/**
 * Línea de tiempo vertical del itinerario: cada función es un boleto y entre
 * funciones consecutivas va el tramo (traslado, holgura o problema).
 * Se usa en /itinerario (editable) y en /itinerario/compartido (soloLectura).
 */
import type { CSSProperties } from "react";
import Link from "next/link";
import Afiche from "@/components/afiche/Afiche";
import type { Analisis, Aviso, Tramo } from "@/lib/itinerario";
import { formatoDuracion, formatoHora, formatoPrecio, textoFin, type Funcion } from "@/lib/programa";
import { conversatorioPerdido, plural, textoTramo } from "./textos";
import {
  IconoAgotada,
  IconoAireLibre,
  IconoAncla,
  IconoCaminar,
  IconoCheck,
  IconoChoque,
  IconoConversatorio,
  IconoNoAlcanza,
  IconoNota,
} from "./iconos";
import s from "./LineaDeTiempo.module.css";

// ---------------------------------------------------------------------------
// Anclas de problemas (compartidas con el resumen)
// ---------------------------------------------------------------------------

const claveTramo = (desdeId: string, hastaId: string) => `${desdeId}>${hastaId}`;

function tramosConsecutivos(analisis: Analisis): Set<string> {
  return new Set(analisis.tramos.map((t) => claveTramo(t.desde.id, t.hasta.id)));
}

/** id del elemento de la línea de tiempo donde se ve un aviso. */
export function anclaAviso(a: Aviso, analisis: Analisis): string {
  if (a.tipo === "agotada" || !a.otra) return `funcion-${a.funcion.id}`;
  if (tramosConsecutivos(analisis).has(claveTramo(a.funcion.id, a.otra.id))) return `tramo-${a.funcion.id}-${a.otra.id}`;
  return `aviso-${a.tipo}-${a.funcion.id}-${a.otra.id}`;
}

/** Avisos en el orden en que aparecen al recorrer la línea de tiempo. */
export function avisosEnOrden(analisis: Analisis): Aviso[] {
  const pos = new Map(analisis.funciones.map((f, i) => [f.id, i]));
  const peso = (a: Aviso) => (pos.get(a.funcion.id) ?? 0) * 2 + (a.tipo === "agotada" ? 0 : 1);
  return [...analisis.avisos].sort((a, b) => peso(a) - peso(b));
}

// ---------------------------------------------------------------------------

type EstadoAhora = "pasada" | "en-curso" | "proxima" | undefined;

function estadosAhora(funciones: Funcion[], ahoraMin: number | null | undefined): Map<string, EstadoAhora> {
  const m = new Map<string, EstadoAhora>();
  if (ahoraMin == null || ahoraMin < 0) return m;
  let proximaMarcada = false;
  for (const f of funciones) {
    if (f.finConversatorioMin <= ahoraMin) m.set(f.id, "pasada");
    else if (f.inicioMin <= ahoraMin) m.set(f.id, "en-curso");
    else if (!proximaMarcada) {
      m.set(f.id, "proxima");
      proximaMarcada = true;
    }
  }
  return m;
}

const ESTILO_SECCION = (f: Funcion) => ({ "--sec": `var(--sec-${f.seccion.id})` }) as CSSProperties;

export interface LineaDeTiempoProps {
  analisis: Analisis;
  soloLectura?: boolean;
  onQuitar?: (funcionId: string) => void;
  /** Minutos del festival "ahora" (solo cliente, tras montar). */
  ahoraMin?: number | null;
}

export default function LineaDeTiempo({ analisis, soloLectura = false, onQuitar, ahoraMin }: LineaDeTiempoProps) {
  const consecutivos = tramosConsecutivos(analisis);
  const tramoHacia = new Map(analisis.tramos.map((t) => [t.hasta.id, t]));
  const ahora = estadosAhora(analisis.funciones, ahoraMin);
  const puedeQuitar = !soloLectura && !!onQuitar;

  return (
    <div className={s.linea}>
      {analisis.porDia.map(({ dia, funciones }) => {
        const inicio = funciones[0];
        const finMax = Math.max(...funciones.map((f) => f.finMin));
        const ultima = funciones.find((f) => f.finMin === finMax)!;
        return (
          <section key={dia.fecha} className={s.dia} aria-labelledby={`dia-${dia.fecha}`}>
            <header className={s.diaCabecera}>
              <h2 id={`dia-${dia.fecha}`} className={s.diaTitulo}>
                <span className={s.diaNombre}>{dia.nombre}</span> <span className={s.diaNumero}>{dia.numero}</span>
              </h2>
              <p className={s.diaMeta}>
                {plural(funciones.length, "función", "funciones")} · {inicio.horaInicio} a{" "}
                {ultima.terminaDiaSiguiente ? textoFin(ultima).replace("termina ", "") : formatoHora(finMax)}
              </p>
            </header>

            <ol className={s.lista}>
              {funciones.map((f, i) => {
                const t = tramoHacia.get(f.id);
                const mostrarTramo = t && (i > 0 || t.estado !== "holgado" || t.pierdeConversatorio);
                return (
                  <FuncionConTramo
                    key={f.id}
                    funcion={f}
                    tramo={mostrarTramo ? t : undefined}
                    avisos={(analisis.avisosPorFuncion.get(f.id) ?? []).filter(
                      (a) => a.tipo !== "agotada" && a.otra && !consecutivos.has(claveTramo(a.funcion.id, a.otra.id)),
                    )}
                    estadoAhora={ahora.get(f.id)}
                    puedeQuitar={puedeQuitar}
                    onQuitar={onQuitar}
                  />
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

interface FuncionConTramoProps {
  funcion: Funcion;
  tramo?: Tramo;
  /** Avisos con funciones no consecutivas (no se ven en un tramo). */
  avisos: Aviso[];
  estadoAhora: EstadoAhora;
  puedeQuitar: boolean;
  onQuitar?: (id: string) => void;
}

function FuncionConTramo({ funcion: f, tramo, avisos, estadoAhora, puedeQuitar, onQuitar }: FuncionConTramoProps) {
  return (
    <>
      {tramo && <TramoItem tramo={tramo} puedeQuitar={puedeQuitar} onQuitar={onQuitar} />}
      <li className={s.item} data-ahora={estadoAhora} style={ESTILO_SECCION(f)}>
        <span className={s.nodo} aria-hidden="true" />
        <article
          id={`funcion-${f.id}`}
          tabIndex={-1}
          className={s.boleto}
          data-agotada={f.agotada ? "si" : undefined}
          aria-labelledby={`titulo-${f.id}`}
        >
          <div className={s.cabecera}>
            <p className={s.horario}>
              <span className={s.inicio}>{f.horaInicio}</span>
              <span className={s.fin}>
                <span aria-hidden="true">–</span>
                <span className="sr-only"> a </span>
                {f.horaFin}
              </span>
            </p>
            {estadoAhora && estadoAhora !== "pasada" && (
              <span className={s.ahora} data-estado={estadoAhora}>
                {estadoAhora === "en-curso" ? "Ahora" : "Próxima"}
              </span>
            )}
            {estadoAhora === "pasada" && <span className={s.ahora} data-estado="pasada">Ya pasó</span>}
          </div>
          {f.terminaDiaSiguiente && <p className={s.madrugada}>{textoFin(f).replace(/^t/, "T")}</p>}

          <div className={s.cuerpo}>
            <Link href={`/pelicula/${f.pelicula.id}`} className={s.afiche} tabIndex={-1} aria-hidden="true">
              <Afiche pelicula={f.pelicula} tamano="mini" conTitulo={false} />
            </Link>
            <div className={s.datos}>
              <p className={s.seccion}>
                {f.seccion.nombre} · {formatoDuracion(f.pelicula.duracionMin)}
              </p>
              <h3 id={`titulo-${f.id}`} className={s.titulo}>
                <Link href={`/pelicula/${f.pelicula.id}`}>{f.pelicula.titulo}</Link>
              </h3>
              <p className={s.sala}>
                <span className={s.salaNombre}>{f.sala.nombre}</span>
                <span className={s.direccion}>{f.sala.direccion}</span>
              </p>
            </div>
          </div>

          {(f.agotada || f.sala.aireLibre || f.conversatorioMin || f.nota) && (
            <ul className={s.marcas}>
              {f.agotada && (
                <li className={s.marca} data-tipo="agotada">
                  <IconoAgotada tamano={16} />
                  <span>
                    <strong>Agotada.</strong> Ya no quedan entradas en boletería.
                  </span>
                </li>
              )}
              {f.conversatorioMin ? (
                <li className={s.marca} data-tipo="conversatorio">
                  <IconoConversatorio tamano={16} />
                  <span>
                    <strong>Conversatorio de {f.conversatorioMin} min</strong> después de la película, hasta las{" "}
                    {formatoHora(f.finConversatorioMin)}.
                  </span>
                </li>
              ) : null}
              {f.sala.aireLibre && (
                <li className={s.marca} data-tipo="aire">
                  <IconoAireLibre tamano={16} />
                  <span>{f.sala.nota ?? "Función al aire libre."}</span>
                </li>
              )}
              {f.nota && (
                <li className={s.marca} data-tipo="nota">
                  <IconoNota tamano={16} />
                  <span>{f.nota}</span>
                </li>
              )}
            </ul>
          )}

          {avisos.length > 0 && (
            <ul className={s.avisosLejanos}>
              {avisos.map((a) => {
                const esPrimera = a.funcion.id === f.id;
                const Icono = a.tipo === "choque" ? IconoChoque : a.tipo === "traslado" ? IconoNoAlcanza : IconoConversatorio;
                return (
                  <li
                    key={`${a.tipo}-${a.funcion.id}-${a.otra!.id}`}
                    id={esPrimera ? `aviso-${a.tipo}-${a.funcion.id}-${a.otra!.id}` : undefined}
                    tabIndex={esPrimera ? -1 : undefined}
                    className={s.avisoLejano}
                    data-tipo={a.tipo}
                  >
                    <Icono tamano={16} />
                    <span>{a.mensaje}</span>
                  </li>
                );
              })}
            </ul>
          )}

          <div className={s.pie}>
            <span className={s.precio}>{formatoPrecio(f.precio)}</span>
            {puedeQuitar && (
              <button
                type="button"
                className={s.quitar}
                onClick={() => onQuitar?.(f.id)}
                aria-label={`Quitar ${f.pelicula.titulo} (${f.dia.nombre} ${f.horaInicio}) de mi itinerario`}
              >
                Quitar
              </button>
            )}
          </div>
        </article>
      </li>
    </>
  );
}

function TramoItem({ tramo: t, puedeQuitar, onQuitar }: { tramo: Tramo; puedeQuitar: boolean; onQuitar?: (id: string) => void }) {
  const { titular, detalle } = textoTramo(t);
  const problema = t.estado === "choque" || t.estado === "no-alcanza";
  const conv = t.pierdeConversatorio;
  const perdidos = conv ? conversatorioPerdido(t) : 0;
  const total = t.desde.conversatorioMin ?? 0;
  const Icono =
    t.estado === "choque"
      ? IconoChoque
      : t.estado === "no-alcanza"
        ? IconoNoAlcanza
        : t.desde.salaId === t.hasta.salaId
          ? IconoAncla
          : IconoCaminar;

  return (
    <li
      className={s.tramo}
      data-estado={t.estado}
      data-conversatorio={conv ? "si" : undefined}
      data-problema={problema || conv ? "si" : undefined}
    >
      <span className={s.tramoNodo} aria-hidden="true">
        <Icono tamano={16} />
      </span>
      <div className={s.tramoCaja} id={problema || conv ? `tramo-${t.desde.id}-${t.hasta.id}` : undefined} tabIndex={problema || conv ? -1 : undefined}>
        <p className={s.tramoTitular}>
          {t.estado === "holgado" && !conv && <IconoCheck tamano={14} className={s.tramoOk} />}
          {titular}
        </p>
        <p className={s.tramoDetalle}>{detalle}</p>
        {conv && (
          <p className={s.tramoConversatorio}>
            <IconoConversatorio tamano={16} />
            <span>
              <strong>Te pierdes el conversatorio</strong> de {t.desde.pelicula.titulo}
              {perdidos < total ? ` (${perdidos} de ${total} min)` : ` (${total} min)`}.
            </span>
          </p>
        )}
        {puedeQuitar && (problema || conv) && (
          <div className={s.tramoAcciones}>
            <span className={s.tramoAccionesTexto}>Quitar una:</span>
            <button type="button" className={s.tramoBoton} onClick={() => onQuitar?.(t.desde.id)}>
              <span className="sr-only">Quitar </span>
              {t.desde.pelicula.titulo} <span className={s.tramoBotonHora}>{t.desde.horaInicio}</span>
            </button>
            <button type="button" className={s.tramoBoton} onClick={() => onQuitar?.(t.hasta.id)}>
              <span className="sr-only">Quitar </span>
              {t.hasta.pelicula.titulo} <span className={s.tramoBotonHora}>{t.hasta.horaInicio}</span>
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
