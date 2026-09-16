# Detalle técnico: sitio del Festival de Cine Niebla

Este documento traduce `docs/BACKLOG.md` a decisiones técnicas concretas para que Haiku implemente sin tener que decidir nada de diseño ni de arquitectura por su cuenta. Está escrito contra **Next.js 16.3.5** (App Router, TypeScript, React 19.2), confirmado leyendo `node_modules/next/dist/docs/` de este proyecto (versión real, no un ejercicio ficticio): `params` y `searchParams` son siempre `Promise` y deben `await`earse; `generateStaticParams` sigue funcionando igual que en versiones anteriores para prerenderizar rutas dinámicas; `cacheComponents`/`use cache` es una función **opt-in** (no viene activada por defecto) pensada para cachear llamadas a APIs externas o bases de datos. Como todo nuestro contenido sale de un `import` local de `data/programa.json` (sin `fetch`, sin base de datos), **no la necesitamos y no la activamos**. Además, el brief exige que "el sitio tiene que funcionar entero en el navegador" sin backend: por eso, tras la revisión de este documento, **toda ruta queda prerenderizada en `next build`** (cero rutas renderizadas por request). Los filtros de `/programa`, que en un primer borrador leían `searchParams` en el servidor, pasan a ser segmentos de ruta estáticos (ver 0.7/0.8/A1 en "Cambios tras la revisión").

No se modifica `data/programa.json`. No se usan librerías de componentes ni de animación (ver razones en 0.2).

---

## 0. Decisiones globales

### 0.1 Estilos: CSS Modules

Se usa **CSS Modules** (ya viene configurado), no Tailwind. Razón: la identidad visual depende de un lenguaje propio (niebla, degradados, un sello SVG por película) más que de utilidades de layout; CSS Modules con variables CSS (`:root`) da control total del sistema de diseño sin instalar nada nuevo ni tocar `next.config.ts`/PostCSS.

Estructura de estilos:

- `app/globals.css`: reset mínimo, variables de diseño (`--color-*`, `--espacio-*`, `--fuente-*`, `--radio-*`, `--duracion-*`), estilos base de tipografía y del elemento `html`/`body`, utilidades muy pequeñas y genéricas (`.solo-lectura-pantalla` para texto solo para lectores de pantalla, `.saltar-enlace`).
- Un archivo `Nombre.module.css` por componente que tenga estilos propios, colocado junto al componente.
- Nada de CSS-in-JS, nada de librerías de componentes.

### 0.2 Sin librería de animación

Todas las transiciones (aparición de avisos, quitar una función del itinerario, la pieza visual de cada película) se resuelven con transiciones y `@keyframes` de CSS puro, controladas con `prefers-reduced-motion`. No hace falta ninguna librería: los movimientos que pide el brief (fundidos, deslizamientos cortos, una animación ambiental sutil en la portada) son casos de uso directos de CSS. Instalar una librería solo para esto sería una dependencia sin beneficio real.

### 0.3 Fuentes con `next/font`

Dos fuentes de Google vía `next/font/google`, cargadas una sola vez en `app/layout.tsx` y expuestas como variables CSS (`className` con las variables, no `className` de la fuente directamente, para poder combinarlas con CSS Modules):

- **Fuente de títulos** (personalidad, condensada o con carácter, ej. una serif de trazo marcado o una display no genérica): variable `--fuente-titulos`.
- **Fuente de lectura** (alta legibilidad en pantallas chicas, ej. una humanista): variable `--fuente-texto`.

Ambas con `subsets: ['latin']` y `display: 'swap'`. Se aplican por CSS (`font-family: var(--fuente-texto)`), no hace falta `next/font/local` porque no hay tipografías propietarias que instalar.

**Familias concretas** (disponibles en `next/font/google`, no queda a criterio de quien implemente):

- **Títulos**: `Fraunces` (variable; si se fija peso, usar 600–800). Serif de trazo marcado, con carácter editorial — encaja con "niebla/puerto/noche" sin caer en un logo de feria.
- **Lectura**: `Atkinson Hyperlegible` (pesos 400 y 700). Diseñada para máxima legibilidad en pantallas chicas y con poca luz, coherente con el público que revisa el programa caminando y cansado después de la pega. Alternativa igualmente válida si no se encuentra en el paquete de fuentes instalado: `Source Sans 3` (400/700).

### 0.4 Estructura de carpetas

```
app/
  layout.tsx                  Server. Fuentes, <html lang="es">, NavPrincipal, Pie, ItinerarioProvider, saltar-enlace
  globals.css
  page.tsx                    Server, estático. Portada
  not-found.tsx                Server, estático. 404 en español
  programa/
    page.tsx                  Server, estático. Día 1, todas las secciones + <RedirigirHoy/> (cliente)
    [dia]/
      page.tsx                Server, estático. generateStaticParams (3 slugs) + dynamicParams = false
      [seccion]/
        page.tsx              Server, estático. generateStaticParams (3×4 = 12) + dynamicParams = false
  pelicula/
    [id]/
      page.tsx                Server, estático. generateStaticParams (24) + dynamicParams = false
  itinerario/
    page.tsx                  Server, estático (shell). Renderiza <ItinerarioVista modo="propio" />
    compartido/
      page.tsx                Server, estático (shell). <Suspense><ItinerarioVista modo="compartido" /></Suspense>

components/
  layout/
    NavPrincipal.tsx          Server: enlaces fijos (Portada, Programa, Mi itinerario) + <ContadorItinerario/>
    ContadorItinerario.tsx    Client: lee el contexto de itinerario
    Pie.tsx                   Server: contacto, texto legal breve
    SaltarAlContenido.tsx     Server: enlace "Saltar al contenido"
  pelicula/
    SelloPelicula.tsx         Compartido (sin APIs de servidor): SVG determinista (ver 1.4)
    FichaFuncion.tsx          Server: una función dentro de una lista (programa, ficha, itinerario)
    BotonItinerario.tsx       Client: interruptor agregar/quitar
    BotonVolver.tsx           Client: router.back() con fallback a /programa (ver H3.1)
    InsigniaSeccion.tsx       Compartido (sin APIs de servidor): nombre + color de sección
  programa/
    SelectorDia.tsx           Server: <Link> por día (segmento de ruta)
    SelectorSeccion.tsx       Server: <Link> por sección + "todas" (segmento de ruta)
    ListaPrograma.tsx         Server: agrupa y ordena FichaFuncion
    RedirigirHoy.tsx          Client: calcula "hoy" en America/Santiago y hace router.replace si corresponde
  itinerario/
    ItinerarioProvider.tsx    Client: contexto global + región viva global de anuncios (ver 0.6, A5)
    ItinerarioVista.tsx       Client: recorrido, avisos, resumen, compartir (propio y compartido)
    BotonCompartir.tsx        Client
  ui/
    AvisoInline.tsx           Compartido (sin APIs de servidor): caja de aviso accesible (choque/traslado/conversatorio) sin depender del color
    EstadoVacio.tsx           Compartido (sin APIs de servidor)

lib/
  datos.ts                    import programa.json + accesores derivados (getPelicula, getFuncionesDeDia, etc.) — módulo compartido, importable desde servidor y cliente (ver 0.6)
  tiempo.ts                   aritmética horaria sin conversión de huso horario (ver 0.5)
  itinerario-reglas.ts        funciones puras: choques, traslados, conversatorios (ver 3 del backlog y E5 abajo)
  almacenamiento.ts           wrapper de localStorage con manejo de errores (ver H4.2)
  compartir.ts                codificar/decodificar el link (ver sección 3)
  visual.ts                   hash determinista + parámetros del sello de cada película (ver 1.4)

types/
  festival.ts                 tipos derivados del JSON (Festival, Sala, Seccion, Pelicula, Funcion, FuncionEnriquecida)
```

`data/programa.json` se importa una sola vez en `lib/datos.ts` (`import programa from '@/data/programa.json'`); todo lo demás consume los accesores de ese módulo, nunca el JSON directamente. Esto cumple H0.1: si mañana cambia el JSON, no hay que tocar nada más.

Nota sobre "Compartido (sin APIs de servidor)" en la tabla de arriba (C1): `AvisoInline`, `SelloPelicula`, `EstadoVacio` e `InsigniaSeccion` son componentes de función normales, sin `cookies()`/`headers()`/`fetch` ni ninguna otra API exclusiva de servidor — no necesitan (ni deben llevar) `"use server"`, y tampoco necesitan `"use client"` propio: cuando un componente padre de servidor los usa se renderizan como servidor, y cuando `ItinerarioVista` (cliente) los usa se renderizan como parte del árbol de cliente, sin ningún cambio de código. Marcarlos como "Server" en la documentación original inducía a pensar que no podían usarse dentro de `ItinerarioVista`, lo cual es incorrecto.

### 0.5 Horas y zonas horarias — la regla más delicada del proyecto (H0.2)

**Nunca se usa `new Date("2026-10-15T20:15")` ni `.toLocaleString()` sin `timeZone` fijo para las horas del programa.** El motivo: un string de fecha sin sufijo de zona (`Z` o `+00:00`) se interpreta como hora local **del motor que ejecuta el código** (el servidor, o el navegador si se calculara ahí). En un servidor con `TZ=UTC` o en un visitante con el reloj en `Asia/Tokyo`, esa interpretación da una hora absoluta distinta y por lo tanto una hora mostrada distinta — exactamente el bug que H0.2 exige verificar y evitar.

En vez de convertir a un instante absoluto, tratamos cada `inicio` del JSON como **aritmética de calendario pura**, sin pasar nunca por una zona horaria real. Para esto **sí está permitido, y es lo recomendado, usar `Date.UTC(...)` y los métodos `getUTC*()`** (`getUTCFullYear`, `getUTCMonth`, `getUTCDate`, `getUTCHours`, `getUTCMinutes`, `getUTCDay`): son puramente aritméticos, no dependen jamás de la zona horaria del entorno que ejecuta el código (a diferencia de `new Date(string)`, `.getDate()`, `.getHours()`, `.getDay()` o `.toLocaleString()` sin `timeZone`, que sí dependen de ella y por eso están prohibidos para las horas del programa). La idea es tratar los números del JSON como si fueran "UTC" únicamente como truco de cálculo — nunca significan la hora UTC real, son la hora de Chile tal cual está escrita.

