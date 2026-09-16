# Entrega: sitio del Festival de Cine Niebla

Sitio de la 3ª edición del Festival de Cine Niebla (Puerto Bruma, Chile), construido según
`BRIEF.md`, `docs/BACKLOG.md` y `docs/DETALLE.md`, y corregido según los 18 hallazgos de
`docs/REVIEW.md`.

## Qué se construyó

### Portada (`/`)
Presenta el festival en segundos: hero con niebla, faro y haz de luz animados (título "NIEBLA"
en Big Shoulders), fechas y lugar sin necesidad de hacer scroll, y llamado a "Ver el programa".
Debajo: qué es el festival con cifras calculadas desde los datos, los tres días con una regla
de horas y los hitos reales (nota de cada función, no texto inventado), las 4 secciones con su
color, motivo y miniaturas de afiche, un esquema de las 4 salas con los minutos caminando entre
ellas (más una tabla accesible con los mismos datos) y la información de entradas y contacto.

### Programa (`/programa`)
Las 39 funciones agrupadas por día, con filtro por día y por sección (estado en la URL:
`?dia=sabado&seccion=costa,nocturna`), contador vivo, botón de itinerario en cada función y
aviso inmediato si la función recién marcada se topa, no alcanza o hace perder un
conversatorio respecto de otra ya elegida. El filtrado ocurre entero en el navegador, sin
pedir nada al servidor. Sin JavaScript se ve el programa completo (con la misma barra de
filtros, aunque no interactiva).

### Ficha de película (`/pelicula/<id>`)
24 páginas estáticas con los datos completos de cada película, un afiche generado con código
(sin imágenes, distinto por película, determinista) grande en la ficha y en miniatura en el
programa y el itinerario, todas las funciones de esa película con su boleto, precio y el mismo
botón de itinerario sincronizado con el resto del sitio, y las demás películas de la sección.

### Mi itinerario (`/itinerario`)
Cada función marcada arma un recorrido agrupado por día, con avisos de choque, traslado
imposible y conversatorio perdido (siempre nombrando a la otra función involucrada, con su
horario), resumen con las cifras del recorrido y enlaces a cada aviso, deshacer al quitar o
vaciar, y un botón "Compartir" que genera un link corto con las funciones elegidas.

### Itinerario compartido (`/itinerario/compartido?f=…`)
Muestra el recorrido de otra persona (rotulado como tal, sin marcarlo como "Mi itinerario" en
la navegación), con la opción de copiarlo al propio (sumar sin duplicar, o reemplazar, con
deshacer), y un aviso claro si el link trae funciones que ya no existen.

## Cómo correrlo

```bash
npm install     # instalar dependencias
npm run dev     # desarrollo, http://localhost:3000
npm run build   # build de producción
npm run start   # sirve el build de producción
npm run lint    # ESLint
```

## Decisiones importantes

- **Stack:** Next.js 16 (App Router) con TypeScript estricto, CSS Modules más variables CSS en
  `app/globals.css`, tipografías con `next/font` (Big Shoulders, Instrument Sans, Instrument
  Serif). Sin Tailwind, sin librería de animación ni de componentes, sin dependencias nuevas.
- **Horas:** todo se calcula en minutos absolutos del festival (`lib/tiempo.ts`), nunca con
  `Date()` ni `toLocale*` sobre los datos del JSON, así el sitio muestra las mismas horas sin
  importar la zona horaria del servidor o del navegador. `Date.UTC` solo se usa para restar
  fechas de calendario y saber el día de la semana.
- **Itinerario en `localStorage`:** un almacén externo (`lib/itinerario/almacen.ts`, sin
  React) expuesto con `useSyncExternalStore`, sincronizado entre pestañas con el evento
  `storage`. Distingue "el dato guardado es inválido" (se ignora, itinerario vacío) de "no
  hay acceso real a `localStorage`" (recién ahí se avisa una vez, desde cualquier lugar donde
  se modifique el itinerario).
- **Link compartido:** `/itinerario/compartido?f=05.09.13` — ids de función sin el prefijo
  `f`, separados por punto, en orden cronológico. Con las 39 funciones el parámetro mide 116
  caracteres.
