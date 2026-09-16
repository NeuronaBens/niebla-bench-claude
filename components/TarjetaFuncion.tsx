import Link from "next/link";
import { FuncionExpandida } from "@/lib/tipos";
import { formatoHora, formatoDuracion, DIAS } from "@/lib/tiempo";
import { nombreCorto } from "@/lib/programa";
import Etiqueta from "./Etiqueta";
import BotonItinerario from "./BotonItinerario";
import styles from "./TarjetaFuncion.module.css";

interface TarjetaFuncionProps {
  funcion: FuncionExpandida;
  variante?: "lista" | "grilla";
  mostrarDia?: boolean;
  avisos?: string[];
  sinBoton?: boolean;
}

export default function TarjetaFuncion({
  funcion,
  variante = "lista",
  mostrarDia,
  avisos,
  sinBoton,
}: TarjetaFuncionProps) {
  const horaInicio = formatoHora(funcion.inicioMin);
  const horaFin = formatoHora(funcion.finMin, { relativoADia: funcion.inicioMin });
  const duracion = formatoDuracion(funcion.pelicula.duracionMin);

  const esGrilla = variante === "grilla";
  const compacto = esGrilla;

  return (
    <article className={`${styles.tarjeta} ${styles[variante]} sec-${funcion.seccion.id}`}>
      {mostrarDia && <div className={styles.dia}>{DIAS[funcion.dia].corto}</div>}

      <div className={`${styles.encabezado} ${variante === "lista" ? styles.lista : ""}`}>
        <span>{horaInicio}</span>
        <span style={{ fontSize: "0.8em", color: "var(--niebla-2)" }}>−</span>
        <span className={styles.horaFin}>{horaFin}</span>
      </div>

      <h2 className={styles.titulo}>
        <Link href={`/pelicula/${funcion.pelicula.id}`}>{funcion.pelicula.titulo}</Link>
      </h2>

      <div className={styles.meta}>
        <span>{nombreCorto(funcion.sala)}</span>
        <span>·</span>
        <span>{duracion}</span>
        <span>·</span>
        <span>{funcion.pelicula.clasificacion}</span>
      </div>

      <div className={styles.etiquetas}>
        {funcion.agotada && <Etiqueta tipo="agotada" texto="Agotada" />}
        {funcion.sala.aireLibre && <Etiqueta tipo="aireLibre" texto="Aire libre" />}
        {funcion.conversatorioMin && (
          <Etiqueta tipo="conversatorio" texto={`Conversatorio ${funcion.conversatorioMin} min`} />
        )}
        {!esGrilla && funcion.pelicula.estreno === "mundial" && (
          <Etiqueta tipo="estreno" texto="Estreno mundial" />
        )}
      </div>

      {funcion.nota && !esGrilla && <div className={styles.nota}>{funcion.nota}</div>}

      {avisos && avisos.length > 0 && (
        <div className={styles.avisos}>
          {avisos.map((aviso, i) => (
            <div key={i} className={styles.aviso}>
              {aviso}
            </div>
          ))}
        </div>
      )}

      {!sinBoton && (
        <div className={`${styles.acciones} ${esGrilla ? styles.accionesGrilla : ""}`}>
          <BotonItinerario funcionId={funcion.id} compacto={compacto} />
        </div>
      )}
    </article>
  );
}
