import Link from 'next/link'
import { dias, festival } from '@/lib/datos'
import { listaHumana, nombreMes, ordinalEdicion } from '@/lib/formato'
import estilos from './EscenaPuerto.module.css'

/** El faro con haz que barre la niebla sobre el puerto de noche: la escena de identidad del sitio. */
export default function EscenaPuerto() {
  const palabras = festival.nombre.split(' ')
  const wordmark = palabras[palabras.length - 1]
  const rotulo = palabras.slice(0, -1).join(' ')
  const anio = festival.fechaInicio.slice(0, 4)
  const mes = nombreMes(Number(festival.fechaInicio.slice(5, 7)))
  const numeros = dias.map((d) => String(d.numero))

  return (
    <section className={estilos.escena}>
      <svg
        className={estilos.fondoSvg}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMaxYMax slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="portada-cielo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0B141B" />
            <stop offset="100%" stopColor="#1C3140" />
          </linearGradient>
          <linearGradient id="portada-haz" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F4C15D" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#F4C15D" stopOpacity="0" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="1440" height="610" fill="url(#portada-cielo)" />
        <rect x="0" y="610" width="1440" height="290" fill="#0E1B24" />

        <g className={`${estilos.ola} ${estilos.ola1}`} stroke="#3A5566" strokeOpacity="0.5" fill="none" strokeWidth="2">
          <path d="M0 650 Q 60 630 120 650 T 240 650 T 360 650 T 480 650 T 600 650 T 720 650 T 840 650 T 960 650 T 1080 650 T 1200 650 T 1320 650 T 1440 650 T 1560 650 T 1680 650 T 1800 650 T 1920 650 T 2040 650 T 2160 650 T 2280 650 T 2400 650 T 2520 650 T 2640 650 T 2760 650 T 2880 650" />
        </g>
        <g className={`${estilos.ola} ${estilos.ola2}`} stroke="#3A5566" strokeOpacity="0.35" fill="none" strokeWidth="2">
          <path d="M0 700 Q 70 675 140 700 T 280 700 T 420 700 T 560 700 T 700 700 T 840 700 T 980 700 T 1120 700 T 1260 700 T 1400 700 T 1540 700 T 1680 700 T 1820 700 T 1960 700 T 2100 700 T 2240 700 T 2380 700 T 2520 700 T 2660 700 T 2800 700" />
        </g>
        <g className={`${estilos.ola} ${estilos.ola3}`} stroke="#3A5566" strokeOpacity="0.2" fill="none" strokeWidth="2">
          <path d="M0 760 Q 80 730 160 760 T 320 760 T 480 760 T 640 760 T 800 760 T 960 760 T 1120 760 T 1280 760 T 1440 760 T 1600 760 T 1760 760 T 1920 760 T 2080 760 T 2240 760 T 2400 760 T 2560 760 T 2720 760 T 2880 760" />
        </g>

        {/* Puerto: grúas, contenedores y pilotes de un muelle */}
        <g fill="#08111A">
          <rect x="40" y="560" width="8" height="50" />
          <path d="M44 560 L110 545 L110 553 L52 568 Z" />
          <rect x="140" y="540" width="8" height="70" />
          <path d="M144 540 L210 528 L210 536 L152 548 Z" />
          <rect x="230" y="576" width="34" height="34" />
          <rect x="266" y="566" width="34" height="44" />
          <rect x="302" y="580" width="34" height="30" />
          <rect x="338" y="558" width="34" height="52" />
          <rect x="374" y="572" width="34" height="38" />
          <rect x="410" y="588" width="34" height="22" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={470 + i * 12} y="600" width="6" height="40" />
          ))}
        </g>

        {/* Promontorio y faro, corridos hacia el borde derecho del viewBox para
            no competir con el texto cuando el recorte "slice" muestra solo
            una franja angosta en móvil. */}
        <g>
          <path d="M1310 900 L1340 780 L1460 780 L1490 900 Z" fill="#0E1B24" />
          <path d="M1380 300 L1400 300 L1415 700 L1365 700 Z" fill="#E8EEF0" />
          <rect x="1368" y="380" width="44" height="14" fill="#FF7B6B" opacity="0.85" />
          <rect x="1368" y="460" width="44" height="14" fill="#FF7B6B" opacity="0.85" />
          <rect x="1362" y="700" width="56" height="16" fill="#1C3140" />
          <rect x="1372" y="270" width="36" height="34" fill="#1C3140" />
          <circle className={estilos.halo} cx="1390" cy="290" r="60" fill="#F4C15D" opacity="0.25" />
          <circle cx="1390" cy="290" r="14" fill="#F4C15D" />
          <g className={estilos.haz}>
            <path d="M1390 290 L1780 40 L1780 540 Z" fill="url(#portada-haz)" />
          </g>
        </g>
      </svg>

      <div className={estilos.niebla} aria-hidden="true">
        <div className={`${estilos.capaNiebla} ${estilos.capaBaja}`} />
        <div className={`${estilos.capaNiebla} ${estilos.capaMedia}`} />
        <div className={`${estilos.capaNiebla} ${estilos.capaAlta}`} />
      </div>

      <div className={estilos.texto}>
        <h1 className={estilos.h1}>
          <span className={`rotulo ${estilos.rotulo}`}>{rotulo}</span>
          <span className={estilos.wordmark}>{wordmark}</span>
        </h1>
        <p className={estilos.fechas}>
          {listaHumana(numeros)} de {mes} de {anio}
        </p>
        <p className={estilos.lugar}>
          {festival.ciudad}, {festival.region} · {ordinalEdicion(festival.edicion)} edición
        </p>
        <div className={estilos.cta}>
          <Link href="/programa" className={estilos.ctaPrincipal}>
            Ver el programa
          </Link>
          <Link href="/itinerario" className={estilos.ctaSecundario}>
            Arma tu itinerario
          </Link>
        </div>
      </div>
    </section>
  )
}
