"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useItinerario } from "@/lib/almacen";
import { analizarItinerario, PARAM_COMPARTIR } from "@/lib/itinerario";
import ItinerarioAcciones from "./ItinerarioAcciones";
import ItinerarioCabeza from "./ItinerarioCabeza";
import ItinerarioCompartido from "./ItinerarioCompartido";
import ItinerarioEsqueleto from "./ItinerarioEsqueleto";
import ItinerarioLista from "./ItinerarioLista";
import ItinerarioVacio from "./ItinerarioVacio";
import styles from "./ItinerarioVista.module.css";

function ItinerarioPropio() {
  const { ids, listo } = useItinerario();
  const analisis = useMemo(() => analizarItinerario(ids), [ids]);

  if (!listo) return <ItinerarioEsqueleto />;
  if (analisis.funciones.length === 0) return <ItinerarioVacio />;

  return (
    <div className={styles.cuerpo}>
      <ItinerarioCabeza titulo="Mi itinerario" analisis={analisis}>
        <p className={styles.ayuda}>Para sacar una función, toca «Elegida» en su tarjeta.</p>
      </ItinerarioCabeza>
      <ItinerarioAcciones ids={analisis.funciones.map((f) => f.id)} />
      <div className={styles.lista}>
        <ItinerarioLista analisis={analisis} />
      </div>
    </div>
  );
}

/** Decide entre el itinerario propio y uno compartido (`/itinerario?f=f01.f05`). Requiere `<Suspense>`. */
export default function ItinerarioVista() {
  const params = useSearchParams();
  const codigo = params.get(PARAM_COMPARTIR);

  if (codigo !== null) return <ItinerarioCompartido codigo={codigo} />;
  return <ItinerarioPropio />;
}
