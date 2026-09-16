# Revisión de `docs/DETALLE.md`

Revisor: Fable. Ronda única. Cada hallazgo dice dónde está, por qué importa y qué cambiar. Sonnet corrige `docs/DETALLE.md` según esto; lo que no se menciona se da por aprobado.

Valoración general: el detalle es completo, las reglas de E5 están bien separadas (choques entre todas las parejas; traslado/conversatorio solo en consecutivas) y la sección 0.5 sobre horas resuelve bien el riesgo principal. Los hallazgos A son incompatibilidades con el brief o defectos que Haiku reproduciría tal cual; los B son decisiones que quedaron abiertas o imprecisas; los C son detalles.

---

## A. Bloqueantes (corregir sí o sí)

### A1. `/programa` renderizado por request contradice "sin backend" y deja el sitio no exportable
**Dónde:** 0.7, 0.8, H2.1, H2.5.
**Problema:** el brief exige "sin backend… el sitio tiene que funcionar entero en el navegador". Una ruta dinámica por request necesita un servidor Node ejecutándose en producción; no se puede servir como archivos estáticos. Además el único motivo para hacerla dinámica (leer "hoy" en el servidor para H2.5, que es P1) no lo justifica.
**Cambiar a:**
- Todas las rutas deben quedar prerenderizadas en `next build` (todas marcadas como estáticas en la salida del build; cero rutas por request). Añadir eso a la checklist de la sección 4. No es obligatorio activar `output: 'export'`, pero el sitio tiene que ser compatible con ello.
- Filtros por segmento de ruta, no por `searchParams` de servidor: `app/programa/page.tsx` (equivale al primer día, todas las secciones), `app/programa/[dia]/page.tsx` (3 rutas) y `app/programa/[dia]/[seccion]/page.tsx` (12 rutas), ambas con `generateStaticParams` y `dynamicParams = false`. Total 16 páginas estáticas, todas con HTML completo sin JS, el botón "atrás" funciona y la portada enlaza a `/programa/<primer día>/<seccion>` (o a la ruta que se decida para "cualquier día" de una sección; definirlo). Si se prefiere un solo archivo con `[[...filtro]]` opcional, también sirve; lo que no puede pasar es que la ruta lea `searchParams` en el servidor.
- "Hoy" (H2.5) pasa al cliente: un Client Component pequeño montado solo en `/programa` (sin día explícito) calcula la fecha de hoy en `America/Santiago` con `Intl.DateTimeFormat('en-CA', { timeZone })` y, si cae en un día del festival distinto del primero, hace `router.replace` a ese día. Sin JS se ve el primer día, que es el comportamiento base de H2.1.
- Estado vacío y "id de sección no reconocido" (H2.2): con `dynamicParams = false` un id inexistente da 404, lo cual es correcto; el `EstadoVacio` queda para el caso de combinación válida sin funciones.

### A2. El enlace "Volver al programa" con `?volver=` vuelve dinámicas las 24 fichas
**Dónde:** H3.1 ("Volver al programa"), H2.3.
**Problema:** si `app/pelicula/[id]/page.tsx` lee `searchParams` para reconstruir `volver`, Next marca la ruta como dinámica por request y se pierde `generateStaticParams` (mismo problema que A1). Es además una solución rebuscada.
**Cambiar a:** un Client Component `BotonVolver` que hace `router.back()` si hay historial (`window.history.length > 1`) y si no navega a `/programa`. Con A1 el día y la sección viven en la ruta, así que volver atrás conserva el filtro. Quitar la alternativa de `?volver=`.

### A3. Colisión de `id` en los gradientes SVG del sello
**Dónde:** 1.4.
**Problema:** cada `SelloPelicula` define `<linearGradient>`/`<radialGradient>` con `id`. Los ids de SVG son globales al documento; en el programa hay 10–17 sellos por página y en el sábado la misma película aparece dos veces (`temporada-seca` en `f27` y `f33`). Con ids repetidos el navegador usa el primero que encuentre: todos los sellos saldrían con el degradado del primero.
**Cambiar a:** especificar que todos los ids internos del SVG se prefijan con el id de la película (`grad-fondo-${id}`, `grad-luz-${id}`, etc.) y que un sello repetido en la misma página es aceptable porque su definición es idéntica.

### A4. Las insignias de sección no cumplen contraste con la paleta dada
**Dónde:** 1.1, 1.3.
**Problema:** con los colores de sección como fondo de insignia, ningún color de texto funciona para las cuatro: con texto oscuro (`#0b1420`) `competencia #3d6fa8` da ~3.6:1 y `nocturna #6a4d9c` ~2.8:1; con texto claro (`#eef3f6`) `panorama #3f9099` da ~3.7:1 y `costa #b3762f` ~3.6:1. H0.5 exige 4.5:1 en texto normal.
**Cambiar a:** una de estas dos, decidida en el documento: (a) la insignia no usa el color de sección como fondo: fondo `--color-fondo-elevado`, borde de 2 px y un punto/marca en el color de sección, texto en `--color-texto`; o (b) definir por sección dos variables (`--color-seccion-X` para acentos/bordes y `--color-seccion-X-texto` para texto sobre fondo oscuro, aclarado hasta ≥ 4.5:1, p. ej. competencia `#8fb8e8`, panorama `#7fcbd2`, nocturna `#b9a3e3`, costa `#e0a866`). Indicar también que `--color-aviso` no puede ser igual a `--color-acento` (los avisos se confundirían con los botones principales): usar un ámbar distinto o depender de forma + texto con el color de error solo para choques.