1. `parseInicio(iso: string)`: separa el string `"2026-10-15T20:15"` por caracteres (`-`, `T`, `:`) en `{ anio, mes, dia, hora, minuto }`, todos números, sin usar `Date` todavía.
2. `minutosAbsolutos({anio,mes,dia,hora,minuto})` = `Date.UTC(anio, mes - 1, dia, hora, minuto) / 60000`. Da un entero que solo sirve para sumar, restar y comparar — nunca se muestra ni se interpreta como un instante real (aunque por dentro se apoye en `Date.UTC`, el resultado sigue siendo "minutos de calendario", no un instante en UTC de verdad).
3. `finDePelicula(funcion)` = `minutosAbsolutos(inicio) + duracionMin`.
4. `finConConversatorio(funcion)` = `finDePelicula(funcion) + (conversatorioMin ?? 0)`.
5. `diaSemanaISO(anio, mes, dia)`: `new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay()` → 0=domingo … 6=sábado (convención de JavaScript). Con esto se deriva el nombre del día ("jueves", "viernes", "sábado") a partir de la fecha real del JSON, no escrito a mano (cumple el criterio de H0.1), y el código sigue siendo correcto si algún año el festival cambia de día de la semana.
6. `formatearHora(minutosAbsolutos)` → `"HH:MM"`: reconstruye con `const d = new Date(minutosAbsolutos * 60000)` y lee `d.getUTCHours()` / `d.getUTCMinutes()` (nunca `getHours()`/`getMinutes()`, que son locales al entorno).
7. Para mostrar el **fin** cuando cruza medianoche (`f22`→01:15, `f39`→01:07, `f09`→00:13, `f10`→00:04, `f21`→00:22): se calcula `finDePelicula` en minutos absolutos, se reconstruye la fecha completa con `new Date(finDePelicula * 60000)` leyendo `getUTCFullYear()/getUTCMonth()+1/getUTCDate()/getUTCHours()/getUTCMinutes()`, y si el día resultante es distinto del día de inicio se muestra la hora igual (`"01:15"`) más una marca textual explícita, por ejemplo "01:15 (del viernes 16)" o "01:15 · madrugada del viernes" — el texto exacto lo decide quien construya el componente, pero **siempre** debe nombrar el día siguiente en palabras, no solo con un asterisco o color.
8. Nombres de mes y de día de la semana en español son constantes fijas de la aplicación (`['domingo','lunes',...]` en el orden que da `getUTCDay()`, `['enero','febrero',...]`) — esto **no** es "escribir a mano los datos del festival" (lo prohibido es inventar fechas/horarios), es una tabla de traducción de idioma, igual que tener el string `"Choque"` fijo en el código.

Con esta base, **"hoy" para H2.5** es el único punto del sitio donde sí interesa la hora real del reloj, y ahí la regla es la opuesta: se pide explícitamente la fecha en la zona horaria de Chile, fija, **nunca la del visitante ni la del servidor que sirvió el HTML**, usando `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year:'numeric', month:'2-digit', day:'2-digit' })` sobre `new Date()` (el `Date` aquí representa el instante real "ahora", que sí es válido convertir, porque se ancla explícitamente a `America/Santiago` y no al reloj de quien ejecuta el código). Tras la revisión (A1), esto se calcula **en el cliente**, dentro de `RedirigirHoy` (ver 0.7/H2.5), no en un Server Component — de todas formas es el mismo cálculo pinneado a `America/Santiago`, así que sigue sin depender de la zona horaria del visitante.

Duraciones (H0.2 último punto): se muestran siempre como minutos si duran menos de 60 (`"84 min"`) y como horas y minutos si son 60 o más (`"1 h 52 min"`), con una sola función `formatearDuracion(minutos)` reutilizada en toda la app para que el formato sea consistente.

### 0.6 Cómo se cargan y comparten los datos, y qué es cliente

- **Datos del festival**: `lib/datos.ts` es un módulo **compartido**, importable tanto desde Server Components como desde Client Components — decisión única, sin excepciones (A6: una versión anterior de este documento decía a la vez que sí se podía importar en cliente y que no se debía, y ninguna otra pieza del sitio funciona sin esto: `ItinerarioProvider` necesita `getFuncion` para descartar ids inválidos guardados o del link, `lib/compartir.ts` lo necesita para `decodificar`, `BotonItinerario` lo necesita para el aviso previo de choque (H2.6) y para el anuncio de accesibilidad (A5), y `ItinerarioVista` lo necesita para mostrar cualquier función elegida). El JSON pesa ~17 KB, entra una sola vez en el bundle donde se use (servidor y/o cliente) y no hace falta pasar ninguna lista completa por props desde un Server Component — cada componente, sea servidor o cliente, importa directamente lo que necesita de `lib/datos.ts`.
- **Itinerario (E4/E5/E6)**: vive enteramente en el cliente. Un único `ItinerarioProvider` (Client Component) se monta en `app/layout.tsx` envolviendo `{children}`, y expone por contexto de React: la lista de ids de función elegidos, `agregar(id)`, `quitar(id)`, `vaciar()`, `tieneFuncion(id)`, `cargado` (booleano) y `disponible` (booleano: si `localStorage` funcionó). Todo lo que necesita leer o modificar el itinerario (contador de nav, botón agregar/quitar, la propia página de itinerario) usa el hook `useItinerario()` en vez de leer `localStorage` directamente. Esto evita seis implementaciones distintas del mismo estado y hace trivial sincronizar el contador de la navegación con cualquier cambio (H0.3, H5.4 "se recalculan al instante... desde cualquier página").
- **Anuncio a lectores de pantalla (A5)**: `ItinerarioProvider` también monta, una sola vez para todo el sitio, una región `aria-live="polite"` visualmente oculta (clase `.solo-lectura-pantalla`, ver 0.1). `agregar(id)`/`quitar(id)` escriben ahí un mensaje corto (ej. `"Agregada «Vidrio» a tu itinerario. Se topa con «La hora azul del puerto»."` / `"Quitada «Vidrio». Tu itinerario tiene 2 funciones."`), calculando el choque con `lib/itinerario-reglas.ts` contra el resto del itinerario ya elegido. Al vivir en el layout raíz, esta región existe **siempre**, así que el anuncio funciona igual al agregar desde `/programa`, desde una ficha o desde `/itinerario` — a diferencia de depender de que `ItinerarioVista` esté montada, que solo ocurre en `/itinerario`.
- **Qué es servidor y qué es cliente**:
  - Servidor (sin JS, contenido pleno en el HTML inicial): portada, listado de programa (todas las rutas y combinaciones de día/sección, ver 0.7), ficha de película, navegación y pie, sello visual de cada película.
  - Cliente (requiere JS, y así se anuncia): el interruptor de agregar/quitar de cada función, el botón "Volver al programa" (`BotonVolver`), el contador de la navegación, el redireccionador de "hoy" en `/programa` (`RedirigirHoy`, mejora progresiva, no bloquea el contenido sin JS), toda la página de Mi itinerario (recorrido, avisos, resumen, compartir, vaciar) y la vista de itinerario compartido.

### 0.7 Filtros de Programa: segmentos de ruta estáticos, no `searchParams` (A1)

**Corrección tras la revisión**: el brief exige "sin backend… el sitio tiene que funcionar entero en el navegador". Una ruta que lee `searchParams` en el servidor queda renderizada por request, lo que exige un servidor Node en producción y ya no es compatible con un `output: 'export'` — no hace falta activar el export estático, pero el sitio tiene que poder serlo. Por eso el día y la sección **son segmentos de ruta**, no query params:

- `app/programa/page.tsx`: estático, sin segmento — equivale al primer día del festival (jueves) con todas las secciones. Además monta `<RedirigirHoy />` (ver H2.5) para la mejora progresiva de "hoy".
- `app/programa/[dia]/page.tsx`: estático, `generateStaticParams` devuelve los 3 `slug` de `getDiasFestival()` (ver B3) y `export const dynamicParams = false`. Ese día, todas las secciones.
- `app/programa/[dia]/[seccion]/page.tsx`: estático, `generateStaticParams` devuelve las 3×4 = 12 combinaciones `{dia, seccion}` y `export const dynamicParams = false`. Ese día, esa sección.

Las tres rutas comparten la misma función de render (`renderPrograma(diaIndice, seccionId?)` en `components/programa/ListaPrograma.tsx` o similar) para no triplicar el marcado — solo cambia qué `page.tsx` la invoca y con qué parámetros ya resueltos en build time.

`SelectorDia` y `SelectorSeccion` son `<Link>` normales hacia estas rutas (`/programa/${diaSlug}` para "todas las secciones", `/programa/${diaSlug}/${seccionId}` para una sección puntual), conservando el segmento que no se está cambiando.

Ventajas de esta decisión, explícitas para quien la revise:

- Funciona **sin JavaScript** (H0.9): cada combinación es un archivo HTML completo generado en el build; cambiar de día o sección es una navegación GET normal a otra página estática.
- Con JavaScript, `<Link>` de Next.js hace la transición sin recarga completa de página (cumple H2.2 "no recarga la página").
- El estado vive solo en la URL: el botón "atrás" del navegador funciona gratis, y un enlace de la portada (H1.2) hacia `/programa/${diaSlug}/${seccionId}` llega directo al programa filtrado.
- **Todas las rutas quedan estáticas**: cero páginas renderizadas por request, compatibles con `output: 'export'` si algún día hiciera falta, sin necesidad de ningún servidor propio más allá de servir archivos.
- Un `dia`/`seccion` inválido en la URL (typo, id inventado) da **404 real** gracias a `dynamicParams = false`, en vez de tener que programarlo como un caso especial de "sin resultados" (H2.2).

Los toggles de itinerario dentro de la lista de programa son islas de cliente (`BotonItinerario`) que reciben el id de función por props; el resto de cada fila es HTML de servidor.

### 0.8 Estrategia de generación

**Tras la revisión (A1): el sitio queda 100% estático — ninguna ruta se renderiza por request.**

