# Detalle de implementación

Complemento de `docs/BACKLOG.md`. Para cada historia dice archivos, componentes, tipos, lógica con casos límite, dirección visual y cómo verificar. No incluye código: las firmas se describen en palabras. Donde este documento y el brief difieran, manda el brief.

---

## 1. Decisiones de base

### 1.1 Stack
- **Next.js 16.3.5 con App Router, React 19.2 y TypeScript estricto.** Ya están instalados. Antes de escribir código, leer en `node_modules/next/dist/docs/01-app/` al menos: `03-api-reference/03-file-conventions/dynamic-routes.md`, `03-api-reference/04-functions/generate-static-params.md`, `03-api-reference/04-functions/use-search-params.md`, `01-getting-started/13-fonts.md` y `02-guides/preventing-flash-before-hydration.md`.
- **Estilos: CSS Modules más un `app/globals.css` con variables.** No instalar Tailwind: evita dependencias y deja las animaciones en CSS puro.
- **Animación: ninguna librería.** Todo con transiciones y `@keyframes` de CSS. No usar el componente `ViewTransition` de React: sus tipos pueden no estar en `@types/react` y romper el build.
- **Sin dependencias nuevas.** Si alguna resulta indispensable, anotarla con su motivo en `ENTREGA.md`.

### 1.2 Reglas de Next 16 que afectan este proyecto
- En páginas y `generateMetadata`, `params` y `searchParams` son **promesas**: se esperan con `await`. El acceso síncrono ya no existe.
- El tipo global `PageProps<'/pelicula/[id]'>` existe tras `next typegen` o durante el build. Si da problemas, tipar las props a mano con `params` como promesa de un objeto con `id` texto.
- Un componente cliente que llama a `useSearchParams` en una página estática **debe** quedar dentro de un `Suspense`; si no, el build falla con "Missing Suspense boundary with useSearchParams".
- Para las fichas: `generateStaticParams` con los 24 ids y `dynamicParams` en `false`, así un id desconocido da 404.
- No activar `cacheComponents` ni otras opciones experimentales en `next.config.ts`.
- `next build` usa Turbopack por defecto. No agregar configuración de webpack.

### 1.3 Reglas de datos y tiempo
- `data/programa.json` no se toca. Se importa desde un solo módulo, `lib/programa.ts`.
- **Nunca** pasar las horas del JSON a `new Date(...)` ni usar `toLocaleString`, `toLocaleDateString` o `toLocaleTimeString`. Esas funciones usan la zona horaria del equipo y hacen que el build en UTC y el navegador muestren horas distintas, además de errores de hidratación.
- El tiempo se trabaja como **minutos absolutos del festival**: los días transcurridos desde `festival.fechaInicio` por 1440, más horas por 60, más minutos. Los días se cuentan con aritmética sobre año, mes y día (se puede usar `Date.UTC` solo para la resta de fechas y para saber el día de la semana, que no depende de la zona horaria).
- Nombres de días y meses en español salen de tablas propias ("jueves", "vie", "octubre").
- Los precios se formatean a mano con punto de miles: "$4.000". "Gratis" cuando es 0.
- Chile no cambia de horario durante el festival, así que la aritmética de minutos es exacta.

### 1.4 Estructura de archivos
```
app/
  layout.tsx                     layout raíz, fuentes, navegación, pie, proveedor de avisos
  globals.css                    reset, variables, tipografía base, utilidades, reduced motion
  icon.svg                       ícono del festival (reemplaza favicon.ico, que se borra)
  not-found.tsx                  404
  page.tsx + portada.module.css  portada
  programa/page.tsx + programa.module.css
  pelicula/[id]/page.tsx + ficha.module.css
  itinerario/page.tsx + itinerario.module.css
  itinerario/compartido/page.tsx
components/
  navegacion/NavegacionPrincipal.tsx, PiePagina.tsx (+ .module.css)
  afiche/AfichePelicula.tsx (+ .module.css)
  portada/HeroNiebla.tsx, QueEs.tsx, DiasFestival.tsx, SeccionesFestival.tsx, MapaSalas.tsx, InfoEntradas.tsx
  programa/ProgramaInteractivo.tsx, FiltrosPrograma.tsx, FilaFuncion.tsx, GrillaDia.tsx (P2)
  funcion/BotonItinerario.tsx, EtiquetasFuncion.tsx
  itinerario/VistaItinerario.tsx, BoletoFuncion.tsx, TramoEntreFunciones.tsx, ResumenItinerario.tsx,
             BotonCompartir.tsx, ItinerarioCompartido.tsx, EstadoVacio.tsx
  avisos/ProveedorAvisos.tsx     toasts y región aria-live
lib/
  tipos.ts          tipos del dominio
  programa.ts       carga, enriquecimiento y consultas
  tiempo.ts         conversión y formato de horas y días
  formato.ts        duración, precio, clasificación, estreno, plurales
  estiloSecciones.ts  color, nombre corto y motivo por sección
  azar.ts           hash de texto y generador pseudoaleatorio con semilla
  itinerario/almacen.ts, useItinerario.ts, avisos.ts, compartir.ts, textos.ts
```
Borrar `app/page.module.css`, `app/favicon.ico` y los svg de `public/`. Reescribir `README.md` en español o dejar que `ENTREGA.md` lo reemplace y el README apunte a él.

---

## 2. Sistema visual

### 2.1 Concepto: "Carta de puerto en noche de niebla"
El sitio es de noche, en el muelle. Fondo azul petróleo casi negro, texto color niebla, luz amarilla de faro para las acciones y papel de boleto para lo que la persona guarda. Tipografía condensada como los rótulos pintados de bodegas y contenedores. Motivos: bandas de niebla difusa, haz de faro, líneas de olas, cuadrícula de redes, líneas de carta náutica y bordes perforados de boleto.

### 2.2 Paleta (variables en `:root` de `globals.css`)
El sitio es solo oscuro: quitar la media query `prefers-color-scheme` de la plantilla y declarar `color-scheme: dark`.

| Variable | Valor | Uso |
|---|---|---|
| `--tinta` | `#0E1A24` | fondo principal |
| `--tinta-2` | `#15293A` | superficies, barra de filtros |
| `--tinta-3` | `#1F3A50` | bordes y separadores |
| `--niebla` | `#ECE8DF` | texto principal sobre tinta |
| `--niebla-2` | `#AEB8BF` | texto secundario sobre tinta |
| `--faro` | `#FFC24B` | acción principal, marca, foco |
| `--faro-oscuro` | `#8A5A00` | texto de acción sobre papel |
| `--papel` | `#EFE8D8` | boletos del itinerario y funciones en la ficha |
| `--papel-tinta` | `#1A1A17` | texto sobre papel |
| `--alerta` | `#FF6B5B` | choque y traslado (sobre tinta) |
| `--alerta-papel` | `#B3261E` | choque y traslado (sobre papel) |
| `--cuidado` | `#FFD27A` | conversatorio perdido (sobre tinta) |
| `--cuidado-papel` | `#7A5200` | conversatorio perdido (sobre papel) |