### A5. Los avisos no se anuncian a lectores de pantalla al agregar desde el programa o la ficha
**Dónde:** H0.5 (`AvisoInline` con `role="status"`), H4.3.
**Problema:** al agregar una función desde `/programa` o `/pelicula/[id]`, `ItinerarioVista` no está montada, así que ningún `role="status"` del itinerario existe. Además, insertar elementos nuevos con `role="status"` no garantiza el anuncio; las regiones vivas deben existir antes de cambiar su contenido.
**Cambiar a:** una única región viva global (`aria-live="polite"`, visualmente oculta) montada en `ItinerarioProvider`. `agregar(id)`/`quitar(id)` escriben ahí un mensaje: "Agregada «Vidrio» a tu itinerario. Se topa con «La hora azul del puerto»." / "Quitada «Vidrio». Tu itinerario tiene 2 funciones." El cálculo de choques para ese mensaje reutiliza `lib/itinerario-reglas.ts` (lo que ya hace H2.6). `AvisoInline` pasa a ser un elemento normal, sin `role="status"`.

### A6. Contradicción sobre si el cliente puede importar `lib/datos.ts`
**Dónde:** 0.6.
**Problema:** el texto dice a la vez que los accesores se pueden importar desde cliente, que no se debe importar el JSON en archivos `"use client"`, y que se pasa la lista completa como props desde el servidor. Pero `ItinerarioProvider` (filtrar ids inválidos), `lib/compartir.ts` (`decodificar`), `BotonItinerario` (H2.6 y el anuncio de A5) y `ItinerarioVista` necesitan `getFuncion` en el cliente. Haiku tendría que elegir y probablemente haría las dos cosas.
**Cambiar a:** decisión única: `lib/datos.ts` es un módulo compartido que se importa donde haga falta, incluido el cliente; el JSON pesa 17 KB, entra una sola vez en el bundle y no hay que pasar listas por props. Eliminar la frase sobre pasar "el listado completo como prop inicial".

---

## B. Importantes (decisiones abiertas o imprecisas que Haiku no debería resolver solo)

### B1. Fuentes sin nombre
**Dónde:** 0.3.
**Problema:** "a criterio de quien implemente" traslada a Haiku una decisión de identidad. El brief pide dirección visual concreta.
**Cambiar a:** nombrar dos familias disponibles en `next/font/google` con sus pesos. Sugerencia coherente con el lenguaje "niebla/puerto/noche": títulos `Fraunces` (variable, `axes: ['opsz']` opcional, pesos 600–800) y lectura `Atkinson Hyperlegible` (400/700) o `Source Sans 3`. Cualquier otra elección es válida si queda escrita con nombre y pesos.

### B2. Traslado solo entre estrictamente consecutivas deja pares sin evaluar
**Dónde:** E5, segundo alcance.
**Problema:** con A=`f03` (galpón 18:00–19:24), B=`f04` (muelle 18:15–19:51) y C=`f05` (teatro 19:30): A–B choque, B–C choque, y el par A→C (no alcanza, faltan 2 min) nunca se evalúa porque no son consecutivas. El usuario ve dos choques pero no que, si quita B, sigue sin llegar a C.
**Cambiar a:** para cada función A del día, B es la **primera función posterior con `inicioMin >= A.finMin`** (la siguiente que no se solapa); se evalúan traslado y conversatorio contra esa B. Si no existe, no hay aviso. Actualizar la fila de "tiempo disponible" de H4.1 para que se dibuje con el mismo criterio (entre A y esa B) y los pares en choque se muestren como choque, sin fila de traslado.

### B3. Parámetro de día: definir el slug
**Dónde:** 0.7, H2.1 ("`sabado` sin tilde").
**Problema:** `getDiasFestival()` da nombres con tilde y la URL los necesita sin tilde; queda implícito cómo se mapea.
**Cambiar a:** `getDiasFestival()` devuelve `{ indice, fecha: 'AAAA-MM-DD', nombreDia: 'sábado', slug: 'sabado', etiqueta: 'Sábado 17' }` con `slug` = nombre en minúsculas sin diacríticos (normalización `NFD` + quitar marcas), y la ruta usa `slug`. Alternativa igual de válida: usar la fecha ISO como segmento (`/programa/2026-10-17`); elegir una.

