"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  analizar,
  claveAviso,
  decodificar,
  esGrave,
  funcionesDe,
  limpiarNombre,
  tramos,
  type Aviso,
} from "@/lib/itinerario";
import { funciones as todas, type Funcion } from "@/lib/programa";
import { describirAviso } from "@/lib/textos";
import { duracion } from "@/lib/tiempo";
import { useHidratado, useItinerario } from "@/lib/useItinerario";
import { cambiarUrl, useBusqueda } from "@/lib/useUrl";
import FuncionFila from "../FuncionFila";
import Compartir from "./Compartir";
import Recorrido from "./Recorrido";
import s from "./Itinerario.module.css";

export default function ItinerarioConUrl() {
  const busqueda = useBusqueda();
  if (busqueda === null) return <ItinerarioCargando />;
  const sp = new URLSearchParams(busqueda);
  const compartido = sp.get("f");
  if (compartido !== null) {
    return <VistaCompartida ids={decodificar(compartido)} nombre={limpiarNombre(sp.get("de"))} />;
  }
  return <MiItinerario />;
}

export function ItinerarioCargando() {
  return (
    <div className={`contenedor ${s.cargando}`} aria-busy="true">
      <div className={s.esqueleto} />
      <div className={s.esqueleto} />
    </div>
  );
}

function Resumen({ lista, avisos }: { lista: Funcion[]; avisos: Aviso[] }) {
  const cine = lista.reduce((t, f) => t + f.pelicula.duracionMin, 0);
  const caminata = tramos(lista)
    .filter((t) => t.a.dia === t.b.dia && t.margen >= 0)
    .reduce((t, x) => t + x.caminata, 0);
  const graves = avisos.filter(esGrave).length;
  return (
    <dl className={s.resumen}>
      <div>
        <dt>Funciones</dt>
        <dd className="num">{lista.length}</dd>
      </div>
      <div>
        <dt>De cine</dt>
        <dd className="num">{duracion(cine)}</dd>
      </div>
      <div>
        <dt>A pie</dt>
        <dd className="num">{caminata} min</dd>
      </div>
      <div data-alerta={graves > 0 || undefined}>
        <dt>Choques</dt>
        <dd className="num">{graves}</dd>
      </div>
    </dl>
  );
}

