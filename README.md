# Festival de Cine Niebla · sitio de la 3ª edición

Sitio web del festival (15, 16 y 17 de octubre de 2026, Puerto Bruma): portada, programa filtrable,
ficha de cada película e itinerario personal con avisos de choques y traslados, compartible por link.

Hecho con Next.js (App Router) y TypeScript, CSS Modules y fuentes vía `next/font`. Sin backend:
todo corre en el navegador y los datos salen de `data/programa.json`.

## Correr

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Para producción: `npm run build` y luego `npm run start`.

## Más información

- `BRIEF.md`: lo que pidió el festival.
- `ENTREGA.md`: qué se construyó, decisiones y pendientes.
- `docs/DISENO.md`: guía de diseño y contrato técnico entre módulos.
