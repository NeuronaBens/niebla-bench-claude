"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useItinerario } from "@/lib/almacen";
import { analizarItinerario, decodificarItinerario } from "@/lib/itinerario";
import ItinerarioCabeza from "./ItinerarioCabeza";
import ItinerarioLista from "./ItinerarioLista";
import styles from "./ItinerarioVista.module.css";

export interface ItinerarioCompartidoProps {
  /** Valor crudo del parámetro `f` de la URL. */
  codigo: string;
}

const plural = (n: number, s: string, p: string) => `${n} ${n === 1 ? s : p}`;

/** Vista de un itinerario compartido por link: solo lectura, se puede copiar al propio. */
export default function ItinerarioCompartido({ codigo }: ItinerarioCompartidoProps) {
  const ids = useMemo(() => decodificarItinerario(codigo), [codigo]);
  const analisis = useMemo(() => analizarItinerario(ids), [ids]);
  const { ids: mios, listo, agregar } = useItinerario();
  const [agregadas, setAgregadas] = useState<number | null>(null);

  if (ids.length === 0) {
    return (
      <div className={styles.cuerpo}>
        <header className={styles.cabeza}>
          <p className={`etiqueta ${styles.sobretitulo}`}>Itinerario compartido</p>
          <h1 className={styles.titulo}>Este link no tiene funciones válidas</h1>
          <p className={styles.resumen}>Puede que esté incompleto o que sea de otra edición del festival.</p>
        </header>
        <div className={styles.filaEnlaces}>
          <Link href="/itinerario" className="boton boton--primario">
            Ver mi itinerario
          </Link>
          <Link href="/programa" className="boton boton--fantasma">
            Ver el programa
          </Link>
        </div>
      </div>
    );
  }

  const yaEstaban = listo ? ids.filter((id) => mios.includes(id)).length : 0;
  const nuevas = ids.length - yaEstaban;

  function copiar() {
    agregar(ids);
    setAgregadas(nuevas);
  }

  return (
    <div className={styles.cuerpo}>
      <ItinerarioCabeza titulo="Itinerario compartido" analisis={analisis}>
        <p className={styles.ayuda}>Alguien te compartió este recorrido. Puedes copiarlo al tuyo y ajustarlo después.</p>
      </ItinerarioCabeza>

      <div className={styles.accionesCompartido}>
        {agregadas !== null ? (
          <p className={styles.listo} role="status">
            {agregadas === 0
              ? "Ya tenías todas estas funciones en tu itinerario."
              : `Listo: ${plural(agregadas, "función agregada", "funciones agregadas")}.`}
          </p>
        ) : (
          <div className={styles.filaEnlaces}>
            <button
              type="button"
              className="boton boton--primario"
              onClick={copiar}
              disabled={!listo || nuevas === 0}
              aria-busy={listo ? undefined : true}
            >
              Copiar a mi itinerario
            </button>
            {listo && yaEstaban > 0 && (
              <p className={styles.yaEstaban} role="status">
                {yaEstaban === ids.length
                  ? "Ya tienes todas estas funciones en el tuyo."
                  : `${yaEstaban} de ${ids.length} ya ${yaEstaban === 1 ? "estaba" : "estaban"} en el tuyo.`}
              </p>
            )}
          </div>
        )}
        <Link href="/itinerario" className={`boton boton--fantasma ${styles.enlaceMio}`}>
          Ver mi itinerario
        </Link>
      </div>

      <div className={styles.lista}>
        <ItinerarioLista analisis={analisis} soloLectura />
      </div>
    </div>
  );
}
