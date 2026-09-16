import { Suspense } from "react";
import type { Metadata } from "next";
import Itinerario from "@/components/Itinerario";

export const metadata: Metadata = {
  title: "Mi itinerario · Festival de Cine Niebla",
  description: "Arma tu itinerario personal para el Festival de Cine Niebla.",
};

export default function ItinerarioPage() {
  return (
    <Suspense fallback={<div style={{ padding: "var(--espacio-2xl)", textAlign: "center" }}>Cargando itinerario…</div>}>
      <Itinerario />
    </Suspense>
  );
}
