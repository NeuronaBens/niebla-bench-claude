# Festival de Cine Niebla — sitio web

Sitio de la 3ª edición del Festival de Cine Niebla (Puerto Bruma, Chile), hecho con Next.js
(App Router), TypeScript y CSS Modules. Ver `docs/IMPLEMENTACION.md` para el detalle de qué
se implementó.

## Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Build de producción

```bash
npm run build
npm run lint
```

## Datos

Toda la información del festival vive en `data/programa.json` y no se modifica. El resto del
sitio la lee a través de `lib/programa.ts`.