- **Afiches generados:** cada película tiene una pieza SVG propia (`components/afiche/`), sin
  imágenes. Todos los parámetros de la pieza se calculan una sola vez en una función pura
  (`calcularParametros`), con un generador con semilla distinta por capa (fondo, motivo,
  niebla). Así la miniatura y el afiche grande son exactamente la misma pieza, y el resultado
  no depende de en qué tamaño se dibuja ni de cuántas veces se renderice.
- **Identidad visual:** concepto "carta de puerto en noche de niebla" — fondo azul petróleo,
  texto niebla, acento amarillo de faro, boletos de papel para lo que la persona guarda. Cada
  sección tiene su color y motivo propios, repetidos en portada, programa, ficha e itinerario.

## Qué quedó pendiente

### P2 no implementados
- **H-2.6** — vista de grilla por salas en escritorio.
- **H-2.7** — indicador de "ahora" durante el festival (`lib/tiempo.ts` ya expone
  `ahoraEnSantiago`, lista para usarse si se retoma).
- **H-4.11** — impresión: se ocultan navegación, pie, grano y botones de acción al imprimir,
  pero no se aplicó el estilo específico de boleto con borde de 1 px negro sin perforado.

### Hallazgos de `docs/REVIEW.md`
De prioridad alta y media quedaron corregidos y verificados R-01, R-02, R-03, R-04, R-05,
R-07, R-08, R-09, R-10 y R-11, con el itinerario de prueba (f03, f05, f06, f07, f09, f10,
f13, f16, f28), la barra de filtros a 360 y 800 px, la pestaña de red al filtrar, y
comparando los parámetros del afiche mini contra el grande.

**R-06 sigue pendiente.** Al cambiar de día con la página ya desplazada, la lista no vuelve a
su inicio: el scroll se queda donde estaba y el encabezado del día nuevo queda fuera de la
pantalla, hacia arriba. Se reproduce en el build de producción a 360 × 640 abriendo
`/programa?dia=jueves`, bajando unos 1400 px y tocando "Vie 16": el filtro cambia bien y la
lista se actualiza, pero el scroll no se mueve. El efecto que debía hacerlo está en
`components/programa/ProgramaInteractivo.tsx` (llama a `scrollIntoView` cuando cambia
`filtros.dia`) y no produce efecto; queda por averiguar por qué. Incumple un criterio de
H-2.4 del backlog.

De prioridad baja, se corrigieron R-12 (encabezados de programa ahora `h2`), R-13 (nombre
accesible del contador con la cantidad, y ya no pulsa en cada carga), R-14 (el fallback del
`Suspense` de `/programa` ahora incluye la misma barra de filtros, sin salto de layout), R-15
(la banda de niebla ahora sí pasa por delante del título en la portada — estructuralmente
tenía que ser hermana de `.contenido`, no hija de la misma capa que las bandas de atrás) y
R-17 (advertencia de fuente resuelta con `adjustFontFallback: false` y un `fallback` manual).

R-16 se corrigió en parte: las fechas del hero y del pie y los hitos de "Cuándo" en la portada
ahora se calculan desde `dias`/`nota` en vez de estar escritos a mano; los nombres cortos de
sala en el esquema de `/programa` siguen siendo un acorte editorial (no hay una regla
algorítmica razonable para derivarlos de `sala.nombre`), pero ahora viven en un
`Record<SalaId, string>` tipado en vez de una cadena de condicionales, así TypeScript avisa si
alguna vez se agrega o quita una sala sin actualizarlo.

R-18 no se corrigió: se agregó `.claude/launch.json` (configuración del servidor de vista
previa usada durante el desarrollo, para `next start`) en la raíz del proyecto. No afecta el
sitio ni se importa desde ningún lado; se deja documentado acá en vez de sacarlo, por si sirve
para correr una vista previa más adelante.

### Advertencias conocidas
- Ninguna advertencia de build activa: `npm run build` y `npm run lint` terminan limpios.
- El esquema de salas de la portada (`MapaSalas.tsx`) es una ilustración, no está a escala;
  la tabla accesible debajo tiene siempre el dato exacto.
