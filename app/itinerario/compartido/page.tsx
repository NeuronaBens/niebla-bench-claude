import { Suspense } from "react";
import type { Metadata } from "next";
import ItinerarioCompartido from "@/components/itinerario/ItinerarioCompartido";
import s from "@/components/itinerario/Itinerario.module.css";

// Metadata estática: leer searchParams en el servidor volvería dinámica la ruta y el sitio
// debe funcionar sin backend. El título con el nombre se pone en el cliente.
export const metadata: Metadata = {
  title: "Itinerario compartido",
  description: "Un recorrido por el Festival de Cine Niebla en Puerto Bruma. Ábrelo, revísalo y cópialo a tu propio itinerario.",
  robots: { index: false },
};

function Cargando() {
  return (
    <div className={s.esqueleto} aria-busy="true" aria-label="Cargando itinerario compartido">
      <div className={s.esqueletoTitulo} />
      <div className={s.esqueletoResumen} />
      <div className={s.esqueletoBoleto} />
      <div className={s.esqueletoTramo} />
      <div className={s.esqueletoBoleto} />
    </div>
  );
}

export default function CompartidoPage() {
  return (
    <div className={s.pagina}>
      <Suspense fallback={<Cargando />}>
        <ItinerarioCompartido />
      </Suspense>
    </div>
  );
}
