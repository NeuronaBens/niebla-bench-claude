import { nombreSalaCorto, type Aviso } from "./itinerario";
import { hora } from "./tiempo";

/** "falta 1 min", "faltan 12 min" */
export function faltan(min: number): string {
  return `${min === 1 ? "falta" : "faltan"} ${min} min`;
}

/** "sobra 1 min", "sobran 12 min" */
export function sobran(min: number): string {
  return `${min === 1 ? "sobra" : "sobran"} ${min} min`;
}

export function describirAviso(x: Aviso): { titulo: string; detalle: string } {
  const A = x.a.pelicula.titulo;
  const B = x.b.pelicula.titulo;
  switch (x.tipo) {
    case "tope":
      return {
        titulo: "Se topan",
        detalle: `${A} termina a las ${hora(x.a.fin)} y ${B} empieza a las ${hora(x.b.ini)}: se pisan ${x.minutos} min.`,
      };
    case "traslado":
      return {
        titulo: "No alcanzas a llegar caminando",
        detalle: `Entre ${nombreSalaCorto(x.a.salaId)} y ${nombreSalaCorto(x.b.salaId)} hay ${x.caminata} min a pie, pero ${A} termina a las ${hora(x.a.fin)} y ${B} empieza a las ${hora(x.b.ini)}. Te ${faltan(x.faltan)}.`,
      };
    case "conversatorio":
      return x.alcanza === 0
        ? {
            titulo: "Te perderías el conversatorio",
            detalle: `Después de ${A} hay ${x.duracion} min de conversatorio, pero para llegar a ${B} tienes que salir apenas termine la película.`,
          }
        : {
            titulo: "Alcanzas sólo parte del conversatorio",
            detalle: `Después de ${A} hay ${x.duracion} min de conversatorio. Alcanzas ${x.alcanza} min antes de partir a ${B}.`,
          };
    case "lluvia": {
      const alAire = x.a.sala.aireLibre ? x.a : x.b;
      return {
        titulo: "Si llueve, no alcanzas",
        detalle: `Si llueve, ${alAire.pelicula.titulo} pasa al Galpón 7 a la misma hora. Desde ahí son ${x.caminata} min a pie y te faltaría${x.faltan === 1 ? "" : "n"} ${x.faltan} min.`,
      };
    }
  }
}

/** Frase corta desde el punto de vista de la función `id` (para el programa). */
export function avisoCorto(x: Aviso, id: string): string {
  const otra = x.a.id === id ? x.b : x.a;
  const T = otra.pelicula.titulo;
  switch (x.tipo) {
    case "tope":
      return `Se topa con ${T} (${hora(otra.ini)})`;
    case "traslado":
      return x.a.id === id
        ? `No alcanzas a llegar a ${T}: ${faltan(x.faltan)} de caminata`
        : `No alcanzas a llegar desde ${T}: ${faltan(x.faltan)} de caminata`;
    case "conversatorio": {
      const cuanto = x.alcanza === 0 ? "el conversatorio" : "parte del conversatorio";
      return x.a.id === id ? `Te perderías ${cuanto} por ir a ${T}` : `Te perderías ${cuanto} de ${T}`;
    }
    case "lluvia":
      return `Si llueve, no alcanzas a llegar ${x.a.id === id ? "a" : "desde"} ${T}`;
  }
}