Secciones: color claro para usar sobre tinta y color oscuro para usar sobre papel.

| Sección | Nombre corto | Sobre tinta | Sobre papel | Motivo |
|---|---|---|---|---|
| competencia | Competencia | `#FF8A3D` | `#9E3F00` | luz de faro: círculo con anillos |
| panorama | Panorama | `#7CC4F0` | `#1C5A85` | carta náutica: horizonte y meridianos |
| nocturna | Nocturna | `#FF5C7A` | `#A31D3C` | dientes: banda de triángulos irregulares |
| costa | Costa | `#6BD4A8` | `#1E6E4E` | olas y redes |

Estos valores se calcularon para AA, pero hay que **comprobar** cada combinación texto y fondo con un cálculo de contraste (un script de Node suelto en el scratchpad o en la consola del navegador) y ajustar si alguna baja de 4,5:1. Guardar el mapeo en `lib/estiloSecciones.ts` y exponerlo también como variables CSS (`--sec-competencia`, `--sec-competencia-papel`, etc.) para que los componentes usen `style` con la variable y no hex sueltos.

### 2.3 Tipografía (con `next/font/google`, en `app/layout.tsx`)
Verificado que existen en esta versión de Next:
- **Big Shoulders** (variable, ejes `wght` y `opsz`) como `--font-display`: títulos, horas grandes, nombres de días, wordmark. Uso habitual en mayúsculas con `letter-spacing` de 0,01 a 0,04em, pesos de 700 a 900.
- **Instrument Sans** (variable, ejes `wght` y `wdth`) como `--font-texto`: interfaz y textos. Base de 16 px, interlineado 1,5.
- **Instrument Serif** (peso 400, normal e itálica) como `--font-cita`: sinopsis, frases editoriales de la portada y estados vacíos.

Subsets `latin` y `latin-ext` si está disponible (hay "Tomáš", "Élise", "Lindqvist"). `display: 'swap'`. Todas las horas usan `font-variant-numeric: tabular-nums`. Escala: `clamp` para títulos (h1 de portada entre 5 rem y 18 rem; h1 de ficha entre 2,5 rem y 5 rem).

### 2.4 Texturas y detalles
- **Grano de película:** una sola capa fija de pantalla completa en el `body` con un SVG `feTurbulence` embebido como data URI en CSS, opacidad entre 0,04 y 0,06, `pointer-events: none`. Es código, no imagen externa.
- **Borde de boleto:** borde lateral perforado con `mask` o `radial-gradient` (semicírculos de 6 px cada 16 px) y una línea punteada vertical que separa el talón con la hora.
- **Esquinas:** rectas o de 2 px como máximo. Nada de tarjetas redondeadas con sombra difusa.
- **Separadores:** líneas finas `--tinta-3` y reglas con marcas de hora, como una tabla de mareas.

### 2.5 Movimiento
- Duraciones: microinteracciones de 150 a 250 ms, entradas de 300 a 600 ms, ambientales (niebla, faro) de 12 a 120 s.
- Curva por defecto `cubic-bezier(0.2, 0.7, 0.2, 1)`.
- Solo `transform` y `opacity`. Nunca animar `filter: blur` en bucle: los elementos de niebla se desenfocan una vez y se desplazan con `transform`.
- **Movimiento reducido:** en `globals.css`, un bloque `@media (prefers-reduced-motion: reduce)` que anula animaciones en bucle y transformaciones (`animation: none`, `transition` limitada a opacidad y color). Cada componente con animación define además su estado final como estado base, para que nada dependa de que la animación corra.

---

## 3. Base (Épica 0)

### H-0.1 Datos tipados — `lib/tipos.ts`, `lib/programa.ts`, `lib/tiempo.ts`

**Tipos en `lib/tipos.ts`:**
- `SalaId`: unión de `teatro`, `muelle`, `galpon` y `terraza`.
- `SeccionId`: unión de `competencia`, `panorama`, `nocturna` y `costa`.
- `DiaId`: unión de `jueves`, `viernes` y `sabado`.
- `Clasificacion`: `TE`, `+14` o `+18`. `TipoEstreno`: `mundial`, `latinoamericano` o `nacional`.
- `Sala`: id, nombre, dirección, capacidad, aireLibre y nota opcional.
- `Seccion`: id, nombre y descripción.
- `Pelicula`: id, título, título original opcional, dirección, país, año, duraciónMin, sección, clasificación, estreno y sinopsis.
- `FuncionDatos`: tal como viene en el JSON (id, peliculaId, salaId, inicio en texto, conversatorioMin opcional, agotada opcional, nota opcional).
- `Funcion` (la enriquecida que usa la interfaz): id; la `Pelicula` y la `Sala` completas; `inicioMin` y `terminoMin` (minutos absolutos); `dia` (`DiaId` del día en que empieza); `horaInicio` y `horaTermino` en "HH:MM"; `terminaOtroDia` booleano; `diaTermino` (nombre del día en que termina, puede ser "domingo"); `conversatorioMin` (0 si no hay); `agotada`; `nota` opcional; `aireLibre` (de la sala); `precio` (general o aireLibre del JSON).
- `Dia`: id, fecha en texto, nombre largo ("jueves"), corto ("Jue"), número (15), mes ("octubre").
- `Traslados`: matriz de `SalaId` por `SalaId` a minutos.

**`lib/programa.ts`:**
- Importa el JSON y lo declara con los tipos anteriores (una aserción en este único lugar). Opcional pero recomendado: una validación liviana al cargar que lance error en el build si una función apunta a una película o sala inexistente.
- Exporta constantes ya calculadas: `festival`, `salas`, `secciones`, `peliculas`, `dias` (los 3, derivados de fechaInicio y fechaFin), `funciones` (todas enriquecidas y ordenadas por inicio y luego por nombre de sala), `traslados`.
- Consultas: película por id; funciones de una película; funciones por día; sección por id; sala por id; minutos de traslado entre dos salas; películas por sección; conteos por sección y por día; primera hora y último término de cada día.
- Todo es puro y sincrónico, se puede importar en componentes de servidor y de cliente.

**`lib/tiempo.ts`:**
- Convierte "2026-10-15T16:00" en minutos absolutos, separando el texto (sin `Date` de por medio salvo `Date.UTC` para restar fechas).
- Convierte minutos absolutos en "HH:MM" (con módulo 1440) y en índice de día.
- Asigna el día de festival: el día de la fecha de inicio. Defensa para el futuro: si la hora de inicio es anterior a las 05:00, pertenece al día anterior (hoy no hay casos).
- Formatea rangos: "22:15 a 00:13" y, cuando `terminaOtroDia`, agrega "(madrugada del viernes)".

