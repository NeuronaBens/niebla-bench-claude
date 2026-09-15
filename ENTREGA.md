# Entrega: sitio del Festival de Cine Niebla

## Qué construí

Un sitio en Next.js 16 (App Router) + TypeScript + CSS Modules, sin librerías de componentes ni de animación, sin imágenes externas y sin backend. Todas las páginas se generan estáticas en el build.

| Ruta | Qué hay |
| --- | --- |
| `/` | Portada: la palabra NIEBLA aparece despejándose de la bruma, con capas de niebla que pasan por delante y un faro que barre el cielo. Luego: qué es el festival, las cuatro secciones (cada una con su arte y sus películas), los tres días (cuántas funciones, a qué hora parte y termina cada día, funciones especiales y la Bruma Nocturna), las cuatro salas con una tabla triangular de minutos a pie y el bloque de entradas. Cuenta regresiva en hora de Chile. |
| `/programa` | Las 39 funciones. Filtros por día (Todo / Jue / Vie / Sáb, con cantidad) y por sección (se pueden combinar varias). Dos vistas: **Lista**, pensada para el celular, y **Por sala**, una grilla horaria con un carril por sala que se desliza de lado. Los filtros viven en la URL (`?dia=2026-10-16&seccion=nocturna&vista=grilla`), así que se pueden compartir. |
| `/pelicula/[id]` | Ficha con afiche generativo grande, sección, título original, sinopsis, dirección, país, año, duración, clasificación, tipo de estreno, todas sus funciones (con botón para sumarlas) y las otras películas de la sección. Las 24 fichas se generan en el build. |
| `/itinerario` | El recorrido personal, ver abajo. |
| `/itinerario?f=05.09.22&de=Nombre` | Un itinerario compartido: se ve completo, con sus avisos, y se puede copiar al propio. |

### Itinerario

- En cada función hay un botón circular ("Ir" / "Voy"). Antes de marcarla ya avisa lo que pasaría: "Si la agregas: se topa con Sal de roca (18:00)", "no alcanzas a llegar desde…", "te perderías el conversatorio de…".
- La página del itinerario ordena las funciones por día como **boletos** y, entre uno y otro, dibuja el **tramo a pie**: "12 min a pie hasta El Muelle · te sobran 23 min", "no alcanzas: te faltan 7 min" o "se topan 25 min". El largo del tramo es proporcional al tiempo libre.
- Avisos que calcula (`lib/itinerario.ts`):
  - **Tope**: dos funciones elegidas se pisan (se revisan todos los pares, no sólo las consecutivas).
  - **Traslado**: entre el fin de una y el inicio de la siguiente hay menos minutos que la caminata de `trasladosMin`.
  - **Conversatorio**: si la función tiene `conversatorioMin`, avisa si te lo pierdes entero o cuántos minutos alcanzas antes de partir a la siguiente (contando la caminata). No cuenta como choque.
  - **Lluvia** (extra, aviso suave): si una función es en la Terraza Faro y, al pasarse al Galpón 7 con la misma hora (nota de la sala), la caminata ya no alcanza.
- Resumen arriba: funciones, horas de cine, minutos a pie y choques; lista de avisos plegable con enlace a cada boleto.
- Quitar una función muestra "Deshacer" por unos segundos. Vaciar pide confirmación y también se puede deshacer.
- Se guarda en `localStorage` (`niebla:itinerario:v1`), se sincroniza entre pestañas y no requiere cuenta.
- **Compartir**: genera un link con los ids de las funciones y, opcionalmente, un nombre. En el celular usa el menú nativo de compartir; si no, copia al portapapeles (y el link queda a la vista para copiarlo a mano). Quien lo abre ve "El recorrido de X" y puede **copiarlo** (si no tiene nada), **sumarlo** al suyo o **reemplazar** el suyo.

### Identidad visual

- Noche de puerto: fondo azul petróleo casi negro, texto color bruma, papel crema para boletos y entradas, luz de sodio (ámbar) como acento. Cada sección tiene su color: ámbar (Competencia), glaciar (Panorama), rojo bengala (Bruma Nocturna) y verde alga (Hecho en la Costa).
- Tipografías con `next/font`: Big Shoulders (títulos, condensada e industrial), Instrument Serif (fechas, sinopsis, acentos en cursiva), Instrument Sans (interfaz) e IBM Plex Mono (horas y rótulos, como tabla de mareas).
- **Afiches sin fotos** (`components/Afiche.tsx`): SVG generado con una semilla por película, así que cada título tiene siempre el mismo dibujo. Motivo por sección: horizonte con sol partido por la niebla (Competencia), carta náutica con curvas de profundidad (Panorama), faro / luna con lluvia / focos cruzados en la bruma (Bruma Nocturna) y oleaje dentro de un cuadro de Súper 8 con luna, muelle o lancha (Hecho en la Costa).
- Movimiento sólo con CSS: letras que se despejan, niebla a la deriva, haz del faro, caminante en los tramos, rebote al marcar una función y apariciones al hacer scroll (con `animation-timeline`, sólo si el navegador lo soporta). Todo se apaga con `prefers-reduced-motion`.

