import type { Metadata } from "next";
import MiItinerario from "@/components/itinerario/MiItinerario";
import s from "@/components/itinerario/Itinerario.module.css";

export const metadata: Metadata = {
  title: "Mi itinerario",
  description:
    "Arma tu recorrido por el Festival de Cine Niebla: marca funciones, revisa si se topan o si alcanzas a llegar caminando entre salas, y compártelo con un link.",
};

export default function ItinerarioPage() {
  return (
    <div className={s.pagina}>
      <header className={s.cabecera}>
        <p className={s.kicker}>Tu recorrido · se guarda en este navegador</p>
        <h1 className={s.tituloPagina}>Mi itinerario</h1>
      </header>
      <MiItinerario />
    </div>
  );
}
