# Entrega: sitio del Festival de Cine Niebla

## 1. Qué se construyó, por página

| Ruta | Contenido |
|---|---|
| `/` | Portada: escena del faro (SVG + niebla animada), "qué es" con las cifras del festival, las 4 secciones (con enlace filtrado al programa), momentos especiales (inaugural y premiación), horarios por día, dónde es (esquema de salas + lista + tabla de traslados), información de entradas y cierre. |
| `/programa` | Las 39 funciones con filtro por día y por sección, reflejado en la URL. Lista agrupada por día y franja horaria en móvil; grilla por hora y sala en escritorio. El fallback de `Suspense` es el programa completo sin filtros, servido como HTML estático. |
| `/peliculas/[id]` | Ficha de cada una de las 24 películas (generadas en build): datos, marca visual propia y todas sus funciones, cada una con su propio botón de itinerario y avisos. |
| `/itinerario` | El itinerario propio: estado vacío, esqueleto de carga, y el recorrido por día con paradas, tramos, avisos de choque/traslado/conversatorio, resumen del día y acciones (compartir, copiar link, vaciar). |
| `/itinerario/compartido` | Lee `?f=` de la URL y muestra el itinerario de otra persona con los mismos avisos, sin tocar el propio, con la opción de copiarlo (reemplazar o sumar). |
| `/peliculas/no-existe` (404) | Página "No encontramos esa página" en español, con enlaces al programa y a la portada. |

