import Link from "next/link";
import Afiche from "@/components/afiche/Afiche";
import BotonItinerario from "@/components/itinerario/BotonItinerario";
import { formatoDuracion, formatoPrecio, type Funcion } from "@/lib/programa";
import { cortoDiaFin } from "./filtros";
import s from "./FilaFuncion.module.css";

export type EstadoTiempo =
  | { tipo: "termino" }
  | { tipo: "curso"; quedan: number }
  | { tipo: "pronto"; faltan: number };

export interface FilaFuncionProps {
  funcion: Funcion;
  enItinerario?: boolean;
  /** Frase corta si agregarla chocaría con algo ya elegido. */
  aviso?: string | null;
  tiempo?: EstadoTiempo | null;
}

function textoTiempo(t: EstadoTiempo): string {
  if (t.tipo === "termino") return "Terminó";
  if (t.tipo === "curso") return "En curso";
  return t.faltan <= 1 ? "Empieza ya" : `En ${t.faltan} min`;
}

export default function FilaFuncion({ funcion: f, enItinerario = false, aviso, tiempo }: FilaFuncionProps) {
  const p = f.pelicula;
  const diaFin = f.terminaDiaSiguiente ? cortoDiaFin(f) : null;
  const tituloId = `titulo-${f.id}`;

  return (
    <li
      className={s.fila}
      id={`funcion-${f.id}`}
      data-seccion={f.seccion.id}
      data-agotada={f.agotada ? "" : undefined}
      data-elegida={enItinerario ? "" : undefined}
      data-tiempo={tiempo?.tipo}
      aria-labelledby={tituloId}
    >
      <div className={s.talon}>
        <time className={s.hora} dateTime={f.inicio}>
          {f.horaInicio}
        </time>
        <span className={s.fin}>
          <span className={s.finRotulo}>hasta</span> {f.horaFin}
          {diaFin && (
            <>
              {" "}
              <span className={s.diaSiguiente} title="Termina pasada la medianoche">
                ({diaFin})
              </span>
            </>
          )}
        </span>
        {tiempo && <span className={s.tiempo}>{textoTiempo(tiempo)}</span>}
      </div>

      <div className={s.cuerpo}>
        <div className={s.texto}>
          <p className={s.seccion}>
            <span className={s.punto} aria-hidden="true" />
            {f.seccion.nombre}
          </p>

          <h3 className={s.titulo} id={tituloId}>
            <Link href={`/pelicula/${p.id}`} className={s.enlace}>
              {p.titulo}
            </Link>
          </h3>

          <p className={s.meta}>
            <span>{f.sala.nombre}</span>
            <span className={s.sep} aria-hidden="true">
              /
            </span>
            <span className={s.duracion}>{formatoDuracion(p.duracionMin)}</span>
          </p>

          <div className={s.detalles}>
            {(!!f.agotada || f.sala.aireLibre || !!f.conversatorioMin) && (
              <ul className={s.marcas} aria-label="Detalles de la función">
                {f.agotada && <li className={s.marcaAgotada}>Agotada</li>}
                {f.sala.aireLibre && (
                  <li className={s.marcaAireLibre}>Al aire libre · {formatoPrecio(f.precio)}</li>
                )}
                {f.conversatorioMin ? (
                  <li className={s.marcaConversatorio}>+ Conversatorio {f.conversatorioMin} min</li>
                ) : null}
              </ul>
            )}
            {f.nota && <p className={s.nota}>{f.nota}</p>}
            {enItinerario && <p className={s.elegida}>En tu itinerario</p>}
            {aviso && <p className={s.aviso}>{aviso}</p>}
          </div>
        </div>

        <div className={s.lado}>
          <div className={s.afiche} aria-hidden="true">
            <Afiche pelicula={p} tamano="mini" conTitulo={false} />
          </div>
          <div className={s.boton}>
            <BotonItinerario funcionId={f.id} variante="compacto" />
          </div>
        </div>
      </div>
    </li>
  );
}
