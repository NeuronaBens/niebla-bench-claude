"use client";

/**
 * Niebla que deriva sobre la bahía. Canvas a baja resolución (el navegador lo
 * escala y queda suave sin filtros caros), ~30 cuadros por segundo, se pausa
 * cuando no está en pantalla o la pestaña está oculta, y con movimiento reducido
 * dibuja un solo cuadro fijo.
 */
import { useEffect, useRef } from "react";

interface Banco {
  x: number;
  y: number;
  r: number;
  sx: number;
  vx: number;
  alfa: number;
  fase: number;
  amp: number;
  gradiente: CanvasGradient;
}

function semilla(seed: number) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FRIA = "206, 214, 219";
const CALIDA = "255, 158, 92";
const T_ESTATICO = 48; // segundos "congelados" para el cuadro fijo

export default function NieblaCanvas({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)");
    let w = 0;
    let h = 0;
    let bancos: Banco[] = [];
    let raf = 0;
    let ultimo = 0;
    let enPantalla = true;

    function degradado(color: string, r: number) {
      const g = ctx!.createRadialGradient(0, 0, 0, 0, 0, r);
      g.addColorStop(0, `rgba(${color}, 1)`);
      g.addColorStop(0.45, `rgba(${color}, 0.5)`);
      g.addColorStop(1, `rgba(${color}, 0)`);
      return g;
    }

    function crearBancos() {
      const rnd = semilla(31);
      const lista: Banco[] = [];
      const cantidad = w < 140 ? 13 : 18;
      for (let i = 0; i < cantidad; i++) {
        const r = h * (0.16 + rnd() * 0.24);
        lista.push({
          x: rnd() * w,
          y: h * (0.4 + rnd() * 0.56),
          r,
          sx: 1.8 + rnd() * 1.8,
          vx: w * (0.005 + rnd() * 0.012),
          alfa: 0.1 + rnd() * 0.16,
          fase: rnd() * Math.PI * 2,
          amp: h * (0.01 + rnd() * 0.025),
          gradiente: degradado(FRIA, r),
        });
      }
      for (let i = 0; i < 3; i++) {
        const r = h * (0.1 + rnd() * 0.08);
        lista.push({
          x: w * (0.05 + rnd() * 0.4),
          y: h * (0.8 + rnd() * 0.1),
          r,
          sx: 2.4,
          vx: w * 0.002,
          alfa: 0.12,
          fase: rnd() * Math.PI * 2,
          amp: h * 0.01,
          gradiente: degradado(CALIDA, r),
        });
      }
      bancos = lista;
    }

    function dibujar(t: number) {
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.clearRect(0, 0, w, h);
      for (const b of bancos) {
        const ancho = b.r * b.sx;
        const tramo = w + ancho * 2;
        const x = ((((b.x + b.vx * t) % tramo) + tramo) % tramo) - ancho;
        const y = b.y + Math.sin(t * 0.05 + b.fase) * b.amp;
        ctx!.globalAlpha = b.alfa * (0.72 + 0.28 * Math.sin(t * 0.08 + b.fase * 2));
        ctx!.setTransform(b.sx, 0, 0, 1, x, y);
        ctx!.fillStyle = b.gradiente;
        ctx!.fillRect(-b.r, -b.r, b.r * 2, b.r * 2);
      }
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.globalAlpha = 1;
    }

    function medir() {
      const caja = canvas!.getBoundingClientRect();
      if (caja.width === 0 || caja.height === 0) return;
      const factor = caja.width < 720 ? 3.5 : 5.5;
      const nw = Math.round(Math.min(340, Math.max(90, caja.width / factor)));
      const nh = Math.round(Math.max(70, (nw * caja.height) / caja.width));
      if (nw === w && nh === h) return;
      w = nw;
      h = nh;
      canvas!.width = w;
      canvas!.height = h;
      crearBancos();
    }

    function cuadro(ms: number) {
      raf = requestAnimationFrame(cuadro);
      if (ms - ultimo < 33) return;
      ultimo = ms;
      dibujar(T_ESTATICO + ms / 1000);
    }

    function actualizar() {
      const animar = enPantalla && !reducido.matches && !document.hidden;
      if (animar && !raf) {
        raf = requestAnimationFrame(cuadro);
      } else if (!animar && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (!animar) dibujar(T_ESTATICO);
    }

    medir();
    dibujar(T_ESTATICO);
    canvas.setAttribute("data-listo", "");

    const alRedimensionar = new ResizeObserver(() => {
      medir();
      if (!raf) dibujar(T_ESTATICO);
    });
    alRedimensionar.observe(canvas);

    const observador = new IntersectionObserver(([entrada]) => {
      enPantalla = entrada.isIntersecting;
      actualizar();
    });
    observador.observe(canvas);

    reducido.addEventListener("change", actualizar);
    document.addEventListener("visibilitychange", actualizar);
    actualizar();

    return () => {
      cancelAnimationFrame(raf);
      alRedimensionar.disconnect();
      observador.disconnect();
      reducido.removeEventListener("change", actualizar);
      document.removeEventListener("visibilitychange", actualizar);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
