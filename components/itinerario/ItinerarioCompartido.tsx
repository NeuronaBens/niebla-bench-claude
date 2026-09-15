"use client";

/**
 * /itinerario/compartido?f=f03.f05&n=Camila — un itinerario ajeno, en solo lectura,
 * con la opción de copiarlo al propio.
 */
import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { analizarItinerario, decodificarItinerario } from "@/lib/itinerario";
import { festival } from "@/lib/programa";
import { useItinerario } from "@/lib/useItinerario";
import LineaDeTiempo from "./LineaDeTiempo";
import ResumenItinerario from "./ResumenItinerario";
import { plural } from "./textos";
import { IconoCheck, IconoFlecha, IconoNota } from "./iconos";
import s from "./Itinerario.module.css";

export default function ItinerarioCompartido() {
  const params = useSearchParams();
  const { ids, idsInvalidos, nombre } = useMemo(() => decodificarItinerario(params), [params]);
  const analisis = useMemo(() => analizarItinerario(ids), [ids]);

  const titulo = nombre ? `Itinerario de ${nombre}` : "Un itinerario compartido";

  useEffect(() => {
    document.title = `${nombre ? `Itinerario de ${nombre}` : "Itinerario compartido"} · ${festival.nombre}`;
  }, [nombre]);

  if (analisis.funciones.length === 0) {
    return (
      <>
        <CabeceraCompartido titulo="Un link sin funciones" />
        <section className={s.vacio}>
          <div className={s.vacioTexto}>
            <p className={s.vacioBajada}>
              {idsInvalidos.length > 0
                ? "Las funciones de este link no están en el programa de esta edición. Puede que el link esté incompleto o sea de otro año."
                : "Este link no trae ninguna función. Puede que se haya cortado al copiarlo."}{" "}
              Pídele a quien te lo mandó que lo comparta de nuevo, o arma tu propio recorrido.
            </p>
            <div className={s.vacioAcciones}>
              <Link href="/programa" className={s.botonSodio}>
                Ver el programa
                <IconoFlecha tamano={18} />
              </Link>
              <Link href="/itinerario" className={s.botonSecundario}>
                Mi itinerario
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <CabeceraCompartido titulo={titulo} />
      <div className={s.disposicion}>
        <aside className={s.lateral}>
          <CopiarAlMio idsCompartidos={analisis.funciones.map((f) => f.id)} nombre={nombre} />
          <ResumenItinerario analisis={analisis} />
          {idsInvalidos.length > 0 && (
            <p className={s.ignoradas}>
              <IconoNota tamano={16} />
              <span>
                {idsInvalidos.length === 1
                  ? "Se ignoró una función del link que no está en el programa."
                  : `Se ignoraron ${idsInvalidos.length} funciones del link que no están en el programa.`}
              </span>
            </p>
          )}
        </aside>
        <div className={s.principal}>
          <LineaDeTiempo analisis={analisis} soloLectura />
        </div>
      </div>
    </>
  );
}

function CabeceraCompartido({ titulo }: { titulo: string }) {
  return (
    <header className={s.cabecera}>
      <p className={s.kicker}>Itinerario compartido</p>
      <h1 className={s.tituloPagina}>{titulo}</h1>
    </header>
  );
}

type Hecho = { tipo: "copiado" | "sumado" | "reemplazado"; n: number } | null;

function CopiarAlMio({ idsCompartidos, nombre }: { idsCompartidos: string[]; nombre: string | null }) {
  const { ids, listo, reemplazar, combinar } = useItinerario();
  const [confirmar, setConfirmar] = useState(false);
  const [hecho, setHecho] = useState<Hecho>(null);

  const mios = new Set(ids);
  const nuevas = idsCompartidos.filter((id) => !mios.has(id));
  const deQuien = nombre ? `de ${nombre}` : "compartido";

  // Choques o traslados imposibles NUEVOS que aparecerían al sumar (para avisar antes).
  const serios = (lista: readonly string[]) =>
    analizarItinerario(lista).avisos.filter((a) => a.tipo === "choque" || a.tipo === "traslado").length;
  const problemasAlSumar =
    listo && ids.length > 0 && nuevas.length > 0 ? Math.max(0, serios([...ids, ...nuevas]) - serios(ids)) : 0;

  let contenido: ReactNode;

  if (!listo) {
    contenido = <div className={s.copiarCargando} aria-hidden="true" />;
  } else if (hecho) {
    contenido = (
      <>
        <p className={s.copiarHecho}>
          <span className={s.calzaSello} aria-hidden="true">
            <IconoCheck tamano={20} strokeWidth={2.6} />
          </span>
          <span>
            {hecho.tipo === "sumado"
              ? `Sumaste ${plural(hecho.n, "función", "funciones")} a tu itinerario.`
              : hecho.tipo === "reemplazado"
                ? "Listo: ahora tu itinerario es este."
                : `Copiaste ${plural(hecho.n, "función", "funciones")} a tu itinerario.`}
          </span>
        </p>
        <Link href="/itinerario" className={s.botonSodio}>
          Ver mi itinerario
          <IconoFlecha tamano={18} />
        </Link>
      </>
    );
  } else if (ids.length === 0) {
    contenido = (
      <>
        <p className={s.copiarTexto}>¿Te tinca este recorrido? Cópialo y queda guardado en este navegador; después lo puedes ajustar.</p>
        <button
          type="button"
          className={s.botonSodio}
          onClick={() => {
            reemplazar(idsCompartidos);
            setHecho({ tipo: "copiado", n: idsCompartidos.length });
          }}
        >
          Copiar a mi itinerario
        </button>
      </>
    );
  } else if (nuevas.length === 0) {
    contenido = (
      <>
        <p className={s.copiarTexto}>
          {ids.length === idsCompartidos.length
            ? "Este itinerario es igual al tuyo."
            : "Ya tienes todas estas funciones en tu itinerario."}
        </p>
        <Link href="/itinerario" className={s.botonSecundario}>
          Ver mi itinerario
        </Link>
      </>
    );
  } else if (confirmar) {
    contenido = (
      <div className={s.confirmar} role="group" aria-label="Confirmar reemplazo">
        <span>
          Tu itinerario tiene {plural(ids.length, "función", "funciones")}. ¿Cambiarlo por el {deQuien}?
        </span>
        <button
          type="button"
          className={s.botonPeligro}
          onClick={() => {
            reemplazar(idsCompartidos);
            setConfirmar(false);
            setHecho({ tipo: "reemplazado", n: idsCompartidos.length });
          }}
        >
          Sí, reemplazar
        </button>
        <button type="button" className={s.botonSecundario} onClick={() => setConfirmar(false)} autoFocus>
          No
        </button>
      </div>
    );
  } else {
    contenido = (
      <>
        <p className={s.copiarTexto}>
          Ya tienes {plural(ids.length, "función", "funciones")} en tu itinerario.{" "}
          {nuevas.length === idsCompartidos.length
            ? nuevas.length === 1
              ? "La de este link es nueva para ti."
              : `Las ${nuevas.length} de este link son nuevas para ti.`
            : `${nuevas.length} de las ${idsCompartidos.length} son nuevas para ti.`}
        </p>
        {problemasAlSumar > 0 && (
          <p className={s.copiarAviso}>
            {problemasAlSumar === 1
              ? "Ojo: al sumarlas aparecería un choque o un traslado imposible. Te lo marcamos en tu itinerario."
              : `Ojo: al sumarlas aparecerían ${problemasAlSumar} choques o traslados imposibles. Te los marcamos en tu itinerario.`}
          </p>
        )}
        <div className={s.copiarAcciones}>
          <button
            type="button"
            className={s.botonSodio}
            onClick={() => {
              combinar(nuevas);
              setHecho({ tipo: "sumado", n: nuevas.length });
            }}
          >
            Sumar a mi itinerario
          </button>
          <button type="button" className={s.botonSecundario} onClick={() => setConfirmar(true)}>
            Reemplazar el mío
          </button>
        </div>
      </>
    );
  }

  return (
    <section className={s.copiar} aria-label="Copiar a mi itinerario" aria-live="polite">
      {contenido}
    </section>
  );
}
