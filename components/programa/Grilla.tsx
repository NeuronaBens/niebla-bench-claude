"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { nombreSalaCorto } from "@/lib/itinerario";
import { funciones, salas, type SeccionId } from "@/lib/programa";
import { hora } from "@/lib/tiempo";
import { useItinerario } from "@/lib/useItinerario";
import BotonMarcar from "../BotonMarcar";
import s from "./Grilla.module.css";

const PX_MIN = 2.4;

export default function Grilla({
  dia,
  secciones,
  ahora,
}: {
  dia: string;
  secciones: SeccionId[];
  ahora: number | null;
}) {
  const { ids } = useItinerario();
  const delDia = funciones.filter((f) => f.dia === dia);
  const t0 = Math.floor(Math.min(...delDia.map((f) => f.ini)) / 60) * 60;
  const t1 = Math.ceil(Math.max(...delDia.map((f) => f.fin + (f.conversatorioMin ?? 0))) / 60) * 60;
  const ancho = (t1 - t0) * PX_MIN;
  const horas: number[] = [];
  for (let t = t0; t <= t1; t += 60) horas.push(t);
  const x = (t: number) => (t - t0) * PX_MIN;
  const pasa = (id: SeccionId) => secciones.length === 0 || secciones.includes(id);

  return (
    <div className={s.marco}>
      <p className={s.ayuda}>Desliza hacia el lado para recorrer el día.</p>
      <div className={s.scroll} tabIndex={0} role="region" aria-label="Grilla de funciones por sala">
        <div className={s.lienzo} style={{ "--ancho": `${ancho}px` } as CSSProperties}>
          <div className={s.regla} aria-hidden="true">
            <span className={s.esquina} />
            <div className={s.pista}>
              {horas.map((t) => (
                <span key={t} className={`${s.tick} num`} style={{ left: x(t) }}>
                  {hora(t)}
                </span>
              ))}
            </div>
          </div>

          {salas.map((sala) => {
            const enSala = delDia.filter((f) => f.salaId === sala.id);
            return (
              <div key={sala.id} className={s.carril}>
                <div className={s.nombreSala}>
                  <strong>{nombreSalaCorto(sala.id)}</strong>
                  {sala.aireLibre && <span>aire libre</span>}
                </div>
                <div className={s.pista}>
                  {horas.map((t) => (
                    <span key={t} className={s.linea} style={{ left: x(t) }} aria-hidden="true" />
                  ))}
                  {enSala.map((f) => (
                    <div
                      key={f.id}
                      className={s.bloque}
                      data-seccion={f.seccion.id}
                      data-marcada={ids.includes(f.id) || undefined}
                      data-atenuada={!pasa(f.seccion.id) || undefined}
                      data-termino={(ahora !== null && ahora >= f.fin) || undefined}
                      style={{
                        left: x(f.ini),
                        width: f.pelicula.duracionMin * PX_MIN,
                      }}
                    >
                      {!!f.conversatorioMin && (
                        <span
                          className={s.conversatorio}
                          style={{ width: f.conversatorioMin * PX_MIN }}
                          title={`${f.conversatorioMin} min de conversatorio`}
                          aria-hidden="true"
                        />
                      )}
                      <Link href={`/pelicula/${f.pelicula.id}`} className={s.enlace}>
                        <span className={`${s.horaBloque} num`}>
                          {hora(f.ini)}
                          {f.agotada && <em> · agotada</em>}
                        </span>
                        <span className={s.tituloBloque}>{f.pelicula.titulo}</span>
                      </Link>
                      <div className={s.boton}>
                        <BotonMarcar f={f} compacto />
                      </div>
                    </div>
                  ))}
                  {ahora !== null && ahora >= t0 && ahora <= t1 && (
                    <span className={s.ahora} style={{ left: x(ahora) }} aria-hidden="true" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
