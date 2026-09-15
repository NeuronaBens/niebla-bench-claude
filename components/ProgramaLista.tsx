import Link from "next/link";
import { dias, getSeccion, type DiaId, type Funcion } from "@/lib/datos";
import TarjetaFuncion from "./TarjetaFuncion";
import styles from "./ProgramaLista.module.css";

export interface ProgramaListaProps {
  funciones: Funcion[];
  /** Día filtrado (o null = todos). Solo se usa para el estado vacío. */
  dia: DiaId | null;
  /** Sección filtrada (o null = todas). Solo se usa para el estado vacío. */
  seccion: string | null;
  alLimpiar?: () => void;
}

type Franja = "Mediodía" | "Tarde" | "Noche" | "Trasnoche";

/** Franja horaria de una función según su hora de inicio (dentro del día). */
function franjaDe(f: Funcion): Franja {
  const hora = ((f.inicioMin % 1440) + 1440) % 1440;
  if (hora >= 23 * 60) return "Trasnoche";
  if (hora >= 19 * 60) return "Noche";
  if (hora >= 15 * 60) return "Tarde";
  return "Mediodía";
}

function plural(n: number, singular: string, pluralTexto: string): string {
  return `${n} ${n === 1 ? singular : pluralTexto}`;
}

export function contarFunciones(n: number): string {
  return plural(n, "función", "funciones");
}

export default function ProgramaLista({ funciones, dia, seccion, alLimpiar }: ProgramaListaProps) {
  if (funciones.length === 0) {
    const nombreSeccion = seccion ? getSeccion(seccion)?.nombre : undefined;
    const nombreDia = dia ? dias.find((d) => d.id === dia)?.etiqueta : undefined;
    return (
      <div className={styles.vacio} role="status">
        <p className={styles.vacioTitulo}>Nada por acá.</p>
        <p className={styles.vacioTexto}>
          {nombreSeccion && nombreDia
            ? `No hay funciones de ${nombreSeccion} el ${nombreDia.toLowerCase()}.`
            : "No hay funciones con estos filtros."}{" "}
          Prueba otro día u otra sección.
        </p>
        {alLimpiar ? (
          <button type="button" className="boton boton--fantasma" onClick={alLimpiar}>
            Ver todo el programa
          </button>
        ) : (
          <Link href="/programa" className="boton boton--fantasma">
            Ver todo el programa
          </Link>
        )}
      </div>
    );
  }

  const grupos = dias
    .map((d) => ({ dia: d, funciones: funciones.filter((f) => f.dia === d.id) }))
    .filter((g) => g.funciones.length > 0);

  return (
    <div className={styles.lista}>
      {grupos.map(({ dia: d, funciones: lista }) => {
        let franjaAnterior: Franja | null = null;
        return (
          <section key={d.id} className={styles.dia} aria-labelledby={`programa-dia-${d.id}`}>
            <header className={styles.diaCabecera}>
              <h2 className={styles.diaTitulo} id={`programa-dia-${d.id}`}>
                {d.nombre} <span className={styles.diaNumero}>{d.numero}</span>
              </h2>
              <p className={styles.diaContador}>{contarFunciones(lista.length)}</p>
            </header>

            <ol className={styles.funciones}>
              {lista.map((f) => {
                const franja = franjaDe(f);
                const nuevaFranja = franja !== franjaAnterior;
                franjaAnterior = franja;
                return (
                  <li key={f.id} className={styles.item}>
                    {nuevaFranja && (
                      <p className={styles.franja}>
                        <span className="etiqueta">{franja}</span>
                      </p>
                    )}
                    <TarjetaFuncion funcion={f} />
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
