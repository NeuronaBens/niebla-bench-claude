// Junta métricas de proceso, calidad, notas de Gabriel y de los jueces ciegos (evaluación conjunta
// de las 8 arquitecturas terminadas) en un solo JSON para el reporte.
// Uso: node bench/reporte-datos.mjs [es|en]  → escribe bench/runs/reporte.json (es) o bench/runs/reporte.en.json (en)
// En inglés usa los nombres traducidos y las notas *.en.json.
import fs from "node:fs";
import path from "node:path";

const IDIOMA = process.argv[2] === "en" ? "en" : "es";
const BENCH = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const R = (f) => JSON.parse(fs.readFileSync(path.join(BENCH, "runs", f), "utf8"));
const existe = (f) => fs.existsSync(path.join(BENCH, "runs", f));
const traducido = (f) => (IDIOMA === "en" ? f.replace(/\.json$/, ".en.json") : f);

// Intervenciones registradas en bench/DECISIONES.md (las aprobaciones de permisos se miden aparte como espera).
const ARQ = {
  "festival-1": {
    ronda: 1,
    es: { corto: "Opus solo", nombre: "Opus 5 solo", coordinacion: "un solo chat", intervenciones: [] },
    en: { corto: "Opus alone", nombre: "Opus 5 alone", coordinacion: "a single chat", intervenciones: [] },
  },
  "festival-2": {
    ronda: 1,
    es: { corto: "Opus + Sonnet", nombre: "Opus define y revisa, Sonnet programa", coordinacion: "el orquestador pasa el trabajo", intervenciones: ["El orquestador hizo los 4 traspasos entre chats"] },
    en: { corto: "Opus + Sonnet (orchestrated)", nombre: "Opus plans and reviews, Sonnet codes; an orchestrator hands off", coordinacion: "orchestrator hands off the work", intervenciones: ["The orchestrator made all 4 handoffs between chats"] },
  },
  "festival-3": {
    ronda: 1,
    es: { corto: "Opus + subagentes", nombre: "Opus con subagentes, libre", coordinacion: "Opus reparte a 5 subagentes Opus", intervenciones: [] },
    en: { corto: "Opus + subagents", nombre: "Opus free to use subagents", coordinacion: "Opus splits work across 5 Opus subagents", intervenciones: [] },
  },
  "festival-5": {
    ronda: 1,
    es: { corto: "Fable solo", nombre: "Fable 5.1 solo", coordinacion: "un solo chat", intervenciones: [] },
    en: { corto: "Fable alone", nombre: "Fable 5.1 alone", coordinacion: "a single chat", intervenciones: [] },
  },
  "festival-4": {
    ronda: 2,
    es: { corto: "Fable → Opus → Sonnet", nombre: "Fable backlog, Opus detalle y revisión, Sonnet programa", coordinacion: "autocoordinados", intervenciones: ["El orquestador reactivó a Fable cuando su turno se cortó antes del cierre"] },
    en: { corto: "Fable → Opus → Sonnet", nombre: "Fable writes the backlog, Opus the detail and review, Sonnet codes", coordinacion: "self-coordinated", intervenciones: ["The orchestrator nudged Fable when its turn was cut off before closing"] },
  },
  "festival-6": {
    ronda: 2,
    es: { corto: "Fable + subagentes", nombre: "Fable con subagentes, libre", coordinacion: "Fable reparte a 4 subagentes Fable", intervenciones: [] },
    en: { corto: "Fable + subagents", nombre: "Fable free to use subagents", coordinacion: "Fable splits work across 4 Fable subagents", intervenciones: [] },
  },
  "festival-8": {
    ronda: 2,
    es: { corto: "Fable + Haiku", nombre: "Fable planifica y revisa, Haiku programa", coordinacion: "autocoordinados", intervenciones: ["Gabriel escribió 2 veces al chat de Haiku", "Haiku se quedó sin contexto y la app compactó la conversación"] },
    en: { corto: "Fable + Haiku", nombre: "Fable plans and reviews, Haiku codes", coordinacion: "self-coordinated", intervenciones: ["Gabriel wrote twice to the Haiku chat", "Haiku ran out of context and the app compacted the conversation"] },
  },
  "festival-9": {
    ronda: 2,
    es: { corto: "Opus + Sonnet auto", nombre: "Opus define y revisa, Sonnet programa (sin orquestador)", coordinacion: "autocoordinados", intervenciones: [] },
    en: { corto: "Opus + Sonnet (self-coordinated)", nombre: "Opus plans and reviews, Sonnet codes, no orchestrator", coordinacion: "self-coordinated", intervenciones: [] },
  },
};
const NO_COMPLETADA = {
  es: { corto: "Fable → Sonnet → Haiku", nombre: "Fable backlog y revisa el detalle, Sonnet detalle y revisa el código, Haiku programa" },
  en: { corto: "Fable → Sonnet → Haiku", nombre: "Fable writes the backlog and reviews the detail, Sonnet writes the detail and reviews the code, Haiku codes" },
};

