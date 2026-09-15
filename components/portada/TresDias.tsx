import Link from "next/link";
import { formatoHora, salas, secciones, slugDia, textoFin } from "@/lib/programa";
import Flecha from "./Flecha";
import {
  cifras,
  colorSeccion,
  enPalabras,
  etiquetaNota,
  mayuscula,
  rangoHorario,
  resumenDias,
  type ResumenDia,
} from "./derivados";
import c from "./comun.module.css";
import s from "./TresDias.module.css";

const TOTAL = rangoHorario.hasta - rangoHorario.desde;
const pct = (min: number) => `${((min / TOTAL) * 100).toFixed(3)}%`;
const horas: number[] = [];
for (let m = rangoHorario.desde; m <= rangoHorario.hasta; m += 120) horas.push(m);

function frase(r: ResumenDia): string {
  const n = r.funciones.length;
  if (r.despuesDeLaPega) {
    return `Para llegar después de la pega: la primera función parte a las ${r.primera.horaInicio}.`;
  }
  if (r.esFuerte) return `El día fuerte: ${n} funciones, desde las ${r.primera.horaInicio}.`;
  return `${n} funciones, desde las ${r.primera.horaInicio}.`;
}

function Grafico({ r }: { r: ResumenDia }) {
  const base = r.dia.indice * 1440 + rangoHorario.desde;
  return (
    <div className={s.grafico} aria-hidden="true" style={{ ["--tramos" as string]: TOTAL / 120 }}>
      <div className={s.carriles}>
        {salas.map((sala) => (
          <div key={sala.id} className={s.carril}>
            <span className={s.carrilNombre}>{sala.id.slice(0, 3)}</span>
            <span className={s.pistaCarril}>
              {r.funciones
                .filter((f) => f.salaId === sala.id)
                .map((f) => (
                  <span
                    key={f.id}
                    className={s.bloqueFuncion}
                    style={{
                      left: pct(f.inicioMin - base),
                      width: pct(f.finConversatorioMin - f.inicioMin),
                      ["--c" as string]: colorSeccion(f.seccion.id),
                      ["--peli" as string]: `${((f.finMin - f.inicioMin) / (f.finConversatorioMin - f.inicioMin)) * 100}%`,
                    }}
                  />
                ))}
            </span>
          </div>
        ))}
      </div>
      <div className={s.eje}>
        {horas.map((m) => (
          <span key={m} style={{ left: pct(m - rangoHorario.desde) }}>
            {formatoHora(m).slice(0, 2)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TresDias() {
  return (
    <section className={`${c.contenedor} ${c.bloque}`} aria-labelledby="titulo-dias">
      <div className={c.encabezado}>
        <p className={c.rotulo}>Cuándo</p>
        <h2 id="titulo-dias" className={c.titulo}>
          {mayuscula(enPalabras(cifras.dias))} días, cada uno con su ritmo
        </h2>
        <ul className={s.leyenda} aria-label="Colores por sección">
          {secciones.map((sec) => (
            <li key={sec.id}>
              <span className={s.muestra} style={{ background: colorSeccion(sec.id) }} aria-hidden="true" />
              {sec.nombre}
            </li>
          ))}
        </ul>
      </div>

      <ol className={s.dias}>
        {resumenDias.map((r) => (
          <li key={r.dia.fecha} className={s.dia}>
            <h3 className={s.cabeza}>
              <span className={s.nombreDia}>{r.dia.nombre}</span>
              <span className={s.numero}>{r.dia.numero}</span>
            </h3>
            <p className={s.frase}>{frase(r)}</p>

            <dl className={s.datos}>
              <div>
                <dt>Funciones</dt>
                <dd>{r.funciones.length}</dd>
              </div>
              <div>
                <dt>Primera</dt>
                <dd>{r.primera.horaInicio}</dd>
              </div>
              <div>
                <dt>Cierre</dt>
                <dd>
                  {r.ultima.horaFin}
                  {r.ultima.terminaDiaSiguiente && <span className={s.madrugada}> +1</span>}
                  <span className="sr-only">, la última función {textoFin(r.ultima)}</span>
                </dd>
              </div>
            </dl>

            <Grafico r={r} />

            <ul className={s.hitos}>
              {r.conNota.map((f) => (
                <li key={f.id}>
                  <span className={s.hitoHora}>{f.horaInicio}</span>
                  {etiquetaNota(f)}
                </li>
              ))}
              {r.conversatorios > 0 && (
                <li>
                  <span className={s.hitoHora}>{r.conversatorios}</span>
                  con conversatorio
                </li>
              )}
              {r.aireLibre > 0 && (
                <li>
                  <span className={s.hitoHora}>{r.aireLibre}</span>
                  al aire libre
                </li>
              )}
            </ul>

            <Link href={`/programa?dia=${slugDia(r.dia)}`} className={s.ver}>
              Programa del {r.dia.nombre}
              <Flecha className={s.flecha} />
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
