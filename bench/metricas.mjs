// Extrae métricas de proceso (tokens, costo API extrapolado, tiempos, turnos, herramientas,
// subagentes, intervenciones manuales) desde los transcripts locales de Claude Code.
// Uso: node bench/metricas.mjs [festival-1 festival-2 ...]   → escribe bench/runs/metricas.json
//
// Un chat cuenta desde el primer mensaje que recibe de otro chat (el orquestador o, en las
// arquitecturas autocoordinadas, el chat a cargo). Lo anterior (el "ok" de preparación) no se mide.
// Tiempos:
// - muroMin: del primer mensaje entrante a la última actividad de la arquitectura (reloj).
// - activoMin: suma de tramos de trabajo. Cada tramo empieza con un mensaje entrante o con el aviso
//   de una tarea en segundo plano y termina en la última actividad antes del siguiente.
// - trabajoMin: como activoMin, pero descontando toda pausa de más de 10 minutos entre dos entradas
//   seguidas del transcript. Ninguna respuesta normal tarda eso: son esperas (una aprobación manual
//   pendiente o el turno de otro chat).
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const BENCH = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const PRECIOS = JSON.parse(fs.readFileSync(path.join(BENCH, "precios.json"), "utf8")).modelos;
const PROYECTOS = path.join(os.homedir(), ".claude", "projects");
// Claude Code guarda cada proyecto en ~/.claude/projects/<ruta con ":", "\", "/" y "_" cambiados por "-">.
// Los worktrees viven junto al repo, en ../ClaudeModelFusions-wt/festival-N.
const WT_PREFIX = path.join(path.dirname(path.dirname(BENCH)), "ClaudeModelFusions-wt", "x").slice(0, -1).replace(/[:\\/_]/g, "-");
const PAUSA_MAX_MS = 10 * 60 * 1000;

const leer = (f) =>
  fs.readFileSync(f, "utf8").split("\n").filter(Boolean).flatMap((l) => {
    try { return [JSON.parse(l)]; } catch { return []; }
  });

const contenido = (e) => JSON.stringify(e.message?.content ?? "");

// Mensaje de otro chat, excluyendo el que movió cada chat a su worktree.
const esMensajeEntrante = (e) =>
  e.type === "user" && contenido(e).includes("cross-session-message") && !contenido(e).includes("change_directory");

// Aviso de que terminó una tarea en segundo plano (despierta al chat que esperaba).
const esAvisoDeTarea = (e) => e.type === "user" && contenido(e).includes("<task-notification>");

function textoUsuario(e) {
  const c = e.message?.content;
  if (typeof c === "string") return c;
  if (Array.isArray(c)) return c.filter((b) => b.type === "text").map((b) => b.text).join("\n");
  return "";
}

function costo(modelo, u) {
  const p = PRECIOS[modelo];
  if (!p) return null;
  return (u.input * p.input + u.output * p.output + u.cw5m * p.cacheWrite5m + u.cw1h * p.cacheWrite1h + u.cr * p.cacheRead) / 1e6;
}

function analizarArchivo(f, desde = null) {
  const E = leer(f);
  const porId = new Map();
  const herramientas = {};
  const toolIds = new Set();
  for (const e of E) {
    if (e.type !== "assistant" || !e.message) continue;
    if (desde && e.timestamp < desde) continue;
    porId.set(e.message.id, e.message);
    for (const b of e.message.content ?? []) {
      if (b.type === "tool_use" && !toolIds.has(b.id)) {
        toolIds.add(b.id);
        herramientas[b.name] = (herramientas[b.name] ?? 0) + 1;
      }
    }
  }
  const porModelo = {};
  for (const m of porId.values()) {
    // "<synthetic>" es un mensaje de 0 tokens que la app inserta cuando un turno se corta por error.
    if (m.model === "<synthetic>") continue;
    const u = m.usage ?? {};
    const k = (porModelo[m.model] ??= { llamadas: 0, input: 0, output: 0, thinking: 0, cw5m: 0, cw1h: 0, cr: 0 });
    k.llamadas++;
    k.input += u.input_tokens ?? 0;
    k.output += u.output_tokens ?? 0;
    k.thinking += u.output_tokens_details?.thinking_tokens ?? 0;
    const cc = u.cache_creation;
    if (cc) { k.cw5m += cc.ephemeral_5m_input_tokens ?? 0; k.cw1h += cc.ephemeral_1h_input_tokens ?? 0; }
    else k.cw5m += u.cache_creation_input_tokens ?? 0;
    k.cr += u.cache_read_input_tokens ?? 0;
  }
  return { E, porModelo, herramientas };
}

