/**
 * Afiche generativo de una película (Server Component, SVG puro y determinista).
 *
 * Capas, de atrás hacia adelante:
 *   1. Cielo en degradado con la paleta de la sección (o el cielo propio del motivo).
 *   2. Escena de la sección: cerros y luces de sodio / retícula de mapa / vetas rojas /
 *      curvas de nivel. Varía con una semilla derivada del id.
 *   3. Banda de niebla lejana (el hilo común del festival).
 *   4. Motivo propio de la película (motivos.tsx), sacado de su sinopsis.
 *   5. Niebla cercana (en "grande" deriva lentamente), textura y viñeta.
 *   6. Tipografía: título compuesto a mano en líneas, y en "grande" los créditos.
 *
 * Los ids internos del SVG (degradados, recortes, filtros) llevan el id de la
 * película más un useId, así no chocan aunque la misma película aparezca varias
 * veces en una página.
 */
import { useId, type ReactNode } from "react";
import { festival, type Pelicula } from "@/lib/programa";
import { crearAzar, r1 } from "./azar";
import { DefsEscena, Escena, PALETAS, Textura, url, type Ctx, type Paleta } from "./escenas";
import { MOTIVOS } from "./motivos";
import { anchoEm, componerTitulo, separarAntetitulo } from "./tipografia";
import styles from "./Afiche.module.css";

export type TamanoAfiche = "mini" | "tarjeta" | "grande";

export interface AficheProps {
  pelicula: Pelicula;
  /** mini: ~48-72px (sin texto). tarjeta: ~160-280px. grande: cabecera de ficha. */
  tamano?: TamanoAfiche;
  /** Muestra el título tipografiado dentro del afiche (por defecto: true salvo en "mini"). */
  conTitulo?: boolean;
  className?: string;
}

const DISPLAY = { fontFamily: "var(--f-display)" } as const;
const MONO = { fontFamily: "var(--f-mono)" } as const;

interface EstiloTitulo {
  peso: number;
  mayusculas: boolean;
  color: (p: Paleta) => string;
  interlinea: number;
}

const ESTILO_TITULO: Record<Pelicula["seccion"], EstiloTitulo> = {
  competencia: { peso: 800, mayusculas: true, color: (p) => p.texto, interlinea: 0.9 },
  panorama: { peso: 600, mayusculas: true, color: (p) => p.texto, interlinea: 0.94 },
  nocturna: { peso: 800, mayusculas: true, color: (p) => p.acento, interlinea: 0.88 },
  costa: { peso: 700, mayusculas: false, color: (p) => p.texto, interlinea: 0.92 },
};

/** Ancho aproximado de IBM Plex Mono: 0,6 em por carácter. */
function anchoMono(texto: string, tam: number, espaciado = 0) {
  return texto.length * tam * (0.6 + espaciado);
}

function bandasNiebla(c: Ctx, capa: string, n: number, yMin: number, yMax: number, opMax: number): ReactNode[] {
  const A = c.azar(capa);
  return Array.from({ length: n }, (_, i) => {
    const alto = A.rango(16, 46);
    const y = A.rango(yMin, yMax);
    return (
      <rect
        key={`${capa}${i}`}
        x={-40}
        y={r1(y)}
        width={280}
        height={r1(alto)}
        fill={url(c, "banda")}
        opacity={r1(A.rango(opMax * 0.45, opMax) * 100) / 100}
      />
    );
  });
}

function fechasFestival(): string {
  const [a, m, d1] = festival.fechaInicio.split("-");
  const d2 = festival.fechaFin.split("-")[2];
  return `${Number(d1)}–${Number(d2)}.${m}.${a}`;
}

