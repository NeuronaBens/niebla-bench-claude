"use client";

/**
 * /itinerario: el recorrido personal guardado en este navegador.
 */
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { analizarItinerario } from "@/lib/itinerario";
import { dias, funciones, funcionPorId, slugDia } from "@/lib/programa";
import { useItinerario } from "@/lib/useItinerario";
import BotonItinerario from "./BotonItinerario";
import CompartirItinerario from "./CompartirItinerario";
import LineaDeTiempo from "./LineaDeTiempo";
import ResumenItinerario from "./ResumenItinerario";
import { useMinutoFestival } from "./useMinutoFestival";
import { IconoDeshacer, IconoFlecha } from "./iconos";
import s from "./Itinerario.module.css";

interface Deshacer {
  clave: number;
  texto: string;
  idsPrevios: readonly string[];
}

export default function MiItinerario() {
  const { ids, listo, quitar, reemplazar, vaciar } = useItinerario();
  const analisis = useMemo(() => analizarItinerario(ids), [ids]);
  const ahora = useMinutoFestival();
  const [deshacer, setDeshacer] = useState<Deshacer | null>(null);
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);

  const alQuitar = (id: string) => {
    const f = funcionPorId.get(id);
    setDeshacer({
      clave: Date.now(),
      texto: f ? `Quitaste ${f.pelicula.titulo} (${f.dia.corto} ${f.horaInicio})` : "Quitaste una función",
      idsPrevios: ids,
    });
    quitar(id);
  };

  const alVaciar = () => {
    setDeshacer({
      clave: Date.now(),
      texto: `Vaciaste tu itinerario (${ids.length === 1 ? "1 función" : `${ids.length} funciones`})`,
      idsPrevios: ids,
    });
    setConfirmarVaciar(false);
    vaciar();
  };

  if (!listo) return <Esqueleto />;

  const vacio = analisis.funciones.length === 0;

  return (
    <>
      {vacio ? (
        <EstadoVacio />
      ) : (
        <div className={s.disposicion}>
          <aside className={s.lateral}>
            <ResumenItinerario analisis={analisis} />
            <CompartirItinerario ids={analisis.funciones.map((f) => f.id)} />
          </aside>

          <div className={s.principal}>
            <LineaDeTiempo analisis={analisis} onQuitar={alQuitar} ahoraMin={ahora} />
          </div>

          <div className={s.pieItinerario}>
            <Link href="/programa" className={s.enlaceFlecha}>
              Sumar más funciones desde el programa
              <IconoFlecha tamano={16} />
            </Link>
            {confirmarVaciar ? (
              <div className={s.confirmar} role="group" aria-label="Confirmar vaciar itinerario">
                <span>
                  ¿Vaciar {analisis.funciones.length === 1 ? "la única función" : `las ${analisis.funciones.length} funciones`}?
                </span>
                <button type="button" className={s.botonPeligro} onClick={alVaciar}>
                  Sí, vaciar
                </button>
                <button type="button" className={s.botonSecundario} onClick={() => setConfirmarVaciar(false)} autoFocus>
                  No
                </button>
              </div>
            ) : (
              <button type="button" className={s.botonTexto} onClick={() => setConfirmarVaciar(true)}>
                Vaciar itinerario
              </button>
            )}
          </div>
        </div>
      )}

      <BarraDeshacer
        deshacer={deshacer}
        onDeshacer={(d) => {
          reemplazar(d.idsPrevios);
          setDeshacer(null);
        }}
        onCerrar={() => setDeshacer(null)}
      />
    </>
  );
}

function BarraDeshacer({
  deshacer,
  onDeshacer,
  onCerrar,
}: {
  deshacer: Deshacer | null;
  onDeshacer: (d: Deshacer) => void;
  onCerrar: () => void;
}) {
  const clave = deshacer?.clave;
  useEffect(() => {
    if (clave === undefined) return;
    const t = window.setTimeout(onCerrar, 7000);
    return () => window.clearTimeout(t);
    // onCerrar es estable en la práctica (solo limpia estado); el temporizador depende de la clave.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave]);

  return (
    <div className={s.barraRegion} aria-live="polite">
      {deshacer && (
        <div key={deshacer.clave} className={s.barra}>
          <span className={s.barraTexto}>{deshacer.texto}</span>
          <button type="button" className={s.barraBoton} onClick={() => onDeshacer(deshacer)}>
            <IconoDeshacer tamano={16} />
            Deshacer
          </button>
        </div>
      )}
    </div>
  );
}

function Esqueleto() {
  return (
    <div className={s.esqueleto} aria-busy="true" aria-label="Cargando tu itinerario">
      <div className={s.esqueletoResumen} />
      <div className={s.esqueletoBoleto} />
      <div className={s.esqueletoTramo} />
      <div className={s.esqueletoBoleto} />
    </div>
  );
}

function EstadoVacio() {
  const inaugural = funciones.find((f) => f.nota?.toLowerCase().includes("inaugural"));
  return (
    <section className={s.vacio} aria-labelledby="vacio-titulo">
      <div className={s.vacioNiebla} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className={s.vacioTexto}>
        <p className={s.vacioKicker}>Puro horizonte</p>
        <h2 id="vacio-titulo" className={s.vacioTitulo}>
          Tu itinerario todavía está en blanco
        </h2>
        <p className={s.vacioBajada}>
          Marca en el programa las funciones a las que quieres ir. Acá las vas a ver en orden, con los minutos
          caminando entre salas, y te avisamos si algo se topa o si no alcanzas a llegar.
        </p>
        <div className={s.vacioAcciones}>
          <Link href="/programa" className={s.botonSodio}>
            Ver el programa
            <IconoFlecha tamano={18} />
          </Link>
        </div>
        <ul className={s.vacioDias} aria-label="Programa por día">
          {dias.map((d) => (
            <li key={d.fecha}>
              <Link href={`/programa?dia=${slugDia(d)}`} className={s.vacioDia}>
                <span className={s.vacioDiaNombre}>{d.corto}</span>
                <span className={s.vacioDiaNumero}>{d.numero}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {inaugural && (
        <div className={s.sugerencia}>
          <p className={s.sugerenciaKicker}>¿Por dónde partir? Por el comienzo</p>
          <p className={s.sugerenciaHora}>
            {inaugural.dia.nombre} {inaugural.dia.numero} · {inaugural.horaInicio}
          </p>
          <p className={s.sugerenciaTitulo}>
            <Link href={`/pelicula/${inaugural.pelicula.id}`}>{inaugural.pelicula.titulo}</Link>
          </p>
          <p className={s.sugerenciaSala}>
            {inaugural.sala.nombre} · {inaugural.nota}
          </p>
          <BotonItinerario funcionId={inaugural.id} variante="completo" />
        </div>
      )}
    </section>
  );
}
