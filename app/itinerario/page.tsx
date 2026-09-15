import type { Metadata } from "next";
import { Suspense } from "react";
import ItinerarioEsqueleto from "@/components/ItinerarioEsqueleto";
import ItinerarioVista from "@/components/ItinerarioVista";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Mi itinerario",
  description:
    "Tu recorrido por el Festival de Cine Niebla: las funciones que elegiste, con avisos si se topan o si no alcanzas a llegar caminando. Se guarda en tu navegador y se comparte con un link.",
};

// Página estática: el itinerario vive en el navegador y el link compartido se lee en el cliente (?f=...).
export default function PaginaItinerario() {
  return (
    <div className={`contenedor ${styles.pagina}`}>
      <Suspense fallback={<ItinerarioEsqueleto />}>
        <ItinerarioVista />
      </Suspense>
    </div>
  );
}
