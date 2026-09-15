import Link from "next/link";
import { Afiche } from "./Afiche";
import type { Pelicula } from "@/lib/datos";
import { formatoDuracion } from "@/lib/tiempo";
import styles from "./TarjetaPelicula.module.css";

export function TarjetaPelicula({ pelicula, className }: { pelicula: Pelicula; className?: string }) {
  return (
    <Link href={`/pelicula/${pelicula.id}`} className={[styles.tarjeta, className].filter(Boolean).join(" ")}>
      <Afiche pelicula={pelicula} conTitulo />
      <span className={styles.pie}>
        <span>{pelicula.pais}</span>
        <span className="mono">{formatoDuracion(pelicula.duracionMin)}</span>
      </span>
    </Link>
  );
}
