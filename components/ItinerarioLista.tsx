"use client";

import type { Analisis } from "@/lib/itinerario";
import TarjetaFuncion from "./TarjetaFuncion";
import ItinerarioTarjetaCompartida from "./ItinerarioTarjetaCompartida";
import ItinerarioConector, { ItinerarioAvisosTarjeta } from "./ItinerarioConector";
import styles from "./ItinerarioLista.module.css";

export interface ItinerarioListaProps {
  analisis: Analisis;
  /** Itinerario compartido: tarjetas sin botón de alternar. */
  soloLectura?: boolean;
}

/**
 * Lista agrupada por día. Regla para no repetir avisos: cada aviso se muestra
 * una sola vez, junto a la función que empieza antes (`a`). Si `a` y `b` son
 * consecutivas, va en el conector entre ambas; si no, dentro de la tarjeta de `a`.
 */
export default function ItinerarioLista({ analisis, soloLectura = false }: ItinerarioListaProps) {
  return (
    <div className={styles.dias}>
      {analisis.porDia.map(({ dia, funciones }) => (
        <section key={dia.id} className={styles.dia} aria-labelledby={`it-dia-${dia.id}`}>
          <h2 id={`it-dia-${dia.id}`} className={styles.encabezadoDia}>
            <span>{dia.nombre}</span>
            <span className={styles.diaNumero}>{dia.numero}</span>
            <span className={`etiqueta ${styles.diaCuenta}`}>
              {funciones.length} {funciones.length === 1 ? "función" : "funciones"}
            </span>
          </h2>

          <ol className={styles.lista}>
            {funciones.map((f, i) => {
              const siguiente = funciones[i + 1];
              const avisoConector = siguiente
                ? analisis.avisos.find((av) => av.a.id === f.id && av.b.id === siguiente.id)
                : undefined;
              const hueco = siguiente
                ? analisis.huecos.find((h) => h.desde.id === f.id && h.hasta.id === siguiente.id)
                : undefined;
              const avisosTarjeta = analisis.avisos.filter((av) => av.a.id === f.id && av.b.id !== siguiente?.id);
              const avisos = avisosTarjeta.length > 0 ? <ItinerarioAvisosTarjeta avisos={avisosTarjeta} /> : undefined;

              return (
                <li key={f.id} className={styles.item}>
                  {soloLectura ? (
                    <ItinerarioTarjetaCompartida funcion={f} avisos={avisos} />
                  ) : (
                    <TarjetaFuncion funcion={f} avisos={avisos} />
                  )}
                  {siguiente && <ItinerarioConector aviso={avisoConector} hueco={hueco} />}
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
