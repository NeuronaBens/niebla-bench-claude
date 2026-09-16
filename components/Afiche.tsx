import { Pelicula } from "@/lib/tipos";
import styles from "./Afiche.module.css";

interface AficheProps {
  pelicula: Pelicula;
  variante?: "tarjeta" | "grande";
  sinTexto?: boolean;
}

/**
 * Genera un número determinista (0-1) a partir de un string
 */
function hashToNumber(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % 10000 / 10000;
}

/**
 * Genera un SVG determinista para una película
 */
function generateAficheSvg(pelicula: Pelicula, colorSeccion: string): string {
  const hash = hashToNumber(pelicula.id);
  const tipo = Math.floor(hash * 4);

  const w = 300;
  const h = 450;

  // Gradiente base: color de sección sobre azul noche
  const noche = "#1a2836";
  const colorInicio = colorSeccion;
  const colorFin = noche;

  let elementoGeometrico = "";

  if (tipo === 0) {
    // Luna / círculo
    const cx = 200 + (hash - 0.5) * 100;
    const cy = 80 + (hash - 0.5) * 60;
    const r = 40 + (hash - 0.5) * 20;
    elementoGeometrico = `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="${colorSeccion}" opacity="0.5" />
      <circle cx="${cx + 15}" cy="${cy - 10}" r="${r * 0.3}" fill="${noche}" opacity="0.7" />
    `;
  } else if (tipo === 1) {
    // Haz de faro (triángulo)
    const x = 150 + (hash - 0.5) * 60;
    elementoGeometrico = `
      <path d="M ${x} 0 L ${x + 80} 200 L ${x - 80} 200 Z"
            fill="${colorSeccion}" opacity="0.4" />
      <path d="M ${x} 0 L ${x + 50} 150 L ${x - 50} 150 Z"
            fill="${colorSeccion}" opacity="0.25" />
    `;
  } else if (tipo === 2) {
    // Olas sinusoidales
    const baseY = 200 + (hash - 0.5) * 50;
    const amp = 20 + (hash - 0.5) * 10;
    let d = `M 0 ${baseY}`;
    for (let i = 0; i <= w; i += 20) {
      const y = baseY + Math.sin((i / w) * Math.PI * 3 + hash * 10) * amp;
      d += ` L ${i} ${y}`;
    }
    d += ` L ${w} ${h} L 0 ${h} Z`;
    elementoGeometrico = `<path d="${d}" fill="${colorSeccion}" opacity="0.35" />`;
  } else {
    // Líneas verticales (lluvia)
    elementoGeometrico = `
      <line x1="40" y1="0" x2="30" y2="${h}" stroke="${colorSeccion}" stroke-width="2" opacity="0.2" />
      <line x1="100" y1="0" x2="90" y2="${h}" stroke="${colorSeccion}" stroke-width="2" opacity="0.15" />
      <line x1="160" y1="0" x2="150" y2="${h}" stroke="${colorSeccion}" stroke-width="2" opacity="0.2" />
      <line x1="220" y1="0" x2="210" y2="${h}" stroke="${colorSeccion}" stroke-width="2" opacity="0.15" />
      <line x1="280" y1="0" x2="270" y2="${h}" stroke="${colorSeccion}" stroke-width="2" opacity="0.2" />
    `;
  }

  return `
    <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="gradiente-afiche-${pelicula.id}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${colorInicio};stop-opacity:0.7" />
          <stop offset="100%" style="stop-color:${colorFin};stop-opacity:1" />
        </linearGradient>
        <filter id="blur-${pelicula.id}">
          <feGaussianBlur in="SourceGraphic" stdDeviation="18" />
        </filter>
        <filter id="grano-${pelicula.id}">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" seed="${Math.floor(hash * 1000)}" />
          <feColorMatrix in="noise" type="saturate" values="0" />
          <feBlend in="SourceGraphic" in2="noise" mode="overlay" />
        </filter>
      </defs>

      <rect width="${w}" height="${h}" fill="url(#gradiente-afiche-${pelicula.id})" />

      <!-- Niebla capa 1 -->
      <ellipse cx="150" cy="${100 + hash * 100}" rx="200" ry="120" fill="${colorSeccion}" opacity="0.15" filter="url(#blur-${pelicula.id})" />

      <!-- Niebla capa 2 -->
      <ellipse cx="100" cy="${250 + (1 - hash) * 100}" rx="220" ry="140" fill="${colorSeccion}" opacity="0.12" filter="url(#blur-${pelicula.id})" />

      <!-- Niebla capa 3 -->
      <ellipse cx="200" cy="${200 + hash * 150}" rx="240" ry="150" fill="#ffffff" opacity="0.08" filter="url(#blur-${pelicula.id})" />

      <!-- Línea de horizonte -->
      <line x1="0" y1="${150 + hash * 100}" x2="${w}" y2="${180 + hash * 80}" stroke="${colorSeccion}" stroke-width="1" opacity="0.25" />

      <!-- Elemento geométrico -->
      ${elementoGeometrico}

      <!-- Grano sutil -->
      <rect width="${w}" height="${h}" fill="#000000" opacity="0.02" filter="url(#grano-${pelicula.id})" />
    </svg>
  `;
}

export default function Afiche({ pelicula, variante = "tarjeta", sinTexto }: AficheProps) {
  const colorSecciones: Record<string, string> = {
    competencia: "#f4b942",
    panorama: "#5cc8ff",
    nocturna: "#ff5c7a",
    costa: "#62d39a",
  };

  const colorSeccion = colorSecciones[pelicula.seccion] || "#f4b942";
  const svg = generateAficheSvg(pelicula, colorSeccion);

  const nombreSeccion =
    {
      competencia: "Competencia",
      panorama: "Panorama",
      nocturna: "Nocturna",
      costa: "Costa",
    }[pelicula.seccion] || "";

  const mostrarTexto = !sinTexto || variante !== "grande";

  return (
    <div className={`${styles.afiche} ${styles[variante]}`}>
      <div
        className={styles.aficheSvg}
        dangerouslySetInnerHTML={{ __html: svg }}
      />

      {mostrarTexto && (
        <div className={styles.contenido}>
          <h3 className={styles.titulo}>{pelicula.titulo}</h3>
          <span className={`${styles.etiqueta} sec-${pelicula.seccion}`}>
            {nombreSeccion}
          </span>
        </div>
      )}
    </div>
  );
}
