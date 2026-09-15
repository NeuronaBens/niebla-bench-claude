"use client";

/**
 * Aviso flotante (toast) que aparece al agregar o quitar una función desde un
 * BotonItinerario. Hay uno solo a la vez en toda la página: un pequeño store de
 * módulo guarda cuál está activo y qué botón lo originó. Se dibuja con un portal
 * dentro de una región `aria-live` que existe desde que se monta el primer botón,
 * para que los lectores de pantalla lo anuncien.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Aviso } from "@/lib/itinerario";
import { funcionPorId } from "@/lib/programa";
import { useItinerario } from "@/lib/useItinerario";
import { textoAvisoAlAgregar } from "./textos";
import {
  IconoAgotada,
  IconoCerrar,
  IconoCheck,
  IconoChoque,
  IconoConversatorio,
  IconoDeshacer,
  IconoFlecha,
  IconoNoAlcanza,
} from "./iconos";
import s from "./AvisoFlotante.module.css";

export interface Flotante {
  clave: number;
  origen: string;
  accion: "agregada" | "quitada";
  funcionId: string;
  avisos: Aviso[];
}

interface Estado {
  flotante: Flotante | null;
  /** Botones montados que pueden dibujar avisos, en orden de montaje. */
  anfitriones: readonly string[];
}

let estado: Estado = { flotante: null, anfitriones: [] };
let contador = 0;
const oyentes = new Set<() => void>();
function fijar(nuevo: Estado) {
  estado = nuevo;
  oyentes.forEach((o) => o());
}

export function mostrarFlotante(f: Omit<Flotante, "clave">) {
  fijar({ ...estado, flotante: { ...f, clave: ++contador } });
}

export function cerrarFlotante(clave?: number) {
  if (!estado.flotante || (clave !== undefined && estado.flotante.clave !== clave)) return;
  fijar({ ...estado, flotante: null });
}

/** Registra un botón como posible anfitrión del aviso. Llamar en un efecto; devuelve la limpieza. */
export function registrarAnfitrion(origen: string) {
  fijar({ ...estado, anfitriones: [...estado.anfitriones, origen] });
  return () => fijar({ ...estado, anfitriones: estado.anfitriones.filter((a) => a !== origen) });
}

function suscribir(o: () => void) {
  oyentes.add(o);
  return () => {
    oyentes.delete(o);
  };
}

/**
 * El aviso activo si le toca dibujarlo a `origen`: al botón que lo originó o, si ese
 * ya no está montado, al primer botón que siga en pantalla.
 */
function avisoPara(origen: string): Flotante | null {
  const { flotante, anfitriones } = estado;
  if (!flotante) return null;
  const dueno = anfitriones.includes(flotante.origen) ? flotante.origen : anfitriones[0];
  return dueno === origen ? flotante : null;
}

const ID_REGION = "niebla-avisos-itinerario";

/** Crea (una vez) la región aria-live donde se dibujan los avisos. Llamar en un efecto. */
export function asegurarRegionAvisos() {
  if (document.getElementById(ID_REGION)) return;
  const region = document.createElement("div");
  region.id = ID_REGION;
  region.setAttribute("aria-live", "polite");
  region.className = s.region;
  document.body.appendChild(region);
}

const ICONO = {
  choque: IconoChoque,
  traslado: IconoNoAlcanza,
  conversatorio: IconoConversatorio,
  agotada: IconoAgotada,
} as const;

function Contenido({ flotante }: { flotante: Flotante }) {
  const { agregar } = useItinerario();
  const pathname = usePathname();
  const [pausado, setPausado] = useState(false);
  const f = funcionPorId.get(flotante.funcionId);
  const conProblemas = flotante.avisos.length > 0;
  const agotada = flotante.accion === "agregada" && !!f?.agotada;

  useEffect(() => {
    if (pausado) return;
    const ms = flotante.accion === "quitada" ? 5000 : conProblemas || agotada ? 9000 : 4200;
    const t = window.setTimeout(() => cerrarFlotante(flotante.clave), ms);
    return () => window.clearTimeout(t);
  }, [pausado, flotante.clave, flotante.accion, conProblemas, agotada]);

  useEffect(() => {
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrarFlotante(flotante.clave);
    };
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [flotante.clave]);

  if (!f) return null;
  const enItinerario = pathname === "/itinerario";

  return (
    <div
      key={flotante.clave}
      className={s.aviso}
      data-accion={flotante.accion}
      data-problemas={conProblemas || agotada ? "si" : "no"}
      onPointerEnter={() => setPausado(true)}
      onPointerLeave={() => setPausado(false)}
      onFocus={() => setPausado(true)}
      onBlur={() => setPausado(false)}
    >
      <div className={s.sello} aria-hidden="true">
        {flotante.accion === "agregada" ? <IconoCheck tamano={20} /> : <IconoCerrar tamano={18} />}
      </div>
      <div className={s.cuerpo}>
        <p className={s.estado}>
          {flotante.accion === "agregada"
            ? conProblemas
              ? "Agregada, pero ojo"
              : "Agregada a tu itinerario"
            : "Quitada de tu itinerario"}
        </p>
        <p className={s.titulo}>
          {f.pelicula.titulo}{" "}
          <span className={s.hora}>
            {f.dia.corto} {f.horaInicio}
          </span>
        </p>
        {flotante.accion === "agregada" && (conProblemas || agotada) && (
          <ul className={s.lista}>
            {flotante.avisos.map((a, i) => {
              const Icono = ICONO[a.tipo];
              return (
                <li key={i} className={s.item} data-tipo={a.tipo}>
                  <Icono tamano={16} />
                  <span>{textoAvisoAlAgregar(a, f.id)}</span>
                </li>
              );
            })}
            {agotada && (
              <li className={s.item} data-tipo="agotada">
                <IconoAgotada tamano={16} />
                <span>Está agotada: ya no quedan entradas en boletería.</span>
              </li>
            )}
          </ul>
        )}
        <div className={s.acciones}>
          {flotante.accion === "quitada" ? (
            <button
              type="button"
              className={s.accion}
              onClick={() => {
                agregar(f.id);
                cerrarFlotante(flotante.clave);
              }}
            >
              <IconoDeshacer tamano={16} />
              Deshacer
            </button>
          ) : (
            !enItinerario && (
              <Link href="/itinerario" className={s.accion} onClick={() => cerrarFlotante(flotante.clave)}>
                Ver mi itinerario
                <IconoFlecha tamano={16} />
              </Link>
            )
          )}
        </div>
      </div>
      <button type="button" className={s.cerrar} onClick={() => cerrarFlotante(flotante.clave)} aria-label="Cerrar aviso">
        <IconoCerrar tamano={18} />
      </button>
    </div>
  );
}

/** Dibuja el aviso activo cuando le corresponde a este botón. */
export default function AvisoFlotante({ origen }: { origen: string }) {
  const flotante = useSyncExternalStore(
    suscribir,
    () => avisoPara(origen),
    () => null,
  );
  if (!flotante) return null;
  const region = document.getElementById(ID_REGION);
  if (!region) return null;
  return createPortal(<Contenido key={flotante.clave} flotante={flotante} />, region);
}