## 2. Cómo correrlo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm start        # sirve el build de producción
npm run lint     # ESLint
```

`npm run build` descarga las fuentes de Google (`next/font/google`) durante el build, así que la primera vez requiere red. Una vez descargadas quedan cacheadas localmente; el sitio no hace ninguna petición externa en tiempo de ejecución (solo `mailto:` y el enlace a Instagram, que es un enlace normal, no un recurso cargado).

## 3. Decisiones importantes

- **Identidad visual:** tema oscuro único ("el puerto de noche con niebla, visto desde el faro"), con Fraunces para titulares, Big Shoulders para horas y rótulos, e IBM Plex Sans para el cuerpo. Paleta de acentos: ámbar del faro (`--faro`), y colores separados para choque, traslado, conversatorio y holgura, para que el color nunca sea el único portador del mensaje (siempre va con ícono y texto). En la portada, un velo (degradado hacia `--noche`) detrás del bloque de texto asegura que las fechas y el resto de la información crítica se lean con buen contraste sin importar dónde caiga la escena del faro debajo.
- **Representación de películas sin afiches:** `lib/marca.ts` genera una marca SVG determinista por película, con un hash FNV-1a de 32 bits sobre el id de la película que alimenta un generador mulberry32. El motivo (disco y olas en Competencia, círculos concéntricos en Panorama, sierra dentada en Bruma Nocturna, retícula de red en Costa) hace reconocible la sección de un vistazo; la misma película siempre se ve igual en programa, ficha e itinerario.
- **Reglas de choque, traslado y conversatorio** (`lib/itinerario/reglas.ts`): choque si `A.fin > B.inicio` (para todos los pares); entre funciones consecutivas del itinerario ordenado por inicio, se evalúa primero el choque, luego si se alcanza a la película (`fin(A) + traslado <= inicio(B)`), y solo si eso se cumple, si se alcanza también al conversatorio completo. La precedencia **choque > traslado > conversatorio** garantiza que nunca se muestren dos avisos para el mismo par. Toda la tabla de casos borde del backlog (incluida la corrección de `f03+f05` de `docs/DETALLE.md` sección 0) se verificó con un script antes de construir la interfaz, y de nuevo después de la ronda de correcciones.
- **Fechas y horas:** nunca se usa la zona horaria del navegador. `lib/tiempo.ts` convierte los textos `AAAA-MM-DDTHH:MM` del JSON a "minutos flotantes" con `Date.UTC` como calendario neutro; es la única parte del código que usa `Date`. Así el servidor y cualquier navegador muestran siempre el mismo texto, sin errores de hidratación.
- **Formato del link compartido:** `/itinerario/compartido?f=f05-f06-f10`, ids en orden canónico (por inicio) separados por guion. Se toleran otros separadores (`,`, `.`, `+`, espacios) y como máximo 100 tokens, hasta 1000 caracteres.
- **Persistencia:** clave de `localStorage` `festival-niebla:itinerario:v1`, valor `{"v":1,"ids":[...]}`, sincronizada entre pestañas con el evento `storage` y expuesta a React con `useSyncExternalStore` (snapshot de servidor `{listo:false}` para no mostrar un "0" que después cambia). Si `localStorage` no está disponible (modo privado restringido), el itinerario sigue funcionando en memoria durante la sesión y se avisa de forma discreta.
- **Filtros en la URL:** `lib/filtros.ts` + `window.history.replaceState` (integrado por Next.js con `useSearchParams`, sin recargar ni pedir nada a la red).

## 4. Hallazgos de la revisión (`docs/REVIEW.md`) corregidos

- **P0 #1** — Portada a 360 px: las fechas y "3ª edición" quedaban tapadas por la torre del faro. Se agregó un velo (`linear-gradient` hacia `--noche`) detrás del bloque de texto, se acotó su ancho máximo por breakpoint (66 % en móvil, 100 % en tablet, 56 % en escritorio) y se corrió la torre más hacia el borde derecho del `viewBox`. El wordmark "Niebla" queda con `white-space: nowrap` a propósito, para no partirse a la mitad de la palabra; su ligero cruce con la niebla del faro es decorativo y no compromete ningún texto informativo.
- **P1 #2 y #3** — La nota de la función (por ejemplo, la inaugural de f05) ahora se muestra también en el itinerario (`ParadaItinerario`) y en la grilla de escritorio (`TarjetaFuncion` variante `grilla`), no solo en la lista móvil y en la ficha.
- **P1 #4** — `PistaFuncion` (el aviso antes de marcar) ahora se renderiza también en la variante `grilla`, para que la persona vea "No alcanzas a llegar desde…" antes de agregar la función, no solo después por la notificación.
- **P1 #5** — `BotonItinerario` aplica siempre `aria-label` descriptivo ("Agregar/Quitar {título}, {día} a las {hora}…"), en las dos variantes, no solo en la compacta de escritorio.
- **P2 #6** — El alto mínimo de las tarjetas de la grilla subió de 126 a 170 px, y `.grilla` pasó de `overflow: hidden` a `overflow: visible`: si el contenido de una tarjeta corta con nota y avisos no cabe, crece hacia abajo en el hueco real que dejan los huecos entre funciones de la misma sala, en vez de recortar la clasificación o el texto.
- **P2 #7** — El itinerario ahora recuerda la nota de lluvia de las funciones al aire libre y el texto de boletería de las agotadas, igual que la ficha de la película.
- **P2 #8** — Los tramos con más de una hora de holgura se leen como "1 h 47 min" en vez de "107 min" (`formatoDuracion`).
- **P2 #9** — El aviso de "ya tienes esta película" usa `dia.etiqueta` ("el viernes 16"), no solo el nombre del día.
- **P2 #10** — Se declaró `fallback: ['system-ui', 'sans-serif']` y `adjustFontFallback: false` para Big Shoulders; el build queda sin warnings.
- **P2 #11** — Las fechas de la metadata (`layout.tsx`, portada) y la palabra "Tres" del párrafo "qué es" ahora se derivan de `data/programa.json` (`listaHumana`, `nombreMes`, un nuevo `cardinalPalabra` en `lib/formato.ts`), igual que ya hacía el pie de página.
- **P2 #12** — `SinResultados` dejó de recibir una función (`alLimpiar`) desde `VistaPrograma`: "Ver todo el programa" es ahora un `<Link href="/programa">`, así el componente puede usarse sin riesgo desde el fallback de `Suspense` que renderiza el servidor.
- **P2 #13** — `ListaPrograma` emite siempre el `h2` del día (visualmente oculto cuando ya hay un filtro de día activo), para no saltar de `h1` a `h3`.
- **P2 #14** — Se agregó `break-inside: avoid` a la parada y al tramo del itinerario, y `break-before: page` entre los bloques de cada día, para que al imprimir no se corte una parada a la mitad.

## 5. Pendientes y por qué

- **P2 #15 (transiciones de entrada en el itinerario):** no se implementaron las animaciones de "aparecer" (parada nueva) y "trazar" (tramo nuevo) al volver a `/itinerario` después de marcar una función. El resto de la interacción (botón, contador, notificación) sí responde al instante; esta es una mejora puramente decorativa y de menor prioridad frente al resto de la ronda.
- **P2 #16 (conversatorio como bloque en la grilla):** en la grilla de escritorio el conversatorio se sigue viendo solo como chip de texto ("Conversatorio después (20 min)"), no como el bloque rayado contiguo bajo la tarjeta que dibuja el tiempo real que ocupa en el eje horario. El chip ya cumple el criterio de aceptación mínimo (H2.1 CA3); el bloque visual queda pendiente por ser el hallazgo de menor impacto de la revisión.
- **Pestañas por día con mapa de ruta en el itinerario de escritorio:** el panel de escritorio de `/itinerario` no incluye pestañas por día con un `MapaPuerto` mostrando la ruta de ese día; se optó por mostrar todos los días en una sola columna, más simple y sin perder información.
- **Encabezado de impresión:** se agregaron los saltos de página por día, pero no el encabezado "Mi itinerario · Festival de Cine Niebla · 15, 16 y 17 de octubre de 2026" que solo se vería al imprimir.
- Las fuentes se descargan desde Google Fonts durante `npm run build`; si el entorno de build no tiene red, el build fallará en ese paso (no hay sustituto local).