function analizarSesion(f) {
  const primero = leer(f).find(esMensajeEntrante);
  const { E, porModelo, herramientas } = analizarArchivo(f, primero.timestamp);
  const tramos = [];
  const intervenciones = [];
  const pausasLargas = [];
  let trabajoMs = 0;
  let actual = null;
  let previo = null;
  for (const e of E) {
    if (!e.timestamp || e.timestamp < primero.timestamp) continue;
    const entrante = esMensajeEntrante(e);
    if (entrante || esAvisoDeTarea(e)) {
      if (actual) tramos.push(actual);
      const prompt = entrante ? textoUsuario(e).replace(/[\s\S]*?name="[^"]*">\n?/, "").slice(0, 80) : "(despierta: terminó una espera)";
      actual = { inicio: e.timestamp, fin: e.timestamp, prompt, despertar: !entrante };
      previo = e.timestamp;
    } else if (actual && (e.type === "assistant" || e.type === "user")) {
      const pausa = Date.parse(e.timestamp) - Date.parse(previo);
      if (pausa <= PAUSA_MAX_MS) trabajoMs += pausa;
      else pausasLargas.push({ desde: previo, min: Math.round(pausa / 60000) });
      previo = e.timestamp;
      actual.fin = e.timestamp;
      const t = textoUsuario(e);
      if (e.type === "user" && !e.isMeta && t && !e.toolUseResult && !t.startsWith("<") && !t.includes("cross-session-message"))
        intervenciones.push({ ts: e.timestamp, texto: t.slice(0, 200) });
    }
  }
  if (actual) tramos.push(actual);

  const dirSub = path.join(f.replace(/\.jsonl$/, ""), "subagents");
  const subagentes = [];
  if (fs.existsSync(dirSub)) {
    for (const s of fs.readdirSync(dirSub).filter((x) => x.endsWith(".jsonl"))) {
      const r = analizarArchivo(path.join(dirSub, s));
      subagentes.push({ archivo: s, porModelo: r.porModelo, herramientas: r.herramientas });
    }
  }
  return { archivo: path.basename(f), tramos, porModelo, herramientas, subagentes, intervenciones, trabajoMs, pausasLargas };
}

function sumar(dst, src) {
  for (const [m, u] of Object.entries(src)) {
    const k = (dst[m] ??= { llamadas: 0, input: 0, output: 0, thinking: 0, cw5m: 0, cw1h: 0, cr: 0 });
    for (const c of Object.keys(k)) k[c] += u[c];
  }
}

const RUTA_SALIDA = path.join(BENCH, "runs", "metricas.json");
const worktrees = process.argv.slice(2).length
  ? process.argv.slice(2)
  : Array.from({ length: 9 }, (_, i) => `festival-${i + 1}`);
// Acumulativo: al medir unas arquitecturas no se borran las ya medidas.
const salida = fs.existsSync(RUTA_SALIDA) ? JSON.parse(fs.readFileSync(RUTA_SALIDA, "utf8")) : { arquitecturas: {} };
salida.generado = new Date().toISOString();

