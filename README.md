# Festival de Cine Niebla · sitio de la 3ª edición

Sitio web del festival: portada, programa filtrable, ficha de cada película y un
itinerario personal que se guarda en el navegador y se comparte con un enlace.

Hecho con Next.js (App Router) y TypeScript, sin backend ni servicios externos.
Toda la información sale de `data/programa.json`.

## Correr el sitio

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

Para producción:

```bash
npm run build
npm start
```

Lee `ENTREGA.md` para saber qué se construyó y cómo está organizado.
