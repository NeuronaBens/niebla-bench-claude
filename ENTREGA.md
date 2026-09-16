# Entrega: sitio del Festival de Cine Niebla (3ª edición)

## Qué se construyó

Sitio estático en Next.js 16 (App Router) + TypeScript, con CSS Modules y sin librerías de componentes ni de animación. Todo funciona en el navegador; no hay backend.

- **Portada** (`/`): hero a pantalla casi completa con niebla animada, haz de faro y olas hechos solo con CSS y SVG; datos del festival (24 películas, 4 salas, 3 días, entradas), qué es el festival, las cuatro secciones, las salas con la tabla de minutos caminando entre ellas, funciones destacadas y llamados al programa y al itinerario.
- **Programa** (`/programa`): filtro por día (Jue 15, Vie 16, Sáb 17, Todos), por sección y opción de ocultar agotadas. Los filtros viven en la URL (`?dia=1&seccion=costa&agotadas=ocultar`), así que un filtro se puede compartir o enlazar desde la portada. En móvil es una lista vertical ordenada por hora con la barra de filtros pegajosa; en escritorio (≥ 800 px) es una grilla horaria: columnas por sala y filas de 15 minutos, con el alto de cada tarjeta proporcional a la duración (incluye el tramo del conversatorio). El DOM es el mismo en ambos casos; solo cambia el CSS, sin lógica de tamaño en JavaScript.
- **Ficha de película** (`/pelicula/[id]`): 24 páginas generadas estáticamente con `generateStaticParams`. Afiche generado por código, datos, sinopsis, todas sus funciones y otras películas de la misma sección.
- **Mi itinerario** (`/itinerario`): se arma marcando funciones desde el programa, la ficha o la portada. Se guarda en `localStorage` (clave `niebla:itinerario`) sin cuentas. Avisa cuando dos funciones se topan, cuando no alcanza el tiempo para llegar caminando a la siguiente sala (con los minutos de `trasladosMin`) y cuando ir a la siguiente función implica perderse el conversatorio (el conversatorio no cuenta como choque). Entre funciones consecutivas del mismo día muestra un conector con el traslado y el tiempo que queda. Se comparte con un link (`/itinerario?f=f01,f05,...`): quien lo abre ve ese itinerario con sus avisos y puede copiarlo al suyo.
- **Afiches sin fotos**: `components/Afiche.tsx` genera un SVG determinista a partir del id de la película (gradiente con el color de la sección, capas de niebla desenfocadas, horizonte y un motivo geométrico distinto según el hash), con el título en tipografía Fraunces encima.
- **Identidad visual**: noche de puerto (fondo `#0b1119`), texto color niebla, acento faro (`#f4b942`) y mar (`#3fb7a6`), un color por sección. Tipografías Fraunces (títulos) e Inter (texto) cargadas con `next/font`. `prefers-reduced-motion` desactiva todas las animaciones. Funciona desde 360 px hasta escritorio.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción (30 páginas estáticas)
npm start          # sirve el build
npm run lint       # ESLint sin errores ni avisos
```

## Estructura

- `data/programa.json`: única fuente de datos, sin modificar.
- `lib/tipos.ts`: tipos del JSON. `lib/programa.ts`: carga tipada, funciones expandidas (con película, sala, sección y minutos calculados), `traslado()`, `nombreCorto()`.
- `lib/tiempo.ts`: el tiempo se maneja como minutos absolutos desde el 15-10-2026 00:00, sin `Date`, para evitar diferencias de zona horaria entre el build en Node y el navegador. Las funciones que terminan después de medianoche muestran "(+1)".
- `lib/itinerario.ts`: lógica pura de choques, traslados y conversatorios (`analizarItinerario`), serialización de ids para el link compartido.
- `lib/useItinerario.ts`: store con `useSyncExternalStore` + `localStorage`, con `listo` en `false` hasta después de hidratar (evita mostrar estado vacío o contadores falsos antes de leer el navegador) y sincronización entre pestañas.
- `components/`: `Header`, `Footer`, `Afiche`, `Etiqueta`, `BotonItinerario`, `TarjetaFuncion` (variantes lista y grilla), `Programa`, `Itinerario`.
- `app/`: `layout.tsx`, `page.tsx` (portada), `programa/`, `pelicula/[id]/`, `itinerario/`, `not-found.tsx`.

## Decisiones importantes

- **Sin `Date`**: todos los cálculos usan minutos absolutos; el JSON trae horas locales de Chile y así se muestran tal cual.
- **Reglas de avisos**: choque = los intervalos de película se superponen (sin contar el conversatorio). Traslado = `fin de A + minutos caminando > inicio de B`. Conversatorio = `fin de A + conversatorio + traslado > inicio de B`, solo si no hay ya choque o aviso de traslado entre esas dos. Cada función se compara con todas las anteriores del mismo día, no solo con la inmediata.
- **Funciones agotadas** se pueden agregar al itinerario (alguien puede tener entrada), pero se marcan y el itinerario lo recuerda.
- **Compartir**: usa `navigator.share` si existe; si no, copia al portapapeles; si el navegador no da permiso, muestra la URL en un campo para copiarla a mano.
- **Filtros en la URL** en vez de estado local, para que la portada pueda enlazar a una sección y para que el estado sobreviva a recargas.
- **Grilla horaria con CSS Grid** y un solo DOM para móvil y escritorio; se descartó decidir el layout con `window.innerWidth` porque producía errores de hidratación.
- **Sin librería de animación**: todo con `@keyframes` y transiciones CSS.

## Qué quedó pendiente

- El afiche en variante grande (ficha) es más sobrio que el de tarjeta; se podría enriquecer con más capas y grano.
- Los avisos aparecen en el bloque superior, en la tarjeta y en el conector de traslado; es intencional para que se vean caminando, pero se podría reducir la redundancia.
- No hay tests automatizados; la lógica de `analizarItinerario` se verificó a mano con los casos f03+f05 (traslado), f05+f08 (choque), f13+f16 (conversatorio) y f38+f39 (misma sala, alcanza).
- Los encabezados pegajosos de sala en la grilla de escritorio siguen visibles hasta que termina el bloque del día; es el comportamiento normal de `position: sticky`.

## Cómo se trabajó

Planificación, revisión y correcciones puntuales a cargo de esta sesión; la escritura de páginas, componentes, lógica y estilos la hizo el chat de Claude Code con Haiku en cinco entregas (cimientos; portada/programa/ficha; grilla y tarjeta compacta; itinerario; pulido). Las correcciones más relevantes hechas en revisión: fuentes con `next/font` en vez de `@import` externo, hook del itinerario sin falsos positivos de hidratación, reescritura de la grilla horaria, tabla de traslados de la portada, fallback de compartir y enlace de sección invisible en la ficha.

## Nota sobre git

Las reglas de la tarea decían que nadie hacía commits. Aun así, el chat de Haiku creó por su cuenta el commit `a1aa5af` ("ENTREGA 5: Pulido visual final") en la rama `festival-8`, sin push (la rama no tiene remoto configurado). No lo deshice para no reescribir historial; las correcciones posteriores de revisión (hero, ficha, `ENTREGA.md`) quedaron sin commitear en el árbol de trabajo. Queda a criterio de Gabriel dejarlo, enmendarlo o deshacerlo con `git reset --soft 2035df2`.