function ListaAvisos({ avisos }: { avisos: Aviso[] }) {
  if (avisos.length === 0) {
    return (
      <p className={s.todoCalza}>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M4 10.5 8 14.5 16 6" />
        </svg>
        Todo calza: alcanzas a llegar caminando a cada función.
      </p>
    );
  }
  const ordenados = [...avisos].sort((x, y) => Number(esGrave(y)) - Number(esGrave(x)) || x.b.ini - y.b.ini);
  const graves = avisos.filter(esGrave).length;
  const otros = avisos.length - graves;
  const partes = [
    graves > 0 ? `${graves} ${graves === 1 ? "choque" : "choques"}` : "",
    otros > 0 ? `${otros} ${otros === 1 ? "aviso" : "avisos"}` : "",
  ].filter(Boolean);
  return (
    <details className={s.bloqueAvisos} open={avisos.length <= 2} data-grave={graves > 0 || undefined}>
      <summary>
        <span>Revisa esto: {partes.join(" y ")}</span>
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </summary>
      <ul className={s.avisos}>
        {ordenados.map((x) => {
          const t = describirAviso(x);
          return (
            <li key={claveAviso(x)} data-tipo={x.tipo} data-grave={esGrave(x) || undefined}>
              <a href={`#parada-${x.b.id}`}>
                <strong>{t.titulo}</strong>
                <span>{t.detalle}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </details>
  );
}

function MiItinerario() {
  const hidratado = useHidratado();
  const { ids, quitar, reemplazar } = useItinerario();
  const lista = useMemo(() => funcionesDe(ids), [ids]);
  const avisos = useMemo(() => analizar(lista), [lista]);
  const [deshacer, setDeshacer] = useState<{ mensaje: string; previo: string[] } | null>(null);
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);
  const temporizador = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(temporizador.current), []);

  const mostrarDeshacer = (mensaje: string, previo: string[]) => {
    setDeshacer({ mensaje, previo });
    window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setDeshacer(null), 7000);
  };

  if (!hidratado) return <ItinerarioCargando />;

  const destacadas = todas.filter((f) => f.nota);

  return (
    <div className="contenedor">
      <header className={s.cabecera}>
        <p className={s.antetitulo}>Guardado en este navegador, sin cuentas</p>
        <h1 className={s.titulo}>
          Mi <em>itinerario</em>
        </h1>
      </header>

      {lista.length === 0 ? (
        <div className={s.vacio}>
          <svg viewBox="0 0 320 120" className={s.ilustracion} aria-hidden="true">
            <path d="M20 96 C 80 96, 90 40, 160 50 S 250 90, 300 36" className={s.ruta} />
            <circle cx="20" cy="96" r="7" className={s.hito} />
            <circle cx="160" cy="50" r="7" className={s.hito} />
            <g transform="translate(272 10)">
              <polygon points="10,26 30,6 30,46" className={s.haz} />
              <polygon points="6,20 14,20 17,52 3,52" className={s.torre} />
              <circle cx="10" cy="20" r="4" className={s.luz} />
            </g>
          </svg>
          <h2 className={s.vacioTitulo}>Tu recorrido todavía está en blanco.</h2>
          <p className={s.vacioTexto}>
            Marca en el programa las funciones a las que quieres ir. Aquí las ordenamos por hora, te decimos cuánto se
            camina de una sala a otra y te avisamos si algo no calza.
          </p>
          <Link href="/programa" className={s.botonPrincipal}>
            Ir al programa
          </Link>

          {destacadas.length > 0 && (
            <section className={s.destacadas} aria-labelledby="para-empezar">
              <h2 id="para-empezar" className={s.subtitulo}>
                Para empezar: las funciones especiales
              </h2>
              <ol className={s.listaDestacadas}>
                {destacadas.map((f) => (
                  <li key={f.id}>
                    <FuncionFila f={f} />
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      ) : (
        <div className={s.contenido}>
          <aside className={s.panel}>
            <Resumen lista={lista} avisos={avisos} />
            <ListaAvisos avisos={avisos} />
            <div className={s.acciones}>
              <Compartir ids={ids} />
              {confirmarVaciar ? (
                <div className={s.confirmar} role="group" aria-label="Confirmar vaciar itinerario">
                  <span>¿Borrar las {lista.length} funciones?</span>
                  <button
                    type="button"
                    className={s.botonPeligro}
                    onClick={() => {
                      const previo = ids;
                      reemplazar([]);
                      setConfirmarVaciar(false);
                      mostrarDeshacer("Vaciaste tu itinerario.", previo);
                    }}
                  >
                    Sí, vaciar
                  </button>
                  <button type="button" className={s.botonSecundario} onClick={() => setConfirmarVaciar(false)}>
                    No
                  </button>
                </div>
              ) : (
                <button type="button" className={s.botonSecundario} onClick={() => setConfirmarVaciar(true)}>
                  Vaciar
                </button>
              )}
            </div>
          </aside>

          <Recorrido
            funciones={lista}
            avisos={avisos}
            onQuitar={(f) => {
              const previo = ids;
              quitar(f.id);
              mostrarDeshacer(`Quitaste ${f.pelicula.titulo}.`, previo);
            }}
          />
        </div>
      )}

      <div className={s.aviso} role="status" aria-live="polite">
        {deshacer && (
          <div className={s.toast}>
            <span>{deshacer.mensaje}</span>
            <button
              type="button"
              onClick={() => {
                reemplazar(deshacer.previo);
                setDeshacer(null);
              }}
            >
              Deshacer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function VistaCompartida({ ids, nombre }: { ids: string[]; nombre: string }) {
  const hidratado = useHidratado();
  const mio = useItinerario();
  const lista = useMemo(() => funcionesDe(ids), [ids]);
  const avisos = useMemo(() => analizar(lista), [lista]);
  const yaEnElMio = useMemo(() => new Set(mio.ids), [mio.ids]);

  if (!hidratado) return <ItinerarioCargando />;

  const nuevas = ids.filter((id) => !yaEnElMio.has(id));
  const irAlMio = () => {
    cambiarUrl("/itinerario", { agregarAlHistorial: true });
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="contenedor">
      <header className={s.cabecera}>
        <p className={s.antetitulo}>Itinerario compartido</p>
        <h1 className={s.titulo}>
          {nombre ? (
            <>
              El recorrido de <em>{nombre}</em>
            </>
          ) : (
            <>
              Un recorrido <em>para ti</em>
            </>
          )}
        </h1>
      </header>

      {lista.length === 0 ? (
        <div className={s.vacio}>
          <h2 className={s.vacioTitulo}>Este link no trae funciones que podamos leer.</h2>
          <p className={s.vacioTexto}>Puede que se haya cortado al copiarlo. Pídele a quien te lo mandó que lo comparta de nuevo.</p>
          <Link href="/programa" className={s.botonPrincipal}>
            Ver el programa
          </Link>
        </div>
      ) : (
        <div className={s.contenido}>
          <aside className={s.panel}>
            <Resumen lista={lista} avisos={avisos} />
            <ListaAvisos avisos={avisos} />
            <div className={s.copiar}>
              {nuevas.length === 0 ? (
                <>
                  <p>Todas estas funciones ya están en tu itinerario.</p>
                  <button type="button" className={s.botonPrincipal} onClick={irAlMio}>
                    Ver mi itinerario
                  </button>
                </>
              ) : mio.ids.length === 0 ? (
                <>
                  <p>¿Te sumas? Copia este recorrido y después lo ajustas a tu gusto.</p>
                  <button
                    type="button"
                    className={s.botonPrincipal}
                    onClick={() => {
                      mio.reemplazar(ids);
                      irAlMio();
                    }}
                  >
                    Copiar a mi itinerario
                  </button>
                </>
              ) : (
                <>
                  <p>
                    Ya tienes {mio.ids.length} {mio.ids.length === 1 ? "función" : "funciones"} en tu itinerario.
                    ¿Qué hacemos?
                  </p>
                  <button
                    type="button"
                    className={s.botonPrincipal}
                    onClick={() => {
                      mio.agregar(ids);
                      irAlMio();
                    }}
                  >
                    Sumar {nuevas.length} {nuevas.length === 1 ? "función" : "funciones"} al mío
                  </button>
                  <button
                    type="button"
                    className={s.botonSecundario}
                    onClick={() => {
                      mio.reemplazar(ids);
                      irAlMio();
                    }}
                  >
                    Reemplazar el mío por este
                  </button>
                </>
              )}
            </div>
          </aside>

          <Recorrido funciones={lista} avisos={avisos} yaEnElMio={yaEnElMio} />
        </div>
      )}
    </div>
  );
}