| Ruta | Renderizado | Por qué |
|---|---|---|
| `/` | Estática (build) | No depende de request ni de reloj |
| `/programa` | Estática (build) | Equivale a `/programa/<slug del primer día>`, todas las secciones; incluye `<RedirigirHoy/>` (cliente) que hace `router.replace` a "hoy" si corresponde (H2.5) |
| `/programa/[dia]` | Estática (build), 3 rutas | `generateStaticParams` devuelve los 3 `slug`; `export const dynamicParams = false` → un slug inventado da 404 real |
| `/programa/[dia]/[seccion]` | Estática (build), 12 rutas | `generateStaticParams` devuelve las 3×4 combinaciones; `export const dynamicParams = false` |
| `/pelicula/[id]` | Estática (build), 24 rutas | `generateStaticParams` devuelve los 24 ids; `export const dynamicParams = false` para que cualquier id que no esté en la lista dé 404 real en vez de intentar renderizar en runtime |
| `/itinerario` | Estática (build), shell vacío de servidor + `ItinerarioVista` cliente | No depende de datos de request |
| `/itinerario/compartido` | Estática (build), shell + `Suspense` + `ItinerarioVista` cliente que lee `useSearchParams()` | `useSearchParams` en una ruta prerenderizada exige envolver el Client Component en `<Suspense>` (si no, `next build` falla con el error de "Missing Suspense boundary"); así el resto de la página se prerenderiza igual. Esto **no** es lo mismo que una ruta dinámica: sigue siendo un archivo estático, el `Suspense` solo delimita qué parte se resuelve en el cliente |
| `/not-found` (raíz) | Estática | Página 404 en español para cualquier id o ruta inventada |

Total: 1 (portada) + 1 (`/programa`) + 3 (`/programa/[dia]`) + 12 (`/programa/[dia]/[seccion]`) + 24 (`/pelicula/[id]`) + 1 (`/itinerario`) + 1 (`/itinerario/compartido`) + 1 (`/not-found`) = 44 páginas estáticas. La salida de `next build` debe listarlas todas como estáticas (símbolo `○`), ninguna como dinámica por request (símbolo `ƒ`) — ver checklist de la sección 4.

---

## 1. Identidad visual concreta

### 1.1 Paleta

Todo en variables CSS sobre `:root` en `globals.css`. Base "niebla nocturna de puerto": azules muy oscuros de fondo, niebla en grises azulados translúcidos, un acento cálido (luz de faro/boliche) para llamados a la acción y estados activos.

| Variable | Valor | Uso |
|---|---|---|
| `--color-fondo` | `#0b1420` | Fondo general (azul casi negro, "noche de puerto") |
| `--color-fondo-elevado` | `#101d2c` | Tarjetas, cabeceras de sección |
| `--color-niebla` | `#c7d3dc` | Textos secundarios, líneas divisoras, la "niebla" misma |
| `--color-texto` | `#eef3f6` | Texto principal sobre fondo oscuro |
| `--color-acento` | `#f4a642` | Faro/luz cálida: CTA principal, foco de teclado, estado activo |
| `--color-acento-suave` | `#3c2c14` | Fondo de insignias sobre `--color-acento` con buen contraste |
| `--color-aviso` | `#6b8cae` | Base de avisos de traslado/conversatorio (con forma/ícono, nunca solo color, ver 2.E5) — deliberadamente distinto de `--color-acento` para no confundir un aviso con un botón principal |
| `--color-error` | `#ff8a80` | Choques (siempre acompañado de texto e ícono) |
| `--color-seccion-competencia` | `#3d6fa8` | Azul puerto — acento/borde de la sección Competencia Latinoamericana |
| `--color-seccion-competencia-texto` | `#8fb8e8` | Texto/insignia de Competencia sobre `--color-fondo-elevado` |
| `--color-seccion-panorama` | `#3f9099` | Cian niebla — acento/borde de Panorama Internacional |
| `--color-seccion-panorama-texto` | `#7fcbd2` | Texto/insignia de Panorama sobre `--color-fondo-elevado` |
| `--color-seccion-nocturna` | `#6a4d9c` | Violeta noche — acento/borde de Bruma Nocturna |
| `--color-seccion-nocturna-texto` | `#b9a3e3` | Texto/insignia de Bruma Nocturna sobre `--color-fondo-elevado` |
| `--color-seccion-costa` | `#b3762f` | Óxido/arena — acento/borde de Hecho en la Costa |
| `--color-seccion-costa-texto` | `#e0a866` | Texto/insignia de Hecho en la Costa sobre `--color-fondo-elevado` |

**Corrección de contraste (A4)**: los cuatro colores base de sección (`--color-seccion-*`) no alcanzan 4.5:1 como fondo de insignia con ningún color de texto disponible (con texto oscuro, Competencia da ~3.6:1 y Bruma Nocturna ~2.8:1; con texto claro, Panorama da ~3.7:1 y Costa ~3.6:1). Por eso `InsigniaSeccion` (ver 1.3) **no** usa el color de sección como fondo: el fondo de la insignia es siempre `--color-fondo-elevado`, con un borde de 2px y el texto en la variante `-texto` de la sección (aclarada para llegar a ≥4.5:1 sobre `--color-fondo-elevado`); el color base `--color-seccion-*` se reserva para acentos que no llevan texto encima (borde izquierdo de una tarjeta, un punto de color). Todos los pares texto/fondo se verifican en 4.5:1 (texto normal) y 3:1 (texto grande/iconos) sobre `--color-fondo` y `--color-fondo-elevado`; el significado nunca depende solo del color — siempre va acompañado del nombre de la sección en texto.

### 1.2 Tipografía y espaciado

- `--fuente-titulos` / `--fuente-texto`: ver 0.3.
- Escala tipográfica fija (`--texto-xs` 0.8rem, `--texto-s` 0.9rem, `--texto-m` 1rem/16px, `--texto-l` 1.25rem, `--texto-xl` 1.75rem, `--texto-xxl` 2.5rem clamped con `clamp()` para escritorio). El cuerpo de sinopsis nunca baja de 1rem (16px) según H0.4.
- Espaciado en escala de 4px: `--espacio-1: 4px` ... `--espacio-8: 32px`, etc. Se usa para todo `gap`/`padding`/`margin` en vez de valores sueltos, para que el ritmo visual sea consistente.

### 1.3 Cómo se distingue cada sección visualmente

Cada `Seccion` tiene su par de colores (tabla 1.1, corregida en A4): `--color-seccion-X` para acentos sin texto encima (borde) y `--color-seccion-X-texto` para el texto de la insignia. `InsigniaSeccion` es una pequeña etiqueta de texto (nombre de la sección) con fondo `--color-fondo-elevado`, borde de 2px en `--color-seccion-X` y texto en `--color-seccion-X-texto` — siempre con el nombre en texto, nunca solo el color, para cumplir H0.5. Las páginas de programa y portada usan `--color-seccion-X` (el color base, no el de texto) como borde izquierdo o superior de la tarjeta de función, de forma consistente en todo el sitio.

### 1.4 El sello de cada película (H3.2) — pieza generada por código

Componente `SelloPelicula`, Server Component, recibe `{ id, seccion, duracionMin, anio, tamano: 'chico' | 'grande' }` y devuelve un `<svg viewBox="0 0 100 100">` — vectorial, se ve nítido en cualquier tamaño.

**Determinismo**: se concatenan las cuatro entradas (`` `${id}|${seccion}|${duracionMin}|${anio}` ``) y se pasan por un hash entero simple y estable (por ejemplo FNV-1a de 32 bits, unas 10 líneas, sin dependencias externas). Ese entero alimenta un generador pseudoaleatorio determinista minúsculo (ej. `mulberry32`, también sin dependencias) del que se sacan 4-5 números en `[0,1)` siempre en el mismo orden. Con la misma entrada, siempre salen los mismos números → siempre el mismo dibujo, en cualquier página, dispositivo o carga (cumple el criterio "determinista" de H3.2 literalmente).

**Composición** (de atrás hacia adelante):

1. **Fondo**: degradado lineal vertical de dos tonos derivados del color de la `seccion` (uno más oscuro arriba, uno más claro abajo) — dos secciones comparten familia de color pero cada película varía el ángulo del degradado (±20°, desde el generador) y un desplazamiento de tono (±10°, hsl) para que no sean idénticas dentro de la misma sección.
2. **Capas de niebla**: entre 3 y 6 franjas horizontales onduladas (paths con curvas Bézier cúbicas), cuya cantidad depende de `duracionMin` (`3 + Math.floor(duracionMin / 30)`, tope 6): películas más largas se sienten más "cargadas" de capas. La amplitud y el desfase de cada onda salen del generador (deterministas). Opacidad decreciente hacia arriba.
3. **Un disco de luz** (faro o luna, según convenga al lenguaje visual elegido): círculo con `radialGradient`, posición `(x,y)` determinista dentro del tercio superior.
4. **Puntitos de luz** ("luces del puerto"): entre 4 y 10 círculos chicos, cantidad y posiciones deterministas, ligada también a `anio` (por ejemplo `4 + (anio % 7)`) para que el año participe visiblemente del resultado.

**Familia por sección**: todas las películas de una misma sección comparten paleta base y el mismo "tipo" de composición; lo que cambia entre películas es el ángulo, el desfase de las ondas y la posición de las luces — suficiente para que dos películas cualquiera se distingan a simple vista (criterio de H3.2) sin perder aire de familia dentro de la sección.

**Movimiento reducido**: la única animación posible sobre el sello es una deriva horizontal muy lenta y sutil de las capas de niebla (`@keyframes` de `transform: translateX`, 30-60s, `ease-in-out infinite alternate`), y solo se activa dentro de `@media (prefers-reduced-motion: no-preference)`. Con movimiento reducido el SVG es 100% estático (no hace falta JS para desactivarla: la media query ya la excluye).

**Tamaños**: `tamano="chico"` fija el contenedor a algo como 56×56px (lista de programa, itinerario); `tamano="grande"` lo deja a ancho completo con una altura mayor (cabecera de ficha, ~30vh tope). El mismo componente y el mismo `viewBox` sirven para ambos — solo cambia el CSS del contenedor.

**Ids de SVG únicos por película (A3)**: cada `SelloPelicula` define sus propios `<linearGradient>`/`<radialGradient>` con `id`, y los ids de SVG son globales al documento HTML, no locales al `<svg>`. En una página de programa hay 10 a 17 sellos a la vez, y una misma película puede aparecer más de una vez en el mismo día o en distintas páginas (`temporada-seca` en `f27` y `f33`, ambas en el programa del sábado). Por eso **todo id interno del SVG lleva el id de la película como prefijo** (`` `grad-fondo-${id}` ``, `` `grad-luz-${id}` ``, etc.), nunca un id genérico como `"grad1"`. Dos instancias de `SelloPelicula` para la **misma** película pueden compartir el mismo id de gradiente sin problema, porque su definición es idéntica (mismo hash, mismos parámetros) — el navegador usará la primera definición que encuentre y da igual cuál sea. Lo que nunca puede pasar es que **dos películas distintas** compartan un id, y eso queda descartado al incluir siempre el id de la película en el prefijo.

### 1.5 Portada — elemento visual de la primera pantalla (H1.1, concretado en B9)

