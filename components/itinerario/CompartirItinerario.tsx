"use client";

/**
 * Compartir el itinerario con un link. El nombre es opcional y se recuerda en este
 * navegador. Usa navigator.share si existe; si no, copia al portapapeles. El link
 * siempre queda visible y seleccionable como respaldo.
 */
import { useId, useRef, useState } from "react";
import { linkCompartido } from "@/lib/itinerario";
import { festival } from "@/lib/programa";
import { IconoCerrar, IconoCompartir, IconoCopiar } from "./iconos";
import s from "./Itinerario.module.css";

const CLAVE_NOMBRE = "niebla:nombre:v1";

function leerNombre(): string {
  try {
    return window.localStorage.getItem(CLAVE_NOMBRE) ?? "";
  } catch {
    return "";
  }
}

function guardarNombre(n: string) {
  try {
    if (n.trim()) window.localStorage.setItem(CLAVE_NOMBRE, n);
    else window.localStorage.removeItem(CLAVE_NOMBRE);
  } catch {
    // sin almacenamiento: no pasa nada
  }
}

export default function CompartirItinerario({ ids }: { ids: readonly string[] }) {
  const [abierto, setAbierto] = useState(false);
  const idPanel = useId();

  return (
    <div className={s.compartir}>
      <button
        type="button"
        className={s.botonPrincipal}
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => setAbierto((a) => !a)}
      >
        {abierto ? <IconoCerrar tamano={18} /> : <IconoCompartir tamano={18} />}
        {abierto ? "Cerrar" : "Compartir itinerario"}
      </button>
      <div id={idPanel}>{abierto && <PanelCompartir ids={ids} />}</div>
    </div>
  );
}

function PanelCompartir({ ids }: { ids: readonly string[] }) {
  // Este panel solo se monta en el cliente tras un clic: se puede leer window aquí.
  const [nombre, setNombre] = useState(leerNombre);
  const [estado, setEstado] = useState<"" | "copiado" | "compartido" | "error">("");
  const campoLink = useRef<HTMLInputElement>(null);
  const [puedeCompartir] = useState(() => typeof navigator !== "undefined" && typeof navigator.share === "function");
  const idNombre = useId();
  const link = linkCompartido(ids, nombre);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setEstado("copiado");
    } catch {
      const campo = campoLink.current;
      if (campo) {
        campo.focus();
        campo.select();
        // Respaldo para navegadores sin API de portapapeles.
        const ok = document.execCommand?.("copy");
        setEstado(ok ? "copiado" : "error");
      } else setEstado("error");
    }
  };

  const compartir = async () => {
    const n = nombre.trim();
    try {
      await navigator.share({
        title: n ? `Itinerario de ${n} · ${festival.nombre}` : `Mi itinerario · ${festival.nombre}`,
        text: n
          ? `El recorrido de ${n} por el ${festival.nombre}. Ábrelo y cópialo al tuyo:`
          : `Mi recorrido por el ${festival.nombre}. Ábrelo y cópialo al tuyo:`,
        url: link,
      });
      setEstado("compartido");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      await copiar();
    }
  };

  const mensaje =
    estado === "copiado"
      ? "Link copiado. Pégalo donde quieras."
      : estado === "compartido"
        ? "Listo, link compartido."
        : estado === "error"
          ? "No se pudo copiar solo: mantén presionado el link y cópialo."
          : "";

  return (
    <div className={s.panel}>
      <label htmlFor={idNombre} className={s.nombreFrase}>
        <span>Itinerario de</span>
        <input
          id={idNombre}
          className={s.nombreCampo}
          type="text"
          value={nombre}
          maxLength={40}
          placeholder="tu nombre (opcional)"
          autoComplete="given-name"
          enterKeyHint="done"
          onChange={(e) => {
            setNombre(e.target.value);
            guardarNombre(e.target.value);
            setEstado("");
          }}
        />
      </label>

      <div className={s.linkCaja}>
        <input
          ref={campoLink}
          className={s.linkCampo}
          type="text"
          readOnly
          value={link}
          aria-label="Link para compartir tu itinerario"
          onFocus={(e) => e.currentTarget.select()}
        />
      </div>

      <div className={s.panelAcciones}>
        {puedeCompartir && (
          <button type="button" className={s.botonSodio} onClick={compartir}>
            <IconoCompartir tamano={18} />
            Compartir
          </button>
        )}
        <button type="button" className={puedeCompartir ? s.botonSecundario : s.botonSodio} onClick={copiar}>
          <IconoCopiar tamano={18} />
          Copiar link
        </button>
      </div>
      <p className={s.panelEstado} aria-live="polite" data-estado={estado || undefined}>
        {mensaje}
      </p>
      <p className={s.panelNota}>Quien abra el link verá tus funciones y podrá copiarlas a su propio itinerario.</p>
    </div>
  );
}
