/* eslint-disable @typescript-eslint/no-require-imports -- script de Node en CommonJS */
/**
 * Verificación de la lógica de horarios e itinerario contra los datos reales.
 * Uso: npm run verificar
 *
 * Transpila lib/programa.ts y lib/itinerario.ts con el compilador de TypeScript
 * (ya instalado) a una carpeta temporal y corre casos con node:assert.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const assert = require("node:assert/strict");
const ts = require("typescript");

const raiz = path.resolve(__dirname, "..");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "niebla-"));
const json = path.join(raiz, "data", "programa.json").split(path.sep).join("/");

for (const nombre of ["programa", "itinerario"]) {
  let src = fs.readFileSync(path.join(raiz, "lib", `${nombre}.ts`), "utf8");
  src = src.replace(/@\/data\/programa\.json/g, json).replace(/@\/lib\//g, "./");
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  });
  fs.writeFileSync(path.join(tmp, `${nombre}.js`), outputText);
}

const P = require(path.join(tmp, "programa.js"));
const I = require(path.join(tmp, "itinerario.js"));

let casos = 0;
function caso(nombre, fn) {
  fn();
  casos++;
  console.log(`  ok  ${nombre}`);
}
const tipos = (ids) => I.analizarItinerario(ids).avisos.map((a) => a.tipo).sort();

console.log("Datos");
caso("3 días, 24 películas, 39 funciones, 4 salas", () => {
  assert.equal(P.dias.length, 3);
  assert.deepEqual(P.dias.map((d) => d.nombre), ["jueves", "viernes", "sábado"]);
  assert.equal(P.peliculas.length, 24);
  assert.equal(P.funciones.length, 39);
  assert.equal(P.salas.length, 4);
});
caso("toda película tiene al menos una función", () => {
  for (const p of P.peliculas) assert.ok(P.funcionesDePelicula(p.id).length > 0, p.id);
});
caso("fin = inicio + duración, cruzando medianoche", () => {
  const f22 = P.funcionPorId.get("f22"); // Marea roja, vie 23:30, 105 min
  assert.equal(f22.horaInicio, "23:30");
  assert.equal(f22.horaFin, "01:15");
  assert.equal(f22.terminaDiaSiguiente, true);
  assert.equal(f22.dia.nombre, "viernes");
  assert.equal(P.textoFin(f22), "termina 01:15 del sábado");
  assert.equal(P.textoFin(P.funcionPorId.get("f39")), "termina 01:07 del domingo");
  assert.deepEqual(
    P.funciones.filter((f) => f.terminaDiaSiguiente).map((f) => f.id).sort(),
    ["f09", "f10", "f21", "f22", "f39"],
  );
});
caso("traslados simétricos e ignoran 'descripcion'", () => {
  assert.equal(P.traslado("galpon", "teatro"), 8);
  assert.equal(P.traslado("teatro", "galpon"), 8);
  assert.equal(P.traslado("muelle", "muelle"), 0);
});
caso("precio: aire libre liberado, general $4.000", () => {
  assert.equal(P.formatoPrecio(P.funcionPorId.get("f07").precio), "Entrada liberada");
  assert.equal(P.formatoPrecio(P.funcionPorId.get("f05").precio), "$4.000");
});

console.log("Itinerario");
caso("f03 -> f05: no alcanza caminando (faltan 2 min)", () => {
  const a = I.analizarItinerario(["f05", "f03"]);
  assert.deepEqual(a.avisos.map((x) => [x.tipo, x.minutos]), [["traslado", 2]]);
  assert.equal(a.tramos[0].estado, "no-alcanza");
});
caso("f03 -> f06: holgado, sin avisos", () => assert.deepEqual(tipos(["f03", "f06"]), []));
caso("f14 -> f16: misma sala, termina justo cuando empieza la otra, no es choque", () => {
  const a = I.analizarItinerario(["f14", "f16"]);
  assert.deepEqual(a.avisos, []);
  assert.equal(a.tramos[0].estado, "justo");
});
caso("f13 -> f16: llega, pero pierde el conversatorio (no es choque)", () => {
  const a = I.analizarItinerario(["f13", "f16"]);
  assert.deepEqual(tipos(["f13", "f16"]), ["conversatorio"]);
  assert.equal(a.tramos[0].pierdeConversatorio, true);
});
caso("f25 + f26 se topan; f25 -> f27 no alcanza por 1 min", () => {
  const a = I.analizarItinerario(["f25", "f26"]);
  assert.deepEqual(a.avisos.map((x) => [x.tipo, x.minutos]), [["choque", 23]]);
  const b = I.analizarItinerario(["f25", "f27"]);
  assert.deepEqual(b.avisos.map((x) => [x.tipo, x.minutos]), [["traslado", 1]]);
});
caso("f21 + f22 se topan pasada la medianoche; f22 agotada", () => {
  assert.deepEqual(tipos(["f21", "f22"]), ["agotada", "choque"]);
});
caso("función que termina 01:15 no choca con la del día siguiente a mediodía", () => {
  assert.deepEqual(tipos(["f22", "f23"]), ["agotada"]);
});
caso("f31 (conversatorio) -> f34: pierde 16 min del conversatorio", () => {
  const a = I.analizarItinerario(["f31", "f34"]);
  const c = a.avisos.find((x) => x.tipo === "conversatorio");
  assert.equal(c.minutos, 16);
});
caso("ids repetidos e inválidos se ignoran", () => {
  const a = I.analizarItinerario(["zz", "f01", "f01"]);
  assert.deepEqual(a.funciones.map((f) => f.id), ["f01"]);
  assert.deepEqual(a.idsInvalidos, ["zz"]);
});

console.log("Compartir");
caso("codifica ordenado por hora y decodifica", () => {
  const q = I.codificarItinerario(["f13", "f03", "nada"], "Camila");
  assert.equal(q, "f=f03.f13&n=Camila");
  const d = I.decodificarItinerario(new URLSearchParams(q));
  assert.deepEqual(d, { ids: ["f03", "f13"], idsInvalidos: [], nombre: "Camila" });
});
caso("decodifica links malformados sin romperse", () => {
  const d = I.decodificarItinerario(new URLSearchParams("f=f13,,f03.x9.f03"));
  assert.deepEqual(d.ids, ["f13", "f03"]);
  assert.deepEqual(d.idsInvalidos, ["x9"]);
  assert.deepEqual(I.decodificarItinerario(new URLSearchParams("")).ids, []);
});

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`\n${casos} casos OK`);
