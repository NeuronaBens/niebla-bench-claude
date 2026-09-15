"use client";

/**
 * Tablero de salidas del hero. Antes del festival: cuenta regresiva a la función
 * inaugural. Durante: lo que viene. Después: despedida. La hora se lee solo en el
 * cliente, después de hidratar (en el servidor se muestran guiones).
 */
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { ahoraEnMinutosFestival, festival, funciones, type Funcion } from "@/lib/programa";
import { funcionInaugural, primeraFuncion, ultimaFuncion } from "./derivados";
import s from "./Tablero.module.css";

/* Reloj compartido: un solo intervalo mientras haya alguien mirando. */
let ahora = 0;
let intervalo: ReturnType<typeof setInterval> | undefined;
const oyentes = new Set<() => void>();

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  if (!intervalo) {
    ahora = Date.now();
    intervalo = setInterval(() => {
      ahora = Date.now();
      oyentes.forEach((o) => o());
    }, 1000);
  }
  return () => {
    oyentes.delete(oyente);
    if (oyentes.size === 0 && intervalo) {
      clearInterval(intervalo);
      intervalo = undefined;
    }
  };
}

const leerAhora = () => {
  if (!ahora) ahora = Date.now();
  return ahora;
};
const leerAhoraServidor = () => null;

const dos = (n: number) => String(n).padStart(2, "0");

function Celdas({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <div className={s.grupo}>
      <div className={s.celdas}>
        {valor.split("").map((c, i) => (
          <span key={`${i}-${c}`} className={s.celda}>
            {c}
          </span>
        ))}
      </div>
      <span className={s.unidad}>{etiqueta}</span>
    </div>
  );
}

function Detalle({ f }: { f: Funcion }) {
  return (
    <p className={s.detalle}>
      <span className={s.mono}>
        {f.dia.corto} {f.dia.numero} · {f.horaInicio}
      </span>
      <Link href={`/pelicula/${f.pelicula.id}`} className={s.pelicula}>
        {f.pelicula.titulo}
      </Link>
      <span className={s.sala}>{f.sala.nombre}</span>
    </p>
  );
}

function plural(n: number, uno: string, varios: string) {
  return `${n} ${n === 1 ? uno : varios}`;
}

export default function Tablero() {
  const ms = useSyncExternalStore(suscribir, leerAhora, leerAhoraServidor);

  const ahoraMin = ms === null ? null : ahoraEnMinutosFestival(new Date(ms));
  const segundo = ms === null ? 0 : new Date(ms).getSeconds();

  // Después del festival
  if (ahoraMin !== null && ahoraMin >= ultimaFuncion.finMin) {
    return (
      <div className={s.tablero}>
        <p className={s.cabecera}>
          <span className={s.luz} data-apagada="" aria-hidden="true" />
          Fin de la {festival.edicion}ª edición
        </p>
        <p className={s.despedida}>Se apagaron los proyectores. Gracias por venir al puerto.</p>
      </div>
    );
  }

  // Durante el festival
  if (ahoraMin !== null && ahoraMin >= primeraFuncion.inicioMin) {
    const enPantalla = funciones.filter((f) => f.inicioMin <= ahoraMin && ahoraMin < f.finMin);
    const siguientes = funciones.filter((f) => f.inicioMin > ahoraMin).slice(0, 3);
    return (
      <div className={s.tablero}>
        <p className={s.cabecera}>
          <span className={s.luz} aria-hidden="true" />
          El festival está andando
          {enPantalla.length > 0 && (
            <span className={s.enCurso}>· {plural(enPantalla.length, "función", "funciones")} en pantalla</span>
          )}
        </p>
        {siguientes.length > 0 ? (
          <>
            <h2 className={s.subtitulo}>Lo que viene</h2>
            <ol className={s.siguientes}>
              {siguientes.map((f) => (
                <li key={f.id}>
                  <Detalle f={f} />
                </li>
              ))}
            </ol>
          </>
        ) : (
          <p className={s.despedida}>Está corriendo la última función de la edición.</p>
        )}
      </div>
    );
  }

  // Antes (o mientras hidrata)
  const f = funcionInaugural;
  const objetivo = f.nota && /inaugura/i.test(f.nota) ? "función inaugural" : "primera función";
  const restante = ahoraMin === null ? null : Math.max(0, (f.inicioMin - ahoraMin) * 60 - segundo);
  const d = restante === null ? null : Math.floor(restante / 86400);
  const h = restante === null ? null : Math.floor((restante % 86400) / 3600);
  const m = restante === null ? null : Math.floor((restante % 3600) / 60);
  const sg = restante === null ? null : restante % 60;

  return (
    <div className={s.tablero}>
      <p className={s.cabecera}>
        <span className={s.luz} aria-hidden="true" />
        Cuenta regresiva a la {objetivo}
      </p>

      <div className={s.cuenta} role="timer" aria-live="off">
        <div className={s.digitos} aria-hidden="true">
          <Celdas valor={d === null ? "--" : dos(d)} etiqueta={d === 1 ? "día" : "días"} />
          <span className={s.dosPuntos}>:</span>
          <Celdas valor={h === null ? "--" : dos(h)} etiqueta="horas" />
          <span className={s.dosPuntos}>:</span>
          <Celdas valor={m === null ? "--" : dos(m)} etiqueta="min" />
          <span className={s.dosPuntos}>:</span>
          <Celdas valor={sg === null ? "--" : dos(sg)} etiqueta="seg" />
        </div>
        {d !== null && h !== null && m !== null && (
          <p className="sr-only">
            Faltan {plural(d, "día", "días")}, {plural(h, "hora", "horas")} y {plural(m, "minuto", "minutos")} para la{" "}
            {objetivo}.
          </p>
        )}
      </div>

      <Detalle f={f} />
    </div>
  );
}
