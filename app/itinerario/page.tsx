import type { Metadata } from "next";
import { Suspense } from "react";
import { Itinerario } from "@/components/Itinerario";

export const metadata: Metadata = {
  title: "Mi itinerario",
  description:
    "Arma tu propio recorrido por el festival. Te avisamos si dos funciones se topan, si no alcanzas a llegar caminando o si te perderías un conversatorio.",
};

export default function PaginaItinerario() {
  return (
    <div className="pagina">
      <Suspense fallback={<div className="contenedor" style={{ minHeight: "60vh" }} />}>
        <Itinerario />
      </Suspense>
    </div>
  );
}
