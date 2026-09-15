# Festival de Cine Niebla · sitio de la 3ª edición

Sitio del festival (Puerto Bruma, 15 al 17 de octubre de 2026): portada, programa filtrable, ficha de cada película y "Mi itinerario" con avisos de choques, traslados y conversatorios, que se puede compartir con un link.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción (todo estático)
npm run start      # sirve el build
npm run lint
npm run verificar  # prueba la lógica de horarios e itinerario con los datos reales
```

Los datos salen de `data/programa.json` (no se modifica). Detalles de lo construido y las decisiones en [`ENTREGA.md`](ENTREGA.md).
