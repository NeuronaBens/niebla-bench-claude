# Entrega · Sitio del Festival de Cine Niebla (3ª edición)

## Qué se construyó

Un sitio completo en Next.js 16 (App Router) con TypeScript y CSS Modules, sin
librerías de componentes, sin librerías de animación, sin imágenes externas y
sin backend. Todo funciona en el navegador y se prerenderiza en el build.

### Páginas

| Ruta | Qué hay |
| --- | --- |
| `/` | Portada: hero nocturno con niebla y haz de faro animados en CSS, fechas, cifras del festival, manifiesto, las cuatro secciones con afiches generados, momentos destacados (inauguración, premiación, conversatorios, aire libre), esquema de salas con minutos caminando, entradas y contacto. |
| `/programa` | Las 39 funciones agrupadas por día. Filtros por día y por sección (y "solo mi itinerario") que viven en la URL, así se pueden compartir. Vista de lista (móvil y escritorio) y vista de grilla por sala y hora (desde 720 px). Cada tarjeta permite sumar la función al itinerario y avisa de antemano si se toparía con algo ya elegido. |
| `/pelicula/[id]` | Ficha de cada una de las 24 películas: afiche generado, datos, sinopsis, sección, todas sus funciones con botón de agregar, y otras películas de la misma sección. Generadas estáticamente con `generateStaticParams`. |
| `/itinerario` | Mi itinerario: funciones elegidas por día, con conectores entre función y función ("12 min caminando a X · te sobran 22 min") y avisos de tope, traslado y conversatorio. Botones para compartir (enlace, portapapeles y Web Share cuando existe) y vaciar (con confirmación). |
| `/itinerario?f=01.05.09` | Itinerario compartido: quien abre el enlace ve ese recorrido y puede sumarlo al suyo, reemplazar el suyo o solo mirar. |

### Reglas del itinerario (`lib/conflictos.ts`)

- Una función termina a la hora de inicio más la duración de la película.
- **Se topan** cuando la siguiente empieza antes de que termine la anterior. El
  conversatorio no cuenta como choque. Se revisan todos los pares, no solo los
  consecutivos.
- **No alcanzas a llegar** cuando los minutos entre el fin de una película y el
  inicio de la siguiente son menos que el traslado caminando entre salas
  (tabla `trasladosMin` del JSON). Se revisa contra la siguiente función que no
  se topa.
- **Conversatorio en riesgo** cuando, restando el traslado, no queda tiempo para
  quedarse los minutos del conversatorio. Se informa cuántos minutos se
  perderían o si se perdería completo.
- Los avisos se ven en el itinerario, en el programa (tarjetas elegidas) y en la
  grilla (borde de color según la gravedad).

### Identidad visual

- Tipografías con `next/font/google`: Fraunces (títulos, con eje óptico y SOFT),
  Instrument Sans (texto) e IBM Plex Mono (horas y etiquetas).
- Paleta: papel niebla claro para el cuerpo, noche azul para el hero y el pie,
  ámbar de faro como acento, y un color por sección (competencia óxido,
  panorama azul mar, nocturna vino, costa verde alga).
- **Afiches sin fotos**: `lib/afiche.ts` genera para cada película un paisaje en
  SVG (cielo, astro, capas de horizonte onduladas, bandas de niebla, haz de faro
  y estelas) de forma determinista a partir del id y la sección. El mismo
  afiche se ve igual en la tarjeta, la ficha y la portada. En la ficha lleva
  grano.
- Animaciones solo en CSS: niebla y faro del hero, aparición de contenido,
  botón de agregar. Todo se apaga con `prefers-reduced-motion`.
- Móvil primero: barra de navegación inferior fija en pantallas angostas,
  filtros pegajosos, tarjetas de una columna. Probado a 360, 375 y 1024 px.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # pasa sin errores (30 rutas estáticas)
npm run lint       # sin errores
```

## Estructura

```
app/
  layout.tsx            fuentes, cabecera, pie, metadatos
  page.tsx              portada
  programa/             programa (Suspense + componente cliente)
  pelicula/[id]/        ficha, generateStaticParams
  itinerario/           mi itinerario / compartido
  not-found.tsx, icon.svg, globals.css
components/
  Afiche.tsx            afiche SVG generado
  TarjetaFuncion.tsx    tarjeta de función (programa, ficha, itinerario)
  TarjetaPelicula.tsx   afiche con título enlazado
  Programa.tsx          filtros, lista y grilla
  Itinerario.tsx        recorrido, conectores, compartir
  Cabecera.tsx, Pie.tsx, MapaSalas.tsx, Etiquetas.tsx, BotonItinerario.tsx
lib/
  datos.ts              tipos y acceso a data/programa.json (no se modifica)
  tiempo.ts             días, minutos, horas, funciones calculadas
  conflictos.ts         análisis de topes, traslados y conversatorios
  compartir.ts          codificación del enlace compartido
  almacen-local.ts      localStorage con useSyncExternalStore
  itinerario-store.tsx  hook useItinerario
  afiche.ts             generador determinista de afiches
```

## Decisiones importantes

- **Sin librería de animación**: todo con CSS. Suficiente para el hero y las
  microinteracciones, y respeta `prefers-reduced-motion` con una sola regla.
- **Estado del itinerario con `useSyncExternalStore`** en vez de `useEffect` +
  `setState`: evita el aviso del linter de React 19, no produce saltos en la
  hidratación (el servidor siempre ve el itinerario vacío) y se sincroniza
  entre pestañas con el evento `storage`.
- **Filtros en la URL** (`?dia=2026-10-16&seccion=nocturna`) para que la
  portada pueda enlazar a una sección y para que un filtro se pueda compartir.
- **Enlace compartido corto**: `?f=01.05.09` (ids sin la "f"). Acepta también
  ids completos y números sin cero a la izquierda.
- **Horas sin `Date` ni zonas horarias**: se calculan como minutos desde la
  medianoche del primer día del festival. Las funciones que terminan después de
  medianoche muestran la hora con un "+1".
- **Sin puntajes, estrellas ni rankings**, sin emojis, todo en español.
- **`dynamicParams = false`** en la ficha: cualquier id que no exista da 404.
- El bloque `@AGENTS.md` en `CLAUDE.md` y `AGENTS.md` lo escribe `next dev`;
  se dejó tal cual.

## Qué quedó pendiente o se puede mejorar

- No hay mapa real de las salas (no se permiten servicios externos); el esquema
  es un diagrama con los minutos caminando.
- La vista de grilla solo aparece desde 720 px; en teléfonos se usa la lista.
- No se implementó exportar el itinerario a calendario (.ics) ni modo oscuro
  automático: el sitio tiene una sola paleta pensada para leerse a la luz del
  día en la calle.
- Las fuentes se descargan desde Google Fonts durante `npm run build`; si el
  build corre sin internet, hay que cambiar a `next/font/local`.
- `package-lock.json` quedó sin versionar (no se hicieron commits, como se
  pidió).