**Casos límite:** f09 termina "00:13" del viernes; f39 termina "01:07" del domingo, que no es día del festival, y aun así se nombra "domingo"; f22 pertenece al viernes.

**Verificar:** con `TZ=UTC npm run build` y luego con el navegador en otra zona horaria (DevTools, Sensors, Location), las horas son idénticas. `git diff -- data/` vacío.

### H-0.2 Build limpio
- Reemplazar la portada de plantilla, borrar restos y ajustar `README.md`.
- **Verificar:** `npm run build` y `npm run lint`. En la tabla de rutas del build, `/`, `/programa`, `/itinerario`, `/itinerario/compartido` y `/pelicula/[id]` aparecen como estáticas o SSG. Si alguna aparece dinámica, revisar que no se esté leyendo `searchParams` en un componente de servidor.

### H-0.3 Restricciones
- **Verificar:** revisar `package.json`; buscar en el proyecto (sin `node_modules`) `http` dentro de `src`, `url(` y `<img`; buscar emojis con una expresión regular de rangos Unicode de emoji sobre `app`, `components` y `lib`; buscar palabras "estrella", "puntaje", "rating", "top", "destacad", "imperdible".

### H-0.4 Movimiento reducido
- Bloque global en `globals.css` más estado final por defecto en cada animación.
- **Verificar:** DevTools, Rendering, "Emulate CSS prefers-reduced-motion: reduce". Recorrer portada, marcar y quitar funciones, abrir el itinerario. Nada se mueve ni queda invisible.

### H-0.5 Responsivo
- Enfoque mobile first. Puntos de quiebre: 480 px, 768 px (cambia la navegación), 1024 px (dos columnas en programa y ficha), 1280 px (ancho máximo 1200 px del contenido).
- Títulos largos con `overflow-wrap: anywhere` y `hyphens: auto` (el documento tiene `lang="es-CL"`).
- **Verificar:** DevTools a 360 × 640, 390 × 844, 768 × 1024 y 1440 × 900; en consola, comparar `document.documentElement.scrollWidth` con el ancho.

### H-0.6 Accesibilidad
- `ProveedorAvisos` monta una región `aria-live="polite"` visualmente oculta para anuncios y la pila visible de toasts.
- Foco visible: `outline` de 3 px `--faro` con `outline-offset` de 3 px en `:focus-visible`.
- Enlace "Saltar al contenido" como primer elemento del `body`, visible solo al recibir foco, apunta a `main#contenido`.
- **Verificar:** recorrer con Tab cada página; Lighthouse de accesibilidad 95 o más; contrastes con el script de 2.2.

### H-0.7 Identidad visual
Aplicar la sección 2 completa.

### H-0.8 Navegación — `components/navegacion/NavegacionPrincipal.tsx` (cliente)
- Usa `usePathname` para `aria-current` y `useItinerario` para el contador.
- **Menos de 768 px:** cabecera superior delgada no fija (56 px) con el wordmark "NIEBLA" en Big Shoulders 900 que lleva a la portada. Barra inferior fija de 64 px más `env(safe-area-inset-bottom)`, fondo `--tinta-2` con borde superior `--tinta-3`, tres destinos: "Inicio", "Programa" y "Mi itinerario". Íconos SVG propios y simples de trazo (faro, lista de horas, boleto), siempre con texto debajo. El `body` recibe `padding-bottom` equivalente para no tapar contenido.
- **Desde 768 px:** cabecera fija arriba con el wordmark a la izquierda y los tres enlaces a la derecha; sin barra inferior.
- **Contador:** insignia circular `--faro` con número en `--tinta`. Mientras no se haya leído el almacenamiento (ver H-4.1, `listo`), no se muestra. Cuando el número sube, la insignia hace un pulso de escala 1 a 1,25 a 1 en 250 ms (sin pulso con movimiento reducido). El nombre accesible es "Mi itinerario, 3 funciones".
- **Verificar:** marcar una función en el programa y ver el número cambiar; recargar y comprobar que no aparece un "0" antes del número real.

### H-0.9 Metadatos y 404
- En `app/layout.tsx`: `metadata` con `title.template` "%s · Festival de Cine Niebla", `title.default` "Festival de Cine Niebla · 15 al 17 de octubre de 2026, Puerto Bruma", descripción en español; `viewport` exportado con `themeColor` `#0E1A24`. `html` con `lang="es-CL"`.
- `app/icon.svg`: faro minimalista amarillo sobre fondo tinta, 32 × 32.
- Cada página exporta su `metadata` o `generateMetadata` (la ficha usa el título de la película y la primera frase de la sinopsis).
- `app/not-found.tsx`: gran "404" en Big Shoulders cubierto parcialmente por una banda de niebla, frase "Esta función se perdió en la niebla" en Instrument Serif y enlaces a programa y portada.
- **Verificar:** abrir `/pelicula/no-existe` y `/cualquier-cosa` en el build de producción (`npm run build` y `npm start`).

---

## 4. Portada (Épica 1) — `app/page.tsx`

Componente de servidor que compone las secciones en este orden: `HeroNiebla`, `QueEs`, `DiasFestival`, `SeccionesFestival`, `MapaSalas`, `InfoEntradas`. Todos son componentes de servidor salvo que se indique lo contrario. Todos los números vienen de `lib/programa.ts`.

### H-1.1 y H-1.2 Hero — `components/portada/HeroNiebla.tsx`
**Contenido:** h1 "Festival de Cine Niebla", con "NIEBLA" enorme y "Festival de Cine" pequeño encima. Debajo: "3ª edición", "Jueves 15, viernes 16 y sábado 17 de octubre de 2026" y "Puerto Bruma, Chile". Botones "Ver el programa" (primario, fondo `--faro`, texto `--tinta`) y "Armar mi itinerario" (secundario, borde `--niebla`).

**Composición (capas, de atrás hacia adelante):**
1. Cielo y mar: degradado vertical de `--tinta` a `#1B3346`. Alto `min-height: 100svh` menos la cabecera, con tope de 900 px.
2. Horizonte al 68 % del alto: una línea de 1 px `--tinta-3` y debajo 4 o 5 trazos SVG de olas finas (`--niebla` al 12 %).
3. Faro: silueta SVG vertical a la derecha (a 360 px, 70 px de alto en la esquina inferior derecha; en escritorio, 240 px). Su linterna es un pequeño círculo `--faro`.
4. Haz de luz: un trapecio largo con degradado lineal de `--faro` al 35 % a transparente, con origen en la linterna. Animación: rota entre -28° y 18° con `alternate` en 14 s, `ease-in-out`.
5. Título "NIEBLA": Big Shoulders 900, tamaño `clamp(5rem, 30vw, 18rem)`, color `--niebla`, interlineado 0,8, alineado a la izquierda sobre el horizonte.
6. Niebla: tres bandas, cada una un `div` o `ellipse` SVG muy ancho (180 % del ancho), alto de 25 a 40 %, color `--niebla` al 10–18 %, desenfocado una sola vez con `filter: blur(40px)`. Se desplazan en X con `translateX` en bucle de 60, 90 y 120 s en sentidos alternos. **La banda del medio pasa por delante del título** con opacidad baja, para que la palabra parezca salir de la niebla sin perder contraste (comprobar AA en el punto más denso).
7. Texto secundario y botones, encima de todo.

