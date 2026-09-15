# Festival de Cine Niebla

Sitio web de la 3ª edición del Festival de Cine Niebla, en Puerto Bruma, Chile: portada, programa filtrable, ficha de cada película y un itinerario personal que avisa de topes, traslados a pie y conversatorios, con opción de compartirlo por link.

Construido con Next.js (App Router) y TypeScript, sin backend ni dependencias externas: todo corre en el navegador y el itinerario se guarda en `localStorage`.

## Comandos

```bash
npm run dev     # servidor de desarrollo
npm run build   # build de producción
npm start       # sirve el build de producción
npm test        # tests de la lógica pura (lib/)
npm run lint    # ESLint
```

Los datos del festival están en `data/programa.json` y no se modifican: `lib/programa.ts` es el único módulo que los importa.
