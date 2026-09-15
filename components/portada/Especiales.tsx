import Link from "next/link";
import BotonItinerario from "@/components/itinerario/BotonItinerario";
import { festival, formatoPrecio, seccionPorId, textoFin, type Funcion } from "@/lib/programa";
import {
  colorSeccion,
  etiquetaNota,
  funcionesAireLibre,
  funcionesConConversatorio,
  funcionesConNota,
  funcionesTrasnoche,
  salasAireLibre,
} from "./derivados";
import c from "./comun.module.css";
import s from "./Especiales.module.css";

function Boleto({ f }: { f: Funcion }) {
  return (
    <li className={s.boleto} style={{ ["--c" as string]: colorSeccion(f.seccion.id) }}>
      <div className={s.talon}>
        <span className={s.talonDia}>{f.dia.nombre}</span>
        <span className={s.talonNumero}>{f.dia.numero}</span>
        <span className={s.talonHora}>{f.horaInicio}</span>
      </div>
      <div className={s.cuerpo}>
        <p className={s.boletoEtiqueta}>{etiquetaNota(f)}</p>
        <h3 className={s.boletoTitulo}>
          <Link href={`/pelicula/${f.pelicula.id}`}>{f.pelicula.titulo}</Link>
        </h3>
        <p className={s.boletoNota}>{f.nota}</p>
        <p className={s.boletoSala}>
          {f.sala.nombre} · {f.seccion.nombre}
        </p>
        <div className={s.boletoAccion}>
          <BotonItinerario funcionId={f.id} variante="compacto" />
        </div>
      </div>
    </li>
  );
}

function Fila({ f, extra }: { f: Funcion; extra: string }) {
  return (
    <li className={s.fila}>
      <span className={s.filaCuando}>
        <span className={s.filaDia}>
          {f.dia.corto} {f.dia.numero}
        </span>
        <span className={s.filaHora}>{f.horaInicio}</span>
      </span>
      <span className={s.filaQue}>
        <Link href={`/pelicula/${f.pelicula.id}`} className={s.filaTitulo}>
          {f.pelicula.titulo}
        </Link>
        <span className={s.filaExtra}>
          {extra}
          {f.agotada && <span className={s.agotada}>Agotada</span>}
        </span>
      </span>
      <span className={s.filaBoton}>
        <BotonItinerario funcionId={f.id} variante="compacto" />
      </span>
    </li>
  );
}

export default function Especiales() {
  const nocturna = seccionPorId.get("nocturna");
  const salaAire = salasAireLibre[0];

  return (
    <section className={`${c.contenedor} ${c.bloque}`} aria-labelledby="titulo-especiales">
      <div className={c.encabezado}>
        <p className={c.rotulo}>No te las pierdas</p>
        <h2 id="titulo-especiales" className={c.titulo}>
          Funciones con algo más
        </h2>
      </div>

      {funcionesConNota.length > 0 && <ul className={s.boletos}>{funcionesConNota.map((f) => <Boleto key={f.id} f={f} />)}</ul>}

      <div className={s.columnas}>
        {funcionesConConversatorio.length > 0 && (
          <section className={s.columna} aria-labelledby="esp-conversatorios" style={{ ["--c" as string]: "var(--conversatorio)" }}>
            <h3 id="esp-conversatorios" className={s.columnaTitulo}>
              Con conversatorio
            </h3>
            <p className={s.columnaBajada}>Después de la película viene un conversatorio. Ojo con los minutos extra si vas a otra función.</p>
            <ul className={s.filas}>
              {funcionesConConversatorio.map((f) => (
                <Fila key={f.id} f={f} extra={`${f.sala.nombre} · +${f.conversatorioMin} min de conversatorio`} />
              ))}
            </ul>
          </section>
        )}

        {funcionesAireLibre.length > 0 && salaAire && (
          <section className={s.columna} aria-labelledby="esp-aire-libre" style={{ ["--c" as string]: "var(--sec-costa)" }}>
            <h3 id="esp-aire-libre" className={s.columnaTitulo}>
              Al aire libre
            </h3>
            <p className={s.columnaBajada}>
              En {salaAire.nombre},{" "}
              {festival.entradas.aireLibre === 0
                ? "con entrada liberada"
                : `entrada a ${formatoPrecio(festival.entradas.aireLibre)}`}
              . {salaAire.nota}
            </p>
            <ul className={s.filas}>
              {funcionesAireLibre.map((f) => (
                <Fila key={f.id} f={f} extra={`${f.pelicula.pais} · ${textoFin(f)}`} />
              ))}
            </ul>
          </section>
        )}

        {funcionesTrasnoche.length > 0 && nocturna && (
          <section className={s.columna} aria-labelledby="esp-trasnoche" style={{ ["--c" as string]: "var(--sec-nocturna)" }}>
            <h3 id="esp-trasnoche" className={s.columnaTitulo}>
              Trasnoche
            </h3>
            <p className={s.columnaBajada}>
              {nocturna.nombre}: {nocturna.descripcion.charAt(0).toLowerCase() + nocturna.descripcion.slice(1)}
            </p>
            <ul className={s.filas}>
              {funcionesTrasnoche.map((f) => (
                <Fila key={f.id} f={f} extra={`${f.sala.nombre} · ${textoFin(f)}`} />
              ))}
            </ul>
          </section>
        )}
      </div>
    </section>
  );
}
