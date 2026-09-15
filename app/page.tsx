import Cifras from "@/components/portada/Cifras";
import Especiales from "@/components/portada/Especiales";
import Hero from "@/components/portada/Hero";
import LlamadoItinerario from "@/components/portada/LlamadoItinerario";
import Marquesina from "@/components/portada/Marquesina";
import Salas from "@/components/portada/Salas";
import Secciones from "@/components/portada/Secciones";
import TresDias from "@/components/portada/TresDias";

export default function Portada() {
  return (
    <>
      <Hero />
      <Marquesina />
      <Cifras />
      <Secciones />
      <TresDias />
      <Especiales />
      <Salas />
      <LlamadoItinerario />
    </>
  );
}
