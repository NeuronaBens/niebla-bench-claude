import { Suspense } from "react";
import type { Metadata } from "next";
import Programa from "@/components/Programa";

export const metadata: Metadata = {
  title: "Programa · Festival de Cine Niebla",
  description: "Programa completo del Festival de Cine Niebla 2026.",
};

export default function ProgramaPage() {
  return (
    <Suspense fallback={<div style={{ padding: "var(--espacio-2xl)", textAlign: "center" }}>Cargando programa...</div>}>
      <Programa />
    </Suspense>
  );
}