Un SVG a sangre completa (`position: absolute`, cubre todo el bloque de la primera pantalla) detrás del bloque de título, generado con los mismos primitivos del sello (1.4) sembrados con un valor fijo (el nombre del festival + edición) para que sea determinista y consistente entre cargas. Composición concreta:

1. **Fondo**: el mismo degradado vertical de dos tonos de 1.4, a escala completa de viewport.
2. **5 a 6 capas de niebla** (más que el sello, porque hay más espacio), cada una con una deriva horizontal lenta (`transform: translateX`, 40–60s, `ease-in-out infinite alternate`, con un desfase distinto por capa para que no se muevan sincronizadas).
3. **Un disco de luz de faro** con halo (`radialGradient` + `filter: blur`) cuya opacidad "respira" entre 0.6 y 0.8 en un ciclo de 8s (`@keyframes` de `opacity`, `ease-in-out infinite alternate`).
4. **Una franja oscura superpuesta** (gradiente lineal de transparente a `--color-fondo` con alta opacidad) exactamente detrás de donde cae el bloque de texto, para garantizar el contraste del título y del texto "qué es el festival" sin depender de dónde caigan las capas de niebla en cada resolución.

Con `prefers-reduced-motion: reduce` (ver H0.6): las capas de niebla no se desplazan y el halo del faro no respira — todo el SVG queda como una imagen fija, sin ningún `@keyframes` activo (igual que el sello, la deriva y la respiración viven dentro de `@media (prefers-reduced-motion: no-preference)`).

---

## 2. Detalle por historia

Convenciones para toda esta sección: "función" en el sentido de datos (`Funcion` del JSON) se escribe función; los componentes de React se listan con su responsabilidad, no con código.

### E0. Base transversal

#### H0.1 Datos únicos y sin modificar
- **Archivos**: `lib/datos.ts` (única puerta de entrada al JSON), `types/festival.ts`.
- **Lógica**: `lib/datos.ts` expone: `getFestival()`, `getSalas()`, `getSala(id)`, `getSecciones()`, `getSeccion(id)`, `getPeliculas()`, `getPelicula(id)`, `getFunciones()` (todas, enriquecidas con su película, sala y horarios calculados vía `lib/tiempo.ts`), `getFuncion(id)`, `getFuncionesDeDia(diaIndice)`, `getFuncionesDePelicula(peliculaId)`, `getDiasFestival()`. Ningún componente importa `data/programa.json` directamente salvo este módulo.
- **`getDiasFestival()` (definido en B3, usado por las rutas de programa de A1)**: para cada día entre `fechaInicio` y `fechaFin`, calculado con `lib/tiempo.ts` (nunca escrito a mano), devuelve `{ indice, fecha: 'AAAA-MM-DD', nombreDia: 'sábado', slug: 'sabado', etiqueta: 'Sábado 17' }`. `slug` es `nombreDia` en minúsculas sin diacríticos (`nombreDia.normalize('NFD').replace(/[̀-ͯ]/g, '')`) y es lo que aparece en la URL (`/programa/sabado`); `etiqueta` es lo que se muestra en `SelectorDia`. (Alternativa igualmente válida que se descarta por ser menos legible en la URL: usar la fecha ISO como segmento, ej. `/programa/2026-10-17`.)
- **Casos límite**: un id de función/película que no exista en ningún accesor debe devolver `undefined` (nunca lanzar), y quien lo consuma decide si hace `notFound()` (rutas) o simplemente ignora el id (itinerario guardado o compartido, H4.2/H6.2).
- **Verificación**: contar en consola/test manual que `getFunciones()` tiene longitud 39 y `getPeliculas()` longitud 24; recorrer los tres días de `/programa` y sumar 10+12+17.

#### H0.2 Horas y duraciones correctas
- **Archivos**: `lib/tiempo.ts` (ver 0.5 completo), usado por `lib/datos.ts` al enriquecer cada función con `inicioMin`, `finMin`, `finConConversatorioMin`, `cruzaMedianoche`, y por cualquier componente que muestre una hora (`FichaFuncion`, `ItinerarioVista`).
- **Componentes**: `FichaFuncion` muestra `"20:15–22:14"` (inicio–fin) siempre con `formatearHora`; si `cruzaMedianoche` añade el texto del día siguiente (ver 0.5.8).
- **Verificación**: los 5 casos del backlog (`f22`→01:15, `f39`→01:07, `f09`→00:13, `f10`→00:04, `f21`→00:22) deben salir exactos; repetir la verificación manual cambiando la zona horaria del sistema operativo (o de un navegador de prueba) a UTC y a `Asia/Tokyo` y confirmar que ninguna hora del programa cambia — solo cambiaría, si acaso, qué día se preselecciona por defecto en `/programa`, y eso se prueba por separado en H2.5 (ese sí usa la hora real, pero anclada a `America/Santiago`, nunca a la del visitante).

#### H0.3 Navegación global
- **Archivos**: `app/layout.tsx`, `components/layout/NavPrincipal.tsx`, `components/layout/ContadorItinerario.tsx`, `components/layout/Pie.tsx`, `components/layout/SaltarAlContenido.tsx`, `app/not-found.tsx`.
- **Componentes**: `NavPrincipal` (servidor) renderiza tres `<Link>` fijos (Portada, Programa, Mi itinerario) y delega el número a `ContadorItinerario` (cliente, usa `useItinerario()`); marca la página activa comparando `usePathname()` — como eso exige cliente, o bien `NavPrincipal` recibe el pathname activo vía un pequeño Client Component que solo pinta el estado "activo" (aria-current="page") sin duplicar toda la navegación en cliente. `Pie` (servidor) imprime correo (`mailto:hola@festivalniebla.cl`) e Instagram (`@festivalniebla`, texto plano, sin ícono de terceros).
- **Lógica de accesibilidad**: objetivos táctiles ≥44×44px vía padding en los `<Link>`. **Posicionamiento (corregido en B6)**: `position: sticky` no funciona para fijar una barra al **borde inferior** de la pantalla dentro de un `<main>` largo (`sticky` solo actúa mientras el elemento sigue dentro del flujo de su contenedor, no lo "engancha" al final del viewport) — en móvil la navegación usa `position: fixed; bottom: 0` con `padding-bottom: env(safe-area-inset-bottom)` para no quedar debajo de la barra de gestos del sistema, y el `<main>` lleva un `padding-bottom` equivalente al alto de la barra para que no tape contenido de forma permanente. En escritorio sí sirve `position: sticky; top: 0` (arriba, dentro del flujo normal).
- **404**: `app/not-found.tsx` es la página que Next.js muestra para cualquier ruta no encontrada (incluida `/pelicula/un-id-inventado` gracias a `dynamicParams = false`, ver H3.1) — texto en español, enlaces a Portada y Programa.
- **Verificación**: recorrer las tres páginas con teclado (Tab) comprobando foco visible; abrir `/pelicula/no-existe` y `/una-ruta-que-no-existe` y confirmar la misma página 404 en español.

#### H0.4 Funciona de 360 px a escritorio
- **Archivos**: todo el CSS; no hay componente propio.
- **Lógica**: layout con flex/grid y `minmax(0, 1fr)` en vez de anchos fijos; `overflow-wrap: break-word` en títulos; ninguna regla usa `width` fijo mayor al viewport mínimo. Se prueba con las herramientas de desarrollador en 360, 390, 768, 1024 y 1440px.
- **Verificación**: revisar especialmente los títulos largos citados en el backlog ("Transbordador de invierno", "Cortos I: Oficios del mar") en la tarjeta de programa a 360px.

#### H0.5 Accesibilidad básica
- **Archivos**: `app/layout.tsx` (`<html lang="es">`), `components/layout/SaltarAlContenido.tsx`, `components/ui/AvisoInline.tsx`, estilos de foco globales en `globals.css` (`:focus-visible`).
- **Componentes clave**:
  - `BotonItinerario` (cliente): `<button aria-pressed={enItinerario}>`, texto visible que cambia ("Agregar a mi itinerario" / "Quitar de mi itinerario"), nunca un ícono solo.
  - `SelectorDia` / `SelectorSeccion`: son `<Link>` marcados con `aria-current="page"` en la opción activa, agrupados en una lista (`<ul>`) con rol de navegación (`<nav aria-label="Filtros de programa">`).
  - `AvisoInline`: **corregido en A5** — ya no lleva `role="status"` propio (insertar un elemento nuevo con `role="status"` no garantiza el anuncio, y en `/programa`/`/pelicula/[id]` no hay ninguna `ItinerarioVista` montada donde vivir). Es un elemento visual normal; el anuncio a lectores de pantalla lo hace la región `aria-live="polite"` global montada por `ItinerarioProvider` (ver 0.6), que existe siempre y se actualiza en cada `agregar`/`quitar`. Cada aviso lleva además un ícono de forma distinta por tipo (choque = triángulo, traslado = flecha/reloj, conversatorio = "media luna"/ícono de charla) más el texto, nunca solo color.
  - Encabezados: un único `<h1>` por página (nombre del festival en portada, "Programa" en programa, título de la película en ficha, "Mi itinerario" en itinerario); listas semánticas (`<ul>/<li>`) para funciones, secciones, itinerario.
- **Verificación**: recorrer agregar/quitar del itinerario, cambiar filtros y compartir solo con teclado; pasar un lector de pantalla básico (NVDA o VoiceOver) por la página de itinerario al agregar una función con choque.

#### H0.6 Movimiento respetuoso
- **Archivos**: `globals.css` centraliza esto con una única convención: cualquier `@keyframes` no trivial se define dentro de `@media (prefers-reduced-motion: no-preference)`; fuera de esa media query solo existen transiciones cortas (`transition: opacity 120ms ease, transform 120ms ease` como máximo) o directamente `transition: none`.
- **Dónde aplica**: la deriva del sello de película (1.4), el fondo ambiental de portada (1.5), la aparición de un aviso en el itinerario (2.E5) y el "deslizar y desvanecer" al quitar una función del itinerario (H4.3).
- **Verificación**: activar "reducir movimiento" del sistema operativo y recorrer portada, programa e itinerario comprobando que no hay parallax ni desplazamientos continuos, y que agregar/quitar del itinerario se siente instantáneo (como mucho un fundido corto).