**Entrada al cargar (una vez):** cada letra de "NIEBLA" pasa de opacidad 0,15 y `translateY(0.08em)` a su estado final con 70 ms de desfase entre letras, 700 ms en total; fechas y botones aparecen con opacidad a los 500 ms. Cada letra es un `span` con `aria-hidden` y el h1 tiene su texto completo accesible. No usar `blur` animado en las letras.

**Movimiento reducido:** sin entrada, sin deriva de niebla y con el haz fijo en -8°.

**Casos límite:** a 360 × 640 todo lo de H-1.1 queda sobre el pliegue (verificar con el título a 30vw, unos 108 px); en pantallas bajas y anchas (1440 × 700), el título baja a `min(30vw, 42svh)`.

### H-1.1 Qué es — `QueEs.tsx`
Frase grande en Instrument Serif: "Tres días de cine en Puerto Bruma: 24 películas en 4 salas, del muelle al faro." Debajo, tres cifras en Big Shoulders (24 películas, 39 funciones, 4 salas) calculadas desde los datos, separadas por reglas finas.

### H-1.5 Días — `DiasFestival.tsx`
Tres bloques, apilados en celular y en fila desde 768 px, con estética de tabla de mareas: nombre del día en Big Shoulders ("JUEVES 15"), una regla horizontal de 12:00 a 02:00 con una marca por cada función (color de su sección, sin interacción), y el texto "10 funciones · de 16:00 a 00:13". El bloque completo es un enlace a `/programa?dia=jueves`. Hitos, solo con datos: jueves con la nota de f05 y sábado con la nota de f36, con película, hora y sala.

### H-1.3 Secciones — `SeccionesFestival.tsx`
Cuatro bloques (una columna en celular, dos desde 768 px). Cada uno tiene de fondo el motivo de su sección en SVG grande y tenue, un borde superior de 4 px con el color de la sección, nombre completo en Big Shoulders, descripción del JSON, "8 películas" y una fila de miniaturas de `AfichePelicula` de sus películas (máximo 5 visibles, en el orden de los datos). Enlaza a `/programa?seccion=<id>`. Al pasar el cursor o recibir foco, el motivo se desplaza 6 px y el borde crece a 8 px en 200 ms.

### H-1.4 Salas — `MapaSalas.tsx`
- **Esquema SVG** (viewBox fijo, escalado al ancho): costa como línea ondulada, las 4 salas como nodos con posición esquemática (Terraza Faro y El Muelle cerca de la costa, Teatro y Galpón 7 hacia el interior), aristas entre las 6 parejas con los minutos al centro. Leyenda: "Esquema, no está a escala. Minutos caminando."
- **Tabla accesible** debajo del esquema (o como alternativa en menos de 480 px): matriz de minutos con encabezados de fila y columna (`th scope`). El SVG lleva `role="img"` y un `aria-label` que remite a la tabla.
- **Lista de salas:** nombre, dirección, capacidad ("420 butacas" o "200 personas" en la terraza) y, para Terraza Faro, etiqueta "Al aire libre" más la nota de lluvia.

### H-1.6 Entradas — `InfoEntradas.tsx` y `PiePagina.tsx`
Bloque con forma de boleto grande sobre papel: "Entrada general $4.000", "Funciones al aire libre: gratis", y el texto de venta del JSON. En el pie: wordmark, fechas, correo `mailto:`, Instagram (texto; si se enlaza, a `https://instagram.com/festivalniebla` en pestaña nueva con `rel="noopener noreferrer"`) y la frase de venta.

**Verificar Épica 1:** a 360 × 640 sin scroll se ven nombre, edición, fechas, lugar y botón; los enlaces de días y secciones abren el programa filtrado con los conteos correctos; con movimiento reducido no hay deriva ni haz en movimiento; en el panel de rendimiento de DevTools no aparecen "long tasks" periódicas.

---

## 5. Afiche generado (H-3.2) — `components/afiche/AfichePelicula.tsx` y `lib/azar.ts`

**Props:** la película; `tamano` (`mini`, `medio` o `grande`); `instancia` (texto obligatorio para que los ids internos del SVG sean únicos cuando la misma película aparece dos veces en una página, por ejemplo Cordillera de papel en f12 y f23 del programa). Componente sin estado y sin `'use client'`, importable desde servidor y cliente.

**Determinismo:** semilla = hash FNV-1a de 32 bits del id de la película; generador mulberry32 a partir de la semilla. Prohibido `Math.random`, fechas o `useId` para la forma. Todos los números que van al SVG se redondean a 2 decimales para que servidor y cliente produzcan el mismo texto.

**Estructura del SVG:** viewBox 0 0 400 500 (proporción 4:5), `aria-hidden="true"`, `focusable="false"`, `preserveAspectRatio="xMidYMid slice"`.
1. Fondo: degradado vertical entre dos tonos de la sección (el oscuro de papel llevado casi a negro arriba y un medio tono abajo). La semilla elige el ángulo entre -10° y 10°.
2. Motivo de sección, parametrizado por la semilla:
   - **competencia:** un círculo de luz (radio de 50 a 90, posición en el tercio superior) con 3 a 6 anillos concéntricos de trazo fino que se abren como un haz.
   - **panorama:** horizonte recto a una altura entre 55 y 75 %, cuadrícula de meridianos y paralelos de carta náutica en perspectiva suave, y una figura mínima de barco (trapecio más mástil) en posición variable.
   - **nocturna:** fondo casi negro; una banda de 7 a 13 triángulos de altura irregular (dientes) que sube desde abajo o baja desde arriba según la semilla, y una luna pequeña color `--niebla`.
   - **costa:** entre 5 y 9 ondas sinusoidales apiladas (amplitud y fase variables) y, sobre una zona, una malla diagonal de redes.
3. Niebla: 2 o 3 elipses anchas color niebla al 20–35 % con un filtro `feGaussianBlur` definido en `defs` con id `af-<peliculaId>-<instancia>-blur`.
4. Grano: solo en `grande`, un filtro `feTurbulence` a opacidad 0,08.
5. Texto (solo en `grande`): arriba, nombre corto de la sección y el año en Instrument Sans mayúsculas pequeñas; abajo, el título en Big Shoulders 800 ajustado con `textLength` si supera el ancho. En `mini` y `medio` no hay texto.

