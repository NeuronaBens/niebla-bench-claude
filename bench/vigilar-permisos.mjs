// Detecta chats trabados esperando aprobación en las arquitecturas de la segunda ronda.
// Un chat está "trabado" si su última entrada es una llamada a herramienta sin resultado y el transcript
// no cambia hace más de 3 minutos (lo típico cuando espera "Permitir una vez"). Termina en cuanto encuentra
// alguno (para despertar al orquestador) o cuando las 5 arquitecturas tienen su .handoff/fin.done.
// Uso: node bench/vigilar-permisos.mjs [minutosUmbral]
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const UMBRAL_MS = Number(process.argv[2] ?? 3) * 60 * 1000;
// Transcripts ya reportados (argumentos 3 en adelante): se ignoran hasta que cambien.
const YA_REPORTADOS = new Map();
const WTS = ["festival-4", "festival-6", "festival-7", "festival-8", "festival-9"];
const P = path.join(os.homedir(), ".claude", "projects");
const BENCH = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
// Los worktrees viven junto al repo; Claude Code guarda sus transcripts con la ruta codificada ("-" en vez de ":", "\", "/", "_").
const WT_DIR = path.join(path.dirname(path.dirname(BENCH)), "ClaudeModelFusions-wt");
const PREFIJO = path.join(WT_DIR, "x").slice(0, -1).replace(/[:\\/_]/g, "-");
const leer = (f) => fs.readFileSync(f, "utf8").split("\n").filter(Boolean).flatMap((l) => { try { return [JSON.parse(l)]; } catch { return []; } });

function titulo(E) {
  const t = E.filter((e) => e.type === "custom-title").pop();
  return t?.customTitle ?? t?.title ?? "(sin título)";
}

for (;;) {
  const trabados = [];
  for (const wt of WTS) {
    const dir = path.join(P, PREFIJO + wt);
    if (!fs.existsSync(dir)) continue;
    for (const x of fs.readdirSync(dir).filter((x) => x.endsWith(".jsonl"))) {
      const f = path.join(dir, x);
      const mtime = fs.statSync(f).mtimeMs;
      if (process.argv.slice(3).includes(x)) {
        if (!YA_REPORTADOS.has(x)) YA_REPORTADOS.set(x, mtime);
        if (YA_REPORTADOS.get(x) === mtime) continue;
      }
      const quieto = Date.now() - mtime;
      if (quieto < UMBRAL_MS || quieto > 6 * 60 * 60 * 1000) continue;
      const E = leer(f).filter((e) => e.type === "assistant" || e.type === "user");
      const ultimo = E[E.length - 1];
      if (!ultimo || ultimo.type !== "assistant") continue;
      const bloques = ultimo.message?.content ?? [];
      const uso = bloques.find((b) => b.type === "tool_use");
      if (!uso) continue;
      // Esperas en segundo plano (run_in_background) no son bloqueos: su resultado llega al instante.
      trabados.push(`${wt} · ${titulo(leer(f))} · ${uso.name} · sin cambios hace ${Math.round(quieto / 60000)} min · ${x}`);
    }
  }
  if (trabados.length) { console.log("TRABADOS:\n" + trabados.join("\n")); process.exit(0); }
  if (WTS.every((w) => fs.existsSync(path.join(WT_DIR, w, ".handoff", "fin.done")))) { console.log("Las 5 arquitecturas terminaron."); process.exit(0); }
  await new Promise((r) => setTimeout(r, 30000));
}
