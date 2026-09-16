"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useItinerario } from "@/lib/useItinerario";
import {
  analizarItinerario,
  avisosDeFuncion,
  serializarIds,
  parsearIds,
} from "@/lib/itinerario";
import { traslado, nombreCorto } from "@/lib/programa";
import { DIAS, formatoDuracion } from "@/lib/tiempo";
import type { FuncionExpandida } from "@/lib/tipos";
import TarjetaFuncion from "./TarjetaFuncion";
import styles from "./Itinerario.module.css";

export default function Itinerario() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ids, listo, vaciar, agregarVarios } = useItinerario();

  const [mostrarCopiadoMensaje, setMostrarCopiadoMensaje] = useState(false);
  const [esperandoVaciar, setEsperandoVaciar] = useState(false);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const [mostrarInputUrl, setMostrarInputUrl] = useState(false);
  const [urlCompartida, setUrlCompartida] = useState("");

  // Detectar modo: compartido o personal
  const idsCompartidos = parsearIds(searchParams.get("f") ?? "");
  const modoCompartido = idsCompartidos.length > 0;

  // Datos a mostrar según el modo
  const idsAMostrar = modoCompartido ? idsCompartidos : ids;
  const analisis = analizarItinerario(idsAMostrar);
  const funcionesAMostrar = analisis.funciones;
  const avisos = analisis.avisos;

  const diasConFunciones = DIAS.filter((dia) =>
    funcionesAMostrar.some((f) => f.dia === dia.index)
  );

  // Manejar compartir
  const manejarCompartir = async () => {
    const url = `${window.location.origin}/itinerario?f=${serializarIds(ids)}`;
    setUrlCompartida(url);

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Mi itinerario · Festival Niebla", url });
        return;
      } catch (err) {
        // Si el usuario canceló, no hacemos nada más; si falló por otra razón, seguimos al portapapeles
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setMostrarCopiadoMensaje(true);
      setTimeout(() => setMostrarCopiadoMensaje(false), 3000);
    } catch {
      // Sin permiso de portapapeles: mostrar la URL en un input para copiarla a mano
      setMostrarInputUrl(true);
      setTimeout(() => {
        urlInputRef.current?.focus();
        urlInputRef.current?.select();
      }, 0);
    }
  };

  // Manejar copiar itinerario compartido
  const manejarCopiar = () => {
    agregarVarios(idsCompartidos);
    router.replace("/itinerario");
  };

  if (!listo) {
    return (
      <div className={styles.itinerario}>
        <div className={styles.esqueleto}>Cargando tu itinerario…</div>
      </div>
    );
  }

  // MODO COMPARTIDO: Sin funciones válidas
  if (modoCompartido && funcionesAMostrar.length === 0) {
    return (
      <div className={styles.itinerario}>
        <div className={styles.vacio}>
          <p>Este link no trae ninguna función válida.</p>
          <Link href="/programa" className={styles.enlaceSecundario} style={{ display: "inline-block", marginTop: "var(--espacio-lg)" }}>
            Ir al programa
          </Link>
        </div>
      </div>
    );
  }

  // MODO PERSONAL: Vacío
  if (!modoCompartido && funcionesAMostrar.length === 0) {
    return (
      <div className={styles.itinerario}>
        <div className={styles.vacio}>
          <h1 className={styles.vacioTitulo}>Tu itinerario está vacío</h1>
          <p className={styles.vacioTexto}>
            Marca funciones en el programa y acá se arma tu recorrido por el festival. Te avisamos si dos se topan o si no alcanzas a llegar caminando.
          </p>
          <Link href="/programa" style={{ display: "inline-block", padding: "var(--espacio-md) var(--espacio-lg)", background: "var(--faro)", color: "var(--fondo)", fontWeight: "600", borderRadius: "var(--radio-lg)", textDecoration: "none" }}>
            Ir al programa
          </Link>
        </div>
      </div>
    );
  }

  // CON FUNCIONES
  return (
    <div className={styles.itinerario}>
      {modoCompartido && (
        <div className={styles.compartidoEncabezado}>
          <h1 className={styles.compartidoTitulo}>Itinerario compartido</h1>
          <p className={styles.compartidoTexto}>
            Alguien te compartió su recorrido por el festival. Puedes copiarlo al tuyo.
          </p>
        </div>
      )}

      <div className={styles.encabezado}>
        <div>
          <h1 className={styles.encabezadoTitulo}>
            {funcionesAMostrar.length} {funcionesAMostrar.length === 1 ? "función" : "funciones"}
          </h1>
          <p className={styles.encabezadoSubtitulo}>
            {diasConFunciones.map((d) => d.corto).join(", ")}
          </p>
        </div>

        {!modoCompartido && (
          <div className={styles.acciones}>
            <button onClick={manejarCompartir} className={styles.botonAccion}>
              Compartir
            </button>
            {!esperandoVaciar ? (
              <button onClick={() => setEsperandoVaciar(true)} className={styles.botonVaciar}>
                Vaciar
              </button>
            ) : (
              <>
                <button onClick={() => { vaciar(); setEsperandoVaciar(false); }} className={styles.botonVaciarConfirm}>
                  ¿Seguro? Sí, vaciar
                </button>
                <button onClick={() => setEsperandoVaciar(false)} className={styles.botonCancelar}>
                  Cancelar
                </button>
              </>
            )}
          </div>
        )}

        {modoCompartido && (
          <div className={styles.acciones}>
            <button onClick={manejarCopiar} disabled={!listo} className={styles.botonAccion}>
              Copiar a mi itinerario
            </button>
          </div>
        )}
      </div>

      {modoCompartido && ids.length > 0 && (
        <p className={styles.copiarInfo}>
          Se suman a las {ids.length} función{ids.length !== 1 ? "es" : ""} que ya tienes.
        </p>
      )}

      {mostrarCopiadoMensaje && (
        <div className={styles.copiadoMensaje} aria-live="polite">
          Link copiado
        </div>
      )}

      {mostrarInputUrl && (
        <div className={styles.compartirCaja}>
          <label style={{ display: "block", marginBottom: "var(--espacio-sm)", fontWeight: "500", color: "var(--niebla)" }}>
            Compartir este link:
          </label>
          <input
            ref={urlInputRef}
            type="text"
            value={urlCompartida}
            readOnly
            className={styles.urlInput}
            onFocus={(e) => e.target.select()}
          />
        </div>
      )}

      {avisos.length > 0 && (
        <div className={styles.avisos}>
          <div className={styles.avisosTitulo}>
            Ojo: {avisos.length} aviso{avisos.length !== 1 ? "s" : ""}
          </div>
          {avisos.map((aviso, i) => (
            <div key={i} className={styles.avisoItem}>
              {aviso.texto}
            </div>
          ))}
        </div>
      )}

      {diasConFunciones.map((dia) => {
        const funcionesDelDia = funcionesAMostrar.filter((f) => f.dia === dia.index);

        return (
          <div key={dia.index} className={styles.diaBloque}>
            <h2 className={styles.diaTitulo}>{dia.largo}</h2>

            <div className={styles.funcionesDelDia}>
              {funcionesDelDia.map((f, idx) => {
                const avisosDeEsta = avisosDeFuncion(analisis, f.id).map((a) => a.texto);
                const elementosAviso = f.agotada
                  ? [...avisosDeEsta, "Esta función está agotada: solo te sirve si ya tienes entrada."]
                  : avisosDeEsta;

                return (
                  <div key={f.id}>
                    <TarjetaFuncion
                      funcion={f}
                      variante="lista"
                      avisos={elementosAviso}
                      sinBoton={modoCompartido}
                    />

                    {idx < funcionesDelDia.length - 1 && (
                      <ConectorTraslado
                        funcionActual={f}
                        siguienteFuncion={funcionesDelDia[idx + 1]}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {!modoCompartido && (
        <div style={{ textAlign: "center", marginTop: "var(--espacio-2xl)" }}>
          <Link
            href="/programa"
            className={styles.enlaceSecundario}
            style={{ display: "inline-block", padding: "var(--espacio-md) var(--espacio-lg)", border: "1px solid var(--faro)", borderRadius: "var(--radio-lg)" }}
          >
            Seguir agregando funciones
          </Link>
        </div>
      )}

      {modoCompartido && (
        <div style={{ textAlign: "center", marginTop: "var(--espacio-2xl)" }}>
          <Link href="/itinerario" className={styles.enlaceSecundario} style={{ display: "inline-block", padding: "var(--espacio-md) var(--espacio-lg)", border: "1px solid var(--faro)", borderRadius: "var(--radio-lg)" }}>
            Ver mi itinerario
          </Link>
        </div>
      )}

    </div>
  );
}

interface ConectorTrasladoProps {
  funcionActual: FuncionExpandida;
  siguienteFuncion: FuncionExpandida;
}

function minutos(n: number): string {
  return n >= 60 ? formatoDuracion(n) : `${n} ${n === 1 ? "minuto" : "minutos"}`;
}

function ConectorTraslado({ funcionActual, siguienteFuncion }: ConectorTrasladoProps) {
  const mismaSala = funcionActual.sala.id === siguienteFuncion.sala.id;
  const desde = nombreCorto(funcionActual.sala);
  const hasta = nombreCorto(siguienteFuncion.sala);
  const camino = mismaSala ? 0 : traslado(funcionActual.sala.id, siguienteFuncion.sala.id);
  const disponible = siguienteFuncion.inicioMin - funcionActual.finMin;
  const sobra = disponible - camino;

  let tipo: "alcanza" | "justo" | "noAlcanza" = "alcanza";
  let texto: string;

  if (disponible < 0) {
    tipo = "noAlcanza";
    texto = "Se topan: la siguiente empieza antes de que termine esta.";
  } else if (mismaSala) {
    texto = `Te quedas en ${desde} · tienes ${minutos(disponible)} entre una y otra.`;
  } else if (sobra < 0) {
    tipo = "noAlcanza";
    texto = `No alcanzas a llegar caminando de ${desde} a ${hasta}: ${-sobra === 1 ? "falta" : "faltan"} ${minutos(-sobra)}.`;
  } else if (sobra < 5) {
    tipo = "justo";
    texto = `${camino} min caminando de ${desde} a ${hasta} · llegas justo, te ${sobra === 1 ? "sobra" : "sobran"} ${minutos(sobra)}.`;
  } else {
    texto = `${camino} min caminando de ${desde} a ${hasta} · tienes ${minutos(disponible)}.`;
  }

  // Si esta función tiene conversatorio y aún se puede llegar, avisar qué pasa si se queda
  if (funcionActual.conversatorioMin && tipo !== "noAlcanza") {
    const sobraConConv = siguienteFuncion.inicioMin - funcionActual.finConversatorioMin - camino;
    const conv = `Si te quedas al conversatorio (${funcionActual.conversatorioMin} min)`;
    if (sobraConConv < 0) {
      tipo = "justo";
      texto += ` ${conv} no alcanzas a llegar a ${hasta}: te perderías ${minutos(-sobraConConv)} de conversatorio o de película.`;
    } else if (sobraConConv < 5) {
      tipo = "justo";
      texto += ` ${conv} te ${sobraConConv === 1 ? "queda" : "quedan"} ${minutos(sobraConConv)} para llegar.`;
    } else {
      texto += ` ${conv} igual alcanzas.`;
    }
  }

  return (
    <div className={`${styles.conectorTraslado} ${styles[tipo]}`} role="note">
      {texto}
    </div>
  );
}