**Tamaños:** `mini` 48 × 60 (programa e itinerario), `medio` 160 × 200 (portada y "más de la sección"), `grande` al ancho de su columna con tope de 70svh (ficha). En `mini` se omiten niebla con filtro y grano para aliviar el programa.

**Verificar:** abrir las 24 fichas y confirmar que no hay dos iguales y que se distingue la sección; recargar y comparar; consola sin "Hydration failed"; en el HTML servido de `/programa` los ids de filtros no se repiten.

---

## 6. Programa (Épica 2) — `app/programa/page.tsx`

### Arquitectura
- La página es de servidor y estática: exporta `metadata`, pinta el h1 "Programa" y una bajada ("39 funciones del jueves 15 al sábado 17") y dentro un `Suspense` con `ProgramaInteractivo`.
- **Fallback del `Suspense`:** la misma lista presentacional sin filtros y sin interactividad de filtros, para que el HTML inicial ya tenga todo el programa (H-2.4, sin JavaScript).
- `ProgramaInteractivo` (cliente) lee `useSearchParams`, calcula el filtro, pinta `FiltrosPrograma` y la lista. Importa `funciones` desde `lib/programa.ts`.

### H-2.2 y H-2.3 Filtros — `FiltrosPrograma.tsx`
**Estado:** en la URL, no en `useState`. Parámetro `dia`: `jueves`, `viernes` o `sabado`; ausente es "Todos". Parámetro `seccion`: ids separados por coma; ausente es "Todas".

**Lectura:** se descartan valores no válidos; se quitan duplicados; si tras limpiar no queda nada, equivale a ausente.

**Escritura:** `router.replace` con la nueva query y `{ scroll: false }`. Al quitar el último filtro, la URL queda como `/programa` sin `?`. Orden fijo de las secciones en la URL (el de los datos) para que el mismo filtro dé siempre la misma URL. Al cambiar el día, llevar el scroll al inicio de la lista (no de la página) con `scrollIntoView` y `behavior` según movimiento reducido.

**Controles:**
- Día: grupo de 4 botones con `aria-pressed` (o radios estilizados), en fila, cada uno de 44 px de alto: "Todos", "Jue 15", "Vie 16", "Sáb 17". El activo lleva fondo `--niebla` y texto `--tinta`.
- Sección: 4 botones conmutables con `aria-pressed`, con un punto del color de la sección y el nombre corto. Menos de 480 px: grilla de 2 × 2. Desde 480 px: una fila. Un quinto botón "Limpiar" aparece solo si hay secciones elegidas.
- Contador vivo: "12 funciones", anunciado por `aria-live` al cambiar.

**Ubicación:** en celular, la barra de día es `position: sticky` arriba (48 px más padding); la grilla de secciones queda debajo y no es fija. Cuando la persona hace scroll y las secciones salen de la vista, la barra fija muestra al lado del día un resumen compacto ("Nocturna, Costa" y un botón "Cambiar" que devuelve el scroll a los filtros). Total fijo: 64 px o menos. Desde 1024 px: columna izquierda de 260 px con todos los filtros fijos.

**Vacío:** si no hay resultados, un bloque con niebla, la frase "No hay funciones con esos filtros" y el botón "Ver todo el programa".

### H-2.1 Lista — `FilaFuncion.tsx` y `EtiquetasFuncion.tsx`
**Agrupación:** por día con encabezado "JUEVES 15 DE OCTUBRE" en Big Shoulders sobre una regla. Dentro, orden por `inicioMin` y luego por nombre de sala.

**Fila (celular, grilla de 3 columnas):**
- Izquierda, 64 px: hora de inicio en Big Shoulders 800 de 2 rem, y debajo "a 20:05" en `--niebla-2` pequeño. Si `terminaOtroDia`, se agrega la línea "madrugada".
- Centro: `AfichePelicula` `mini` flotando junto al título en Instrument Sans 600 de 1,05 rem (enlace a la ficha que cubre título y afiche); línea de sección con su color y nombre corto; línea de meta: "El Muelle · 1 h 35 min".
- Derecha, 48 px: `BotonItinerario`.
- Borde izquierdo de 3 px del color de la sección.
- Etiquetas (texto en mayúsculas pequeñas, borde de 1 px, sin relleno de color de alerta): "Agotada" (tachado sutil sobre la hora de inicio, además del texto), "Aire libre · gratis", "Conversatorio 25 min", "Estreno mundial", y la nota completa en una línea itálica debajo cuando exista.

**Desde 1024 px:** la fila se abre en columnas (hora, afiche, título y sección, sala y duración, etiquetas, botón) y la lista queda a la derecha de los filtros.

**Casos:** Cortos I y II muestran "Varios directores" solo en la ficha, no en la fila. Una función agotada ya marcada sigue mostrando "Agotada".

### H-2.5 Marcar — `components/funcion/BotonItinerario.tsx` (cliente)
**Props:** la función y una variante visual (`compacto` en la fila, `amplio` con texto en la ficha).

**Comportamiento:** alterna la función con `useItinerario`. Al **agregar**, calcula con `lib/itinerario/avisos.ts` los avisos entre la nueva y las ya guardadas; si hay alguno, muestra un toast breve ("Ojo: se topa con Mar negro, jue 22:15" o "No alcanzas a llegar desde Terraza Faro: necesitas 20 min y tienes 19") con un enlace "Ver itinerario". Si no hay avisos, anuncio `aria-live` "Agregaste Sal de roca, viernes 18:00". Al **quitar**, anuncio y toast con "Deshacer".

**Antes de leer el almacenamiento:** el botón se pinta en estado no marcado pero deshabilitado visualmente al 60 % durante ese instante, sin salto de tamaño.

**Visual:** ícono SVG de boleto de 24 px dentro de un botón de 44 × 44. Sin marcar: trazo `--niebla`. Marcado: relleno `--faro` con una perforación circular en color tinta y el texto oculto "En tu itinerario". Animación al marcar (220 ms): el boleto baja a escala 0,85 y rebota a 1,08 y a 1 mientras la perforación aparece desde escala 0, como un sello de boletería. Al quitar: vuelve a trazo con fundido de 150 ms. Variante `amplio`: botón con texto "Agregar a mi itinerario" o "En mi itinerario" más el ícono.

**Nombre accesible:** "Agregar Sal de roca, viernes 16 a las 18:00, a mi itinerario", con `aria-pressed`.

### H-2.6 Grilla (P2) — `GrillaDia.tsx`
Solo desde 1024 px, con un conmutador "Lista" o "Grilla" guardado en la URL (`vista=grilla`). Requiere un día elegido; si está en "Todos", muestra un día por bloque. Columnas: las 4 salas. Eje: de la primera hora del día redondeada hacia abajo al término máximo redondeado hacia arriba, a 2 px por minuto. Bloques posicionados con `top` y `height` según minutos, con color de sección, título, horas y botón. Una línea más marcada a las 00:00 rotulada "medianoche".

