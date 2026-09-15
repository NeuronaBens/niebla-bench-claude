/**
 * Una función de la película presentada como boleto: talón con día y hora (tipo
 * tablero de horarios) y cuerpo con sala, precio, marcas y el botón del itinerario.
 */
import BotonItinerario from "@/components/itinerario/BotonItinerario";
import { formatoDuracion, formatoHora, formatoPrecio, textoFin, type Funcion } from "@/lib/programa";
import s from "./Boleto.module.css";

export default function Boleto({ funcion: f, numero }: { funcion: Funcion; numero: number }) {
  const conv = f.conversatorioMin ?? 0;
  const tituloId = `boleto-${f.id}`;

  return (
    <article
      className={s.boleto}
      aria-labelledby={tituloId}
      data-agotada={f.agotada ? "si" : undefined}
      data-aire={f.sala.aireLibre ? "si" : undefined}
      data-nota={f.nota ? "si" : undefined}
    >
      <div className={s.talon}>
        <p className={s.numero} aria-hidden="true">
          N.º {String(numero).padStart(2, "0")}
        </p>
        <h3 id={tituloId} className={s.dia}>
          <span className={s.diaNombre}>{f.dia.nombre}</span>{" "}
          <span className={s.diaFecha}>
            {f.dia.numero} {f.dia.mes.slice(0, 3)}
          </span>
          <span className="sr-only">, a las {f.horaInicio}</span>
        </h3>
        <p className={s.hora} aria-hidden="true">
          <time dateTime={f.inicio}>{f.horaInicio}</time>
        </p>
        <p className={s.fin} data-madrugada={f.terminaDiaSiguiente ? "si" : undefined}>
          {textoFin(f)}
        </p>
        {f.agotada && (
          <p className={s.sello} aria-hidden="true">
            Agotada
          </p>
        )}
      </div>

      <div className={s.cuerpo}>
        <ul className={s.marcas} aria-label="Detalles de la función">
          {f.agotada && <li className={s.marcaAgotada}>Agotada</li>}
          {f.sala.aireLibre && <li className={s.marcaAire}>Al aire libre</li>}
          {conv > 0 && <li className={s.marcaConv}>Conversatorio</li>}
          {f.nota && <li className={s.marcaNota}>Función especial</li>}
        </ul>

        <p className={s.sala}>{f.sala.nombre}</p>
        <p className={s.direccion}>{f.sala.direccion}</p>

        {/* Duración de la película y, si hay, del conversatorio, a escala. */}
        <div className={s.tramo} aria-hidden="true">
          <span className={s.tramoPeli} style={{ flexGrow: f.pelicula.duracionMin }}>
            <span>{formatoDuracion(f.pelicula.duracionMin)}</span>
          </span>
          {conv > 0 && (
            <span className={s.tramoConv} style={{ flexGrow: conv }}>
              <span>+{conv} min</span>
            </span>
          )}
        </div>

        <p className={s.precio} data-liberada={f.precio === 0 ? "si" : undefined}>
          {formatoPrecio(f.precio)}
        </p>

        {(f.nota || conv > 0 || (f.sala.aireLibre && f.sala.nota)) && (
          <ul className={s.notas}>
            {f.nota && <li className={s.notaFuncion}>{f.nota}</li>}
            {conv > 0 && (
              <li>
                Conversatorio de {conv} min después de la película, hasta las {formatoHora(f.finConversatorioMin)}.
              </li>
            )}
            {f.sala.aireLibre && f.sala.nota && <li>{f.sala.nota}</li>}
          </ul>
        )}
      </div>

      <div className={s.accion}>
        <BotonItinerario funcionId={f.id} variante="completo" />
      </div>
    </article>
  );
}