#### H0.7 Identidad visual propia y sin imágenes externas
- **Archivos**: se eliminan `public/next.svg`, `public/vercel.svg`, `public/file.svg`, `public/globe.svg`, `public/window.svg` y se reescribe `app/page.tsx`/`app/page.module.css` por completo (nada del contenido de plantilla de `create-next-app`). `public/favicon.ico` puede reemplazarse por un ícono propio simple (opcional) o dejarse.
- **Verificación**: revisar que no quede ningún `<img>`, ninguna referencia a `next.svg`/`vercel.svg`, ningún texto "Get started by editing", y que ninguna hoja de estilos ni componente contenga un emoji.

#### H0.8 Textos en español y metadatos
- **Archivos**: `export const metadata` (estático) en `app/layout.tsx` (título base + plantilla, ej. `title: { default: 'Festival de Cine Niebla', template: '%s · Festival de Cine Niebla' }`) y en cada `page.tsx` que lo necesite; `generateMetadata` en `app/pelicula/[id]/page.tsx` (título = "Título — Dirección"), y `export const metadata` estático en `app/programa/page.tsx`, `app/programa/[dia]/page.tsx`, `app/programa/[dia]/[seccion]/page.tsx` (título con el día y, si aplica, la sección), `app/itinerario/page.tsx`, y (añadido en C3, faltaban en la primera versión de este documento) `app/itinerario/compartido/page.tsx` (ej. "Itinerario compartido") y `app/not-found.tsx` (ej. "Página no encontrada").
- **Verificación**: revisar la pestaña del navegador en cada página; revisar que ningún string de interfaz (botones, estados vacíos, `alt` si hubiera imágenes, aunque no las hay) quede en inglés.

#### H0.9 Calidad técnica
- **Archivos**: no aplica a un archivo puntual; es una checklist transversal (ver sección 4).
- **Decisión clave ya tomada arriba**: no se activa `cacheComponents`; por lo tanto no aplican las restricciones de `Suspense` obligatorio para código async fuera de una función `'use cache'` **excepto** en el caso puntual de `useSearchParams` en `/itinerario/compartido` (ver 0.8), que es una regla general de Next.js y no de Cache Components.
- **Verificación**: `npm run build` y `npm run lint` sin errores; abrir cada página con las herramientas de desarrollador abiertas y confirmar cero errores/advertencias en consola, incluida ninguna advertencia de hidratación (poner especial atención al contador de itinerario y a `BotonItinerario`, que son los puntos más propensos a mismatches — ver la técnica de `useLayoutEffect` en 2.H4.2).

---

### E1. Portada

#### H1.1 Presentación del festival
- **Archivos**: `app/page.tsx` (servidor, estático), `app/page.module.css`.
- **Componentes**: usa `getFestival()` para nombre/edición/ciudad/fechas (formateadas con `lib/tiempo.ts`, nunca escritas a mano); una sección "qué es" redactada a partir del brief (festival chico, hecho por cuatro personas y voluntarios, cine de la costa); dos CTA (`<Link href="/programa">Ver el programa</Link>` principal, `<Link href="/itinerario">Mi itinerario</Link>` secundario); el elemento visual ambiental de 1.5 como fondo de esta primera sección (`position: relative`, el SVG detrás del texto con buen contraste).
- **Verificación**: en 360px y en escritorio, nombre + fechas + CTA visibles sin scroll.

#### H1.2 Secciones del festival
- **Componentes**: recorre `getSecciones()`, cada una en una tarjeta con `InsigniaSeccion` + descripción del JSON + `<Link href={`/programa/${diaSlugPorDefecto}/${seccion.id}`}>` (tras A1, el enlace apunta al primer día del festival con esa sección filtrada — es la ruta estática que siempre existe; `diaSlugPorDefecto` sale de `getDiasFestival()[0].slug`).

#### H1.3 Dónde es: salas
- **Componentes**: recorre `getSalas()` (nombre, dirección); la Terraza Faro se marca "Al aire libre · Entrada gratis" y muestra su `nota` de lluvia (dato del JSON, no redactado). Los traslados: una tabla simple (filas/columnas = las 4 salas) o una lista "desde X hacia Y: N min" que cubra los pares únicos (6 pares, ya que es simétrico y la diagonal es 0) — cualquier formato es válido si los 6 pares son consultables.

#### H1.4 Entradas y contacto
- **Lógica**: formatear `entradas.general` (4000) con `Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })`, que produce directamente `"$4.000"` (C4) — no hay que armar el punto de miles a mano. Esto es formato de **número**, no de horario/calendario, así que no tiene el problema de zona horaria de 0.5: `Intl.NumberFormat` da el mismo resultado en cualquier entorno. Como la portada es una página estática (se renderiza una sola vez en el build), tampoco hay riesgo de que salga distinto entre servidor y cliente. Aire libre se muestra como "Gratis", texto de venta literal del JSON, `mailto:hola@festivalniebla.cl`.

#### H1.5 Momentos destacados (P1)
- **Lógica**: `f05` y la función antes de `f36`... en realidad el destacado es `f36` mismo (la nota de premiación está en `f36`), enlazando ambos a su `FichaFuncion`/ficha de película. Los textos salen literalmente de `nota` de cada función, no se inventa redacción adicional sobre quién entrega los premios.

#### H1.6 Muestra de películas (P2)
- **Lógica**: una película por sección (por ejemplo la primera de `getPeliculas()` filtrada por sección, orden estable = orden del JSON) con su `SelloPelicula` chico/mediano y enlace a la ficha.

---

### E2. Programa

#### H2.1 Ver todas las funciones por día
- **Archivos**: `app/programa/page.tsx`, `app/programa/[dia]/page.tsx`, `app/programa/[dia]/[seccion]/page.tsx`, `components/programa/SelectorDia.tsx`, `components/programa/ListaPrograma.tsx`, `components/pelicula/FichaFuncion.tsx`.
- **Lógica (route segments, A1)**: `getDiasFestival()` da, para cada día, `{ indice, slug, nombreDia, etiqueta }` (ver B3). `app/programa/[dia]/page.tsx` y `app/programa/[dia]/[seccion]/page.tsx` usan `generateStaticParams` sobre esos `slug` (y sobre `getSecciones()` para el segundo) con `export const dynamicParams = false`; `app/programa/page.tsx` (sin segmento) reutiliza el mismo render con el primer día del arreglo. `getFuncionesDeDia(diaIndice)` ya viene ordenada por `inicioMin` y, a igualdad, por nombre de sala (orden alfabético del campo `nombre` de la sala, que es estable y no depende de nada externo).
- **`FichaFuncion`** muestra: hora inicio–fin, título (enlace a `/pelicula/[id]`), sala, `InsigniaSeccion`, duración, clasificación, `SelloPelicula` chico, y si aplica: "Agotada", "Al aire libre", "Conversatorio después (N min)", y el texto de `nota`. Ver B5 para la anatomía concreta de la tarjeta en móvil.
- **Verificación**: sumar 10+12+17 = 39 recorriendo los tres días (`/programa/jueves`, `/programa/viernes`, `/programa/sabado`); confirmar que `f22` aparece en viernes y `f39` en sábado (por `diaIndice` derivado de su `inicio`, no de su hora de fin).

#### H2.2 Filtrar por sección
- **Archivos**: `components/programa/SelectorSeccion.tsx` (enlaces `/programa/${diaSlug}` para "Todas" y `/programa/${diaSlug}/${seccion.id}` por sección).
- **Lógica**: el conteo de resultados y los filtros activos se calculan en el propio Server Component y se muestran en un texto simple ("Mostrando 8 funciones · viernes · Bruma Nocturna") con una acción "Quitar filtros" (`<Link href={`/programa/${diaSlug}`}>`). Estado vacío: `components/ui/EstadoVacio.tsx` reutilizable, con mensaje en español y el mismo enlace, para el caso de una combinación **válida** de día/sección sin funciones (hoy no ocurre con los datos reales, pero el componente debe existir). Un `dia`/`seccion` que no exista en absoluto (typo, id inventado) ya no se trata como "sin resultados": con `dynamicParams = false` (A1) Next.js devuelve un 404 real antes de que el componente se ejecute.
- **Verificación**: cambiar filtros y comprobar que la URL cambia a una ruta real, que "atrás" del navegador funciona nativamente, y que `/programa/viernes/una-seccion-inventada` da la página 404 en español.

#### H2.3 Se usa bien en el celular caminando
- **Lógica**: `SelectorDia`/`SelectorSeccion` en una barra horizontal con scroll propio si no entran (`overflow-x: auto`) fija arriba de la lista (`position: sticky; top: 0`, esto sí es un `sticky` válido porque ancla al borde **superior** dentro del flujo, a diferencia del caso de B6) para no tener que volver a subir. `BotonItinerario` dentro de `FichaFuncion` cambia su estado visual al instante (estado optimista en el cliente: cambia el texto/ícono en cuanto se hace click, sin esperar ningún request porque todo es local). Al volver de una ficha hacia el programa se usa `BotonVolver` (`router.back()`, ver A2/H3.1): como el día y la sección ahora son parte de la propia ruta (A1), "atrás" recupera exactamente la página estática que se estaba viendo, sin reconstruir nada.
- **Anatomía de la tarjeta en móvil (B5)**: `FichaFuncion` se arma en tres filas para entrar holgada en ~150px de alto (necesario para que quepan 3 tarjetas completas en 360×640 con la barra de filtros y la navegación fijas, H2.3): (1) `HH:MM–HH:MM` en `font-variant-numeric: tabular-nums` y peso alto, con el nombre corto de la sala a la derecha; (2) `SelloPelicula` de 48px + título (máx. 2 líneas, `-webkit-line-clamp` o equivalente) + `InsigniaSeccion`; (3) marcas que apliquen (Agotada / Al aire libre / Conversatorio N min) junto a `BotonItinerario` en su variante compacta (texto corto "Agregar"/"Quitar" con `aria-label` completo, ej. `aria-label="Agregar Vidrio (20:00, Galpón 7) a mi itinerario"`). La `nota` de la función no se repite en el programa (ya se ve completa en la ficha y en el itinerario): en el programa basta una marca "Con nota" clicable, o una cuarta línea corta solo cuando `nota` existe.
- **Verificación**: en 360×640 deben verse al menos 3 `FichaFuncion` completas sin scroll; medir con las herramientas de desarrollador.

#### H2.4 Vista de escritorio aprovechada (P1)
- **Lógica (concretada en B5)**: desde `min-width: 1024px` (CSS puro, mismo HTML y mismo componente `FichaFuncion`), `ListaPrograma` cambia a una grilla de **4 columnas, una por sala, en el orden en que `getSalas()` las trae del JSON** (Teatro Municipal, Cine Arte El Muelle, Galpón 7, Terraza Faro), con las tarjetas de cada columna ordenadas por hora de inicio — así se ve de un vistazo qué pasa en paralelo en cada sala, sin duplicar ninguna función ni cambiar de componente.

