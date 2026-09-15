"use client";

import { useEffect, useRef, useState } from "react";
import { useItinerario } from "@/lib/almacen";
import { rutaCompartir } from "@/lib/itinerario";
import { IconoCompartir, IconoCruz } from "./ItinerarioIconos";
import styles from "./ItinerarioAcciones.module.css";

export interface ItinerarioAccionesProps {
  ids: string[];
}

const TITULO_COMPARTIR = "Mi itinerario · Festival de Cine Niebla";

function esMovil(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

/** Barra de acciones del itinerario propio: compartir (link) y vaciar (dos pasos). */
export default function ItinerarioAcciones({ ids }: ItinerarioAccionesProps) {
  const { vaciar } = useItinerario();
  const [estado, setEstado] = useState("");
  const [linkVisible, setLinkVisible] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const temporizador = useRef<number | null>(null);
  const botonVaciar = useRef<HTMLButtonElement>(null);
  const botonConfirmar = useRef<HTMLButtonElement>(null);
  const campoLink = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (temporizador.current) window.clearTimeout(temporizador.current);
    };
  }, []);

  // Al abrir la confirmación el foco va a "Sí, vaciar"; al cancelar vuelve a "Vaciar" (que recién se vuelve a montar).
  const devolverFoco = useRef(false);
  useEffect(() => {
    if (confirmando) {
      botonConfirmar.current?.focus();
    } else if (devolverFoco.current) {
      devolverFoco.current = false;
      botonVaciar.current?.focus();
    }
  }, [confirmando]);

  useEffect(() => {
    if (linkVisible) {
      campoLink.current?.focus();
      campoLink.current?.select();
    }
  }, [linkVisible]);

  function avisar(texto: string) {
    setEstado(texto);
    if (temporizador.current) window.clearTimeout(temporizador.current);
    temporizador.current = window.setTimeout(() => setEstado(""), 2000);
  }

  async function compartir() {
    const url = window.location.origin + rutaCompartir(ids);
    setLinkVisible(null);

    if (typeof navigator.share === "function" && esMovil()) {
      try {
        await navigator.share({ title: TITULO_COMPARTIR, url });
        return;
      } catch (e) {
        // La persona cerró la hoja de compartir: no hacemos nada más.
        if (e instanceof DOMException && e.name === "AbortError") return;
        // Cualquier otro error: seguimos con el portapapeles.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      avisar("Link copiado");
    } catch {
      setLinkVisible(url);
    }
  }

  function cancelar() {
    devolverFoco.current = true;
    setConfirmando(false);
  }

  function confirmarVaciado() {
    vaciar();
    setConfirmando(false);
    setLinkVisible(null);
    avisar("Itinerario vaciado");
  }

  return (
    <div className={styles.barra}>
      <div className={styles.fila}>
        <button type="button" className={`boton boton--primario ${styles.boton}`} onClick={compartir}>
          <IconoCompartir />
          Compartir
        </button>

        {confirmando ? (
          <div
            className={styles.confirmacion}
            role="group"
            aria-label="Confirmar vaciado"
            onKeyDown={(e) => {
              if (e.key === "Escape") cancelar();
            }}
          >
            <span className={styles.pregunta}>¿Vaciar el itinerario?</span>
            <button
              ref={botonConfirmar}
              type="button"
              className={`boton ${styles.boton} ${styles.botonPeligro}`}
              onClick={confirmarVaciado}
            >
              Sí, vaciar
            </button>
            <button type="button" className={`boton boton--fantasma ${styles.boton}`} onClick={cancelar}>
              Cancelar
            </button>
          </div>
        ) : (
          <button
            ref={botonVaciar}
            type="button"
            className={`boton boton--fantasma ${styles.boton}`}
            onClick={() => setConfirmando(true)}
          >
            <IconoCruz />
            Vaciar
          </button>
        )}

        <p className={styles.estado} role="status" aria-live="polite">
          {estado}
        </p>
      </div>

      {linkVisible && (
        <div className={styles.linkManual}>
          <label htmlFor="link-itinerario" className={styles.linkEtiqueta}>
            No pudimos copiar el link. Cópialo de aquí:
          </label>
          <input
            ref={campoLink}
            id="link-itinerario"
            className={styles.linkCampo}
            type="text"
            readOnly
            value={linkVisible}
            onFocus={(e) => e.currentTarget.select()}
          />
        </div>
      )}
    </div>
  );
}
