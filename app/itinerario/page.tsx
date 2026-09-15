import type { Metadata } from "next";
import ItinerarioConUrl from "@/components/itinerario/Itinerario";

export const metadata: Metadata = {
  title: "Mi itinerario",
  description: "Arma tu recorrido por el Festival de Cine Niebla y compártelo con un link.",
};

export default function PaginaItinerario() {
  return (
    <ItinerarioConUrl />
  );
}
