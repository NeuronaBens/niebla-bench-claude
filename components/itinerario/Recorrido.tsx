"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { nombreSalaCorto, tramos, type Aviso, type Tramo } from "@/lib/itinerario";
import { dias, type Funcion } from "@/lib/programa";
import { faltan, sobran } from "@/lib/textos";
import { duracion, etiquetaDia, hora, horaFin, mes } from "@/lib/tiempo";
import Afiche from "../Afiche";
import Etiquetas from "../Etiquetas";
import s from "./Recorrido.module.css";

type Props = {
  funciones: Funcion[];
  avisos: Aviso[];
  /** Si viene, cada boleto muestra un botón para quitarlo. */
  onQuitar?: (f: Funcion) => void;
  /** Ids que ya están en el itinerario propio (modo compartido). */
  yaEnElMio?: Set<string>;
};

export default function Recorrido({ funciones, avisos, onQuitar, yaEnElMio }: Props) {
  const todos = tramos(funciones);
  return (
    <div className={s.recorrido}>
      {dias.map((d) => {
        const delDia = funciones.filter((f) => f.dia === d);
        if (delDia.length === 0) return null;
        const minutosCine = delDia.reduce((t, f) => t + f.pelicula.duracionMin, 0);
        return (
          <section key={d} className={s.dia} aria-labelledby={`rec-${d}`}>
            <header className={s.cabeceraDia}>
              <h2 id={`rec-${d}`} className={s.tituloDia}>
                {etiquetaDia(d)} <span>de {mes(d)}</span>
              </h2>
              <p className="num">
                {delDia.length} {delDia.length === 1 ? "función" : "funciones"} · {duracion(minutosCine)} de cine
              </p>
            </header>
            <ol className={s.linea}>
              {delDia.map((f, i) => {
                const siguiente = delDia[i + 1];
                const tramo = siguiente ? todos.find((t) => t.a.id === f.id && t.b.id === siguiente.id) : undefined;
                return (
                  <li key={f.id} className={s.item}>
                    <Boleto
                      f={f}
                      avisos={avisos}
                      onQuitar={onQuitar}
                      ya={yaEnElMio?.has(f.id)}
                      esUltima={!funciones.some((x) => x.ini >= f.fin)}
                    />
                    {tramo && <Conector tramo={tramo} avisos={avisos} />}
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function Boleto({
  f,
  avisos,
  onQuitar,
  ya,
  esUltima,
}: {
  f: Funcion;
  avisos: Aviso[];
  onQuitar?: (f: Funcion) => void;
  ya?: boolean;
  esUltima: boolean;
}) {
  const fin = horaFin(f.fin, f.dia);
  const topes = avisos.filter((x) => x.tipo === "tope" && (x.a.id === f.id || x.b.id === f.id));
  const conv = avisos.find((x) => x.tipo === "conversatorio" && x.a.id === f.id);
  return (
    <article
      id={`parada-${f.id}`}
      className={s.boleto}
      data-seccion={f.seccion.id}
      data-tope={topes.length > 0 || undefined}
    >
      <div className={s.talon}>
        <span className={`${s.horaIni} num`}>{hora(f.ini)}</span>
        <span className={`${s.horaFin} num`}>
          {fin.hora}
          {fin.otroDia && <small> madrugada</small>}
        </span>
      </div>
      <div className={s.cuerpoBoleto}>
        <p className={s.salaBoleto}>
          {nombreSalaCorto(f.salaId)}
          <span> · {f.sala.direccion}</span>
        </p>
        <h3 className={s.tituloBoleto}>
          <Link href={`/pelicula/${f.pelicula.id}`}>{f.pelicula.titulo}</Link>
        </h3>
        <p className={s.metaBoleto}>
          {f.seccion.nombre} · {duracion(f.pelicula.duracionMin)}
        </p>
        <Etiquetas f={f} />
        {!!f.conversatorioMin && topes.length === 0 && (
          <p className={s.conversatorio} data-estado={conv ? (conv.tipo === "conversatorio" && conv.alcanza > 0 ? "parcial" : "pierde") : "ok"}>
            {!conv
              ? esUltima
                ? `Te puedes quedar al conversatorio (${f.conversatorioMin} min).`
                : `Alcanzas el conversatorio completo (${f.conversatorioMin} min).`
              : conv.tipo === "conversatorio" && conv.alcanza > 0
                ? `Del conversatorio alcanzas ${conv.alcanza} de ${conv.duracion} min.`
                : `Te pierdes el conversatorio (${f.conversatorioMin} min).`}
          </p>
        )}
        {ya && <p className={s.ya}>Ya está en tu itinerario</p>}
      </div>
      <div className={s.lateral}>
        <div className={s.miniAfiche} aria-hidden="true">
          <Afiche semilla={f.pelicula.id} seccion={f.seccion.id} detalle="mini" />
        </div>
        {onQuitar && (
          <button
            type="button"
            className={s.quitar}
            onClick={() => onQuitar(f)}
            aria-label={`Quitar ${f.pelicula.titulo} de mi itinerario`}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 5l10 10M15 5 5 15" />
            </svg>
          </button>
        )}
      </div>
    </article>
  );
}

function Caminante() {
  return (
    <svg viewBox="0 0 24 24" className={s.caminante} aria-hidden="true">
      <circle cx="13" cy="4" r="2" />
      <path d="M11 8.5 8 11l-1 4M11 8.5l3 2.5 3 1M11 8.5 10.5 14l3 3 1 5M10.5 14 8 18l-3 3" />
    </svg>
  );
}

function Conector({ tramo, avisos }: { tramo: Tramo; avisos: Aviso[] }) {
  const { a, b, margen, caminata, holgura } = tramo;
  const tope = avisos.find((x) => x.tipo === "tope" && x.a.id === a.id && x.b.id === b.id);
  const lluvia = avisos.find((x) => x.tipo === "lluvia" && x.a.id === a.id && x.b.id === b.id);
  const mismaSala = a.salaId === b.salaId;

  let estado: "tope" | "no-alcanza" | "justo" | "ok";
  let texto: string;
  let detalle: string;

  if (tope && tope.tipo === "tope") {
    estado = "tope";
    texto = `Se topan ${tope.minutos} min`;
    detalle = `${b.pelicula.titulo} empieza antes de que termine ${a.pelicula.titulo}.`;
  } else if (holgura < 0) {
    estado = "no-alcanza";
    texto = `No alcanzas: te ${faltan(-holgura)}`;
    detalle = `Son ${caminata} min a pie hasta ${nombreSalaCorto(b.salaId)} y tienes ${margen} min.`;
  } else if (mismaSala) {
    estado = holgura < 5 ? "justo" : "ok";
    texto = margen === 0 ? "Sin pausa, en la misma sala" : `${duracion(margen)} de pausa`;
    detalle = `Te quedas en ${nombreSalaCorto(b.salaId)}.`;
  } else {
    estado = holgura < 5 ? "justo" : "ok";
    texto = `${caminata} min a pie hasta ${nombreSalaCorto(b.salaId)}`;
    detalle =
      holgura === 0 ? "Llegas justo a la hora." : holgura < 60 ? `Te ${sobran(holgura)}.` : `Te sobran ${duracion(holgura)}.`;
  }

  const alto = Math.max(64, Math.min(170, Math.max(0, margen) * 1.1));

  return (
    <div className={s.conector} data-estado={estado} style={{ "--alto": `${alto}px` } as CSSProperties}>
      <span className={s.riel} aria-hidden="true">
        {!mismaSala && estado !== "tope" && <Caminante />}
      </span>
      <div className={s.textoConector}>
        <strong>{texto}</strong>
        <span>{detalle}</span>
        {lluvia && lluvia.tipo === "lluvia" && (
          <span className={s.lluvia}>
            Si llueve y la función de la Terraza pasa al Galpón 7, son {lluvia.caminata} min a pie y te{" "}
            {faltan(lluvia.faltan)}.
          </span>
        )}
      </div>
    </div>
  );
}
