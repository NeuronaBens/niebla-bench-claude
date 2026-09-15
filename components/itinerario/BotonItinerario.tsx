"use client";

/**
 * Botón para marcar/desmarcar una función en "Mi itinerario".
 * - compacto: una perforación de boleto (44 px táctil) para las listas del programa.
 * - completo: boleto con texto para la ficha de la película.
 * Las funciones agotadas SÍ se pueden agregar (el itinerario las marca como agotadas):
 * el botón y el aviso lo dejan claro.
 */
import { useEffect, useId, useState } from "react";
import { avisosAlAgregar } from "@/lib/itinerario";
import { funcionPorId } from "@/lib/programa";
import { useItinerario } from "@/lib/useItinerario";
import AvisoFlotante, { asegurarRegionAvisos, mostrarFlotante, registrarAnfitrion } from "./AvisoFlotante";
import { IconoCheck, IconoMas } from "./iconos";
import s from "./BotonItinerario.module.css";

export interface BotonItinerarioProps {
  funcionId: string;
  /** compacto: botón pequeño para listas del programa. completo: con texto, para la ficha. */
  variante?: "compacto" | "completo";
  className?: string;
}

export default function BotonItinerario({ funcionId, variante = "compacto", className }: BotonItinerarioProps) {
  const { ids, listo, tiene, alternar } = useItinerario();
  const origen = useId();
  const [golpe, setGolpe] = useState(0);
  const funcion = funcionPorId.get(funcionId);
  const marcada = listo && tiene(funcionId);

  useEffect(() => {
    asegurarRegionAvisos();
    return registrarAnfitrion(origen);
  }, [origen]);

  if (!funcion) return null;

  const detalle =
    `${funcion.pelicula.titulo}, ${funcion.dia.nombre} ${funcion.dia.numero} a las ${funcion.horaInicio}, ${funcion.sala.nombre}` +
    (funcion.agotada ? " (agotada)" : "");
  // compacto: nombre constante (el estado lo da aria-pressed). completo: incluye el texto visible.
  const etiqueta =
    variante === "compacto"
      ? `Agregar a mi itinerario: ${detalle}`
      : `${marcada ? "En mi itinerario" : "Agregar a mi itinerario"}: ${detalle}`;

  const alPulsar = () => {
    if (!listo) return;
    const avisos = avisosAlAgregar(ids, funcionId);
    const quedo = alternar(funcionId);
    if (quedo) setGolpe((g) => g + 1);
    mostrarFlotante({
      origen,
      accion: quedo ? "agregada" : "quitada",
      funcionId,
      avisos: quedo ? avisos : [],
    });
  };

  const clases = [s.boton, variante === "completo" ? s.completo : s.compacto, className].filter(Boolean).join(" ");

  return (
    <>
      <button
        type="button"
        className={clases}
        aria-pressed={marcada}
        aria-label={etiqueta}
        title={variante === "compacto" ? (marcada ? "En mi itinerario (tocar para quitar)" : "Agregar a mi itinerario") : undefined}
        data-marcada={marcada ? "si" : "no"}
        data-listo={listo ? "si" : "no"}
        data-agotada={funcion.agotada ? "si" : undefined}
        onClick={alPulsar}
      >
        <span className={s.perforacion} aria-hidden="true">
          <span key={golpe} className={s.sello} data-golpe={golpe > 0 ? "si" : undefined}>
            {marcada ? <IconoCheck tamano={variante === "completo" ? 18 : 20} strokeWidth={2.6} /> : <IconoMas tamano={18} />}
          </span>
        </span>
        {variante === "completo" && (
          <span className={s.textos}>
            {/* Ambas variantes ocupan la misma celda: el botón no cambia de ancho al marcar. */}
            <span className={s.principal}>
              <span data-visible={!marcada ? "si" : "no"}>Agregar a mi itinerario</span>
              <span data-visible={marcada ? "si" : "no"}>En mi itinerario</span>
            </span>
            <span className={s.secundario}>
              {funcion.agotada ? (
                <span data-visible="si">Agotada: sin entradas en boletería</span>
              ) : (
                <>
                  <span data-visible={!marcada ? "si" : "no"}>
                    {funcion.dia.corto} {funcion.horaInicio} · {funcion.sala.nombre}
                  </span>
                  <span data-visible={marcada ? "si" : "no"}>Tocar para quitar</span>
                </>
              )}
            </span>
          </span>
        )}
      </button>
      <AvisoFlotante origen={origen} />
    </>
  );
}
