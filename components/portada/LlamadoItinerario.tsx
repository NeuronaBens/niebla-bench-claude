import Link from "next/link";
import Flecha from "./Flecha";
import s from "./LlamadoItinerario.module.css";

const PASOS = [
  {
    titulo: "Marca tus funciones",
    texto: "Desde el programa o desde la ficha de cada película. Queda guardado en este navegador, sin cuentas ni registro.",
  },
  {
    titulo: "Te avisamos",
    texto: "Si dos funciones se topan, si no alcanzas a llegar caminando o si te perderías un conversatorio.",
  },
  {
    titulo: "Compártelo",
    texto: "Manda tu recorrido con un link. Quien lo abra lo ve y lo puede copiar al suyo.",
  },
];

export default function LlamadoItinerario() {
  return (
    <section className={s.llamado} aria-labelledby="titulo-itinerario">
      <div className={s.interior}>
        <div className={s.cabeza}>
          <p className={s.rotulo}>Mi itinerario</p>
          <h2 id="titulo-itinerario" className={s.titulo}>
            Arma tu recorrido por el puerto
          </h2>
        </div>

        <svg className={s.ruta} viewBox="0 0 600 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <path d="M8 20 C120 -4 180 44 300 20 S480 -4 592 20" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>

        <ol className={s.pasos}>
          {PASOS.map((p, i) => (
            <li key={p.titulo} className={s.paso}>
              <span className={s.numero} aria-hidden="true">
                {i + 1}
              </span>
              <h3 className={s.pasoTitulo}>{p.titulo}</h3>
              <p className={s.pasoTexto}>{p.texto}</p>
            </li>
          ))}
        </ol>

        <div className={s.acciones}>
          <Link href="/programa" className={s.primario}>
            Ir al programa
            <Flecha className={s.flecha} />
          </Link>
          <Link href="/itinerario" className={s.secundario}>
            Ver mi itinerario
          </Link>
        </div>
      </div>
    </section>
  );
}