#### H2.5 Contexto del itinerario dentro del programa
- **Lógica de "hoy" (movida al cliente en A1)**: `RedirigirHoy` (Client Component, montado solo en `app/programa/page.tsx`, la ruta sin segmento de día) calcula la fecha de hoy en `America/Santiago` (ver 0.5) con `Intl.DateTimeFormat` en un `useEffect`, la compara contra `getDiasFestival()` (importado directamente, ver A6), y si cae en un día del festival **distinto** del primero hace `router.replace(`/programa/${diaDeHoy.slug}`)`. No renderiza nada visible. Sin JavaScript (o antes de que el efecto corra) se ve el primer día del festival, que es exactamente el comportamiento base de H2.1 — no hay contenido incorrecto en ningún momento, solo una posible mejora posterior a "el día de hoy". Las funciones ya elegidas se marcan (borde/ícono + texto "En tu itinerario") usando `useItinerario()` desde `FichaFuncion` en su parte cliente (`BotonItinerario` ya sabe si está elegida; el resto de la tarjeta puede quedar servidor).

#### H2.6 Aviso previo de conflicto (P2)
- **Lógica**: requiere que `BotonItinerario` (cliente) calcule, contra el contexto de itinerario ya cargado, si la función que representa chocaría (mismo criterio de `lib/itinerario-reglas.ts`, ver E5) con alguna ya elegida, y si es así muestre una marca discreta ("Se topa con lo que ya elegiste") sin bloquear el agregar. Al ser P2, se implementa después de que E5 esté verificado, reutilizando la misma función pura.

---

### E3. Ficha de cada película

#### H3.1 Datos de la película
- **Archivos**: `app/pelicula/[id]/page.tsx`, `components/pelicula/BotonVolver.tsx`.
- **Lógica**: `generateStaticParams` devuelve `getPeliculas().map(p => ({ id: p.id }))` (24 rutas); `export const dynamicParams = false`. Si en algún momento el propio código no encuentra la película por algún motivo (no debería pasar dado `dynamicParams = false`, pero es la defensa correcta) se llama a `notFound()`. `generateMetadata` arma `title`/`description` con título y dirección.
- **Contenido**: título, título original si existe (`if (pelicula.tituloOriginal)`), dirección, país, año, duración (formateada), `InsigniaSeccion` con enlace a `/programa/${diaSlugPorDefecto}/${pelicula.seccion}`, clasificación con su significado (`{TE: 'Todo espectador', '+14': 'Mayores de 14', '+18': 'Mayores de 18'}`), tipo de estreno traducido (`{mundial: 'Estreno mundial', nacional: 'Estreno nacional', latinoamericano: 'Estreno latinoamericano'}`), sinopsis completa, `BotonVolver`.
- **"Volver al programa" — corregido en A2**: la alternativa de armar un `?volver=...` con los `searchParams` de origen queda **descartada**: haría que `app/pelicula/[id]/page.tsx` leyera `searchParams`, lo que vuelve dinámica por request a las 24 fichas (mismo problema que A1) y además es más complicado de lo necesario. La decisión única es `BotonVolver`, un Client Component: si `window.history.length > 1` hace `router.back()`; si no (el visitante llegó directo a la ficha, ej. por un link externo), navega a `/programa`. Como tras A1 el día y la sección viven en la propia URL de programa, `router.back()` ya vuelve exactamente a la combinación de día/sección que se estaba viendo, sin necesidad de reconstruir nada.

#### H3.2 Representación visual sin afiches
- Ya detallado en 1.4. Acá solo se usa: `<SelloPelicula id={pelicula.id} seccion={pelicula.seccion} duracionMin={pelicula.duracionMin} anio={pelicula.anio} tamano="grande" />` en la cabecera.

#### H3.3 Todas las funciones de la película
- **Lógica**: `getFuncionesDePelicula(id)` ordenada por `inicioMin`; cada una usa `FichaFuncion` en una variante compacta (ya se sabe la película, no hace falta repetir sello grande) mostrando día, hora inicio/fin, sala y dirección, agotada/aire libre (+ nota de lluvia)/conversatorio (+ minutos)/nota, y `BotonItinerario`.
- **Verificación puntual del backlog**: `cordillera-de-papel` debe listar `f12` (viernes 17:30, Galpón 7) y `f23` (sábado 12:00, Cine Arte El Muelle); `la-hora-azul-del-puerto` debe listar `f05` con su nota inaugural y `f31` marcada agotada con conversatorio de 30 min.

#### H3.4 Información práctica en la ficha (P1)
- **Lógica**: precio por función = gratis si `salaId === 'terraza'`, si no `entradas.general` formateado (ver C4); texto de venta literal. **Navegación (decisión firme, C5)**: anterior/siguiente dentro de `getPeliculas().filter(p => p.seccion === pelicula.seccion)`, en el orden del JSON, buscando el índice actual y enlazando al anterior/siguiente; **sin wraparound** (el primero de la sección no tiene "anterior", el último no tiene "siguiente" — esos botones se omiten o se muestran deshabilitados, no dan la vuelta al principio/final de la lista).

---

### E4. Mi itinerario: armar y guardar

#### H4.1 Agregar y quitar funciones
- **Archivos**: `components/itinerario/ItinerarioProvider.tsx`, `components/pelicula/BotonItinerario.tsx`, `app/itinerario/page.tsx`, `components/itinerario/ItinerarioVista.tsx`.
- **Lógica del interruptor**: `BotonItinerario` llama a `agregar(funcionId)`/`quitar(funcionId)` del contexto; como es un `Set`/lista de ids, agregar dos veces el mismo id es una operación idempotente por diseño (no se puede duplicar).
- **`ItinerarioVista` (modo "propio")**: agrupa los ids elegidos por `diaIndice` (a través de `getFuncion(id)`), ordena por `inicioMin` dentro de cada grupo, y por cada función muestra: `SelloPelicula` chico, título (enlace a ficha), sala + dirección, inicio–fin, conversatorio si tiene, agotada/aire libre si aplica, botón para quitar. **Corregido en B2**: el aviso de "tiempo disponible"/traslado ya no se dibuja como una fila fija entre dos tarjetas consecutivas de la lista — se calcula y se muestra junto a la tarjeta de cada función, contra su verdadera siguiente función viable (ver el nuevo criterio de E5 más abajo), nombrando explícitamente esa función cuando no coincide con la tarjeta inmediatamente de abajo (esto pasa cuando una función intermedia choca con la actual). Se reutiliza exactamente `lib/itinerario-reglas.ts` de E5 para no calcular esto dos veces con lógicas distintas.
- **Resumen**: cantidad de funciones por día + total, en la parte superior de la página.
- **Estado vacío**: `EstadoVacio` con enlace a `/programa`.
- **Vaciar (decisión única, B7)**: un `<dialog>` nativo de HTML (`showModal()`), accesible por teclado sin ninguna librería, con dos acciones "Vaciar itinerario" / "Cancelar"; solo al confirmar se llama a `vaciar()`. Se descarta la alternativa de "deshacer" para no mantener dos mecanismos de confirmación en el sitio.
- **Funciones agotadas**: se pueden agregar igual (no hay ninguna restricción de negocio que lo impida) y se muestran con la misma marca "Agotada" que en programa/ficha.

#### H4.2 Se guarda en el navegador
- **Archivos**: `lib/almacenamiento.ts`, `components/itinerario/ItinerarioProvider.tsx`.
- **`lib/almacenamiento.ts`**: funciones `leer()`/`escribir(ids)` que envuelven `window.localStorage` en `try/catch`; si lanza (modo privado restrictivo, cuota excedida, `localStorage` inexistente), devuelven un valor que indica "no disponible" en vez de lanzar. Clave fija con versión, ej. `"festivalniebla:itinerario:v1"`, valor = JSON de un array de ids de función (strings).
- **Filtrado de ids inválidos (H4.2 último punto y H6.2)**: al leer, se descartan (en silencio, sin error visible) los ids que `getFuncion(id)` no resuelva.
- **Evitar parpadeo del contador y de la página de itinerario (H4.2)**: `ItinerarioProvider` inicializa su estado como "no cargado todavía" (`cargado: false`, lista vacía) tanto en el render de servidor como en el primer render de cliente (deben coincidir exactamente para no producir un error de hidratación) y usa `useLayoutEffect` para leer `localStorage` sincrónicamente antes de que el navegador pinte el primer frame del cliente — así el usuario no llega a ver un "0" seguido de un cambio a "3": ve directamente el valor correcto en cuanto la página es interactiva. **Alternativa igualmente válida (C2)**: `useSyncExternalStore` con un `getServerSnapshot` que devuelve la lista vacía y un `getSnapshot`/`subscribe` sobre `localStorage`; `useLayoutEffect` no genera advertencia en SSR con React 19, así que cualquiera de las dos formas es correcta — lo único que no puede cambiar es la regla de fondo: el primer render de cliente debe ser idéntico al de servidor. Mientras `cargado` es `false`, `ContadorItinerario` no debe mostrar `0` sino nada (o un espacio reservado sin número), y `ItinerarioVista` puede mostrar un estado de carga breve neutro en vez del "está vacío" (para no mostrar "vacío" y luego "tienes 3" de golpe).
- **`disponible: false`** (cuando `localStorage` falló): el sitio sigue funcionando con el estado solo en memoria de React durante esa sesión, y `ItinerarioVista` muestra un aviso breve ("No pudimos guardar tu itinerario en este navegador; se perderá al cerrar la pestaña.").

#### H4.3 Se siente bien, no como un formulario (P1)
- **Lógica**: `BotonItinerario` cambia de estado inmediatamente (no hay espera posible, es local) y además dispara una confirmación textual breve junto al propio botón (ej. un texto que aparece y se desvanece: "Agregada a tu itinerario"), nunca un `alert()` ni un modal. `ItinerarioVista` presenta cada día como una línea de tiempo vertical (una barra o una serie de nodos conectados) en vez de una tabla, para que se perciba el orden cronológico y los huecos entre funciones de un vistazo; quitar una función anima su salida (fundido + colapso de alto) respetando H0.6.

---

### E5. Mi itinerario: avisos

Toda la lógica de esta épica vive en **`lib/itinerario-reglas.ts`**, funciones puras (mismas entradas → misma salida, sin `Date`, sin acceso a `localStorage`) para poder reutilizarlas igual en el itinerario propio y en el compartido (H5.4 último punto), y para poder probarlas manualmente contra la tabla de casos de referencia del backlog sin tocar la interfaz.

