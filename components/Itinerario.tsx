"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { TarjetaFuncion } from "./TarjetaFuncion";
import { decodificarIds, PARAM_COMPARTIR, rutaCompartida } from "@/lib/compartir";
import { analizar, type Tramo } from "@/lib/conflictos";
import { pelicula, sala } from "@/lib/datos";
import { useHidratado } from "@/lib/almacen-local";
import { useItinerario } from "@/lib/itinerario-store";
import { dias, type FuncionCalc } from "@/lib/tiempo";
import styles from "./Itinerario.module.css";

export function Itinerario() {
  const params = useSearchParams();
  const compartidos = useMemo(() => decodificarIds(params.get(PARAM_COMPARTIR)), [params]);
  const esCompartido = params.has(PARAM_COMPARTIR);
  const { ids, cargado } = useItinerario();

  const lista = esCompartido ? compartidos : ids;
  const analisis = useMemo(() => analizar(lista), [lista]);

  if (esCompartido) {
    return <VistaCompartida ids={compartidos} analisis={analisis} />;
  }

  return <VistaPropia ids={ids} cargado={cargado} analisis={analisis} />;
}

/* ---------- Mi itinerario ---------- */

function VistaPropia({
  ids,
  cargado,
  analisis,
}: {
  ids: string[];
  cargado: boolean;
  analisis: ReturnType<typeof analizar>;
}) {
  const { vaciar } = useItinerario();
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);
  const [compartirAbierto, setCompartirAbierto] = useState(false);

  useEffect(() => {
    if (!confirmarVaciar) return;
    const t = window.setTimeout(() => setConfirmarVaciar(false), 4000);
    return () => window.clearTimeout(t);
  }, [confirmarVaciar]);

  const totalAvisos = contarAvisos(analisis);

  return (
    <div className="contenedor">
      <header className={styles.cabecera}>
        <div>
          <p className="sobreimpreso">Mi itinerario</p>
          <h1 className="seccion-titulo">
            {!cargado
              ? "Cargando…"
              : ids.length === 0
                ? "Todavía no eliges nada"
                : `${ids.length} ${ids.length === 1 ? "función" : "funciones"} en ${diasDistintos(analisis.funciones)} ${diasDistintos(analisis.funciones) === 1 ? "día" : "días"}`}
          </h1>
          {cargado && ids.length > 0 && <ResumenAvisos analisis={analisis} />}
        </div>
        {cargado && ids.length > 0 && (
          <div className={styles.acciones}>
            <button type="button" className="boton boton--faro" onClick={() => setCompartirAbierto((v) => !v)} aria-expanded={compartirAbierto}>
              Compartir
            </button>
            <button
              type="button"
              className={`boton boton--secundario ${confirmarVaciar ? styles.peligro : ""}`}
              onClick={() => {
                if (confirmarVaciar) {
                  vaciar();
                  setConfirmarVaciar(false);
                } else {
                  setConfirmarVaciar(true);
                }
              }}
            >
              {confirmarVaciar ? "¿Seguro? Vaciar todo" : "Vaciar"}
            </button>
          </div>
        )}
      </header>

      {compartirAbierto && cargado && ids.length > 0 && <PanelCompartir ids={ids} alCerrar={() => setCompartirAbierto(false)} />}

      {cargado && ids.length === 0 && <Vacio />}

      {cargado && ids.length > 0 && (
        <>
          <Recorrido analisis={analisis} />
          <p className={styles.notaFinal}>
            Tu itinerario se guarda en este navegador, sin cuentas ni registro. Si quieres verlo en
            otro teléfono, compártelo con el enlace.
            {totalAvisos > 0 && " Los avisos se recalculan cada vez que agregas o quitas una función."}
          </p>
        </>
      )}
    </div>
  );
}

/* ---------- Itinerario compartido ---------- */

