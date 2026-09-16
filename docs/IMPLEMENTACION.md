# Implementación: sitio del Festival de Cine Niebla

Resumen de qué se hizo, qué quedó pendiente y por qué, respecto de `docs/BACKLOG.md` y
`docs/DETALLE.md`.

## Historias terminadas

**Épica 0 (base):** H-0.1 a H-0.9 completas. Tiempo trabajado en minutos absolutos del
festival (`lib/tiempo.ts`), sin `Date()` ni `toLocale*` sobre los datos del JSON (solo
`Date.UTC` para restar fechas y saber el día de semana, según lo permitido). Verificado con
un script suelto (`scratchpad`) que compara los 13 casos obligatorios de
`docs/DETALLE.md` §8 y los conteos de `docs/BACKLOG.md`: todos coinciden exactamente
(incluidos los 116 caracteres del link con las 39 funciones).

**Épica 1 (portada):** H-1.1 a H-1.6 completas: hero animado con niebla/faro/haz de luz,
"Qué es", los tres días con hitos, las 4 secciones con miniaturas de afiche, esquema de
salas + tabla accesible, e info de entradas.

**Épica 2 (programa):** H-2.1 a H-2.5 completas: lista agrupada por día, filtros por día y
sección con estado en la URL, contador vivo, estado vacío, marcado desde el programa con
aviso inmediato. El `Suspense` alrededor de `ProgramaInteractivo` usa como fallback la
misma lista completa sin filtrar (`ListaFunciones`), así que sin JavaScript se ve el
programa entero.

**Épica 3 (ficha):** H-3.1 a H-3.3 completas: las 24 rutas estáticas, afiche grande, ficha
técnica, sinopsis completa, funciones ordenadas cronológicamente con boleto y precio.

**Épica 4 (itinerario):** H-4.1 a H-4.10 completas: almacén en `localStorage` con
`useSyncExternalStore` (sincroniza entre pestañas vía el evento `storage`), avisos de
choque/traslado/conversatorio/repetida/agotada/aire libre, quitar y vaciar con deshacer,
compartir por link (con `navigator.share` o portapapeles, y campo de respaldo si falla
copiar) y la vista del itinerario compartido con "sumar" / "reemplazar".

## Historias P2 no terminadas

- **H-2.6 (vista de grilla por salas en escritorio):** no implementada. La lista por día ya
  cumple los P0/P1 de programa; la grilla horaria por salas quedó fuera por tiempo.
- **H-2.7 ("ahora" durante el festival):** no implementada. `lib/tiempo.ts` ya expone
  `ahoraEnSantiago`, listo para usarse si se retoma.
- **H-4.11 (impresión):** parcial. Se ocultan navegación, pie, grano y los botones de acción
  (`@media print` en `globals.css` y `app/itinerario/itinerario.module.css`), pero no se
  aplicó el estilo específico de boleto con borde de 1 px negro sin perforado.

## H-3.4 y H-4.6 (P2 sí resueltos)

- "Más de la sección" y "Volver al programa" (con el filtro recordado en `sessionStorage`)
  están implementados en la ficha.
- El aviso de lluvia (Terraza Faro → Galpón 7) está implementado en
  `lib/itinerario/avisos.ts`.

## Desvíos respecto de `docs/DETALLE.md`

- El resumen compacto de filtros que aparece al hacer scroll en el programa móvil (la barra
  fija mostrando "Nocturna, Costa" + botón "Cambiar") no se implementó; en su lugar, solo la
  barra de día queda fija (`position: sticky`) y la fila de secciones se desplaza con la
  página. Cumple igual el criterio de no tapar más del 25 % de una pantalla de 640 px.
- El choque visual "los boletos se superponen 12 px con desfase de 16 px" se simplificó a
  una caja de aviso "SE TOPAN" entre los dos boletos, sin el desplazamiento y solape
  pixel a pixel descrito.
- El motivo de fondo grande de cada sección en la portada (`SeccionesFestival`) se resolvió
  con patrones CSS (`radial-gradient`/`repeating-linear-gradient`) en vez de reutilizar el
  generador SVG de `AfichePelicula`, para no acoplar ambos componentes.
- El esquema de salas ajusta la posición de cada etiqueta de minutos a una fracción del
  tramo (no siempre el punto medio) para que las dos diagonales que se cruzan cerca del
  centro no superpongan sus números; la tabla accesible siempre muestra el valor exacto.

## Build y lint

```
npm run build
```
Termina sin errores. Rutas: `/`, `/programa`, `/itinerario`, `/itinerario/compartido` y las
24 rutas de `/pelicula/[id]` aparecen estáticas (○) o SSG (●) en la salida de `next build`;
ninguna aparece dinámica.

```
npm run lint
```
Sin errores ni advertencias.

`git diff --stat -- data/` no muestra cambios.

## Verificación manual

Recorrido en `next start` (build de producción) a 360×640 y a 1024/1440 de ancho: sin
scroll horizontal, sin errores de hidratación en consola, filtros de programa y marcado de
funciones probados en vivo (incluida la detección de choque al agregar desde la ficha),
itinerario sembrado con f07/f09/f10/f13/f16/f38/f39 mostrando exactamente los avisos
esperados por `docs/DETALLE.md` §8, y el caso `?f=05.99.xx.05` mostrando solo f05 más el
aviso de funciones inexistentes.
