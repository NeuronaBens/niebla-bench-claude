import { festival, funciones, salas, traslado } from "@/lib/programa";
import { cifras, enPalabras, mayuscula, trasladoMaximo } from "./derivados";
import c from "./comun.module.css";
import s from "./Salas.module.css";

export default function Salas() {
  return (
    <section className={`${c.contenedor} ${c.bloque}`} aria-labelledby="titulo-salas">
      <div className={c.encabezado}>
        <p className={c.rotulo}>Dónde</p>
        <h2 id="titulo-salas" className={c.titulo}>
          {mayuscula(enPalabras(cifras.salas))} salas en {festival.ciudad}, todo a pie
        </h2>
        <p className={c.bajada}>
          Lo más largo que te va a tocar caminar son {trasladoMaximo.min} minutos, entre {trasladoMaximo.b.nombre} y{" "}
          {trasladoMaximo.a.nombre}. Tu itinerario te avisa si no alcanzas a llegar de una función a la siguiente.
        </p>
      </div>

      <div className={s.grilla}>
        <ol className={s.salas}>
          {salas.map((sala, i) => {
            const n = funciones.filter((f) => f.salaId === sala.id).length;
            return (
              <li key={sala.id} className={s.sala}>
                <span className={s.numero} aria-hidden="true">
                  {i + 1}
                </span>
                <div className={s.salaTexto}>
                  <h3 className={s.salaNombre}>{sala.nombre}</h3>
                  <p className={s.direccion}>{sala.direccion}</p>
                  <p className={s.meta}>
                    {sala.aireLibre ? "Al aire libre" : "Sala"} · {sala.capacidad} personas · {n}{" "}
                    {n === 1 ? "función" : "funciones"}
                  </p>
                  {sala.nota && <p className={s.nota}>{sala.nota}</p>}
                </div>
              </li>
            );
          })}
        </ol>

        <div className={s.tablaCaja}>
          <table className={s.tabla}>
            <caption className={s.caption}>Minutos caminando entre salas</caption>
            <thead>
              <tr>
                <td />
                {salas.slice(0, -1).map((sala, i) => (
                  <th key={sala.id} scope="col">
                    <span className={s.chip}>{i + 1}</span>
                    <span className="sr-only">{sala.nombre}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salas.slice(1).map((fila, i) => (
                <tr key={fila.id}>
                  <th scope="row">
                    <span className={s.chip}>{i + 2}</span>
                    <span className={s.filaNombre}>{fila.nombre}</span>
                  </th>
                  {salas.slice(0, -1).map((col, j) =>
                    j <= i ? (
                      <td key={col.id} className={s.celda} data-lejos={traslado(fila.id, col.id) >= 15 ? "" : undefined}>
                        {traslado(fila.id, col.id)}
                        <span className={s.min}> min</span>
                      </td>
                    ) : (
                      <td key={col.id} className={s.vacia} aria-hidden="true" />
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
