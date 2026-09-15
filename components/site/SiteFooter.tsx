import Link from "next/link";
import { dias, festival, formatoPrecio, salas } from "@/lib/programa";
import Isotipo from "./Isotipo";
import s from "./SiteFooter.module.css";

const primero = dias[0];
const ultimo = dias[dias.length - 1];
const anio = festival.fechaInicio.slice(0, 4);
const marca = festival.nombre.trim().split(/\s+/).pop() ?? festival.nombre;
const salasAireLibre = salas.filter((sala) => sala.aireLibre);
const usuarioInstagram = festival.contacto.instagram.replace(/^@/, "");

function lista(nombres: string[]): string {
  if (nombres.length <= 1) return nombres.join("");
  return `${nombres.slice(0, -1).join(", ")} y ${nombres[nombres.length - 1]}`;
}

export default function SiteFooter() {
  return (
    <footer className={s.footer}>
      <div className={s.franja} aria-hidden="true" />

      <div className={s.contenido}>
        <section className={s.marca} aria-labelledby="pie-festival">
          <div className={s.logo}>
            <Isotipo className={s.isotipo} />
            <h2 id="pie-festival" className={s.nombre}>
              {festival.nombre}
            </h2>
          </div>
          <p className={s.edicion}>
            {festival.edicion}ª edición · {festival.ciudad}, {festival.region}
          </p>
          <ul className={s.dias} aria-label="Días del festival">
            {dias.map((d) => (
              <li key={d.fecha}>
                <span className={s.diaNombre}>{d.corto}</span>
                <span className={s.diaNumero}>{d.numero}</span>
              </li>
            ))}
          </ul>
          <p className={s.rango}>
            Del {primero.nombre} {primero.numero} al {ultimo.nombre} {ultimo.numero} de {ultimo.mes} de {anio}
          </p>
        </section>

        <section aria-labelledby="pie-entradas">
          <h2 id="pie-entradas" className={s.titulo}>
            Entradas
          </h2>
          <div className={s.boleto}>
            <dl className={s.precios}>
              <div>
                <dt>General</dt>
                <dd className={s.precio}>{formatoPrecio(festival.entradas.general)}</dd>
              </div>
              {salasAireLibre.length > 0 && (
                <div>
                  <dt>Funciones al aire libre</dt>
                  <dd className={s.precioLibre}>
                    {formatoPrecio(festival.entradas.aireLibre)}
                    <span className={s.enSala}>en {lista(salasAireLibre.map((x) => x.nombre))}</span>
                  </dd>
                </div>
              )}
            </dl>
            <p className={s.venta}>{festival.entradas.venta}</p>
          </div>
        </section>

        <section aria-labelledby="pie-salas">
          <h2 id="pie-salas" className={s.titulo}>
            Salas
          </h2>
          <ul className={s.listaSalas}>
            {salas.map((sala) => (
              <li key={sala.id}>
                <span className={s.salaNombre}>{sala.nombre}</span>
                <span className={s.salaDireccion}>{sala.direccion}</span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="pie-contacto">
          <h2 id="pie-contacto" className={s.titulo}>
            Contacto
          </h2>
          <ul className={s.listaContacto}>
            <li>
              <a href={`mailto:${festival.contacto.correo}`} className={s.link}>
                {festival.contacto.correo}
              </a>
            </li>
            <li>
              <a
                href={`https://www.instagram.com/${usuarioInstagram}/`}
                className={s.link}
                rel="noopener noreferrer"
                target="_blank"
              >
                {festival.contacto.instagram}
                <span className="sr-only"> en Instagram (se abre en otra pestaña)</span>
              </a>
            </li>
          </ul>
          <nav className={s.atajos} aria-label="Pie de página">
            <Link href="/programa">Programa</Link>
            <Link href="/itinerario">Mi itinerario</Link>
          </nav>
        </section>
      </div>

      <div className={s.cierre}>
        <p className={s.copy}>
          {festival.nombre} · {anio}
        </p>
      </div>

      <p className={s.gigante} aria-hidden="true">
        {marca}
      </p>
    </footer>
  );
}