### H-2.7 Ahora (P2)
Función `ahoraEnSantiago` en `lib/tiempo.ts` con `Intl.DateTimeFormat` y `timeZone: 'America/Santiago'` usando `formatToParts`, convertida a minutos absolutos del festival. Se ejecuta solo en el cliente después de montar (con `useSyncExternalStore` con valor de servidor nulo o en un efecto). Si cae entre la primera función del jueves menos 2 horas y el último término del sábado, y la URL no trae `dia`, hace `router.replace` al día que corresponde. Marca "En curso" si inicio ≤ ahora < término y "Siguiente" en la próxima. Se recalcula cada 60 s y el intervalo solo existe durante el festival.

**Verificar Épica 2:** conteos de H-2.2 y H-2.3; `/programa?dia=lunes&seccion=xyz` muestra todo; volver desde una ficha conserva el filtro; a 360 px la barra fija mide 64 px o menos; desactivar JavaScript y ver las 39 funciones; `npm run build` sin error de Suspense.

---

## 7. Ficha (Épica 3) — `app/pelicula/[id]/page.tsx`

### H-3.1 Datos
- `generateStaticParams` devuelve los 24 ids; `dynamicParams` en `false`; si la película no existe, `notFound()`.
- `generateMetadata` espera `params` y usa el título.
- **Diseño celular:** afiche `grande` a ancho completo con tope de 70svh; debajo, etiqueta de sección con color (enlace a `/programa?seccion=<id>`), h1 en Big Shoulders 900 con `clamp(2.5rem, 12vw, 5rem)`; título original en Instrument Serif itálica cuando exista; ficha técnica como lista de definiciones en dos columnas (Dirección, País, Año, Duración, Clasificación, Estreno); sinopsis en Instrument Serif de 1,3 rem con interlineado 1,45.
- **Desde 1024 px:** dos columnas; afiche fijo con `sticky` a la izquierda (40 %) y contenido a la derecha.
- **Textos de formato (`lib/formato.ts`):** duración "1 h 38 min" (63 da "1 h 3 min"; 60 daría "1 h"); clasificación "TE" da "Todo espectador", las otras quedan igual; estreno da "Estreno mundial", "Estreno latinoamericano" o "Estreno nacional".
- **Entrada:** el afiche aparece con opacidad y escala de 1,03 a 1 en 500 ms, y el título con `translateY` de 12 px en 400 ms con 80 ms de retraso. Nada con movimiento reducido.

### H-3.3 Funciones de la película
Sección "Funciones" con un boleto por función sobre `--papel` (borde perforado a la izquierda, talón con día corto y hora en Big Shoulders): día largo ("viernes 16 de octubre"), "18:00 a 19:52", sala y dirección, precio ("$4.000" o "Gratis, al aire libre"), etiquetas (agotada, conversatorio, nota) y, para la terraza, la nota de lluvia. `BotonItinerario` en variante `amplio`. Todos los textos sobre papel usan los colores "sobre papel".

### H-3.4 Más de la sección (P2)
Fila de hasta 4 películas de la misma sección (excluye la actual, en el orden de los datos) con afiche `medio` y título. "Volver al programa": `ProgramaInteractivo` guarda su query actual en `sessionStorage` (clave `niebla.programa.query`) cada vez que cambia; un enlace cliente en la ficha la lee después de montar y arma `/programa?<query>`, con `/programa` como valor inicial.

**Verificar Épica 3:** las 24 rutas existen en el build; `/pelicula/no-existe` da 404; Cordillera de papel lista f12 y f23; marcar en la ficha se refleja en el programa y en el contador.

---

## 8. Itinerario (Épica 4)

### H-4.1 Almacén — `lib/itinerario/almacen.ts` y `useItinerario.ts`
**Formato guardado:** clave `niebla.itinerario.v1` en `localStorage`; valor JSON con `version: 1` e `ids` (lista de ids de función).

**Almacén externo (módulo, sin React):**
- Estado en memoria: lista de ids (siempre deduplicada, filtrada contra `funciones` y ordenada por `inicioMin`) y bandera `persistible`.
- Lectura perezosa la primera vez que alguien se suscribe: `try` sobre `localStorage.getItem`; JSON inválido, versión distinta o formato inesperado dan lista vacía; si `localStorage` lanza error, `persistible` es falso.
- Operaciones: agregar, quitar, alternar, reemplazar (con una lista), sumar (unión con una lista) y vaciar. Cada una devuelve la lista anterior para poder deshacer. Cada una escribe en `localStorage` dentro de `try` y notifica a los suscriptores.
- Escucha el evento `storage` de `window` para la clave y, si cambia, relee y notifica (sincronía entre pestañas).
- **Instantánea estable:** la lista se reemplaza por una nueva referencia solo cuando cambia; `getSnapshot` devuelve siempre la misma referencia mientras no cambie (si no, `useSyncExternalStore` entra en bucle). La instantánea del servidor es una constante de lista vacía definida una sola vez.

**Hook `useItinerario`:** con `useSyncExternalStore` devuelve `ids`, un `Set` memorizado para consulta rápida, `funciones` enriquecidas memorizadas, las operaciones, `persistible` y `listo`. `listo` vale falso en servidor e hidratación y verdadero en el cliente; se obtiene con un segundo `useSyncExternalStore` de suscripción vacía, servidor falso y cliente verdadero.

**Aviso de no persistencia:** si `persistible` es falso, el primer cambio muestra una sola vez el toast "Tu navegador no deja guardar el itinerario. Lo verás mientras no cierres esta pestaña."

### H-4.3, H-4.4 y H-4.5 Avisos — `lib/itinerario/avisos.ts` (puro, sin React)
**Entrada:** lista de `Funcion` y la matriz de traslados. **Salida:** una lista de `Aviso` y una lista de `Tramo`.

**Tipo `Aviso`:**
- `tipo`: `choque`, `traslado`, `conversatorio`, `repetida`, `agotada`, `aireLibre` o `lluvia` (P2).
- `nivel`: `alerta` (choque y traslado), `cuidado` (conversatorio y lluvia) o `info` (repetida, agotada y aire libre).
- `ids`: la función o el par ordenado por inicio (primera y segunda).
- Datos numéricos según el tipo: `solapeDesde` y `solapeHasta` en choque; `necesitaMin` y `tieneMin` en traslado; `conversatorioMin` y `alcanzaMin` en conversatorio; más `pierdeConversatorio` booleano en choque y traslado.
- Un `id` estable, por ejemplo `choque-f09-f10`, para enlazar desde el resumen.