Dos alcances de cálculo, deliberadamente distintos — **importante que Haiku no los mezcle**:

- **Choque (H5.1)**: se evalúa entre **todas las parejas** de funciones elegidas (no solo consecutivas), porque con duraciones desparejas dos funciones no adyacentes en el orden por hora de inicio igual pueden solaparse. `calcularChoques(funciones: FuncionEnriquecida[])`: para cada pareja `(A,B)` con `A.id < B.id` (para no repetir), es choque si `B.inicioMin < A.finMin && A.inicioMin < B.finMin` (estrictas ambas, terminar justo cuando empieza la otra no es choque). Devuelve, por función, la lista de las demás con las que choca y un texto por cada una (ej. `"Se topa con «Vidrio» (20:00–22:01)"`, usando el título de la película y el rango de la otra función).
- **Traslado y conversatorio (H5.2/H5.3) — corregido en B2**: evaluarlos solo entre parejas **estrictamente consecutivas en el orden por `inicioMin`** deja pares sin evaluar. Ejemplo real con tres funciones elegidas el jueves: A=`f03` (galpón 18:00–19:24), B=`f04` (muelle 18:15–19:51), C=`f05` (teatro 19:30–21:08). Ordenadas por inicio: A, B, C. A choca con B, y B choca con C, pero el par A→C (que si se quitara B seguiría sin poder hacerse: llegando a las 19:32 cuando C empieza a las 19:30, faltan 2 min) nunca se evaluaría si solo se miran pares consecutivos — el visitante vería dos choques pero no que, aunque quite B, tampoco alcanza a llegar de A a C.

  La regla correcta: para cada función **A** elegida de un día, se busca su **verdadera siguiente función viable, B** = la primera función elegida de ese mismo día (en orden de `inicioMin`) tal que `B.inicioMin >= A.finMin` (es decir, la primera que **no** se solapa con A; por definición esto ya excluye cualquier choque entre A y B, así que no hace falta comprobarlo aparte). Si no existe tal B (A es la última del día, o todas las posteriores siguen solapadas — caso extremo improbable), A no genera aviso de traslado/conversatorio. `calcularAvisoSiguienteViable(funcionesDelDiaOrdenadas)` — para cada A, con `j` el índice de B:
  1. `traslado = trasladosMin[salaA][salaB]` (0 si es la misma sala); `llegada = A.finMin + traslado`.
  2. Si `llegada > B.inicioMin` → **aviso de traslado**: `{ hacia: B, faltanMin: llegada - B.inicioMin }`. Texto tipo `"No alcanzas a llegar a «B»: faltan N min (la película termina HH:MM y son M min caminando)"`, nombrando siempre a B explícitamente (importante porque B puede no ser la tarjeta inmediatamente siguiente en la lista, si alguna función intermedia chocaba con A). **No** se evalúa el conversatorio para este par (H5.3 último punto: prevalece el traslado); como mucho, si A tenía conversatorio, se puede añadir como dato secundario no destacado, nunca como un segundo aviso independiente.
  3. Si `llegada <= B.inicioMin` (alcanza) y **A tiene `conversatorioMin`**: `llegadaConConversatorio = A.finConConversatorioMin + traslado`.
     - Si `llegadaConConversatorio > B.inicioMin` → **aviso de conversatorio perdido**: `minutosQueVeria = max(0, B.inicioMin - traslado - A.finMin)` (fórmula de H5.5); si `minutosQueVeria <= 0` es "perdería todo el conversatorio", si es menor que `conversatorioMin` es "perdería parte" (mencionando cuántos de cuántos minutos, H5.5 P2), si por alguna razón `minutosQueVeria >= conversatorioMin` no debería dispararse este aviso (contradicción imposible dado que ya se comprobó `llegadaConConversatorio > B.inicioMin`, se deja como aserción de sanidad, no como caso real).
     - Si no, no hay aviso: todo bien.

  En `ItinerarioVista`, este aviso se dibuja adjunto a la tarjeta de A (no como una fila entre dos tarjetas), nombrando a B en el propio texto; cuando B coincide con la tarjeta que sigue inmediatamente en la lista se lee como un conector natural, y cuando no (porque una función intermedia chocaba con A) el texto sigue siendo inequívoco porque nombra a B por su título.
- **Textos e iconografía**: cada tipo de aviso (`choque`, `traslado`, `conversatorio`) usa el mismo componente `AvisoInline` con una variante (forma/ícono) distinta, nunca solo color (H0.5).
- **Resumen (H5.4)**: `ItinerarioVista` cuenta choques únicos (parejas, no funciones) y traslados imposibles y los muestra arriba ("2 choques · 1 traslado imposible"); los avisos individuales aparecen junto a cada función afectada dentro del recorrido.
- **Recalculo instantáneo**: como todo vive en el contexto de React y las funciones de `itinerario-reglas.ts` son puras y baratas (a lo sumo 39×39 comparaciones), se recalculan en cada render sin necesidad de memoización especial; si se quiere, `useMemo` sobre la lista de ids elegidos es suficiente.

**Verificación** — correr manualmente, con el itinerario propio, cada caso de la tabla de la sección 3 del backlog (los 15 pares), confirmando el resultado exacto (choque / no alcanza con los minutos que faltan / pierde conversatorio con los minutos que vería / todo bien / sin aviso por ser días distintos).

H5.5 (P2) ya queda cubierto arriba por la fórmula de `minutosQueVeria`; solo falta decidir si mostrarlo siempre que hay conversatorio perdido (recomendado) o solo cuando es mayor que cero.

---

### E6. Compartir itinerario por link

Ver también la sección 3 (formato exacto).

#### H6.1 Generar el link
- **Archivos**: `lib/compartir.ts`, `components/itinerario/BotonCompartir.tsx`.
- **Lógica**: `codificar(ids: string[]): string` arma la URL completa `${origin}/itinerario/compartido?i=${ids.join(',')}` (ver sección 3 para por qué esto ya es corto y por qué no hace falta comprimir nada más). `BotonCompartir` intenta `navigator.clipboard.writeText(url)`; si falla o no existe, muestra la URL en un `<input readOnly value={url}>` seleccionable (con un botón "Seleccionar todo" que hace `select()` sobre el input) para copiarla a mano. Confirmación visible tipo "Link copiado" (texto, con `aria-live="polite"`).

#### H6.2 Abrir un link compartido
- **Archivos**: `app/itinerario/compartido/page.tsx`, `components/itinerario/ItinerarioVista.tsx` (modo="compartido").
- **Lógica**: la página server-side arma el shell y envuelve en `<Suspense>` un Client Component que lee `useSearchParams().get('i')`, lo decodifica con `lib/compartir.ts` (`decodificar(query): string[]`, que separa por coma y descarta cualquier id que `getFuncion` no reconozca), y renderiza `ItinerarioVista` en modo solo lectura: mismo recorrido, mismos avisos (misma función `itinerario-reglas.ts`), pero sin botones de quitar y con una etiqueta visible "Itinerario compartido" arriba. Si tras filtrar no queda ningún id válido, se muestra un mensaje claro ("Este link no tiene funciones válidas") con enlace a `/programa`.
- **No modifica el propio**: esta vista **no** toca el contexto `ItinerarioProvider` salvo cuando el visitante pulsa explícitamente "Copiar a mi itinerario". **Etiqueta del botón (B8)**: se calcula `N` = cantidad de ids válidos del link que **no** están ya en el itinerario propio (`idsDelLink.filter(id => !tieneFuncion(id)).length`), y el botón dice "Sumar N funciones a mi itinerario" (dejando explícito, sin diálogo aparte, que se suman y no se reemplazan); si `N === 0` el botón se muestra deshabilitado con el texto "Ya tienes todas estas funciones". Al pulsarlo, llama a `agregar(id)` por cada id válido que no esté ya en el propio (evita duplicados por construcción, ya que `agregar` es idempotente) y después navega a `/itinerario` o muestra una confirmación con enlace.
- **Navegación**: enlaces visibles a "Ver mi itinerario" y "Ver el programa" desde la vista compartida.

#### H6.3 Compartir desde el celular (P1)
- **Lógica**: `BotonCompartir`, si `navigator.share` existe, ofrece un segundo botón "Compartir..." que llama a `navigator.share({ url })` con la misma URL que genera `codificar`; si no existe, solo se ofrece copiar.

---

### E7. Entrega

#### H7.1 Documentación de entrega
- `ENTREGA.md` (nuevo, en la raíz): qué se construyó, cómo correrlo (`npm install`, `npm run dev`, `npm run build`, `npm start`), decisiones importantes (remitir a este `docs/DETALLE.md` para el detalle fino, pero resumiendo en dos o tres párrafos identidad visual / representación de películas / guardado y compartido / reglas de choque-traslado-conversatorio), y qué quedó pendiente o fuera de alcance (copiar la lista de "Fuera de alcance" del backlog).
- `README.md`: reemplazar el de la plantilla por algo mínimo que apunte a `ENTREGA.md`.

#### H7.2 Verificación final
Ver checklist de la sección 4.

---

## 3. Formato del link compartido

**Formato**: `https://<dominio>/itinerario/compartido?i=f05,f12,f23` — el parámetro `i` es la lista de ids de función (tal cual, ej. `f05`, no un índice ni un hash) separados por coma, sin ningún otro carácter de escape especial más allá del que el propio navegador aplique a la URL (las comas son válidas sin codificar en un valor de query string; si alguna herramienta las codificara como `%2C` igual se decodifican solas al leer `searchParams`).

**Por qué no hace falta codificar/comprimir más**: los ids de función tienen 3 caracteres (`f01`…`f39`). Un itinerario de 10 funciones da `10×3 + 9 comas = 39` caracteres para el valor del parámetro, muy por debajo de los "menos de 200 caracteres" que pide H6.1 incluso sumando dominio y el resto de la URL. No se necesita Base64 ni ninguna librería de compresión — añadir eso sería complejidad sin beneficio medible.

**Decodificación y validación**: `decodificar(valorDeQuery: string | null): string[]` — si es `null`/vacío, devuelve `[]`; si no, `valorDeQuery.split(',')`, recorta espacios, descarta vacíos, y descarta cualquier id para el que `getFuncion(id)` no exista en `data/programa.json`. El resultado son solo ids válidos y existentes, listos para pasar a `ItinerarioVista`.