### B4. Aritmética de calendario reinventada
**Dónde:** 0.5 puntos 2, 6 y 8.
**Problema:** implementar día juliano, Zeller y la inversa a mano es superficie de bugs innecesaria. `Date.UTC(anio, mes-1, dia)` y `getUTCDay()`/`getUTC*()` son independientes de la zona horaria del entorno y cumplen exactamente el objetivo de 0.5 (nunca interpretar el string en hora local).
**Cambiar a:** permitir explícitamente `Date.UTC` y los métodos `getUTC*` para número de día, día de la semana y reconstrucción de fecha; mantener la prohibición de `new Date('AAAA-MM-DDTHH:MM')`, `getDay()`, `getHours()` y `toLocale*` sin `timeZone` fija.

### B5. Anatomía concreta de la tarjeta de función en móvil y de la grilla en escritorio
**Dónde:** H2.3, H2.4, 1.2.
**Problema:** H2.3 exige 3 tarjetas completas en 360×640 con barra de filtros fija y navegación inferior; eso deja ~150 px por tarjeta y el detalle no dice cómo entra todo. H2.4 dice "por sala o por franja" sin decidir.
**Cambiar a:** definir la tarjeta móvil en tres filas: (1) `HH:MM–HH:MM` en tabular-nums y peso alto + nombre corto de sala a la derecha; (2) sello 48 px + título (máx. 2 líneas) + insignia de sección; (3) marcas (Agotada / Aire libre / Conversatorio N min) y el `BotonItinerario` compacto (texto corto "Agregar"/"Quitar" con `aria-label` completo). La `nota` de la función se muestra en la ficha y en el itinerario; en el programa basta una marca "Con nota" o mostrarla en una línea extra solo si existe. En escritorio (≥ 1024 px): grilla de 4 columnas, una por sala en el orden del JSON, con las tarjetas ordenadas por hora dentro de cada columna y el mismo componente.

### B6. La navegación inferior en móvil no puede ser `position: sticky`
**Dónde:** H0.3.
**Problema:** `sticky` en el borde inferior solo funciona si el elemento está al final del flujo; en un layout con `<main>` largo no queda fijo.
**Cambiar a:** `position: fixed; bottom: 0` en móvil con `padding-bottom: env(safe-area-inset-bottom)` y `padding-bottom` equivalente en `<main>`; `position: sticky; top: 0` en escritorio.

### B7. Vaciar: elegir un mecanismo
**Dónde:** H4.1.
**Cambiar a:** una sola opción. Recomendada: un `<dialog>` nativo con "Vaciar" / "Cancelar" (accesible por teclado y sin librerías).

### B8. "Copiar a mi itinerario": etiqueta con el número real
**Dónde:** H6.2.
**Cambiar a:** el botón calcula N = ids válidos del link que no están en el propio y se etiqueta "Sumar N funciones a mi itinerario" (o "Ya tienes todas estas funciones" deshabilitado si N = 0). Así se informa que se suman sin diálogo adicional.

### B9. Fondo ambiental de la portada: concretar
**Dónde:** 1.5, H1.1.
**Cambiar a:** describir la composición: SVG a sangre completa detrás del bloque de título, 5–6 capas de niebla con deriva horizontal lenta (40–60 s, alternate) y un disco de luz de faro con un halo que respira (opacidad 0.6→0.8, 8 s); una franja superpuesta oscura (gradiente) bajo el texto para garantizar contraste; todo estático con `prefers-reduced-motion`.

---

## C. Menores

### C1. Componentes "Server" usados dentro de cliente
`AvisoInline`, `SelloPelicula` y `EstadoVacio` se renderizan dentro de `ItinerarioVista` (cliente); sin `"use client"` pasan a ser componentes de cliente ahí. Etiquetarlos como "compartidos (sin APIs de servidor)" en 0.4 para evitar que Haiku los marque `server-only`.

### C2. `useLayoutEffect` en el provider
Está bien en React 19 (ya no avisa en SSR). Alternativa igualmente válida: `useSyncExternalStore` con `getServerSnapshot` que devuelve la lista vacía. Dejar constancia de que cualquiera de las dos vale, y de que el primer render de cliente debe ser idéntico al de servidor.

### C3. Metadatos faltantes
`app/itinerario/compartido/page.tsx` y `app/not-found.tsx` sin `metadata` en la lista de H0.8; añadirlos.

### C4. Formato de precio
`Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })` produce `$4.000` en Node y navegadores; indicarlo para que no se formatee a mano. Se renderiza en build (portada estática), sin riesgo de diferencia servidor/cliente.

### C5. Observación 2 al backlog (H3.4)
Aceptada: anterior/siguiente dentro de la sección, en el orden del JSON, sin wraparound (extremos deshabilitados).

---

## Qué debe entregar la corrección

`docs/DETALLE.md` actualizado con A1–A6 y B1–B9 resueltos y C1–C5 incorporados, sin secciones nuevas que contradigan el backlog. Sección 0.8 (tabla de rutas) y sección 4 (checklist) reflejando que todas las rutas son estáticas.