function VistaCompartida({ ids, analisis }: { ids: string[]; analisis: ReturnType<typeof analizar> }) {
  const { ids: mios, cargado, agregarVarias, reemplazar } = useItinerario();
  const router = useRouter();
  const [hecho, setHecho] = useState<"sumado" | "reemplazado" | null>(null);

  const nuevas = ids.filter((id) => !mios.includes(id));
  const yaTodas = cargado && ids.length > 0 && nuevas.length === 0;

  return (
    <div className="contenedor">
      <header className={styles.cabecera}>
        <div>
          <p className="sobreimpreso">Itinerario compartido</p>
          <h1 className="seccion-titulo">
            {ids.length === 0
              ? "Este enlace no trae funciones"
              : `${ids.length} ${ids.length === 1 ? "función" : "funciones"} en ${diasDistintos(analisis.funciones)} ${diasDistintos(analisis.funciones) === 1 ? "día" : "días"}`}
          </h1>
          <p className="seccion-sub">
            {ids.length === 0
              ? "Puede que el enlace esté incompleto. Revisa el programa y arma el tuyo."
              : "Alguien te compartió su recorrido por el festival. Puedes copiarlo al tuyo y seguir editándolo."}
          </p>
        </div>
      </header>

      {ids.length > 0 && (
        <div className={styles.bannerCompartido} role="region" aria-label="Copiar itinerario">
          {hecho ? (
            <>
              <p className={styles.bannerTexto}>
                <strong>Listo.</strong>{" "}
                {hecho === "sumado" ? "Estas funciones ya están en tu itinerario." : "Tu itinerario ahora es igual a este."}
              </p>
              <button type="button" className="boton" onClick={() => router.push("/itinerario")}>
                Ver mi itinerario
              </button>
            </>
          ) : (
            <>
              <p className={styles.bannerTexto}>
                {!cargado
                  ? "Cargando tu itinerario…"
                  : yaTodas
                    ? "Todas estas funciones ya están en tu itinerario."
                    : mios.length === 0
                      ? "Todavía no tienes itinerario. Puedes partir con este."
                      : nuevas.length === 1
                        ? "Una de estas funciones no está en tu itinerario."
                        : `${nuevas.length} de estas funciones no están en tu itinerario.`}
              </p>
              <div className={styles.bannerAcciones}>
                {yaTodas ? (
                  <Link href="/itinerario" className="boton">
                    Ver mi itinerario
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="boton boton--faro"
                    disabled={!cargado}
                    onClick={() => {
                      agregarVarias(ids);
                      setHecho("sumado");
                    }}
                  >
                    {mios.length === 0 ? "Copiar a mi itinerario" : "Sumar a mi itinerario"}
                  </button>
                )}
                {cargado && mios.length > 0 && !yaTodas && (
                  <button
                    type="button"
                    className="boton boton--secundario"
                    onClick={() => {
                      reemplazar(ids);
                      setHecho("reemplazado");
                    }}
                  >
                    Reemplazar el mío
                  </button>
                )}
                {cargado && mios.length > 0 && !yaTodas && (
                  <Link href="/itinerario" className={styles.enlaceSuave}>
                    Ver el mío sin copiar
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {ids.length > 0 ? (
        <Recorrido analisis={analisis} soloLectura />
      ) : (
        <div className={styles.accionesVacio}>
          <Link href="/programa" className="boton">
            Ver el programa
          </Link>
        </div>
      )}
    </div>
  );
}

/* ---------- Piezas ---------- */

function diasDistintos(funciones: FuncionCalc[]): number {
  return new Set(funciones.map((f) => f.dia.fecha)).size;
}

function contarAvisos(analisis: ReturnType<typeof analizar>): number {
  let n = 0;
  for (const lista of analisis.avisos.values()) n += lista.length;
  return n;
}

function ResumenAvisos({ analisis }: { analisis: ReturnType<typeof analizar> }) {
  const conteo = { choque: 0, traslado: 0, conversatorio: 0 };
  const paresVistos = new Set<string>();
  for (const lista of analisis.avisos.values()) {
    for (const a of lista) {
      if (a.tipo === "choque") {
        const clave = [a.funcionId, a.otraFuncionId].sort().join("|");
        if (paresVistos.has(clave)) continue;
        paresVistos.add(clave);
      }
      conteo[a.tipo]++;
    }
  }
  const total = conteo.choque + conteo.traslado + conteo.conversatorio;
  if (total === 0) {
    return <p className={`${styles.resumen} ${styles.resumenOk}`}>Todo calza: sin topes y con tiempo para caminar.</p>;
  }
  return (
    <p className={styles.resumen} aria-live="polite">
      {conteo.choque > 0 && (
        <span className="chip chip--alerta">
          {conteo.choque} {conteo.choque === 1 ? "tope" : "topes"}
        </span>
      )}
      {conteo.traslado > 0 && (
        <span className="chip chip--aviso">
          {conteo.traslado} {conteo.traslado === 1 ? "traslado justo" : "traslados justos"}
        </span>
      )}
      {conteo.conversatorio > 0 && (
        <span className="chip chip--nota">
          {conteo.conversatorio} {conteo.conversatorio === 1 ? "conversatorio en riesgo" : "conversatorios en riesgo"}
        </span>
      )}
    </p>
  );
}

function Vacio() {
  return (
    <div className={styles.vacio}>
      <svg viewBox="0 0 240 120" className={styles.vacioDibujo} aria-hidden="true">
        <path d="M0 80c30-18 60-18 90 0s60 18 90 0 45-12 60-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        <path d="M0 100c30-18 60-18 90 0s60 18 90 0 45-12 60-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
        <circle cx="180" cy="34" r="16" fill="currentColor" opacity="0.9" />
        <path d="M140 60h-20l6-24h8z" fill="currentColor" opacity="0.7" />
      </svg>
      <h2 className={styles.vacioTitulo}>Tu recorrido parte en el programa</h2>
      <p className={styles.vacioTexto}>
        Marca las funciones que quieres ver y acá te mostramos el recorrido completo: horarios,
        traslados a pie entre salas y avisos si algo no calza.
      </p>
      <Link href="/programa" className="boton">
        Ir al programa
      </Link>
    </div>
  );
}

function Recorrido({ analisis, soloLectura = false }: { analisis: ReturnType<typeof analizar>; soloLectura?: boolean }) {
  const tramosPorDestino = new Map<string, Tramo>();
  for (const t of analisis.tramos) tramosPorDestino.set(t.hastaId, t);
  const funcionesPorId = new Map(analisis.funciones.map((f) => [f.id, f]));

  const porDia = dias
    .map((d) => ({ dia: d, lista: analisis.funciones.filter((f) => f.dia.fecha === d.fecha) }))
    .filter((g) => g.lista.length > 0);

  return (
    <div className={styles.recorrido}>
      {porDia.map(({ dia, lista }) => (
        <section key={dia.fecha} className={styles.dia} aria-labelledby={`it-${dia.fecha}`}>
          <header className={styles.diaCabecera}>
            <h2 id={`it-${dia.fecha}`} className={styles.diaTitulo}>
              {dia.larga}
            </h2>
            <p className={styles.diaResumen}>
              {lista.length} {lista.length === 1 ? "función" : "funciones"} · {lista[0].horaInicio} a {lista[lista.length - 1].horaFin}
            </p>
          </header>
          <ol className={styles.lista}>
            {lista.map((f, i) => {
              const anterior = i > 0 ? lista[i - 1] : undefined;
              const tramo = anterior ? tramosPorDestino.get(f.id) : undefined;
              const desde = tramo ? funcionesPorId.get(tramo.desdeId) : undefined;
              const mostrarTramo = Boolean(tramo && desde && anterior && desde.id === anterior.id);
              return (
                <li key={f.id} className={styles.item}>
                  {mostrarTramo && tramo && desde && <Conector tramo={tramo} desde={desde} hasta={f} />}
                  {!mostrarTramo && i > 0 && (analisis.avisos.get(f.id) ?? []).some((a) => a.tipo === "choque") && (
                    <div className={`${styles.conector} ${styles.conectorChoque}`}>
                      <span className={styles.conectorLinea} aria-hidden="true" />
                      <span className={styles.conectorTexto}>Se topa con la función anterior</span>
                    </div>
                  )}
                  <TarjetaFuncion funcion={f} avisos={analisis.avisos.get(f.id)} sinHipoteticos sinBoton={soloLectura} />
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}

function Conector({ tramo, desde, hasta }: { tramo: Tramo; desde: FuncionCalc; hasta: FuncionCalc }) {
  const salaHasta = sala(hasta.salaId);
  const conv = desde.conversatorioMin ?? 0;
  const margenTrasConv = tramo.minutosDisponibles - tramo.minutosCaminando - conv;
  let clase = styles.conectorOk;
  let texto: string;

  if (tramo.mismaSala) {
    texto = `Misma sala · ${tramo.minutosDisponibles} min entre una y otra`;
    if (conv > 0 && tramo.minutosDisponibles < conv) {
      clase = styles.conectorNota;
      texto = `Misma sala · el conversatorio de «${pelicula(desde.peliculaId)?.titulo}» se cruza ${conv - tramo.minutosDisponibles} min con esta función`;
    }
  } else if (!tramo.alcanza) {
    clase = styles.conectorAviso;
    texto = `Caminar a ${salaHasta.nombre} toma ${tramo.minutosCaminando} min y solo hay ${tramo.minutosDisponibles}. Faltan ${tramo.minutosCaminando - tramo.minutosDisponibles} min.`;
  } else if (conv > 0 && margenTrasConv < 0) {
    clase = styles.conectorNota;
    texto = `${tramo.minutosCaminando} min caminando a ${salaHasta.nombre} · alcanzas justo si sales apenas termina la película, sin conversatorio`;
    if (margenTrasConv + conv > 0) {
      texto = `${tramo.minutosCaminando} min caminando a ${salaHasta.nombre} · puedes quedarte ${margenTrasConv + conv} de los ${conv} min de conversatorio`;
    }
  } else {
    const holgura = tramo.minutosDisponibles - tramo.minutosCaminando;
    texto = `${tramo.minutosCaminando} min caminando a ${salaHasta.nombre} · te sobran ${holgura} min`;
    if (holgura <= 5) clase = styles.conectorJusto;
  }

  return (
    <div className={`${styles.conector} ${clase}`}>
      <span className={styles.conectorLinea} aria-hidden="true" />
      <span className={styles.conectorTexto}>{texto}</span>
    </div>
  );
}

function PanelCompartir({ ids, alCerrar }: { ids: string[]; alCerrar: () => void }) {
  const hidratado = useHidratado();
  const [estado, setEstado] = useState<"" | "copiado" | "error">("");
  const ruta = rutaCompartida(ids);
  const url = hidratado ? `${window.location.origin}${ruta}` : ruta;
  const puedeCompartir = hidratado && typeof navigator.share === "function";

  useEffect(() => {
    if (!estado) return;
    const t = window.setTimeout(() => setEstado(""), 2500);
    return () => window.clearTimeout(t);
  }, [estado]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setEstado("copiado");
    } catch {
      setEstado("error");
    }
  };

  const compartir = async () => {
    try {
      await navigator.share({ title: "Mi itinerario del Festival Niebla", url });
    } catch {
      // La persona canceló o el navegador no pudo compartir. No pasa nada.
    }
  };

  return (
    <div className={styles.panelCompartir} role="region" aria-label="Compartir itinerario">
      <div className={styles.panelTexto}>
        <p className={styles.panelTitulo}>Comparte tu recorrido</p>
        <p className={styles.panelSub}>
          Quien abra este enlace ve tus {ids.length} funciones y puede copiarlas a su itinerario.
        </p>
      </div>
      <div className={styles.panelCampo}>
        <input
          type="text"
          readOnly
          value={url}
          className={`mono ${styles.panelInput}`}
          aria-label="Enlace para compartir"
          onFocus={(e) => e.currentTarget.select()}
        />
        <div className={styles.panelBotones}>
          <button type="button" className="boton boton--chico" onClick={copiar}>
            {estado === "copiado" ? "Enlace copiado" : estado === "error" ? "Copia el enlace a mano" : "Copiar enlace"}
          </button>
          {puedeCompartir && (
            <button type="button" className="boton boton--chico boton--secundario" onClick={compartir}>
              Enviar
            </button>
          )}
          <button type="button" className={styles.enlaceSuave} onClick={alCerrar}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