**Estabilidad**: el link es válido mientras esos ids sigan existiendo en `data/programa.json` (que no se modifica, H0.1), así que en la práctica es estable para siempre dentro de esta edición del festival.

---

## 4. Orden de implementación y checklist final

### Orden sugerido para Haiku

1. **Base**: `types/festival.ts`, `lib/tiempo.ts`, `lib/datos.ts` — y verificar a mano (un script temporal o simplemente `console.log` en desarrollo) que las 24 películas, 39 funciones y los 5 casos de medianoche de H0.2 salen correctos antes de construir ninguna pantalla.
2. `app/layout.tsx` (fuentes, `<html lang="es">`, `ItinerarioProvider`, `NavPrincipal`, `Pie`, saltar-al-contenido), `globals.css` con toda la paleta/tipografía/espaciado de la sección 1, y `lib/visual.ts` + `SelloPelicula` (probarlo aislado con varios ids antes de usarlo en páginas reales).
3. `/programa`, `/programa/[dia]` y `/programa/[dia]/[seccion]` completos (E2, ver A1) y `/pelicula/[id]` completo (E3) — en este punto todo el contenido estático/navegable del sitio ya existe y es revisable sin itinerario.
4. `lib/almacenamiento.ts`, `ItinerarioProvider`, `BotonItinerario`, `/itinerario` con agregar/guardar/listar (E4) sin avisos todavía.
5. `lib/itinerario-reglas.ts` y los avisos dentro de `/itinerario` (E5) — verificar uno por uno los 15 casos de la tabla del backlog antes de seguir.
6. `lib/compartir.ts`, `/itinerario/compartido`, `BotonCompartir` (E6).
7. Terminar la portada (E1: destacados y muestra dependen de que ficha/programa ya existan) y las historias P1/P2 restantes (H2.4, H2.5 si no se hizo antes, H2.6, H3.4, H4.3 si no se hizo antes, H5.5, H6.3, H1.5, H1.6).
8. `ENTREGA.md`, limpiar `README.md` (E7).

### Checklist final (H7.2 y H0.9)

- [ ] `npm run build` sin errores ni advertencias de tipos, y **la salida del build lista las 44 rutas de la tabla de 0.8 como estáticas (`○`), ninguna como dinámica por request (`ƒ`)** (A1).
- [ ] `npm run lint` sin errores.
- [ ] Cero errores/advertencias en consola del navegador recorriendo `/`, `/programa`, al menos una `/programa/[dia]`, al menos una `/programa/[dia]/[seccion]`, una `/pelicula/[id]`, `/itinerario` e `/itinerario/compartido`, incluida ninguna advertencia de hidratación.
- [ ] Recorrido manual completo en 360px y en escritorio: portada → programa (cambiar día y sección, confirmar que cada combinación es una URL real) → ficha → volver con `BotonVolver` y comprobar que se conserva el día/sección → agregar 4 funciones que reproduzcan choque, no-alcanza y conversatorio perdido (usar las combinaciones de la tabla del backlog, ej. `f05`+`f06` para choque, `f03`+`f05` para no-alcanza, `f13`+`f17` para conversatorio perdido) → confirmar que el itinerario muestra los tres avisos correctos, nombrando siempre a la otra función → compartir → abrir el link en una ventana privada → copiar al propio itinerario y comprobar que el botón mostró el número correcto de funciones a sumar.
- [ ] Probado con `prefers-reduced-motion: reduce` activado (portada, programa, itinerario).
- [ ] Probado con la zona horaria del sistema/navegador en algo distinto de Chile (ej. UTC o `Asia/Tokyo`) confirmando que ninguna hora de función cambia.
- [ ] Probado con un lector de pantalla que, al agregar una función desde `/programa` (no desde `/itinerario`), se anuncia el mensaje de la región viva global (A5).
- [ ] Sin `<img>`, sin peticiones externas salvo las fuentes vía `next/font`, sin emojis, sin puntajes/estrellas/rankings.

---

## Observaciones al backlog

Nada en el backlog resulta contradictorio, imposible con los datos disponibles o falta de información para construir el sitio. Dos precisiones menores que valen la pena dejar registradas porque no estaban explícitas y alguien podría resolverlas de forma distinta a la aquí decidida:

1. **H1.5** dice "la premiación (antes de `f36`)": el dato real está en la nota de la propia `f36` ("Antes de la función se entregan los premios del festival"), no en una función separada. Se decidió que el destacado de premiación enlaza a `f36`/su película (Transbordador de invierno), usando literalmente ese texto de `nota`.
2. **H3.4** ("Navegación a la película anterior y siguiente dentro de la misma sección, o enlace a 'más de esta sección'") ofrecía dos alternativas sin decir cuál preferir; tras la revisión de Fable queda decidido en firme (C5): anterior/siguiente dentro de la sección, en el orden del JSON, sin wraparound.

No se encontraron datos faltantes: los 39 casos que el backlog cita explícitamente (medianoche, choques, traslados, conversatorios) fueron verificados a mano contra `data/programa.json` en la sección 0.5 y 2.E5 de este documento y son consistentes con la tabla de la sección 3 del backlog.

---

## Cambios tras la revisión

Ronda única de revisión de Fable (`docs/REVIEW-DETALLE.md`). Todos los A y B quedaron resueltos y los C incorporados; lo que la revisión no mencionó no se tocó.

- **A1** — `/programa` ya no lee `searchParams` en el servidor (dejaba el sitio no exportable y contradecía "sin backend"). Día y sección pasan a ser segmentos de ruta estáticos: `/programa`, `/programa/[dia]` (3 rutas) y `/programa/[dia]/[seccion]` (12 rutas), todas con `generateStaticParams` + `dynamicParams = false`. "Hoy" (H2.5) se calcula ahora en el cliente (`RedirigirHoy`) como mejora progresiva. Actualizado en 0.7, 0.8, H2.1, H2.2, H2.5 y la sección 4.
- **A2** — Se descarta el enlace "Volver al programa" con `?volver=` (volvía dinámicas las 24 fichas). Se reemplaza por `BotonVolver` (cliente): `router.back()` si hay historial, si no `/programa`. Actualizado en H3.1, H2.3.
- **A3** — Los ids internos de `<linearGradient>`/`<radialGradient>` de `SelloPelicula` se prefijan con el id de la película, para no colisionar entre sellos distintos en la misma página; un sello repetido de la misma película puede compartir id sin problema porque su definición es idéntica. Actualizado en 1.4.
- **A4** — Los colores base de sección no llegaban a 4.5:1 como fondo de insignia. Se agregó una variable `--color-seccion-X-texto` aclarada por sección para el texto de `InsigniaSeccion` (fondo `--color-fondo-elevado` + borde), y se separó `--color-aviso` de `--color-acento` para no confundir un aviso con un botón principal. Actualizado en 1.1, 1.3.
- **A5** — Los avisos no se anunciaban a lectores de pantalla al agregar desde `/programa` o la ficha (`ItinerarioVista` no está montada ahí). Se agregó una región `aria-live="polite"` global en `ItinerarioProvider`, que existe en todas las páginas. `AvisoInline` deja de llevar `role="status"` propio. Actualizado en 0.4, 0.6, H0.5.
- **A6** — Se resolvió la contradicción sobre si el cliente podía importar `lib/datos.ts`: es un módulo compartido, importable desde servidor y cliente sin restricciones; se eliminó la idea de pasar el listado completo como prop desde un Server Component. Actualizado en 0.4, 0.6.
- **B1** — Fuentes nombradas: títulos `Fraunces` (600–800), lectura `Atkinson Hyperlegible` (400/700, alternativa `Source Sans 3`). Actualizado en 0.3.
- **B2** — Traslado/conversatorio ya no se evalúan solo entre parejas estrictamente consecutivas (dejaba pares sin evaluar, ej. A→C saltando una B que choca con ambas). Ahora cada función A se evalúa contra su primera función posterior que no se solapa. Actualizado en E5, H4.1.
- **B3** — `getDiasFestival()` ahora define explícitamente `slug` (sin diacríticos, usado en la URL) y `etiqueta`. Actualizado en H0.1, 0.7.
- **B4** — Se reemplaza la aritmética de calendario hecha a mano (día juliano, congruencia de Zeller) por `Date.UTC(...)` y los métodos `getUTC*()`, igual de independientes de la zona horaria del entorno pero con muchísima menos superficie de error. Reescrito 0.5 completo.
- **B5** — Se definió la anatomía concreta de `FichaFuncion` en móvil (tres filas) y la grilla de escritorio (4 columnas, una por sala, orden del JSON). Actualizado en H2.3, H2.4.
- **B6** — La navegación inferior en móvil no podía ser `position: sticky` (no ancla al borde del viewport dentro de un `<main>` largo); se cambia a `position: fixed; bottom: 0` con `env(safe-area-inset-bottom)`. Actualizado en H0.3.
- **B7** — "Vaciar" itinerario: se elige una sola opción, un `<dialog>` nativo con confirmar/cancelar (se descarta la alternativa de deshacer). Actualizado en H4.1.
- **B8** — "Copiar a mi itinerario" ahora calcula N (funciones válidas del link que no están ya en el propio) y etiqueta el botón "Sumar N funciones a mi itinerario" (deshabilitado si N=0). Actualizado en H6.2.
- **B9** — Se concretó la composición del fondo ambiental de la portada: SVG a sangre completa, 5–6 capas de niebla con deriva de 40–60s, un disco de faro con halo que respira en 8s, franja oscura superpuesta para contraste del texto, estático con movimiento reducido. Actualizado en 1.5.
- **C1** — `AvisoInline`, `SelloPelicula`, `EstadoVacio` e `InsigniaSeccion` se reetiquetan "Compartidos (sin APIs de servidor)" en vez de "Server", para dejar claro que funcionan igual dentro de `ItinerarioVista` (cliente). Actualizado en 0.4.
- **C2** — Se deja constancia de que `useSyncExternalStore` con `getServerSnapshot` vacío es una alternativa igualmente válida a `useLayoutEffect` para leer el itinerario guardado. Actualizado en H4.2.
- **C3** — Se agregó `metadata` a la lista de H0.8 para `/itinerario/compartido` y `/not-found`, que faltaban.
- **C4** — Se indica usar `Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })` directamente (produce `"$4.000"`), sin riesgo de diferencia servidor/cliente porque la portada es estática. Actualizado en H1.4.
- **C5** — Observación 2 al backlog (H3.4) aceptada y decidida en firme: anterior/siguiente dentro de la sección, orden del JSON, sin wraparound. Actualizado en H3.4 y en "Observaciones al backlog".