**Algoritmo:**
1. Ordenar por `inicioMin` y luego por id.
2. Para cada par (A, B) con A antes que B en ese orden, sin importar el día:
   - `hueco` = inicio de B − término de A. `caminata` = traslado entre la sala de A y la de B.
   - Si `hueco` < 0: **choque**. El solape va desde el inicio de B hasta el menor de los dos términos. `pierdeConversatorio` si A tiene conversatorio.
   - Si no, y `hueco` < `caminata`: **traslado**, con `necesitaMin` = caminata y `tieneMin` = hueco. `pierdeConversatorio` si A tiene conversatorio.
   - Si no, y A tiene conversatorio, y `hueco` − `caminata` < conversatorio de A: **conversatorio**, con `alcanzaMin` = `hueco` − `caminata` (queda entre 0 y el conversatorio menos 1).
   - Si no, nada.
   - Con dos funciones que empiezan a la misma hora, el hueco es negativo: choque.
   - Optimización permitida y no obligatoria: cortar el ciclo interno cuando el inicio de B supera el término de A más el conversatorio de A más la caminata máxima (22).
3. Por película repetida: un aviso `repetida` por par de funciones con el mismo `peliculaId`.
4. Por función: `agotada` si corresponde y `aireLibre` si la sala es al aire libre.
5. **Lluvia (P2):** para cada par donde A o B está en la terraza y no hay alerta en el caso normal, repetir la cuenta de traslado cambiando la terraza por el galpón; si aparece traslado o choque, aviso `lluvia` ("Si llueve y la función pasa a Galpón 7, no alcanzas").

**Tramos** (para la vista): entre funciones **consecutivas** en el orden y del mismo día de festival, un `Tramo` con desde, hasta, `caminataMin`, `margenMin` (hueco − caminata) y `estado` (`ok`, `justo` si el margen está entre 0 y 4, `traslado`, `choque`, `conversatorio`). Entre días distintos no hay tramo: se pinta el separador de día.

**Casos de prueba obligatorios** (salen de los datos):

| Par | Resultado esperado |
|---|---|
| f09 y f10 | choque, solape de 22:30 a 00:04 |
| f21 y f22 | choque, solape de 23:30 a 00:22 |
| f07 y f09 | traslado, necesita 20 y tiene 19 |
| f03 y f05 | traslado, necesita 8 y tiene 6, pierde el conversatorio de f03 |
| f08 y f10 | traslado, necesita 15 y tiene 3 |
| f19 y f21 | traslado, necesita 22 y tiene 1 |
| f13 y f16 | conversatorio, alcanza 1 de 25 |
| f13 y f17 | conversatorio, alcanza 3 de 25 |
| f31 y f34 | conversatorio, alcanza 14 de 30 |
| f38 y f39 | ninguno, tramo `ok` en la misma sala con margen 11 |
| f25 y f28 | ninguno: f25 termina 14:23 con conversatorio de 30 min y f28 empieza 15:00 en el mismo teatro; hueco 37, alcanza el conversatorio completo |
| f06 y f28 | repetida (Vidrio), sin otro aviso |
| f22 y f23 | ninguno: días distintos y 10 h 45 min de diferencia |

**Recomendación de verificación:** un script suelto, fuera de `app`, `components` y `lib` (por ejemplo en el scratchpad o en `scripts/` excluido del build), que importe la lógica y compruebe la tabla, o comprobarla a mano en `/itinerario/compartido?f=...` con cada par.

### Textos — `lib/itinerario/textos.ts`
Todas las frases se arman aquí a partir del `Aviso`, en tono cercano y sin emojis:
- **Choque:** "Se topa con {título} ({día corto} {hora}). Las dos se cruzan de {desde} a {hasta}."
- **Traslado:** "No alcanzas a llegar a {sala B}: son {necesita} min caminando y tienes {tiene}." Si `tieneMin` es 0: "y sales justo cuando empieza".
- **Conversatorio:** "Te pierdes parte del conversatorio de {título A}: alcanzas {alcanza} de {total} min antes de salir a {sala B}." Si `alcanza` es 0: "Te pierdes el conversatorio de {título A} para llegar a {título B}."
- **Pierde conversatorio dentro de otro aviso:** se agrega "Y te pierdes el conversatorio."
- **Repetida:** "Ya tienes {título} el {día} a las {hora}."
- **Agotada:** "Agotada: te sirve solo si ya tienes entrada."
- **Aire libre:** la nota de la sala del JSON.
- **Tramo ok:** "{caminata} min caminando a {sala}. Te sobran {margen}." Misma sala: "Te quedas en {sala}. Tienes {margen} min."
- **Tramo justo:** "Llegas justo: {caminata} min caminando y te sobran {margen}."

Plurales correctos ("1 minuto", "2 min").

### Vista — `components/itinerario/VistaItinerario.tsx` (cliente)
**Props:** `ids`; `modo` (`propio` o `compartido`); en compartido, `idsPropios` para marcar "Ya está en el tuyo".

Compone: `ResumenItinerario`, un bloque por día con encabezado y, por cada función, `BoletoFuncion` seguido de `TramoEntreFunciones` si hay tramo.

**Página `app/itinerario/page.tsx`:** servidor, `metadata`, h1 "Mi itinerario" y el componente cliente que usa `useItinerario`. Mientras `listo` sea falso muestra un esqueleto neutro de boletos en papel al 10 % (sin texto de "vacío" para no mentir).

### H-4.8 Dirección visual del itinerario
- **Recorrido:** una línea vertical de 2 px `--tinta-3` a la izquierda (x = 28 px en celular) que une todo el día, con un nodo circular por función del color de su sección.
- **`BoletoFuncion`:** boleto sobre `--papel` a la derecha de la línea. Talón izquierdo (72 px, separado por línea punteada) con la hora de inicio en Big Shoulders 800 y "a 19:52" debajo. Cuerpo con título (enlace a la ficha), sala, etiquetas, avisos de nivel `info` en línea y botón "Quitar" (texto con ícono de cruz SVG, 44 px). Borde perforado del lado del talón. A 360 px el boleto mide todo el ancho menos 44 px de la línea.
- **`TramoEntreFunciones`:** segmento de la línea entre dos boletos con un texto pequeño al lado.
  - `ok`: línea punteada `--niebla-2` y una fila de 3 a 6 puntos que representan pasos.
  - `justo`: puntos en `--cuidado` y texto de "llegas justo".
  - `traslado`: la línea se corta en zigzag y el texto va en una caja con borde izquierdo de 4 px `--alerta`, rótulo "NO ALCANZAS" en Big Shoulders más la frase.
  - `choque`: los dos boletos se superponen visualmente (el segundo sube 12 px con desfase horizontal de 16 px) y entre ellos una banda `--alerta` con "SE TOPAN" y la frase.
  - `conversatorio`: caja con borde `--cuidado` y rótulo "CONVERSATORIO".
  - Los choques entre funciones **no** consecutivas (por ejemplo, una película larga que cubre otras dos) se muestran como aviso dentro del boleto de ambas, porque no hay tramo que los contenga.
