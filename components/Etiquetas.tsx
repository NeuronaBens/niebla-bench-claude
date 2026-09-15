import { ETIQUETA_ESTRENO, sala, seccion, type Funcion, type Pelicula } from "@/lib/datos";

export function ChipSeccion({ id, className }: { id: string; className?: string }) {
  return (
    <span className={`chip chip--seccion-${id} ${className ?? ""}`}>{seccion(id).nombre}</span>
  );
}

export function ChipsFuncion({ funcion }: { funcion: Funcion }) {
  const s = sala(funcion.salaId);
  return (
    <>
      {funcion.agotada && <span className="chip chip--agotada">Agotada</span>}
      {s.aireLibre && <span className="chip chip--aire">Aire libre</span>}
      {funcion.conversatorioMin && (
        <span className="chip chip--faro">Conversatorio {funcion.conversatorioMin} min</span>
      )}
    </>
  );
}

export function ChipEstreno({ pelicula }: { pelicula: Pelicula }) {
  return <span className="chip chip--contorno">{ETIQUETA_ESTRENO[pelicula.estreno]}</span>;
}
