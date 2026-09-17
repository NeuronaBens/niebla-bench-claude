// Material para la evaluación a ciegas conjunta de las 8 arquitecturas terminadas.
// Solo escribe letras (A–H) en la salida: nada de puertos, carpetas ni modelos.
// Las capturas "completas" se toman bajando por la página tramo a tramo (lección de la ronda 1).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const SALIDA = path.join(RAIZ, "bench/runs/juez2");
const { mapa } = JSON.parse(fs.readFileSync(path.join(RAIZ, "bench/runs/ciego2.json"), "utf8"));

const sinF = (ids, sep) => ids.map((i) => i.slice(1)).join(sep);
// Cómo recibe cada sitio un itinerario (leído de su código; los jueces no lo ven).
const SITIOS = {
  "festival-1": { puerto: 4101, clave: "niebla:itinerario:v1", guardar: (ids) => JSON.stringify(ids), compartir: (ids) => `/itinerario?f=${sinF(ids, ".")}` },
  "festival-2": { puerto: 4102, clave: "niebla:itinerario:v1", guardar: (ids) => JSON.stringify({ v: 1, ids }), compartir: (ids) => `/itinerario/compartido?f=${sinF(ids, "-")}` },
  "festival-3": { puerto: 4103, clave: "niebla:itinerario:v1", guardar: (ids) => JSON.stringify(ids), compartir: (ids) => `/itinerario/compartido?f=${ids.join(".")}` },
  "festival-4": { puerto: 4104, clave: "festival-niebla:itinerario:v1", guardar: (ids) => JSON.stringify({ v: 1, ids }), compartir: (ids) => `/itinerario/compartido?f=${ids.join("-")}` },
  "festival-5": { puerto: 4105, clave: "niebla-itinerario-v1", guardar: (ids) => JSON.stringify(ids), compartir: (ids) => `/itinerario?f=${sinF(ids, ".")}` },
  "festival-6": { puerto: 4106, clave: "niebla:itinerario:v1", guardar: (ids) => JSON.stringify(ids), compartir: (ids) => `/itinerario?f=${ids.join(".")}` },
  "festival-8": { puerto: 4108, clave: "niebla:itinerario", guardar: (ids) => ids.join(","), compartir: (ids) => `/itinerario?f=${ids.join(",")}` },
  "festival-9": { puerto: 4109, clave: "niebla.itinerario.v1", guardar: (ids) => JSON.stringify({ version: 1, ids }), compartir: (ids) => `/itinerario/compartido?f=${sinF(ids, ".")}` },
};

