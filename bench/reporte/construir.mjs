// Construye el reporte HTML del benchmark en español y en inglés.
// Uso: node bench/reporte/construir.mjs [es|en|todos]   (por defecto: todos)
//   es → bench/reporte/benchmark-niebla.html  (plantilla.html)
//   en → docs/index.html                      (plantilla.en.html, para GitHub Pages)
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const AQUI = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const BENCH = path.dirname(AQUI);
const RAIZ = path.dirname(BENCH);

const DESTINOS = {
  es: { plantilla: path.join(AQUI, "plantilla.html"), datos: "reporte.json", salida: path.join(AQUI, "benchmark-niebla.html") },
  en: { plantilla: path.join(AQUI, "plantilla.en.html"), datos: "reporte.en.json", salida: path.join(RAIZ, "docs", "index.html") },
};

const pedido = process.argv[2] ?? "todos";
const idiomas = pedido === "todos" ? ["es", "en"] : [pedido];

for (const idioma of idiomas) {
  const d = DESTINOS[idioma];
  execFileSync(process.execPath, [path.join(BENCH, "reporte-datos.mjs"), idioma], { stdio: "inherit" });
  const datos = JSON.parse(fs.readFileSync(path.join(BENCH, "runs", d.datos), "utf8"));

  // Solo lo que la página usa: nada de rutas locales, ids de sesión ni el mapeo interno de letras.
  const publico = {
    precios: { modelos: datos.precios.modelos },
    comentariosJueces: datos.comentariosJueces,
    noCompletadas: datos.noCompletadas,
    filas: datos.filas.map((f) => ({
      worktree: f.worktree, letraCiega: f.letraCiega, ronda: f.ronda, corto: f.corto, nombre: f.nombre,
      coordinacion: f.coordinacion, intervenciones: f.intervenciones,
      costoUsd: f.costoUsd, costoUsdPorModelo: f.costoUsdPorModelo, tokensPorModelo: f.tokensPorModelo,
      minutosReloj: f.minutosReloj, minutosEsperaAprobacion: f.minutosEsperaAprobacion, minutosNeto: f.minutosNeto,
      llamadasApi: f.llamadasApi, subagentes: f.subagentes, lineas: f.lineas,
      notaGabriel: f.notaGabriel, comentarioGabriel: f.comentarioGabriel,
      notaJuecesPromedio: f.notaJuecesPromedio,
      jueces: Object.fromEntries(Object.entries(f.jueces).map(([j, e]) => [j, {
        alineamiento: e.alineamiento, creatividad: e.creatividad, ejecucion: e.ejecucion,
        nota: e.nota, puesto: e.puesto, resumen: e.resumen, casosItinerario: e.casosItinerario,
      }])),
    })),
  };

  const plantilla = fs.readFileSync(d.plantilla, "utf8");
  const json = JSON.stringify(publico).replace(/</g, "\\u003c");
  const html = plantilla.replace("/*__DATOS__*/null", json);
  if (html === plantilla) throw new Error(`No encontré el marcador de datos en ${path.basename(d.plantilla)}`);
  fs.mkdirSync(path.dirname(d.salida), { recursive: true });
  fs.writeFileSync(d.salida, html);
  console.log(`Reporte (${idioma}) escrito en ${path.relative(RAIZ, d.salida)}`);
}
