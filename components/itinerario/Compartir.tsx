"use client";

import { useId, useState } from "react";
import { codificar, limpiarNombre } from "@/lib/itinerario";
import s from "./Itinerario.module.css";

export default function Compartir({ ids }: { ids: readonly string[] }) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [estado, setEstado] = useState<"" | "copiado" | "error">("");
  const idPanel = useId();
  const idNombre = useId();

  const q = new URLSearchParams({ f: codificar(ids) });
  const n = limpiarNombre(nombre);
  if (n) q.set("de", n);
  const link = typeof window === "undefined" ? "" : `${window.location.origin}/itinerario?${q.toString()}`;

  const puedeCompartir = typeof navigator !== "undefined" && typeof navigator.share === "function";

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setEstado("copiado");
    } catch {
      setEstado("error");
    }
  };

  const compartir = async () => {
    try {
      await navigator.share({
        title: "Mi itinerario del Festival Niebla",
        text: n ? `El recorrido de ${n} por el Festival Niebla` : "Mi recorrido por el Festival Niebla",
        url: link,
      });
    } catch {
      // La persona cerró el menú de compartir: no hay nada que hacer.
    }
  };

  return (
    <div className={s.compartir}>
      <button
        type="button"
        className={s.botonPrincipal}
        aria-expanded={abierto}
        aria-controls={idPanel}
        onClick={() => {
          setAbierto(!abierto);
          setEstado("");
        }}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" className={s.iconoBoton}>
          <path d="M8 12 12 8M7 9.5 5.2 11.3a2.5 2.5 0 0 0 3.5 3.5L10.5 13M9.5 7l1.8-1.8a2.5 2.5 0 0 1 3.5 3.5L13 10.5" />
        </svg>
        Compartir
      </button>

      {abierto && (
        <div id={idPanel} className={s.panelCompartir}>
          <label htmlFor={idNombre}>Tu nombre (opcional)</label>
          <input
            id={idNombre}
            type="text"
            value={nombre}
            maxLength={32}
            autoComplete="given-name"
            placeholder="Así sabrán de quién es"
            onChange={(e) => {
              setNombre(e.target.value);
              setEstado("");
            }}
          />
          <p className={s.link}>
            <span className="solo-lector">Link: </span>
            {link}
          </p>
          <div className={s.botonesCompartir}>
            {puedeCompartir && (
              <button type="button" className={s.botonPrincipal} onClick={compartir}>
                Enviar
              </button>
            )}
            <button type="button" className={s.botonSecundario} onClick={copiar}>
              Copiar link
            </button>
          </div>
          <p className={s.estadoCompartir} role="status">
            {estado === "copiado" && "Link copiado. Quien lo abra verá tu recorrido y podrá copiarlo al suyo."}
            {estado === "error" && "No pudimos copiar solos: mantén presionado el link de arriba para copiarlo."}
          </p>
        </div>
      )}
    </div>
  );
}