// Casos de la rúbrica (sección 2.2). "esperado" es lo que debería comunicar el sitio.
const CASOS = [
  { id: "caso1-tope", ids: ["f02", "f04"], esperado: "Jueves. Caleta Sur (teatro 17:00–18:16) y Doce noches claras (muelle 18:15). Se TOPAN por 1 minuto." },
  { id: "caso2-traslado", ids: ["f03", "f05"], esperado: "Jueves. El último astillero (galpón 18:00–19:24, conversatorio 20 min) y La hora azul del puerto (teatro 19:30). Hay 6 min y el traslado es de 8: NO ALCANZA a llegar. También se pierde el conversatorio." },
  { id: "caso3-justo-misma-sala", ids: ["f14", "f16"], esperado: "Viernes. Madrugada en Paysandú (muelle 18:30–20:05) y Cortos II (muelle 20:05). Misma sala, 0 min de traslado: NO hay choque." },
  { id: "caso4-alcanza-justo", ids: ["f14", "f17"], esperado: "Viernes. Madrugada en Paysandú (muelle, termina 20:05) y Los que cuidan el faro (terraza 20:15). 10 min y el traslado es de 9: NO hay choque (alcanza justo). La terraza es al aire libre (nota de lluvia)." },
  { id: "caso5-conversatorio", ids: ["f13", "f16"], esperado: "Viernes. Sal de roca (teatro 18:00–19:52, conversatorio 25 min hasta 20:17) y Cortos II (muelle 20:05). 13 min y el traslado es de 12: NO hay choque, pero SÍ debe avisar que se pierde el conversatorio." },
  { id: "caso6-medianoche", ids: ["f20", "f22"], esperado: "Viernes noche. Horas muertas (muelle 22:00–23:32) y Marea roja (galpón 23:30, AGOTADA, termina 01:15 del sábado). Se TOPAN. Marea roja debe verse como agotada y terminando pasada la medianoche." },
];

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function abrir(ctx, url) {
  const page = await ctx.newPage();
  const errores = [];
  page.on("console", (m) => { if (m.type() === "error") errores.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errores.push(String(e).slice(0, 200)));
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await esperar(2500);
  return { page, errores };
}

const texto = (page) => page.evaluate(() => (document.querySelector("main") ?? document.body).innerText.replace(/\n{3,}/g, "\n\n").slice(0, 6000));
const desborde = (page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

async function capturaCompleta(browser, page, ruta, ancho, alto, maxAlto = 9000) {
  const info = await page.evaluate(() => {
    const doc = document.scrollingElement;
    if (doc.scrollHeight > doc.clientHeight + 5) return { interno: false, total: doc.scrollHeight };
    const cands = [...document.querySelectorAll("body *")].filter((e) => /(auto|scroll)/.test(getComputedStyle(e).overflowY) && e.scrollHeight > e.clientHeight + 50);
    cands.sort((a, b) => b.scrollHeight - a.scrollHeight);
    if (!cands.length) return { interno: false, total: doc.scrollHeight };
    cands[0].setAttribute("data-captura-scroller", "1");
    return { interno: true, total: cands[0].scrollHeight, visible: cands[0].clientHeight };
  });
  const paso = info.interno ? info.visible : alto;
  const total = Math.min(info.total, maxAlto);
  const tramos = [];
  for (let y = 0; y < total; y += paso) {
    await page.evaluate(([v, interno]) => {
      if (interno) document.querySelector("[data-captura-scroller]").scrollTop = v;
      else window.scrollTo(0, v);
    }, [y, info.interno]);
    await esperar(900);
    const real = await page.evaluate((interno) => (interno ? document.querySelector("[data-captura-scroller]").scrollTop : window.scrollY), info.interno);
    tramos.push({ b64: (await page.screenshot()).toString("base64"), recorte: Math.max(0, y - real) });
    if (real < y) break;
  }
  const lienzo = await browser.newPage({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1 });
  const html = tramos
    .map((t, i) => `<div style="height:${i === tramos.length - 1 ? alto - t.recorte : alto}px;overflow:hidden;position:relative"><img src="data:image/png;base64,${t.b64}" style="display:block;position:absolute;top:${-t.recorte}px;left:0;width:${ancho}px"></div>`)
    .join("");
  await lienzo.setContent(`<body style="margin:0;background:#fff">${html}</body>`, { waitUntil: "load" });
  await lienzo.screenshot({ path: ruta, fullPage: true });
  await lienzo.close();
}

const browser = await chromium.launch({ channel: "chrome", headless: true });
fs.mkdirSync(SALIDA, { recursive: true });

for (const [letra, wt] of Object.entries(mapa).sort()) {
  const s = SITIOS[wt];
  const base = `http://localhost:${s.puerto}`;
  const dir = path.join(SALIDA, letra);
  fs.mkdirSync(dir, { recursive: true });
  const datos = { sitio: letra, desbordeHorizontal360px: {}, erroresConsola: {}, animaciones: {}, casos: [], compartir: null };

  for (const [nombre, ruta] of [["portada", "/"], ["programa", "/programa"], ["ficha", "/pelicula/vidrio"], ["itinerario-vacio", "/itinerario"]]) {
    for (const [ancho, alto, movil] of [[360, 780, true], [1440, 900, false]]) {
      const ctx = await browser.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil, locale: "es-CL", timezoneId: "America/Santiago" });
      const { page, errores } = await abrir(ctx, base + ruta);
      await page.screenshot({ path: path.join(dir, `${nombre}-${ancho}-arriba.png`) });
      if (nombre !== "itinerario-vacio") await capturaCompleta(browser, page, path.join(dir, `${nombre}-${ancho}-completa.png`), ancho, alto);
      if (ancho === 360) datos.desbordeHorizontal360px[nombre] = await desborde(page);
      if (errores.length) datos.erroresConsola[`${nombre}-${ancho}`] = errores;
      await ctx.close();
    }
  }

  for (const [modo, rm] of [["normal", "no-preference"], ["reducido", "reduce"]]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: rm });
    const { page } = await abrir(ctx, base + "/");
    datos.animaciones[modo] = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
    if (modo === "reducido") await page.screenshot({ path: path.join(dir, "portada-1440-movimiento-reducido.png") });
    await ctx.close();
  }

  for (const caso of CASOS) {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, locale: "es-CL", timezoneId: "America/Santiago" });
    await ctx.addInitScript(([clave, valor]) => { if (!sessionStorage.getItem("__cargado")) { localStorage.setItem(clave, valor); sessionStorage.setItem("__cargado", "1"); } }, [s.clave, s.guardar(caso.ids)]);
    const { page, errores } = await abrir(ctx, base + "/itinerario");
    await capturaCompleta(browser, page, path.join(dir, `${caso.id}-360.png`), 360, 780);
    const t = await texto(page);
    await page.reload({ waitUntil: "networkidle" });
    await esperar(2000);
    const tRecarga = await texto(page);
    datos.casos.push({ caso: caso.id, funciones: caso.ids, esperado: caso.esperado, textoPantalla: t, persisteAlRecargar: tRecarga.length > 0 && tRecarga === t, errores });
    await ctx.close();
  }

  {
    const ids = ["f05", "f09", "f22"];
    const ctx = await browser.newContext({ viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, locale: "es-CL" });
    const { page, errores } = await abrir(ctx, base + s.compartir(ids));
    await capturaCompleta(browser, page, path.join(dir, "compartido-360.png"), 360, 780);
    datos.compartir = { funciones: ids, textoPantalla: await texto(page), errores };
    await ctx.close();
  }

  fs.writeFileSync(path.join(dir, "datos.json"), JSON.stringify(datos, null, 2));
  const vacios = datos.casos.filter((c) => c.textoPantalla.trim().length < 80).map((c) => c.caso);
  console.log(`${letra}: ${fs.readdirSync(dir).length} archivos · casos con poco texto: ${vacios.join(", ") || "ninguno"} · errores de consola: ${Object.keys(datos.erroresConsola).length}`);
}

await browser.close();
