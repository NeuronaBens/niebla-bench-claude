# Entrega · sitio del Festival de Cine Niebla (3ª edición)

## Qué se construyó

Un sitio completo en Next.js 16 (App Router) + TypeScript, sin backend, con los datos de `data/programa.json`
usados tal cual (no se modificó ni se inventó nada).

| Ruta | Qué hay |
|---|---|
| `/` | Portada: hero con faro cuyo haz barre lento sobre la niebla, fechas y ciudad en tipografía grande, cifras calculadas desde los datos (24 películas, 39 funciones, 4 salas, 3 días, precio de entradas), las 4 secciones con su color, el programa día por día como tiras de afiches, destacados que salen de los datos (función inaugural, entrega de premios, funciones al aire libre, conversatorios), un diagrama SVG de las 4 salas con los minutos caminando entre ellas, y una explicación en 3 pasos del itinerario. |
| `/programa` | Todas las funciones, filtrables por día y por sección (estado en la URL: `?dia=2026-10-16&seccion=nocturna`). Barra de filtros pegada bajo la cabecera en el celular, lista agrupada por día y por franja (Mediodía, Tarde, Noche, Trasnoche), cada función con su tarjeta y botón para agregar al itinerario. |
| `/pelicula/[id]` | Ficha con afiche generativo grande, datos, título original, sinopsis, todas sus funciones (con botón de itinerario) y otras películas de la misma sección. 24 fichas prerenderizadas; id inexistente da 404 en español. |
| `/itinerario` | Mi itinerario: funciones elegidas agrupadas por día, con conectores entre una y otra que cuentan el recorrido (minutos caminando y tiempo que sobra) y avisos cuando dos funciones se topan, cuando no alcanza a llegar caminando, o cuando se perdería el conversatorio. Se guarda en `localStorage`. Compartir copia un link (`/itinerario?f=f01.f05…`); quien lo abre ve el itinerario en modo lectura y puede copiarlo al suyo. |

### Identidad visual

- Idea: "una noche de puerto con niebla". Tema oscuro único, niebla animada de fondo (capas de gradientes que derivan en 75–120 s), acento ámbar de faro y un color por sección: ámbar (Competencia), cian hielo (Panorama), rojo marea (Bruma Nocturna), verde alga (Hecho en la Costa).
- Tipografía: Fraunces (títulos, horas, números; ejes `opsz`/`SOFT`) e Instrument Sans (interfaz), cargadas con `next/font/google` y servidas desde el propio sitio.
- Afiches sin fotos: `components/Afiche.tsx` genera un SVG determinista por película (hash FNV-1a del id + generador mulberry32): horizonte, bandas de niebla, luna o faro, olas, luces del puerto, estrellas, título en Fraunces y grano solo en la versión grande. Cada película tiene un afiche distinto, todos de la misma familia y coloreados por su sección.

## Cómo correrlo

```bash
npm install
npm run dev
```

Abrir http://localhost:3000. Producción:

```bash
npm run build
npm run start
```

`npm run build` y `npm run lint` pasan sin errores ni avisos (Node 24, Next 16.3.5). Todas las rutas se prerenderizan como estáticas.

## Cómo probar el itinerario rápido

1. En `/programa`, marcar con "Agregar" varias funciones (o pegar en la consola
   `localStorage.setItem("niebla:itinerario:v1", JSON.stringify(["f05","f03","f04","f31","f34","f39"]))` y recargar).
2. Abrir `/itinerario`: se ven un choque (f03 con f04), un traslado que no alcanza (f03 termina 18:00+84 min y f05 en el Teatro
   necesita 8 min caminando desde el Galpón 7 y solo hay 6), un conversatorio que se perdería (f31 → f34) y una función que termina
   pasada la medianoche (f39).
3. "Compartir" copia el link; abrirlo en una ventana privada muestra "Itinerario compartido" y "Copiar a mi itinerario".

## Decisiones importantes

