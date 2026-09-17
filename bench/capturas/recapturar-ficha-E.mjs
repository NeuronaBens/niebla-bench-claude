// Corrige la ficha de la letra E: su sitio publica las fichas en /peliculas/<id> y la captura original usó /pelicula/<id> (404).
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
const RAIZ = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const DIR = path.join(RAIZ, "bench/runs/juez2/E");
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
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
const datos = JSON.parse(fs.readFileSync(path.join(DIR, "datos.json"), "utf8"));
for (const [ancho, alto, movil] of [[360, 780, true], [1440, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: ancho, height: alto }, deviceScaleFactor: 1, isMobile: movil, hasTouch: movil, locale: "es-CL", timezoneId: "America/Santiago" });
  const page = await ctx.newPage();
  const errores = [];
  page.on("console", (m) => { if (m.type() === "error") errores.push(m.text().slice(0, 200)); });
  const resp = await page.goto("http://localhost:4104/peliculas/vidrio", { waitUntil: "networkidle", timeout: 60000 });
  await esperar(2500);
  await page.screenshot({ path: path.join(DIR, `ficha-${ancho}-arriba.png`) });
  await capturaCompleta(browser, page, path.join(DIR, `ficha-${ancho}-completa.png`), ancho, alto);
  if (ancho === 360) datos.desbordeHorizontal360px.ficha = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (errores.length) datos.erroresConsola[`ficha-${ancho}`] = errores; else delete datos.erroresConsola[`ficha-${ancho}`];
  console.log(ancho, "status", resp.status(), "errores", errores.length);
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "datos.json"), JSON.stringify(datos, null, 2));
await browser.close();