for (const wt of worktrees) {
  const dir = path.join(PROYECTOS, WT_PREFIX + wt);
  if (!fs.existsSync(dir)) continue;
  const sesiones = fs.readdirSync(dir).filter((x) => x.endsWith(".jsonl"))
    .map((x) => path.join(dir, x))
    .filter((f) => leer(f).some(esMensajeEntrante))
    .map(analizarSesion);
  if (!sesiones.length) continue;

  const total = {};
  const herramientas = {};
  let nSub = 0, llamadas = 0, activoMs = 0, trabajoMs = 0;
  const inicios = [], fines = [];
  for (const s of sesiones) {
    sumar(total, s.porModelo);
    for (const sub of s.subagentes) {
      sumar(total, sub.porModelo);
      nSub++;
      for (const [h, n] of Object.entries(sub.herramientas)) herramientas[h] = (herramientas[h] ?? 0) + n;
    }
    for (const [h, n] of Object.entries(s.herramientas)) herramientas[h] = (herramientas[h] ?? 0) + n;
    for (const t of s.tramos) { inicios.push(t.inicio); fines.push(t.fin); activoMs += Date.parse(t.fin) - Date.parse(t.inicio); }
    trabajoMs += s.trabajoMs;
    llamadas += Object.values(s.porModelo).reduce((a, u) => a + u.llamadas, 0);
  }
  // Esperas por aprobación: pausas largas dentro de un tramo, unidas entre chats para no descontar dos veces.
  const esperas = sesiones.flatMap((s) => s.pausasLargas.map((p) => [Date.parse(p.desde), Date.parse(p.desde) + p.min * 60000]))
    .sort((a, b) => a[0] - b[0]);
  let esperaMs = 0, cursor = -Infinity;
  for (const [a, b] of esperas) {
    const desde = Math.max(a, cursor);
    if (b > desde) esperaMs += b - desde;
    cursor = Math.max(cursor, b);
  }
  const costos = Object.fromEntries(Object.entries(total).map(([m, u]) => [m, costo(m, u)]));
  inicios.sort(); fines.sort();
  salida.arquitecturas[wt] = {
    sesiones: sesiones.map((s) => ({ archivo: s.archivo, modelos: Object.keys(s.porModelo), tramos: s.tramos, subagentes: s.subagentes.length, intervenciones: s.intervenciones, trabajoMin: s.trabajoMs / 60000, pausasLargas: s.pausasLargas })),
    tokensPorModelo: total,
    costoUsdPorModelo: costos,
    costoUsdTotal: Object.values(costos).reduce((a, c) => a + (c ?? 0), 0),
    llamadasApiPrincipal: llamadas,
    subagentes: nSub,
    herramientas,
    inicio: inicios[0],
    fin: fines[fines.length - 1],
    muroMin: (Date.parse(fines[fines.length - 1]) - Date.parse(inicios[0])) / 60000,
    activoMin: activoMs / 60000,
    trabajoMin: trabajoMs / 60000,
    esperaAprobacionMin: esperaMs / 60000,
    // Tiempo para comparar arquitecturas: reloj menos esperas por aprobación manual.
    tiempoNetoMin: (Date.parse(fines[fines.length - 1]) - Date.parse(inicios[0]) - esperaMs) / 60000,
    intervencionesManuales: sesiones.reduce((a, s) => a + s.intervenciones.length, 0),
  };
}

fs.mkdirSync(path.dirname(RUTA_SALIDA), { recursive: true });
fs.writeFileSync(RUTA_SALIDA, JSON.stringify(salida, null, 2));
for (const wt of worktrees) {
  const a = salida.arquitecturas[wt];
  if (!a) continue;
  const tok = Object.values(a.tokensPorModelo).reduce((s, u) => s + u.input + u.output + u.cw5m + u.cw1h + u.cr, 0);
  console.log(`${wt}: $${a.costoUsdTotal.toFixed(2)} | ${(tok / 1e6).toFixed(2)}M tok | muro ${a.muroMin.toFixed(1)} min | trabajo ${a.trabajoMin.toFixed(1)} min | llamadas ${a.llamadasApiPrincipal} | subagentes ${a.subagentes} | intervenciones ${a.intervencionesManuales}`);
}
