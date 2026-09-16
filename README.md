# Festival de Cine Niebla

Sitio web de la 3ª edición del Festival de Cine Niebla, en Puerto Bruma, Chile (15, 16 y 17 de octubre de 2026): portada, programa con filtros por día y sección, ficha de cada película, e itinerario personal con avisos de choque, traslado y conversatorio, compartible por link.

Construido con Next.js (App Router) y TypeScript, sin backend ni librerías de componentes; toda la información sale de `data/programa.json`.

## Cómo correrlo

```bash
npm install
npm run dev      # http://localhost:3000
```

Para producción:

```bash
npm run build
npm start
```

Ver [`ENTREGA.md`](./ENTREGA.md) para el detalle de qué se construyó, las decisiones de diseño e implementación, y los pendientes.