- **Entradas y salidas:** al montar, cada boleto entra con opacidad y `translateY` de 8 px con 40 ms de desfase por posición (máximo 400 ms total). Al quitar, el boleto se desliza 24 px a la derecha con opacidad a 0 y su alto se colapsa en 220 ms (contenedor con `grid-template-rows` de 1fr a 0fr); luego se actualiza el almacén. Los avisos nuevos aparecen con opacidad en 200 ms. Movimiento reducido: todo instantáneo.
- **Estado vacío (`EstadoVacio.tsx`):** un boleto en blanco dibujado con trazo, niebla alrededor, la frase en Instrument Serif "Tu recorrido todavía está en la niebla." y el botón "Ir al programa". Debajo, una ayuda corta: "Marca el boleto de las funciones que quieres ver y aquí armamos tu recorrido, con los tiempos para llegar caminando."

### H-4.7 Resumen — `ResumenItinerario.tsx`
Hoja de ruta arriba: cuatro cifras en Big Shoulders (funciones, películas, horas de cine como "7 h 40 min", avisos) y una línea "Entradas estimadas: $24.000, se pagan en boletería". Si hay avisos de nivel `alerta` o `cuidado`, una lista compacta de enlaces a cada uno (ancla al boleto con `id` del aviso). En `modo` propio: botones "Compartir" y "Vaciar itinerario". En desktop desde 1024 px, el resumen queda fijo en una columna derecha de 320 px.

### H-4.2 Quitar y deshacer
- `ProveedorAvisos` ofrece una función para mostrar un toast con texto, acción opcional ("Deshacer") y duración (6 s por defecto; se pausa con hover o foco).
- Los toasts se apilan abajo, encima de la barra de navegación, y entran con `translateY` de 16 px.
- **Quitar una:** guarda la lista anterior y ofrece "Deshacer", que llama a reemplazar con esa lista.
- **Vaciar:** igual, con el texto "Vaciaste tu itinerario (5 funciones)".
- No usar `window.confirm` ni `alert`.

### H-4.9 Compartir — `lib/itinerario/compartir.ts` y `BotonCompartir.tsx`
**Formato del link:** `/itinerario/compartido?f=` seguido de los ids en orden cronológico, sin la letra "f" y separados por punto. Por ejemplo `?f=05.09.13` para f05, f09 y f13. Con las 39 funciones el parámetro mide 116 caracteres.

**Codificar:** recibe ids, deduplica, ordena por inicio y quita el prefijo. **Decodificar:** recibe el texto o nulo; separa por punto, coma, espacio o guion; acepta cada pieza con o sin "f" inicial y con o sin cero a la izquierda ("5", "05", "f05"); normaliza a `fNN`; clasifica en válidos (existen en `funciones`) e inválidos; devuelve los válidos deduplicados y ordenados y la cantidad de inválidos.

**URL absoluta:** `window.location.origin` más la ruta, calculada al hacer clic, nunca en el render de servidor.

**Botón:** si existe `navigator.share`, compartir con título "Mi itinerario en el Festival de Cine Niebla", un texto con la cantidad de funciones y la URL (si el usuario cancela, `AbortError`, no mostrar error). Si no, `navigator.clipboard.writeText` y toast "Link copiado". Si falla, abrir debajo del botón un campo de solo lectura con la URL seleccionada y el texto "Copia este link". El botón no aparece con el itinerario vacío.

### H-4.10 Compartido — `app/itinerario/compartido/page.tsx` e `ItinerarioCompartido.tsx`
- La página de servidor exporta `metadata` ("Itinerario compartido"), pinta el h1 y un `Suspense` con fallback "Abriendo el itinerario compartido…" en estilo de boleto esqueleto. Dentro, `ItinerarioCompartido` (cliente) lee `useSearchParams().get('f')`, decodifica y usa `useItinerario` solo para leer el propio y para las acciones de copiar.
- **Encabezado:** rótulo "ITINERARIO COMPARTIDO" sobre banda `--faro` y la frase "Alguien armó este recorrido. Revísalo y, si te gusta, cópialo al tuyo."
- Si hay inválidos: aviso "Algunas funciones del link ya no están en el programa."
- Si no hay válidos: estado vacío con "Este link no trae funciones" y botón al programa.
- `VistaItinerario` en `modo` compartido: sin botones de quitar; cada boleto que ya esté en el propio muestra la etiqueta "Ya está en el tuyo".
- **Acciones:**
  - Si el propio está vacío (y `listo`): un botón "Copiar a mi itinerario".
  - Si no: "Sumar al mío" y "Reemplazar el mío".
  - Si todas las del compartido ya están en el propio: el texto "Ya tienes todas estas funciones" y un enlace a Mi itinerario.
  - Tras copiar: toast "Listo, copiamos N funciones a tu itinerario" con acción "Ver mi itinerario", y en "Reemplazar" también "Deshacer".
- Nunca escribir en el almacén solo por abrir la página.

**Verificar Épica 4:**
1. Marcar f09 y f10 y ver el choque en ambos boletos.
2. Marcar f07 y f09 y ver "necesita 20, tiene 19".
3. Marcar f13 y f16 y ver "alcanzas 1 de 25".
4. Marcar f38 y f39 y ver un tramo sin aviso.
5. Recargar y confirmar que siguen; abrir otra pestaña y quitar una, volver y confirmar que se actualizó.
6. En consola, poner basura en la clave de `localStorage`, recargar y ver el itinerario vacío sin error.
7. Compartir, abrir el link en una ventana privada, ver los mismos avisos y copiar.
8. Abrir `/itinerario/compartido?f=05.99.xx.05` y ver solo f05 y el aviso de funciones inexistentes.
9. Abrir el link compartido con un itinerario propio distinto y probar sumar y reemplazar con deshacer.

### H-4.11 Impresión (P2)
En `itinerario.module.css`, un bloque `@media print`: ocultar navegación, toasts, botones y grano; fondo blanco, texto negro; boletos con borde de 1 px negro y sin perforado; evitar cortes dentro de un boleto con `break-inside: avoid`.

---

## 9. Checklist final antes de avisar
- `npm run build` y `npm run lint` sin errores; rutas estáticas como en H-0.2.
- `git diff -- data/` vacío.
- Recorrido completo a 360 px y a 1440 px, con y sin movimiento reducido.
- Casos de la tabla de avisos comprobados.
- Consola del navegador sin errores de hidratación en portada, programa, ficha, itinerario y compartido.
- Búsqueda de emojis, textos en inglés y palabras de ranking sin resultados.
