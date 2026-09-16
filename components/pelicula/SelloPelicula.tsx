import { generarParametrosSello } from '@/lib/visual';
import styles from './SelloPelicula.module.css';

const COLORES_SECCION: Record<string, { base: string; luz: string }> = {
  competencia: { base: '#3d6fa8', luz: '#5a9ad6' },
  panorama: { base: '#3f9099', luz: '#5db8c4' },
  nocturna: { base: '#6a4d9c', luz: '#9676c5' },
  costa: { base: '#b3762f', luz: '#d99e52' },
};

interface Props {
  id: string;
  seccion: string;
  duracionMin: number;
  anio: number;
  tamano?: 'chico' | 'grande';
}

export default function SelloPelicula({ id, seccion, duracionMin, anio, tamano = 'chico' }: Props) {
  const params = generarParametrosSello(id, seccion, duracionMin, anio);
  const colores = COLORES_SECCION[seccion] || COLORES_SECCION.competencia;

  const clases = tamano === 'grande' ? styles.grande : styles.chico;

  return (
    <div className={clases}>
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id={`grad-fondo-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colores.base} />
            <stop offset="100%" stopColor={colores.luz} />
          </linearGradient>
          <radialGradient id={`grad-luz-${id}`} cx={`${params.posicionLuz.x}%`} cy={`${params.posicionLuz.y}%`} r="20%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        {/* Fondo */}
        <rect width="100" height="100" fill={`url(#grad-fondo-${id})`} />

        {/* Capas de niebla */}
        {Array.from({ length: params.capasNiebla }).map((_, i) => {
          const y = 80 - (i * 100 / params.capasNiebla);
          const altura = 15 + i * 5;
          const opacidad = 0.4 - (i * 0.08);
          return (
            <rect
              key={i}
              x="0"
              y={y}
              width="100"
              height={altura}
              fill="rgba(99, 110, 114, 0.3)"
              opacity={opacidad}
            />
          );
        })}

        {/* Luz del faro */}
        <circle
          cx={params.posicionLuz.x}
          cy={params.posicionLuz.y}
          r="8"
          fill={`url(#grad-luz-${id})`}
          opacity="0.7"
        />
        <circle
          cx={params.posicionLuz.x}
          cy={params.posicionLuz.y}
          r="6"
          fill="rgba(255,255,255,0.2)"
        />

        {/* Puntitos de luz */}
        {Array.from({ length: params.numPuntitos }).map((_, i) => {
          const x = 10 + params.rand() * 80;
          const y = 20 + params.rand() * 60;
          const r = 1 + params.rand() * 1.5;
          return (
            <circle
              key={`puntito-${i}`}
              cx={x}
              cy={y}
              r={r}
              fill="rgba(200, 211, 220, 0.4)"
            />
          );
        })}
      </svg>
    </div>
  );
}