const metricas = R("metricas.json").arquitecturas;
const calidad = R("calidad.json");
const gabriel = R(traducido("notas-gabriel.json")).notas;
const { mapa } = R("ciego2.json");
const letraDe = Object.fromEntries(Object.entries(mapa).map(([l, wt]) => [wt, l]));
const jueces = ["opus", "fable"]
  .filter((j) => existe(traducido(`juez2/notas-juez-${j}.json`)))
  .map((j) => R(traducido(`juez2/notas-juez-${j}.json`)));
if (IDIOMA === "en" && jueces.length < 2) throw new Error("Faltan las notas de los jueces en inglés (juez2/notas-juez-*.en.json)");

const nota = (e) => +(0.35 * e.alineamiento + 0.35 * e.creatividad + 0.3 * e.ejecucion).toFixed(2);

const filas = Object.entries(ARQ).map(([wt, a]) => {
  const m = metricas[wt];
  const c = calidad[wt];
  const letra = letraDe[wt];
  const porJuez = Object.fromEntries(jueces.map((j) => {
    const e = j.equipos[letra];
    return [j.juez, { alineamiento: e.alineamiento, creatividad: e.creatividad, ejecucion: e.ejecucion, nota: nota(e), puesto: j.ranking.indexOf(letra) + 1, resumen: e.resumen, casosItinerario: e.casosItinerario, fortalezas: e.fortalezas, debilidades: e.debilidades }];
  }));
  const notasJueces = Object.values(porJuez).map((e) => e.nota);
  const tokensTotales = Object.values(m.tokensPorModelo).reduce((s, u) => s + u.input + u.output + u.cw5m + u.cw1h + u.cr, 0);
  return {
    worktree: wt, letraCiega: letra, ronda: a.ronda, ...a[IDIOMA],
    costoUsd: +m.costoUsdTotal.toFixed(2),
    costoUsdPorModelo: Object.fromEntries(Object.entries(m.costoUsdPorModelo).map(([k, v]) => [k, +(v ?? 0).toFixed(2)])),
    tokensPorModelo: m.tokensPorModelo,
    tokensTotales,
    minutosReloj: +m.muroMin.toFixed(1),
    minutosEsperaAprobacion: +(m.esperaAprobacionMin ?? 0).toFixed(1),
    minutosNeto: +(m.tiempoNetoMin ?? m.muroMin).toFixed(1),
    llamadasApi: Object.values(m.tokensPorModelo).reduce((s, u) => s + u.llamadas, 0),
    subagentes: m.subagentes,
    tramos: m.sesiones.flatMap((s) => s.tramos.map((t) => ({ modelos: s.modelos, inicio: t.inicio, fin: t.fin, prompt: t.prompt, despertar: !!t.despertar }))),
    pausasLargas: m.sesiones.flatMap((s) => (s.pausasLargas ?? []).map((p) => ({ modelos: s.modelos, ...p }))),
    build: c.build.ok, lintErrores: c.lint.errores, lintWarnings: c.lint.warnings,
    lineas: c.codigo.lineasNoVacias, archivos: c.codigo.archivos,
    notaGabriel: gabriel[wt].nota, comentarioGabriel: gabriel[wt].comentario,
    jueces: porJuez,
    notaJuecesPromedio: notasJueces.length ? +(notasJueces.reduce((x, y) => x + y, 0) / notasJueces.length).toFixed(2) : null,
  };
});

const m7 = metricas["festival-7"];
const salida = {
  idioma: IDIOMA,
  generado: new Date().toISOString(),
  precios: JSON.parse(fs.readFileSync(path.join(BENCH, "precios.json"), "utf8")),
  comentariosJueces: Object.fromEntries(jueces.map((j) => [j.juez, j.comentarioGeneral])),
  filas,
  noCompletadas: m7 ? [{
    worktree: "festival-7", ronda: 2, ...NO_COMPLETADA[IDIOMA],
    motivo: gabriel["festival-7"]?.comentario ?? (IDIOMA === "en" ? "Not completed" : "No completada"),
    costoUsdHastaDetenerse: +m7.costoUsdTotal.toFixed(2),
  }] : [],
};
const destino = path.join(BENCH, "runs", IDIOMA === "en" ? "reporte.en.json" : "reporte.json");
fs.writeFileSync(destino, JSON.stringify(salida, null, 2));
for (const f of filas) console.log(`[${IDIOMA}] ${f.corto} [${f.letraCiega}]: $${f.costoUsd} · neto ${f.minutosNeto} min · Gabriel ${f.notaGabriel} · jueces ${JSON.stringify(Object.fromEntries(Object.entries(f.jueces).map(([k, v]) => [k, v.nota])))}`);
