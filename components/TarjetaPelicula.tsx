import Link from "next/link";
import type { Pelicula } from "@/lib/programa";
import { duracion } from "@/lib/tiempo";
import Afiche from "./Afiche";
import s from "./TarjetaPelicula.module.css";

export default function TarjetaPelicula({ p }: { p: Pelicula }) {
  return (
    <Link href={`/pelicula/${p.id}`} className={s.tarjeta} data-seccion={p.seccion}>
      <div className={s.afiche}>
        <Afiche semilla={p.id} seccion={p.seccion} />
      </div>
      <div className={s.texto}>
        <h3 className={s.titulo}>{p.titulo}</h3>
        <p className={s.meta}>
          {p.direccion} · {p.pais} · {duracion(p.duracionMin)}
        </p>
      </div>
    </Link>
  );
}