## Cómo correrlo

```bash
npm install
npm run dev      # desarrollo en http://localhost:3000
npm run build    # pasa sin errores ni advertencias
npm start        # sirve el build
npm run lint     # sin errores
```

## Decisiones importantes

- **CSS Modules en vez de Tailwind**: Tailwind no venía instalado y con CSS Modules no hay que agregar dependencias.
- **Sin librería de animación**: todo lo que se necesitaba se resolvió con CSS.
- **Horas como "minutos de reloj"**: `2026-10-15T19:30` se convierte con `Date.UTC` a minutos comparables, sin pasar por la zona horaria del navegador. Así una persona con el teléfono en otra zona ve y calcula lo mismo. Las funciones que pasan de medianoche quedan bien ordenadas y se marcan como "madrugada". Para "hoy", "en curso" y la cuenta regresiva, la hora actual se lee con `Intl` en `America/Santiago`.
- **Una función pertenece al día en que empieza** (Marea roja del viernes 23:30 aparece el viernes aunque termine el sábado 01:15).
- **Filtros e itinerario compartido leídos con la History API** (`lib/useUrl.ts`) y no con `useSearchParams`: la página se prerenderiza completa y, al hidratar, aplica los parámetros de la URL.
- **Traslados y conversatorios se evalúan contra la siguiente función que no se topa**; los topes, entre todos los pares. Si una función se topa con otra, el aviso de conversatorio no se repite.
- **Las funciones agotadas se pueden marcar** (alguien puede tener entrada o querer intentarlo en boletería), pero se ven con la etiqueta "Agotada" en el programa y en el boleto.
- **Links compartidos compactos**: `f=05.09.22` en vez de ids completos. Se ignoran ids inválidos o repetidos; el nombre se limpia y se corta a 32 caracteres.
- **Textos sólo con datos del JSON o del brief**. Los "hitos" de cada día salen de las notas de las funciones; la frase sobre cuatro organizadores y voluntarios viene del brief. No hay puntajes, estrellas, rankings ni emojis.
- **En celular** la navegación pasa a una barra inferior (Inicio, Programa, Itinerario con contador), la barra de filtros queda pegada arriba y los chips de sección usan nombres cortos (el lector de pantalla lee el completo).
- Se quitaron los archivos de la plantilla (`public/*.svg`, `favicon.ico`, `page.module.css`) y se agregó `app/icon.svg` con el faro.

## Cómo lo verifiqué

- `npm run build` y `npm run lint` sin errores.
- Revisé en el navegador a 360 px, 790 px y 1200 px: portada, programa (lista y grilla, con filtros por URL), fichas e itinerario. Verifiqué que ninguna página tenga scroll horizontal a 360 px (encontré y corregí un desborde de los chips de sección).
- Probé el itinerario con una combinación armada para gatillar todos los casos (topes entre funciones no consecutivas, traslado que no alcanza, conversatorio parcial) y con la vista previa de avisos en el programa; los minutos calculados coinciden con los datos.
- Probé el flujo de compartir: generar link con nombre, abrirlo, sumar al propio y volver a `/itinerario`.

## Qué quedó pendiente

- **Estados "durante el festival" sin probar en vivo**: la etiqueta "hoy" en los días, "En curso ahora" / "Esta función ya terminó" y la línea de la hora actual en la grilla dependen de la fecha real; la lógica está, pero hoy (septiembre) no se ven.
- **No hay tests automatizados** de `lib/itinerario.ts`; conviene agregar unos pocos casos (topes, traslados, conversatorio, lluvia, cruce de medianoche).
- **No hice una prueba con lector de pantalla real** ni una auditoría de contraste formal; se usaron `aria-pressed`, etiquetas descriptivas, `aria-live` y enlace para saltar al contenido.
- **No se probó en Safari/iOS**. Las apariciones al hacer scroll sólo funcionan en navegadores con `animation-timeline`; en el resto el contenido aparece normal.
- Ideas que no entraron: exportar el itinerario a calendario (.ics), un mapa esquemático de las salas (el JSON no trae coordenadas, por eso se usó la tabla de minutos) y un modo claro para leer a pleno sol.