- **Sin Tailwind ni librerías**: CSS Modules + variables globales en `app/globals.css`. Ninguna dependencia nueva; las
  animaciones son CSS puro y todas se anulan bajo `prefers-reduced-motion` (regla global más ajustes locales).
- **Horas sin `Date`**: las horas se calculan como minutos desde el 15 de octubre a las 00:00 a partir de las cadenas del JSON,
  así que el servidor y el navegador muestran exactamente lo mismo sin depender de la zona horaria de quien mira. Una función
  pertenece al día en que empieza aunque termine después de medianoche (se indica "termina pasada la medianoche").
- **Reglas del análisis** (`lib/itinerario.ts`, por cada par de funciones del mismo día): choque si la segunda empieza antes
  de que termine la película de la primera (el conversatorio no cuenta); si no, traslado si el hueco es menor que los minutos
  caminando entre salas (misma sala = 0); si no, y la primera tiene conversatorio, aviso de conversatorio con cuántos minutos se
  pierden. Los avisos se muestran una sola vez: como conector entre funciones consecutivas y dentro de la tarjeta cuando el par no
  es consecutivo.
- **Almacenamiento**: `lib/almacen.tsx` usa `useSyncExternalStore` sobre `localStorage` (clave `niebla:itinerario:v1`), con
  sincronización entre pestañas y estado `listo` para evitar parpadeos en la hidratación. Los ids inválidos se descartan al leer.
- **Compartir sin backend**: el link lleva los ids en la query (`?f=f01.f05`), se decodifica en el cliente dentro de `<Suspense>`
  y la página sigue siendo estática. Se usa `navigator.share` en celulares con pantalla táctil, si no el portapapeles, y si eso
  falla se muestra el link en un campo seleccionable.
- **Filtros del programa en la URL** para que la portada pueda enlazar `/programa?seccion=nocturna` y para que un filtro se pueda
  compartir; se escriben con `history.replaceState` sin recargar ni mover el scroll.
- **Tarjeta compartida en modo lectura**: componente propio que reutiliza los estilos de `TarjetaFuncion` en vez de esconder el
  botón con CSS.
- **Página 404 propia** en español (`app/not-found.tsx`).
- `docs/DISENO.md` es la guía de diseño y el contrato técnico con el que se coordinó el trabajo; se deja como documentación.
- `.claude/launch.json` solo configura el servidor de desarrollo para la vista previa; se puede borrar sin efecto.

## Verificado

- Build y lint limpios; 30 páginas estáticas generadas.
- En navegador a 360 px y a 1280 px: portada, programa (filtros, URL, barra pegada), ficha, itinerario propio, itinerario
  compartido (incluido un link con un id inválido, que se descarta), 404. Sin scroll horizontal a 360 px en ninguna ruta
  (se corrigió un desborde que generaban las tiras horizontales de afiches en la portada).
- La lógica de avisos se probó con casos reales de los datos (choques, traslado con 6 min libres y 8 caminando, conversatorio
  parcial de 14 de 30 min, función que cruza medianoche, funciones de días distintos que no se comparan).

## Qué quedó pendiente o merece una segunda mirada

- `navigator.share` y el portapapeles solo se pueden probar de verdad en un celular con la ventana enfocada; el código cubre los
  tres caminos (compartir nativo, portapapeles, campo con el link) pero se validó el fallback, no el compartir nativo.
- Cuando el mismo afiche aparece dos veces en una página (una película con dos funciones en la portada), se repiten los ids de los
  gradientes del SVG. Se ve idéntico y no rompe nada, pero no es HTML estrictamente válido; se arreglaría añadiendo un sufijo de
  instancia a los ids.
- No hay página de "sala" ni vista por sala del programa; se decidió priorizar la lista por hora, que es lo que se usa caminando.
- No se agregaron pruebas automatizadas (no había framework de tests en el proyecto y el brief no las pedía); la lógica de
  `lib/itinerario.ts` es pura y fácil de cubrir si se quiere añadir Vitest.
- El sitio se prerenderiza completo; si más adelante cambian los datos, basta con editar el JSON y volver a construir.
