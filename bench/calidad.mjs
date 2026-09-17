// Métricas de producto de cada worktree: build, lint, tamaño del código, dependencias y
// restricciones del brief que se pueden verificar automáticamente.
// Uso: node bench/calidad.mjs festival-1 [festival-2 ...]  → escribe bench/runs/calidad.json (acumulativo)
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const BENCH = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const RAIZ = path.dirname(BENCH);
const WT = path.join(path.dirname(RAIZ), "ClaudeModelFusions-wt");
const SALIDA = path.join(BENCH, "runs", "calidad.json");

const IGNORAR = new Set(["node_modules", ".next", ".git", ".handoff", "public", "data", "docs"]);
const EXT_CODIGO = /\.(tsx?|jsx?|mjs|css|scss)$/;
const LIBS_COMPONENTES = ["@radix-ui", "@mui", "@chakra-ui", "@mantine", "daisyui", "@headlessui", "antd", "@nextui-org", "@heroui", "react-bootstrap", "shadcn", "@ark-ui", "react-aria-components"];
const LIBS_ANIMACION = ["framer-motion", "motion", "gsap", "@react-spring/web", "react-spring", "animejs", "lottie-react", "@formkit/auto-animate"];

const sh = (cmd, cwd) => {
  const t = Date.now();
  const r = spawnSync(cmd, { cwd, shell: true, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  return { codigo: r.status, ms: Date.now() - t, salida: (r.stdout ?? "") + (r.stderr ?? "") };
};

function archivos(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORAR.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) archivos(p, acc);
    else if (EXT_CODIGO.test(e.name) && !/next-env\.d\.ts$|eslint\.config|next\.config/.test(e.name)) acc.push(p);
  }
  return acc;
}

function hallazgos(codigo, regex) {
  const out = [];
  for (const [f, txt] of codigo) {
    txt.split("\n").forEach((l, i) => { if (regex.test(l)) out.push(`${f}:${i + 1}: ${l.trim().slice(0, 120)}`); });
  }
  return out;
}

const previos = fs.existsSync(SALIDA) ? JSON.parse(fs.readFileSync(SALIDA, "utf8")) : {};
const base = JSON.parse(spawnSync("git", ["show", "base:package.json"], { cwd: RAIZ, encoding: "utf8" }).stdout);

for (const nombre of process.argv.slice(2)) {
  const dir = path.join(WT, nombre);
  const pkg = JSON.parse(fs.readFileSync(path.join(dir, "package.json"), "utf8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const depsBase = { ...base.dependencies, ...base.devDependencies };
  const agregadas = Object.keys(deps).filter((d) => !(d in depsBase));

  const files = archivos(dir);
  const codigo = files.map((f) => [path.relative(dir, f).replaceAll("\\", "/"), fs.readFileSync(f, "utf8")]);
  const lineas = codigo.reduce((a, [, t]) => a + t.split("\n").filter((l) => l.trim()).length, 0);

  console.log(`[${nombre}] build...`);
  const build = sh("npm run build", dir);
  console.log(`[${nombre}] lint...`);
  const lint = sh("npx eslint . -f json", dir);
  let lintErr = null, lintWarn = null;
  try {
    const j = JSON.parse(lint.salida.slice(lint.salida.indexOf("[")));
    lintErr = j.reduce((a, f) => a + f.errorCount, 0);
    lintWarn = j.reduce((a, f) => a + f.warningCount, 0);
  } catch { /* lint no produjo JSON */ }

  const textoUi = codigo.filter(([f]) => /\.(tsx|jsx)$/.test(f));
  previos[nombre] = {
    fecha: new Date().toISOString(),
    build: { ok: build.codigo === 0, segundos: Math.round(build.ms / 1000), cola: build.codigo === 0 ? undefined : build.salida.slice(-3000) },
    lint: { errores: lintErr, warnings: lintWarn },
    codigo: { archivos: files.length, lineasNoVacias: lineas, porArchivo: codigo.map(([f, t]) => [f, t.split("\n").length]) },
    dependenciasAgregadas: agregadas,
    restricciones: {
      // git diff ignora la conversión CRLF de Windows (comparar hashes da falsos positivos)
      datosSinModificar: spawnSync("git", ["diff", "--quiet", "base", "--", "data/programa.json"], { cwd: dir }).status === 0,
      librasComponentes: agregadas.filter((d) => LIBS_COMPONENTES.some((l) => d === l || d.startsWith(l + "/") || d.startsWith(l))),
      librasAnimacion: agregadas.filter((d) => LIBS_ANIMACION.includes(d)),
      tailwind: agregadas.some((d) => d.includes("tailwind")),
      emojis: hallazgos(textoUi, /\p{Extended_Pictographic}/u).slice(0, 20),
      puntajes: hallazgos(textoUi, /estrellas?\b|puntaje|calificaci|rating|ranking|★|☆/i).slice(0, 20),
      reducedMotion: hallazgos(codigo, /prefers-reduced-motion|useReducedMotion|reducedMotion/i).length,
      imagenesExternas: hallazgos(codigo, /https?:\/\/[^"'`\s)]+\.(png|jpe?g|webp|gif|avif)|remotePatterns|images\.unsplash|picsum/i).slice(0, 20),
      fetchExterno: hallazgos(codigo, /fetch\(\s*["'`]https?:/i).slice(0, 20),
      nextFont: hallazgos(codigo, /from ["']next\/font/).length,
    },
    entrega: fs.existsSync(path.join(dir, "ENTREGA.md")),
  };
  console.log(`[${nombre}] build ${previos[nombre].build.ok ? "OK" : "FALLA"} · lint ${lintErr}E/${lintWarn}W · ${lineas} líneas en ${files.length} archivos · deps +${agregadas.join(", ") || "ninguna"}`);
}

fs.mkdirSync(path.dirname(SALIDA), { recursive: true });
fs.writeFileSync(SALIDA, JSON.stringify(previos, null, 2));