export default function Afiche({ pelicula, tamano = "tarjeta", conTitulo, className }: AficheProps) {
  const idReact = useId().replace(/[^A-Za-z0-9_-]/g, "");
  const uid = `af-${pelicula.id}-${idReact}`;
  const conTexto = conTitulo ?? tamano !== "mini";
  const seccion = pelicula.seccion;
  const pal = PALETAS[seccion];
  const motivo = MOTIVOS[pelicula.id];
  const opciones = motivo?.escena ?? {};
  const cielo = motivo?.cielo ?? pal.cielo;

  const c: Ctx = {
    R: crearAzar(`${pelicula.id}:motivo`),
    azar: (capa) => crearAzar(`${pelicula.id}:${capa}`),
    uid,
    pal,
    detalle: tamano,
    fino: tamano !== "mini",
  };

  const grande = tamano === "grande";
  // En mini se acerca un poco la cámara al motivo (sigue siendo 2:3).
  const viewBox = tamano === "mini" ? "12 24 176 264" : "0 0 200 300";

  // ——— Tipografía ———
  let texto: ReactNode = null;
  if (conTexto) {
    const estilo = ESTILO_TITULO[seccion];
    const { antetitulo, titulo } = separarAntetitulo(pelicula.titulo);
    const margen = grande ? 14 : 13;
    const ancho = 200 - margen * 2;
    // Con minúsculas se deja aire para los descendentes (p, q, g, y).
    const descendentes = !estilo.mayusculas && /[gjpqy,]/.test(titulo);
    const bloque = componerTitulo(titulo, {
      ancho,
      altoMax: grande ? 78 : 84,
      base: (grande ? 246 : 283) - (descendentes ? 7 : 0),
      tamMax: grande ? 48 : 52,
      interlinea: estilo.interlinea,
      peso: estilo.peso,
      mayusculas: estilo.mayusculas,
    });
    const colorTitulo = estilo.color(pal);
    const sobreTitulo = antetitulo ?? (grande ? pelicula.tituloOriginal : undefined);
    const tamSobre = grande ? 6.5 : 10.5;
    const textoSobre = sobreTitulo ? (antetitulo ? antetitulo.toLocaleUpperCase("es-CL") : sobreTitulo) : "";

    const lineas = bloque.lineas.map((l, i) => (
      <text
        key={i}
        x={margen}
        y={r1(l.y)}
        fontSize={r1(bloque.tamano)}
        fontWeight={estilo.peso}
        fill={colorTitulo}
        textLength={r1(l.ancho)}
        lengthAdjust="spacingAndGlyphs"
        style={DISPLAY}
      >
        {l.texto}
      </text>
    ));

    let creditos: ReactNode = null;
    if (grande) {
      const nombre = pelicula.direccion.toLocaleUpperCase("es-CL");
      const tamNombre = 11;
      const anchoNombre = anchoEm(nombre, 700) * tamNombre;
      const origen = `${pelicula.pais.toLocaleUpperCase("es-CL")} · ${pelicula.anio}`;
      const duracion = `${pelicula.duracionMin} MIN`;
      const tamMono = 5.6;
      const cabIzq = festival.nombre.toLocaleUpperCase("es-CL");
      const cabDer = fechasFestival();
      const colorSec = pal.acento;
      creditos = (
        <g>
          <rect x={margen} y={13} width={5} height={5} fill={colorSec} />
          <text x={margen + 9} y={17.8} fontSize={tamMono} fill={pal.texto} opacity={0.85} style={MONO} letterSpacing={0.6} textLength={r1(Math.min(anchoMono(cabIzq, tamMono, 0.1), 112))} lengthAdjust="spacingAndGlyphs">
            {cabIzq}
          </text>
          <text x={200 - margen} y={17.8} fontSize={tamMono} fill={pal.texto} opacity={0.85} textAnchor="end" style={MONO}>
            {cabDer}
          </text>
          <rect x={margen} y={23} width={ancho} height={0.5} fill={pal.texto} opacity={0.3} />
          <rect x={margen} y={254} width={ancho} height={0.5} fill={pal.texto} opacity={0.3} />
          <text x={margen} y={264} fontSize={4.8} fill={colorSec} style={MONO} letterSpacing={0.5}>
            {pelicula.direccion.startsWith("Varios") ? "UN PROGRAMA DE" : "UNA PELÍCULA DE"}
          </text>
          <text
            x={margen}
            y={276}
            fontSize={tamNombre}
            fontWeight={700}
            fill={pal.texto}
            style={DISPLAY}
            {...(anchoNombre > ancho ? { textLength: ancho, lengthAdjust: "spacingAndGlyphs" as const } : {})}
          >
            {nombre}
          </text>
          <text x={margen} y={288} fontSize={tamMono} fill={pal.texto} opacity={0.8} style={MONO} {...(anchoMono(origen, tamMono) > ancho - 36 ? { textLength: ancho - 36, lengthAdjust: "spacingAndGlyphs" as const } : {})}>
            {origen}
          </text>
          <text x={200 - margen} y={288} fontSize={tamMono} fill={pal.texto} opacity={0.8} textAnchor="end" style={MONO}>
            {duracion}
          </text>
        </g>
      );
    }

    texto = (
      <g>
        <rect x={0} y={grande ? 150 : 160} width={200} height={grande ? 150 : 140} fill={url(c, "velo")} />
        {sobreTitulo && (
          <text
            x={margen}
            y={r1(bloque.arriba - (grande ? 6 : 7))}
            fontSize={tamSobre}
            fill={seccion === "nocturna" ? pal.texto : pal.acento}
            style={MONO}
            {...(anchoMono(textoSobre, tamSobre) > ancho ? { textLength: ancho, lengthAdjust: "spacingAndGlyphs" as const } : {})}
          >
            {textoSobre}
          </text>
        )}
        {lineas}
        {creditos}
      </g>
    );
  }

  const nieblaLejos = bandasNiebla(c, "nieblaLejos", 2, 70, 190, 0.2);
  const nieblaCerca = bandasNiebla(c, "nieblaCerca", tamano === "mini" ? 1 : 2, 110, 230, 0.16);

  const direccion = pelicula.direccion.startsWith("Varios") ? "varios directores" : pelicula.direccion;
  const clases = [styles.afiche, styles[tamano], className].filter(Boolean).join(" ");

  return (
    <svg
      className={clases}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={`Afiche de ${pelicula.titulo}, de ${direccion}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <DefsEscena c={c} seccion={seccion} cielo={cielo} opciones={opciones} />
      </defs>
      <rect x={0} y={0} width={200} height={300} fill={url(c, "cielo")} />
      <Escena c={c} seccion={seccion} opciones={opciones} />
      <g className={grande ? styles.derivaLenta : undefined}>{nieblaLejos}</g>
      {motivo?.dibujar(c)}
      <g className={grande ? styles.deriva : undefined}>{nieblaCerca}</g>
      <Textura c={c} seccion={seccion} opciones={opciones} />
      {texto}
      {grande && <rect x={5} y={5} width={190} height={290} fill="none" stroke={pal.texto} strokeWidth={0.5} opacity={0.14} />}
    </svg>
  );
}
