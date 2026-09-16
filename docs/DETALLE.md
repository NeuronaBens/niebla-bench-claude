# Detalle técnico y visual: sitio del Festival de Cine Niebla

Especificación para implementar `docs/BACKLOG.md` sin volver a preguntar. Fuentes: `BRIEF.md`, `data/programa.json`, `docs/BACKLOG.md` y la documentación de Next.js 16.3.5 incluida en `node_modules/next/dist/docs/` (revisada para `generateStaticParams`, `dynamicParams`, `useSearchParams` + `Suspense`, `window.history.replaceState`, `title.template`, `not-found`, `next/font/google` y cómo evitar el parpadeo antes de hidratar).

Este documento no contiene código. Cuando dice "función pura", "hook" o "server/client", es una decisión que se implementa tal cual.

---

## 0. Correcciones al backlog detectadas al recalcular los datos

Recalculé todos los ejemplos de BACKLOG con un script sobre `data/programa.json`. **Uno no cumple las reglas del mismo backlog:**

| Ejemplo | Backlog dice | Cálculo real | Qué hacer |
|---|---|---|---|
| f03 + f05 (H4.4 CA1, H5.2 punto 6) | "llega a la película, pierde el conversatorio" | f03 (Galpón 7) termina 18:00 + 84 = **19:24**. Traslado Galpón → Teatro = 8. Llegada **19:32** > 19:30. **No alcanza, 2 minutos tarde.** | Por H4.4 CA3 prevalece el aviso de **traslado** ("Llegarías 19:32, 2 minutos tarde") y **no** se muestra el de conversatorio. La implementación sigue las reglas, no el texto del ejemplo. Para probar el aviso de conversatorio se usa **f13 + f16** (ya está en el backlog como "Ejemplo 2") o **f31 + f34**. |

Todos los demás ejemplos coinciden con el cálculo (tabla completa en la sección 8.9).

Ejemplos nuevos que salen de los datos y cubren los casos borde:

- **f14 + f16**: f14 (Muelle, 18:30 + 95) termina **20:05** y f16 empieza **20:05** en el mismo Muelle. Sirve para fin == inicio (no hay choque) y llegada == inicio (sí alcanza). Resultado: sin aviso, solo el texto informativo "Termina y empieza la siguiente a las 20:05, en la misma sala".
- **f25 + f27**: f25 (Teatro) termina 14:23 y el traslado al Galpón es de 8 min: llegada 14:31 contra inicio 14:30. **No alcanza, 1 minuto tarde.** Como prevalece el traslado, no aparece el aviso del conversatorio.
- **f31 + f34**: f31 (Teatro) termina 19:08 y la llegada al Galpón es 19:16, antes de las 19:30, así que alcanza. Pero el conversatorio termina 19:38 y 19:38 + 8 = 19:46 > 19:30: **pierde el conversatorio** (ve 14 de 30 min; debe salir a las 19:22).
- **f05 + f06 + f07**: tres choques (f05–f06, f05–f07, f06–f07). Sirve para H4.2 CA5.

---

## 1. Decisiones globales

### 1.1 Stack
- Next.js 16.3.5, App Router, React 19.2, TypeScript en modo `strict` (ya viene en `tsconfig.json`). Todo archivo de aplicación es `.ts` o `.tsx`.
- **Estilos: CSS Modules** más un `app/globals.css` con tokens y reset. No se instala Tailwind: no está en el proyecto y los tokens en variables CSS alcanzan.
- **Sin librería de animación.** Todo el movimiento es CSS (`transition`, `@keyframes`) sobre `transform` y `opacity`. **No se agrega ninguna dependencia** a `package.json`.
- No se usa `<ViewTransition>` de React ni `cacheComponents`. `next.config.ts` queda sin opciones (con `cacheComponents` activo no existiría `dynamicParams`).
- Fuentes vía `next/font/google`, que las descarga en build y las sirve desde el mismo dominio. Requiere red durante `npm run build`. Si el build no tiene red, se documenta en `ENTREGA.md`; no se sustituyen por fuentes externas.

### 1.2 Generación estática
Todas las rutas son estáticas. En el resumen de `next build` deben aparecer como ○ (estática) o ● (SSG), **nunca ƒ (dinámica)**:

| Ruta | Tipo | Notas |
|---|---|---|
| `/` | ○ | Portada, Server Component. |
| `/programa` | ○ | Shell server. La lista con filtros es client y lee `useSearchParams` dentro de un `<Suspense>`: sin ese límite el build falla. |
| `/peliculas/[id]` | ● ×24 | `generateStaticParams` sobre `peliculas`; `export const dynamicParams = false` (un id desconocido da 404). |
| `/itinerario` | ○ | Shell server + client que lee localStorage. No usa `useSearchParams`. |
| `/itinerario/compartido` | ○ | Shell server + client con `useSearchParams` dentro de `<Suspense>`. |
| `/_not-found` | ○ | `app/not-found.tsx`. |

Prohibido en páginas: `searchParams` como prop de página (volvería dinámica la ruta), `cookies()`, `headers()`, `connection()`, route handlers, server actions y `fetch`.

### 1.3 Convenciones de nombres
- El dominio va en español y sin tildes ni ñ en los identificadores: `Funcion`, `Pelicula`, `Sala`, `Seccion`, `anio`, `duracionMin`, `inicioMin`, `finMin`. Coincide con las claves del JSON.
- Componentes en PascalCase español (`TarjetaFuncion`), un componente por archivo, con su `NombreComponente.module.css` al lado. Clases CSS en camelCase (`.talon`, `.reglaDelDia`).
- `lib/` solo contiene funciones puras y tipos, excepto `lib/itinerario/almacen.ts`, `lib/itinerario/useItinerario.ts` y `lib/anuncios.ts`, que tocan el navegador y se usan solo desde componentes client.
- Los componentes client llevan `'use client'` en la primera línea. Todo lo que no lo necesita queda sin la directiva.
- Alias de importación `@/` (ya configurado): `@/lib/datos`, `@/components/...`.

### 1.4 Textos
- Toda la interfaz va en español, con vocabulario chileno cuando corresponde: "función", "sala", "boletería", "conversatorio", "se topa", "la pega".
- Las etiquetas derivadas de datos (días, estrenos, clasificación, duraciones, precios, plurales) se generan en `lib/formato.ts` y `lib/etiquetas.ts`. Los textos de avisos del itinerario se generan en `lib/itinerario/mensajes.ts`. Los textos fijos de interfaz van en línea en cada componente.
- Horas en 24 h con dos dígitos ("09:05", "19:30"). Rangos con guion largo con espacios ("19:30 – 21:08").
- Sin emojis. Se permiten "·", "–" y "ª". Los íconos son SVG propios.
- Nunca se muestran puntajes, estrellas, "destacadas" ni rankings. Tampoco se muestran números que parezcan ranking (índices de película, "n.º 1").
- Plurales correctos: "1 función" / "2 funciones", "1 minuto" / "12 minutos", "1 película" / "8 películas".

### 1.5 Regla de oro de fechas
**Nunca** se usa `new Date("2026-10-15T16:00")` (el navegador lo interpreta en su zona local), ni `toLocaleTimeString`, `toLocaleDateString` o `Intl.DateTimeFormat` para horas o días. Toda la aritmética usa "minutos flotantes" calculados con `Date.UTC(...)` como calendario neutro (sección 3.2). La única ocurrencia permitida de `Date` en el repo está en `lib/tiempo.ts`. Así el servidor, el build y cualquier navegador producen el mismo texto y no hay errores de hidratación.

---

## 2. Estructura de archivos

```
app/
  layout.tsx                 server · <html lang="es">, fuentes, metadata base, viewport, Encabezado, NavegacionMovil, Pie, Anunciador
  globals.css                tokens, reset, tipografía base, foco, reduced-motion, impresión
  icon.svg                   ícono del sitio (faro); se BORRA app/favicon.ico de la plantilla
  not-found.tsx              server
  page.tsx + page.module.css portada (server)
  programa/
    page.tsx + page.module.css
  peliculas/[id]/
    page.tsx + page.module.css
  itinerario/
    page.tsx + page.module.css
    compartido/
      page.tsx + page.module.css
components/
  layout/      Encabezado, NavegacionPrincipal (client), ContadorItinerario (client), Pie, SaltarAlContenido
  portada/     EscenaPuerto, CifrasFestival, TarjetaSeccion, MomentosEspeciales, HorariosPorDia, MapaPuerto, TablaTraslados, InfoEntradas
  programa/    ProgramaConFiltros (client), BarraFiltros (client), VistaPrograma, ListaPrograma, GrillaPrograma, TarjetaFuncion, ReglaDelDia, SinResultados
  pelicula/    FichaDatos, FuncionesDePelicula (client), FilaFuncionFicha (client), VolverAlPrograma (client)
  itinerario/  BotonItinerario (client), PistaFuncion (client), VistaItinerario (client), ParadaItinerario, TramoItinerario, ResumenDia,
               MiItinerario (client), AccionesItinerario (client), ItinerarioCompartido (client), CopiarCompartido (client)
  marcas/      MarcaPelicula, GlifoSala, PuntoSeccion, Etiqueta
  iconos/      Iconos.tsx (conjunto de íconos SVG en línea)
  anuncios/    Anunciador (client)
lib/
  tipos.ts  datos.ts  tiempo.ts  formato.ts  etiquetas.ts  marca.ts  filtros.ts  anuncios.ts
  itinerario/ reglas.ts  mensajes.ts  almacen.ts  useItinerario.ts  enlace.ts
ENTREGA.md
README.md                    reescrito (H5.1)
```

Se borran `public/file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`, `app/page.module.css` de la plantilla (se reemplaza) y `app/favicon.ico`. La carpeta `public/` puede quedar vacía.

---

## 3. Épica 0: base técnica y reglas transversales

### H0.1 El proyecto compila y respeta las restricciones

**Archivos:** `lib/tipos.ts`, `lib/datos.ts`, `lib/tiempo.ts`, `lib/formato.ts`, `lib/etiquetas.ts`, `app/layout.tsx`, `app/globals.css`, `app/icon.svg`. Se borra el contenido de la plantilla.

#### 3.1 Tipos (`lib/tipos.ts`)

Tipos del JSON tal como viene:

- `SalaId = 'teatro' | 'muelle' | 'galpon' | 'terraza'`
- `SeccionId = 'competencia' | 'panorama' | 'nocturna' | 'costa'`
- `Estreno = 'mundial' | 'nacional' | 'latinoamericano'`
- `Clasificacion = 'TE' | '+14' | '+18'`
- `FuncionId = string` (alias documental; formato validado `^[a-z0-9]+$`)
- `Festival { nombre; edicion: number; ciudad; region; fechaInicio: string; fechaFin: string; zonaHoraria: string; entradas: { moneda: string; general: number; aireLibre: number; venta: string }; contacto: { correo: string; instagram: string } }`
- `Sala { id: SalaId; nombre; direccion; capacidad: number; aireLibre: boolean; nota?: string }`
- `Seccion { id: SeccionId; nombre; descripcion }`
- `Pelicula { id; titulo; tituloOriginal?: string; direccion; pais; anio: number; duracionMin: number; seccion: SeccionId; clasificacion: Clasificacion; estreno: Estreno; sinopsis }`
- `FuncionDatos { id: FuncionId; peliculaId: string; salaId: SalaId; inicio: string; conversatorioMin?: number; nota?: string; agotada?: boolean }`
- `Programa { festival; salas: Sala[]; trasladosMin: { descripcion: string } & Record<SalaId, Record<SalaId, number>>; secciones: Seccion[]; peliculas: Pelicula[]; funciones: FuncionDatos[] }`

Tipos derivados, que son los que usa la interfaz:

- `DiaFestival { fecha: string /* '2026-10-15' */; slug: 'jueves' | 'viernes' | 'sabado' | string; nombre: string /* 'Jueves' */; numero: number /* 15 */; etiqueta: string /* 'Jueves 15' */; corta: string /* 'Jue 15' */; inicioDiaMin: number /* 00:00 de ese día en minutos flotantes */; ejeInicioMin: number; ejeFinMin: number }`
  - `ejeInicioMin` = hora del primer inicio del día truncada a la hora. `ejeFinMin` = hora del mayor `finConversatorioMin ?? finMin` del día redondeada hacia arriba. Resultado: jueves 16:00–01:00, viernes 16:00–02:00, sábado 12:00–02:00. Se usan en `ReglaDelDia` y `GrillaPrograma`.
- `Funcion` = `FuncionDatos` más: `pelicula: Pelicula; sala: Sala; seccion: Seccion; dia: DiaFestival; inicioMin: number; finMin: number; finConversatorioMin: number | null; terminaDiaSiguiente: boolean; conversatorioTerminaDiaSiguiente: boolean; agotada: boolean /* default false */; aireLibre: boolean /* = sala.aireLibre */; precio: number /* aireLibre ? entradas.aireLibre : entradas.general */`
- Tipos del itinerario (sección 8.1): `EstadoTramo`, `Tramo`, `Choque`, `AnalisisItinerario`, `AvisoCandidata`, `EstadoItinerario`.

#### 3.2 Tiempo (`lib/tiempo.ts`), funciones puras

- `parsearInicio(texto: string): number`. Valida con `^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$` y devuelve `Date.UTC(a, m-1, d, h, min) / 60000` (minutos flotantes). Si no calza, lanza un error con el id de la función.
- `fechaDe(min): string` devuelve `'YYYY-MM-DD'` usando los getters `getUTC*` sobre `new Date(min*60000)`.
- `horaDe(min): string` devuelve `'HH:MM'` con cero a la izquierda.
- `diaSemana(fecha): number` (0 = domingo) vía `getUTCDay`. Nombres: `['domingo','lunes','martes','miércoles','jueves','viernes','sábado']`. Mayúscula inicial en `etiqueta`.
- `crearDia(fecha): DiaFestival`. `slug` = nombre sin tildes en minúscula ("sabado"); `corta` = tres primeras letras con mayúscula y tilde ("Sáb 17"; "Mié" si aplicara).
- `terminaDiaSiguiente = finMin >= dia.inicioDiaMin + 1440`.
- `etiquetaFin(funcion, modo)`:
  - `'compacto'`: "01:07" más la marca "+1". Como texto accesible, un `<span>` visualmente oculto "del día siguiente".
  - `'largo'`: "01:07 del domingo 18" (día calculado con `fechaDe(finMin)`).
- Casos borde: el día de una función es siempre el de su **inicio**. f39 (sábado 23:45) está en sábado y su fin es "01:07 del domingo 18" (el domingo no es día de festival; el nombre sale igual del cálculo).
- **No hay conversión de zona horaria.** `festival.zonaHoraria` solo se usa en `<time dateTime>` para lectores automáticos: `dateTime="2026-10-15T16:00"` sin sufijo de zona, tal cual el dato.

#### 3.3 Carga y validación (`lib/datos.ts`)

- Importa `@/data/programa.json` de forma estática. Con `resolveJsonModule`, los strings se ensanchan a `string`, así que se hace un único `as unknown as Programa` **después** de `validarPrograma()`, que corre al evaluar el módulo (en build, en servidor y en cliente; es barato) y lanza un error descriptivo si:
  - hay ids duplicados en salas, secciones, películas o funciones;
  - un `peliculaId`, `salaId` o `seccion` no existe;
  - `estreno` o `clasificacion` están fuera de su conjunto;
  - `inicio` no calza con el regex;
  - un id de función no calza con `^[a-z0-9]+$` (necesario para el link compartido, H4.6);
  - falta algún par en `trasladosMin`. La clave `descripcion` se ignora; si falta `a→b` pero existe `b→a`, se usa ese valor (el JSON declara que es simétrico).
- Exporta:
  - `festival`, `salas`, `secciones`, `peliculas` (orden del JSON);
  - `funciones: Funcion[]` enriquecidas, ordenadas por `inicioMin` y luego por `id`;
  - `dias: DiaFestival[]`: fechas únicas de inicio de funciones, ordenadas (3);
  - mapas `funcionPorId`, `peliculaPorId`, `salaPorId`, `seccionPorId`, `diaPorSlug` (`Map`) y helpers `funcionesDePelicula(peliculaId)`, `funcionesDelDia(fecha)`, `peliculasDeSeccion(seccionId)`, `traslado(salaA, salaB): number`.
  - Cifras derivadas: `totalPeliculas` (24), `totalSalas` (4), `totalDias` (3), `totalFunciones` (39).
- Ningún componente importa el JSON directamente: siempre pasa por `lib/datos.ts`. Los componentes client también importan `lib/datos.ts`; el JSON queda en el bundle del cliente (unos 15 KB), lo que se acepta a cambio de no tener servidor.

#### 3.4 Formato y etiquetas

- `lib/formato.ts`:
  - `formatoDuracion(min)`: 112 → "1 h 52 min", 60 → "1 h", 63 → "1 h 3 min", 45 → "45 min".
  - `formatoPesos(n)`: 4000 → "$4.000", con separador de miles "." aplicado a mano, **sin** `Intl`, para que servidor y cliente coincidan.
  - `precioTexto(n)`: 0 → "Gratis".
  - `plural(n, 'función', 'funciones')` devuelve "1 función" / "39 funciones".
  - `listaHumana(['15','16','17'])` devuelve "15, 16 y 17".
  - `ordinalEdicion(3)` → "3ª" y `ordinalPalabra(3)` → "tercera" (tabla de 1 a 10).
- `lib/etiquetas.ts`:
  - `ETIQUETA_ESTRENO` = {mundial: "Estreno mundial", nacional: "Estreno nacional", latinoamericano: "Estreno latinoamericano"}.
  - `ETIQUETA_CLASIFICACION` = {TE: "Todo espectador", "+14": "+14", "+18": "+18"}.
  - `DESCRIPCION_CLASIFICACION` (solo para `aria-label`/`title`) = {TE: "Apta para todo espectador", "+14": "Para mayores de 14 años", "+18": "Para mayores de 18 años"}.
  - `instagramUrl(handle)` = `https://www.instagram.com/` + handle sin "@".

#### 3.5 Layout raíz (`app/layout.tsx`, server)

- `<html lang="es" className={variables de fuentes}>`.
- Fuentes (`next/font/google`, `subsets: ['latin', 'latin-ext']`, porque hay "Tomáš", "Élise" y "nætter"; `display: 'swap'`):
  - **Fraunces**: variable, `axes: ['opsz', 'SOFT', 'WONK']`, `style: ['normal', 'italic']`, `variable: '--f-titular'`. Títulos de película, titulares, wordmark y sinopsis.
  - **Big Shoulders**: variable, `axes: ['opsz']`, `variable: '--f-rotulo'`. Horas, cifras, rótulos en mayúscula, navegación. Evoca la señalética de puerto.
  - **IBM Plex Sans**: `weight: 'variable'`, `style: ['normal', 'italic']`, `variable: '--f-texto'`. Texto de interfaz y cuerpo.
- `export const metadata`:
  - `title: { template: '%s, Festival de Cine Niebla', default: 'Festival de Cine Niebla' }`;
  - `description`: "Tercera edición del Festival de Cine Niebla en Puerto Bruma, Chile: 15, 16 y 17 de octubre de 2026." (armada desde datos con los helpers).
- `export const viewport = { themeColor: '#0B141B', colorScheme: 'dark' }`.
- Cuerpo, en orden: `SaltarAlContenido` → `Encabezado` → `<main id="contenido">{children}</main>` → `Pie` → `NavegacionMovil` (parte de `NavegacionPrincipal`) → `Anunciador`.

#### Verificación H0.1
1. `npm run build` termina sin errores ni warnings de Suspense. Todas las rutas con ○ o ●.
2. `npm run lint` pasa.
3. `git diff --stat 2035df2 -- data/programa.json` no muestra cambios.
4. `package.json` tiene las mismas `dependencies` y `devDependencies` que el commit base.
5. Buscar en `app components lib` los patrones `https?://`: solo pueden aparecer `mailto:` y el enlace de Instagram. Buscar `new Date(`: solo en `lib/tiempo.ts`.
6. DevTools, pestaña Red, recarga completa en `/`, `/programa`, una ficha y `/itinerario`: todas las peticiones van a `localhost`.
7. No hay rastros visuales de la plantilla y `public/` no tiene SVG de Next ni de Vercel.

### H0.2 Todo en español, sin emojis ni puntajes
- **Decisión:** los textos de avisos se centralizan en `lib/itinerario/mensajes.ts` y las etiquetas en `lib/etiquetas.ts`, para revisarlos en un solo lugar. Todo `aria-label` va en español.
- **Verificación:**
  1. Recorrer las cinco pantallas con el lector de accesibilidad de DevTools (árbol de accesibilidad) buscando palabras en inglés.
  2. Buscar con regex `[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]` en `app components lib`: cero resultados.
  3. Buscar `estrella|puntaje|rating|score|ranking|destacad` en el código: cero resultados.

### H0.3 De 360 px a escritorio

**Sistema de espaciado y medidas** (tokens en `globals.css`):

| Token | Valor | Uso |
|---|---|---|
| `--e-1` … `--e-9` | 4, 8, 12, 16, 24, 32, 48, 64, 96 px | márgenes y gaps; solo estos valores |
| `--margen` | `clamp(16px, 4vw, 40px)` | padding lateral de página |
| `--ancho-max` | `1200px` | contenedor general |
| `--ancho-lectura` | `64ch` | sinopsis, textos de portada |
| `--toque` | `44px` | alto y ancho mínimo de todo control |
| `--radio-1` / `--radio-2` | 4px / 10px | chips / tarjetas. La estética es de boleto de papel, casi recta |
| `--alto-nav-movil` | `64px` + `env(safe-area-inset-bottom)` | barra inferior |

**Breakpoints** (mobile first, `min-width`): `40rem` (640px) tablet, `64rem` (1024px) escritorio, `80rem` (1280px) escritorio ancho. Nada de `max-width` en media queries salvo impresión.

**Escala tipográfica:**

| Rol | Familia | Móvil | ≥1024 | Notas |
|---|---|---|---|---|
| wordmark portada "Niebla" | Fraunces 600, `opsz 144`, `SOFT 100`, `WONK 1` | `clamp(76px, 24vw, 220px)` | igual | `line-height: .85` |
| h1 de página | Fraunces 600, opsz 96 | 40px / 1.05 | 64px | |
| h2 | Fraunces 500 | 28px / 1.1 | 40px | |
| h3 / título en tarjeta | Fraunces 600, opsz 24 | 20px / 1.2 | 22px | |
| hora en tarjeta | Big Shoulders 700, `font-variant-numeric: tabular-nums` | 30px / 1 | 32px | |
| hora de fin | Big Shoulders 600 | 18px | 18px | |
| rótulo (sala, día, sección) | Big Shoulders 600, mayúsculas, `letter-spacing: .06em` | 16px | 16px | |
| cuerpo | IBM Plex Sans 400 | 17px / 1.5 | 18px | |
| secundario | IBM Plex Sans 400 | 15px / 1.45 | 15px | nunca para hora, sala ni avisos |
| sinopsis | Fraunces 400, opsz 14 | 19px / 1.55 | 21px | |

**Reglas:** `html, body { overflow-x: clip }` como red de seguridad, pero cada pantalla debe cumplir sin ella. Las filas desplazables horizontalmente (chips de sección) tienen su propio `overflow-x: auto`. Títulos y direcciones largos hacen `overflow-wrap: anywhere` (el título más largo es "Cortos II: Noches de puerto", 27 caracteres). Ningún texto se trunca con elipsis, salvo en la grilla de escritorio, que usa `line-clamp: 3`.

**Verificación:** DevTools en modo dispositivo a 360×640, 768×1024, 1280×800 y 1920×1080. En cada una de las cinco pantallas, ejecutar en consola `document.documentElement.scrollWidth <= innerWidth` (debe dar `true`). Revisar con el inspector que botones de filtro, "Agregar" y "Quitar" midan ≥44×44 a 360 px.

### H0.4 `prefers-reduced-motion`
- **Decisión global** en `globals.css`: dentro de `@media (prefers-reduced-motion: reduce)`, todo `animation` pasa a `none` y `transition-duration` a `0ms`, en todos los elementos y pseudo-elementos, con `!important`, y `scroll-behavior: auto`. Además, cada animación decorativa de la portada declara explícitamente `animation: none` en su módulo y define un **fotograma estático de diseño** (haz del faro fijo a −8°, niebla en su posición inicial, olas quietas, título visible sin desenfoque).
- En JS, `scrollIntoView` y `scrollTo` usan `behavior: 'smooth'` solo si `matchMedia('(prefers-reduced-motion: reduce)').matches` es falso.
- Los cambios de estado siguen siendo visibles sin movimiento: color, borde, ícono y texto cambian al instante.
- No hay destellos: el "destello" del faro dura 1 vez por ciclo de 10 s. Nada supera 1 cambio por segundo.
- Sin la preferencia, ninguna animación retrasa contenido: el programa no anima al filtrar y los CTA de portada son visibles desde el primer fotograma.
- **Verificación:** DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce". En la portada nada se mueve y el título es legible de inmediato. Al marcar una función, el botón cambia de estado sin animación. La notificación aparece sin deslizarse. Con Performance → Record 5 s en portada sin la emulación, no hay tareas largas por animación (solo capas compuestas).

### H0.5 Accesibilidad básica
- **Foco:** `:focus-visible` con `outline: 3px solid var(--faro); outline-offset: 3px` en todo el sitio. Nunca `outline: none` sin reemplazo.
- `SaltarAlContenido`: primer elemento del body, enlace a `#contenido`, visible solo al recibir foco.
- **Avisos:** siempre ícono SVG con `aria-hidden="true"` más texto visible. El color es un refuerzo, no el mensaje.
- **Anuncios:** `Anunciador` mantiene una región `role="status" aria-live="polite"` visualmente oculta y, aparte, la notificación visible (sección 8.8).
- **Encabezados:** un `h1` por página. Portada: el h1 es "Festival de Cine Niebla" (el wordmark). Programa: "Programa". Ficha: el título de la película. Itinerario: "Mi itinerario" o "Itinerario compartido". Los días son `h2`; en la ficha, "Funciones" es `h2`.
- **Controles:** filtros y botón de itinerario son `<button>` con `aria-pressed`. La navegación usa `aria-current="page"`.
- **Contraste:** paleta verificada en la sección 4.2.
- **Verificación:** recorrer cada página solo con Tab / Shift+Tab / Enter / Espacio: navegar, filtrar, agregar, quitar, deshacer, compartir y copiar. Lighthouse Accesibilidad ≥ 95 en las cinco páginas. Con NVDA o VoiceOver, agregar f05 y escuchar "Agregaste La hora azul del puerto, jueves 15 a las 19:30".

### H0.6 Metadatos y navegación global

**Metadatos por página:**

| Página | `title` resultante | `description` |
|---|---|---|
| `/` | `absolute`: "Festival de Cine Niebla · 15 al 17 de octubre de 2026, Puerto Bruma" | la de layout |
| `/programa` | "Programa, Festival de Cine Niebla" | "Las 39 funciones de los tres días, por día y por sección." (cifra derivada) |
| `/peliculas/[id]` | "{titulo}, Festival de Cine Niebla" (vía `generateMetadata`) | la sinopsis |
| `/itinerario` | "Mi itinerario, Festival de Cine Niebla" | "Arma tu recorrido por las salas del festival." |
| `/itinerario/compartido` | "Itinerario compartido, Festival de Cine Niebla" | igual; además `robots: { index: false }` |
| 404 | "Página no encontrada, Festival de Cine Niebla" (`metadata` exportada en `not-found.tsx`; si esta versión la ignora, el h1 basta) | |

**Componentes:**
- `Encabezado` (server). En móvil: franja superior no fija de 56px con el wordmark pequeño "Niebla" (Fraunces) enlazado a `/` y, a la derecha, "15–17 oct". En ≥1024 es la barra principal: wordmark a la izquierda y `NavegacionPrincipal` en línea a la derecha. No es sticky en escritorio; el sticky es la barra de filtros del programa.
- `NavegacionPrincipal` (client). Props `{ variante: 'barra' | 'inferior' }`. Usa `usePathname()` para `aria-current`. Tres enlaces: "Portada" (`/`), "Programa" (`/programa`), "Mi itinerario" (`/itinerario`) con `ContadorItinerario`. `/peliculas/*` marca "Programa" como actual; `/itinerario/compartido` no marca ninguno.
  - `inferior` (<1024): `position: fixed; bottom: 0`, alto `--alto-nav-movil`, fondo `--noche-2` con borde superior `--linea`, tres zonas iguales de ancho completo con ícono + rótulo de 14px Big Shoulders. El `body` lleva `padding-bottom` igual al alto. Se oculta en ≥1024 y en impresión.
- `ContadorItinerario` (client). Usa `useItinerario()`. Mientras `listo === false` (render de servidor e hidratación) renderiza el hueco con `visibility: hidden` y ancho mínimo de 2ch, para que no se vea "0" y luego "5". Con `listo` muestra el número (también "0") en una pastilla `--faro` sobre `--noche`. Texto accesible: `aria-label` en el enlace, "Mi itinerario, 5 funciones". Cuando el número cambia, animación `latido` (escala 1 → 1.18 → 1, 220ms).
- `Pie` (server): nombre y "3ª edición", fechas ("15, 16 y 17 de octubre de 2026"), "Puerto Bruma, Chile", entradas (general "$4.000", aire libre "Gratis", frase `entradas.venta` tal cual), contacto (`mailto:` con el correo; Instagram como enlace con `target="_blank" rel="noopener noreferrer"` y texto "@festivalniebla"). Todo derivado de `festival`. Dibujo decorativo: línea de olas SVG estática de 1px.
- `app/not-found.tsx` (server): h1 "No encontramos esa página", texto "Puede que el enlace esté incompleto o que esa película no sea parte de esta edición.", enlaces "Ver el programa" (principal) y "Ir a la portada". Fondo: el faro de `EscenaPuerto` en versión mini estática, con el haz apuntando al vacío.

**Verificación:**
1. Revisar el título de pestaña en cada página.
2. `/peliculas/no-existe` muestra la 404 en español con status 404 en Red (`npm run build && npm start`).
3. A 360 px la barra inferior está al alcance del pulgar. Agregar f05 desde el programa: el contador pasa de 0 a 1 sin recargar.
4. Recargar con 5 funciones guardadas: no se ve un "0" antes del "5" (grabar con Performance y revisar los fotogramas).

---

## 4. Dirección visual global

### 4.1 Concepto
"El puerto de noche con niebla, visto desde el faro." Tema **oscuro único**: el público lo mira de noche caminando entre salas, y el oscuro con alto contraste se lee bien con el celular. Superficies de "boleto de papel" (tarjetas con muescas laterales) sobre azul noche, luz ámbar del faro como acento y la niebla como textura. No se ofrece tema claro (salvo impresión).

### 4.2 Paleta (tokens en `:root`)

Contrastes calculados (WCAG) contra `--noche` / `--noche-2` / `--noche-3`:

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `--noche` | `#0B141B` | fondo de página | — |
| `--noche-2` | `#13222C` | superficie de tarjetas y barras | — |
| `--noche-3` | `#1C3140` | superficie elevada, hover, talón | — |
| `--linea` | `#3A5566` | bordes y líneas no textuales (≥3:1 no aplica a decoración) | 2.4 / 2.1 / 1.7 |
| `--bruma` | `#E8EEF0` | texto principal | 15.9 / 13.9 / 11.5 |
| `--bruma-tenue` | `#A3B3BB` | texto secundario | 8.6 / 7.5 / 6.2 |
| `--faro` | `#F4C15D` | acento: CTA, estado "en mi itinerario", foco, haz | 11.2 / 9.8 / 8.1 |
| `--sobre-faro` | `#0B141B` | texto sobre fondo `--faro` | 11.2 |
| `--choque` | `#FF7B6B` | aviso de choque | 7.3 / 6.4 / 5.3 |
| `--traslado` | `#FFA95C` | aviso de no alcanzar | 9.8 / 8.6 / 7.1 |
| `--conversatorio` | `#8FC9EA` | aviso informativo de conversatorio | 10.4 / 9.1 / 7.5 |
| `--holgura` | `#8ED6A0` | "te sobran N min" | 10.9 / 9.5 / 7.9 |
| `--sec-competencia` | `#EFA3C8` (rosa sal) | sección | 9.5 / 8.3 / 6.9 |
| `--sec-panorama` | `#6CC4AE` (verde agua) | sección | 9.0 / 7.9 / 6.5 |
| `--sec-nocturna` | `#B79CF0` (violeta bruma) | sección | 8.0 / 7.0 / 5.8 |
| `--sec-costa` | `#6FAEE8` (azul caleta) | sección | 7.9 / 6.9 / 5.7 |

Los fondos translúcidos de aviso son el color al 14% sobre `--noche-2` (`color-mix(in srgb, var(--choque) 14%, var(--noche-2))`). Encima el texto sigue siendo `--bruma`.

En `globals.css` se define `[data-seccion="competencia"] { --sec: var(--sec-competencia) }` (y así las cuatro), para que cualquier componente use `var(--sec)` con solo poner el atributo.

### 4.3 Salas y secciones: cómo se distinguen
- **Secciones = color** (`--sec`) más un rombo pequeño, `PuntoSeccion`: cuadrado de 10px rotado 45°, como una boya. Siempre acompañado del nombre de la sección.
- **Salas = forma** (`GlifoSala`, SVG de 20×20, trazo 2px, `currentColor`) más el nombre completo:
  - `teatro`: arco de medio punto sobre una base (fachada de teatro).
  - `muelle`: tablón horizontal con tres pilotes verticales.
  - `galpon`: silueta de galpón con techo a dos aguas y una puerta rectangular al centro (sin números).
  - `terraza`: faro (trapecio con linterna y dos rayos cortos).
  - Id desconocido: círculo.
- Nunca se codifica una sala con color, así no compite con secciones ni avisos.

### 4.4 Íconos (`components/iconos/Iconos.tsx`)
Un componente por ícono, SVG 24×24, `stroke="currentColor"`, trazo 2px, extremos redondeados, `aria-hidden="true"`: `IconoAgregar` (+), `IconoMarcada` (visto), `IconoChoque` (dos segmentos cruzados que se topan), `IconoCaminar` (dos huellas), `IconoConversatorio` (dos globos de diálogo), `IconoAgotada` (boleto con una diagonal), `IconoAireLibre` (luna con nube), `IconoNota` (asterisco de 6 brazos), `IconoCompartir`, `IconoCopiar`, `IconoDeshacer`, `IconoQuitar` (x), `IconoFlechaIzq`, `IconoPrograma`, `IconoPortada` (faro), `IconoItinerario` (línea punteada con dos nodos).

### 4.5 `Etiqueta` (chip de estado)
Props `{ tipo: 'agotada' | 'aireLibre' | 'conversatorio' | 'nota' | 'estreno'; children }`. Alto 28px (no es control, no requiere 44), Plex Sans 14px/600, ícono de 16px más texto, borde 1px `--linea`, radio `--radio-1`. `agotada` lleva borde y texto `--choque` y la palabra "Agotada". `aireLibre` usa `--holgura`. `conversatorio` usa `--conversatorio`.

---

## 5. Épica 1: portada (`app/page.tsx`, server)

Orden de bloques: `EscenaPuerto` (hero) → "Qué es" + `CifrasFestival` → Secciones → `MomentosEspeciales` → `HorariosPorDia` → Salas (`MapaPuerto` + lista + `TablaTraslados`) → `InfoEntradas` → cierre "Arma tu recorrido".

### H1.1 Presentación del festival

**`EscenaPuerto`** (server, sin props; lee `festival` y `dias`). Estructura:
- `<section>` con `min-height: 100svh` (mínimo 640px, máximo 1000px), `position: relative`, `overflow: hidden`, fondo `--noche`.
- **Capa 1, cielo y mar (SVG en línea).** `viewBox="0 0 1440 900"`, `preserveAspectRatio="xMidYMax slice"`, `aria-hidden`. Ids con prefijo `portada-` (es la única instancia).
  - Cielo: `linearGradient` vertical `#0B141B` → `#1C3140` a la altura del horizonte (y = 610).
  - Mar: rectángulo desde y = 610 en `#0E1B24` con tres `path` de olas (trazo `--linea` a 50%, 35% y 20% de opacidad). Cada ola es una sinusoide de 2880 de ancho (dos períodos del viewBox), para desplazarse en bucle sin salto.
  - Puerto a la izquierda: siluetas planas `#08111A` sobre el horizonte: dos grúas (rectángulos con brazo diagonal), una fila de 6 contenedores de alturas 22–34 y los pilotes de un muelle (8 rectángulos de 6×40).
  - Promontorio y faro a la derecha (x ≈ 1130 en escritorio). En móvil el `slice` recorta el centro, así que el faro se ubica en x = 1010 para que se vea a 360 px (verificar). Torre: trapecio blanco bruma con dos franjas `--choque` al 80% (faro rojo y blanco), balcón y linterna; círculo de luz `--faro` de r = 14 con halo r = 60 al 25%.
  - Haz del faro: `<g class="haz">` con un triángulo (vértice en la linterna, base de 900 de ancho a 1400 de distancia) relleno con un `linearGradient` `--faro` 55% → 0%. `transform-origin` en la linterna (usar `transform-box: view-box` y coordenadas absolutas).
- **Capa 2, niebla (HTML).** Tres `div` absolutos, `aria-hidden`, de 200% de ancho, cada uno con 4–6 `radial-gradient` elípticos de `rgba(232,238,240, .06–.14)` repetidos en ancho y `filter: blur(18px)` estático. Capa baja sobre el horizonte, capa media que tapa la base del faro, capa alta tenue que cruza el título.
- **Capa 3, texto** (`position: relative`, alineado abajo a la izquierda en móvil y a la izquierda centrado verticalmente en escritorio, con `--margen`):
  1. Rótulo Big Shoulders: "Festival de Cine" (de `festival.nombre` sin la última palabra; el wordmark es la última: "Niebla").
  2. `h1` accesible "Festival de Cine Niebla" compuesto así: el rótulo anterior visualmente y "Niebla" como wordmark gigante Fraunces. Un solo `h1` que contiene ambos spans.
  3. Línea Big Shoulders 22px, `--faro`: "15, 16 y 17 de octubre de 2026" (desde `dias` y el año de `fechaInicio`).
  4. Línea 17px `--bruma`: "Puerto Bruma, Chile · 3ª edición".
  5. CTA principal `<Link href="/programa">` "Ver el programa": fondo `--faro`, texto `--sobre-faro`, 52px de alto, Big Shoulders 20px mayúsculas. CTA secundario "Arma tu itinerario" (`/itinerario`): borde `--bruma`, fondo transparente. En móvil ocupan dos filas a ancho completo; en ≥640 van en línea.
- **CA1 sobre el pliegue a 360×640:** encabezado de 56px + bloque de texto ≈ 400px. El wordmark de 86px (24vw) y los CTA caben. La escena se ve detrás y arriba.

**Animaciones de la escena** (todas en `EscenaPuerto.module.css`, solo `transform` y `opacity`):

| Nombre | Elemento | Keyframes | Duración | Reduced motion |
|---|---|---|---|---|
| `barrido` | `.haz` | `rotate(-28deg)` → `rotate(12deg)` | 10s `ease-in-out` infinito `alternate` | `animation: none; transform: rotate(-8deg)` |
| `destello` | halo de linterna | opacidad .25 → .7 → .25 al 45–55% del ciclo | 10s infinito, sincronizado con `barrido` | halo fijo en .35 |
| `deriva` | 3 capas de niebla | `translateX(0)` → `translateX(-50%)` | 90s / 140s / 200s `linear` infinito; la capa media va en sentido contrario | sin animación |
| `oleaje` | 3 grupos de olas | `translateX(0)` → `translateX(-1440px)` en unidades del viewBox | 26s / 40s / 60s `linear` infinito | sin animación |
| `emerger` | wordmark "Niebla" | opacidad 0 → 1, `blur(12px)` → 0, `translateY(10px)` → 0 | 1100ms `cubic-bezier(.2,.7,.2,1)`, una vez | visible desde el inicio |

Los CTA y las fechas no se animan. `will-change: transform` solo en las capas de niebla y en `.haz`.

**"Qué es"** (server, en `page.tsx`). `h2` "Cine chico, de puerto". Párrafo (máx. `--ancho-lectura`), texto fijo:
> "Tres días de películas repartidas entre un teatro, un cine arte, un galpón y una terraza frente al mar. Lo organizamos entre cuatro personas, con fondos concursables y la mano de muchos voluntarios. Esta es la tercera edición."

"tercera" sale de `ordinalPalabra(festival.edicion)`. "un teatro, un cine arte, un galpón y una terraza" es texto fijo que describe las 4 salas; si se prefiere derivarlo, se usan los nombres reales.

**`CifrasFestival`** (server): tres cifras grandes en fila (se apilan en <360): "24" / "películas", "4" / "salas", "3" / "días". Números Big Shoulders 72px `--faro` y rótulo en mayúsculas. Todo desde `totalPeliculas`, `totalSalas` y `totalDias`.

**Verificación H1.1:** a 360×640 se ven sin desplazar nombre, "3ª edición", "15, 16 y 17 de octubre de 2026", "Puerto Bruma" y el botón "Ver el programa". A 1280 la escena ocupa el ancho y el faro queda a la derecha del texto. Cambiar `edicion` en memoria no aplica (el dato es fijo): verificar en el código que "24", "4", "3" y "tercera" vienen de `lib/datos.ts`.

### H1.2 Secciones del festival
- **`TarjetaSeccion`** (server). Props `{ seccion: Seccion; peliculas: Pelicula[] }`. Tarjeta `data-seccion`, borde superior de 4px `var(--sec)`, `h3` con el nombre, descripción tal cual, rótulo "8 películas" (`plural(peliculas.length, 'película', 'películas')`), franja de miniaturas `MarcaPelicula tamano="mini"` de todas sus películas (28×37 cada una, fila con `flex-wrap`, `aria-hidden`) y enlace "Ver en el programa" a `/programa?seccion={id}` (el texto accesible incluye el nombre: "Ver Bruma Nocturna en el programa").
- **Grilla:** 1 columna <640, 2 columnas ≥640, 4 columnas ≥1280.
- **Verificación:** Competencia 8, Panorama 6, Nocturna 5, Costa 5. Clic en "Hecho en la Costa" abre `/programa?seccion=costa` con el chip activo y solo funciones de esa sección.

### H1.3 Dónde es: salas
- **`MapaPuerto`** (server-safe, sin estado). Props `{ ruta?: SalaId[]; etiquetaRuta?: string }`. SVG esquemático `viewBox="0 0 520 300"`, **no es un mapa real** (se aclara con un rótulo pequeño "Esquema, no a escala"):
  - costa: `path` curvo que cruza de izquierda a derecha en la mitad inferior; mar abajo en `#0E1B24`;
  - nodos fijos (constantes de presentación en el componente, indexadas por `SalaId`): galpon (110, 150), teatro (220, 110), muelle (340, 190), terraza (450, 105);
  - 6 aristas (todos los pares) con línea discontinua `--linea`, cada una con una etiqueta en su punto medio: número de minutos (`traslado(a, b)`) más "min", Big Shoulders 20 unidades del viewBox (≈14px reales a 360 px de ancho);
  - en cada nodo, un círculo r = 18 `--noche-3` con `GlifoSala` y debajo el nombre en dos líneas máximo. Los nombres largos se muestran fuera del SVG a 360 px; ver la lista;
  - si viene `ruta`, se dibuja encima una polilínea `--faro` de 3px entre los nodos en orden, con círculos numerados 1..n. Las repeticiones consecutivas de la misma sala se colapsan a un nodo con "2 · 3".
  - `role="img"` con `aria-label` que resume: "Esquema de las cuatro salas con minutos caminando entre ellas". La información completa está en la tabla.
- **Lista de salas** (en `page.tsx`): por sala, glifo, nombre (h3), dirección, "Capacidad: 420 personas", y si `aireLibre`, `Etiqueta aireLibre` "Al aire libre · entrada gratis" más `nota` tal cual.
- **`TablaTraslados`** (server): `<table>` 4×4 con `<caption>` "Minutos caminando entre salas". Encabezados de fila y columna con glifo y nombre; diagonal "—". Dentro de su propio contenedor con `overflow-x: auto` (a 360 px se usan nombres completos en filas y glifo más nombre abreviado visualmente con `abbr`, `title` = nombre completo en las columnas). Alternativa aceptable si no cabe: lista de 6 pares ("Teatro Municipal de Puerto Bruma ↔ Galpón 7: 8 min"); la flecha es un carácter tipográfico, no un emoji.
- **Diseño:** ≥1024 mapa a la izquierda (7/12) y lista más tabla a la derecha. En móvil: mapa, lista, tabla.
- **Verificación:** Teatro ↔ Galpón 8, Muelle ↔ Terraza 9, Galpón ↔ Terraza 22, Terraza muestra la nota de lluvia, 4 direcciones visibles.

### H1.4 Información práctica
- **`InfoEntradas`** (server): dos "boletos" dibujados con CSS (rectángulos con muescas semicirculares a los lados vía `mask` de `radial-gradient`): "General $4.000" y "Al aire libre · Gratis". Debajo, la frase `entradas.venta` tal cual, destacada. Texto fijo adicional: "El sitio no vende ni reserva entradas."
- **`MomentosEspeciales`** (server): `funciones.filter(f => f.nota)` en orden. Para cada una, fecha ("Jueves 15 · 19:30"), título de película enlazado a su ficha, sala y la nota tal cual. Resultado: f05 "Función inaugural con la presencia del equipo de la película." y f36 "Antes de la función se entregan los premios del festival.". `h2` "Momentos especiales".
- **`HorariosPorDia`** (server). `h2` "Pensado para después de la pega". Una fila por día: "Jueves 15", "desde las 16:00", "10 funciones", "última a las 22:30". Texto fijo introductorio: "Jueves y viernes el programa parte en la tarde; el sábado arranca al mediodía." Se muestra solo si los datos lo cumplen: el componente comprueba que el primer inicio de jueves y viernes es ≥ 15:00 y el del sábado < 15:00; si no, omite la frase y deja solo las filas.
- **Verificación:** $4.000 y Gratis visibles, frase de boletería, f05 y f36 con sus notas, primeras funciones 16:00, 16:30 y 12:00, conteos 10, 12 y 17.

### H1.5 La portada sorprende
- El elemento de identidad es `EscenaPuerto`: faro con haz que barre la niebla sobre un puerto de noche. Coherencia: la misma paleta, Fraunces y Big Shoulders se usan en todo el sitio; las muescas de boleto se repiten en tarjetas de función e `InfoEntradas`; el glifo del faro es el ícono del sitio (`app/icon.svg`: faro `--faro` sobre `--noche`, 32×32).
- Cierre de portada: bloque "Arma tu recorrido" con una miniatura estática de un recorrido de ejemplo (3 nodos con líneas punteadas, **sin** datos de funciones reales para no parecer una recomendación) y botón "Ir al programa".
- Prohibido: carruseles, sliders, testimonios, "nuestros valores", íconos de check en listas de beneficios.
- **Verificación:** comparar lado a lado a 360 y 1280. Con reduced motion, el fotograma estático sigue viéndose como una escena (faro con haz fijo), no como un fondo plano.

---

## 6. Épica 2: programa (`/programa`)

### 6.1 Archivos y límite server/client
- `app/programa/page.tsx` (server): `metadata`, `h1` "Programa" (visualmente pequeño en móvil, 28px, porque la barra de filtros manda) y `<Suspense fallback={<VistaPrograma filtros={{ dia: null, seccion: null }} interactiva={false} />}> <ProgramaConFiltros /> </Suspense>`.
  - El fallback es el programa completo sin filtros, así que queda en el HTML estático y funciona sin JavaScript como lista completa.
- `ProgramaConFiltros` (client): lee `useSearchParams()`, normaliza con `lib/filtros.ts` y renderiza `<VistaPrograma filtros interactiva />`.
- `VistaPrograma` (sin directiva; se vuelve client al importarse desde client). Props `{ filtros: FiltrosPrograma; interactiva: boolean }`. Contiene `BarraFiltros`, la línea de conteo, `ListaPrograma` (visible <1024) y `GrillaPrograma` (visible ≥1024). **Ambas vistas se renderizan y CSS oculta una con `display: none`** según breakpoint. Así no se usa `matchMedia` en el render ni hay desajuste de hidratación, y el árbol de accesibilidad solo expone la visible.

### 6.2 Filtros en la URL (`lib/filtros.ts`, puro)
- `FiltrosPrograma { dia: string | null /* slug */; seccion: SeccionId | null }`.
- `leerFiltros(params: URLSearchParams | ReadonlyURLSearchParams): { filtros; huboInvalidos: boolean }`. `dia` válido si está en `diaPorSlug` (`jueves`, `viernes`, `sabado`); `seccion` válida si está en `seccionPorId`. Todo lo demás se ignora. Acepta mayúsculas y tildes (`sábado` → `sabado`).
- `escribirFiltros(filtros): string` devuelve `"?dia=viernes&seccion=nocturna"`, en ese orden, omitiendo nulos; `""` si ambos son nulos.
- `filtrarFunciones(funciones, filtros): Funcion[]`.

### H2.1 Listado completo de funciones

**`ListaPrograma`** (móvil y tablet). Props `{ funciones: Funcion[]; interactiva: boolean; mostrarDias: boolean }`.
- Agrupa por día (`h2` con `dia.etiqueta`, sticky bajo la barra de filtros, fondo `--noche` al 92% con `backdrop-filter: blur(6px)`) y, dentro, por **franja horaria**: hora de inicio truncada ("19 h"), como rótulo Big Shoulders 15px `--bruma-tenue` con una línea `--linea` a lo ancho, estilo tabla de mareas. Las funciones de una misma franja quedan juntas, y así las simultáneas se ven como grupo.
- Lista semántica: `<ol>` por día, `<li>` por función.

**`TarjetaFuncion`**. Props `{ funcion: Funcion; variante: 'lista' | 'grilla'; interactiva: boolean }`. Atributos `data-seccion={funcion.pelicula.seccion}` y `data-funcion={funcion.id}`.

Variante `lista` (diseño de boleto, 360 px):
```
┌──────────┬─────────────────────────────────────────┐
│  19:30   ( ▢ GLIFO  TEATRO MUNICIPAL DE PUERTO BRUMA │
│ – 21:08  (  [marca] La hora azul del puerto          │
│          (          ◆ Competencia Latinoamericana   │
│          (          1 h 38 min · +14                 │
│          (  [Agotada] [Al aire libre] [Conversatorio 20 min]
│          (  * Función inaugural con la presencia…    │
│          (  ▬▬▬▬▬▬▬██████▬▬▬▬▬▬ (ReglaDelDia)        │
│          (  [ + Agregar ]   pista: Se topa con…      │
└──────────┴─────────────────────────────────────────┘
```
- Contenedor: grid `76px 1fr`, fondo `--noche-2`, radio `--radio-2`, borde 1px transparente. Un separador punteado vertical `--linea` con dos muescas semicirculares de 8px (mask) entre talón y cuerpo.
- **Talón:** fondo `--noche-3`; hora de inicio 30px; debajo "– 21:08" 18px `--bruma-tenue`; si `terminaDiaSiguiente`, la marca "+1" en pastilla de 16px de alto con borde `--bruma-tenue` más el texto oculto "del día siguiente".
- **Cuerpo**, en este orden:
  1. Sala: `GlifoSala` + nombre en rótulo 16px `--bruma`, con `overflow-wrap: anywhere`.
  2. Fila con `MarcaPelicula tamano="tarjeta"` (48×64) a la izquierda y, a la derecha, título `h3` enlazado (`<Link href="/peliculas/{id}">`, con pseudo-elemento que extiende el clic al cuerpo salvo al botón); sección con `PuntoSeccion` y nombre 15px; "1 h 38 min · +14" 15px (`title` y `aria-label` de la clasificación con `DESCRIPCION_CLASIFICACION`).
  3. Chips, solo si aplican: `agotada` "Agotada", `aireLibre` "Al aire libre", `conversatorio` "Conversatorio después (20 min)".
  4. Nota de función, si hay: `IconoNota` + texto 15px en itálica.
  5. `ReglaDelDia`.
  6. Si `interactiva`: `BotonItinerario variante="completo"` y `PistaFuncion` debajo. Si no es interactiva (fallback de Suspense), el botón se renderiza en estado `pendiente` (ver `BotonItinerario` en H4.1).
- Hover (solo `@media (hover: hover)`): borde `--linea` y `translateY(-2px)` en 150ms.
- Cuando la función está en el itinerario: borde 1px `--faro` y talón con franja izquierda de 3px `--faro` ("luz encendida"). Al agregar, `encender`: `box-shadow` de 0 a `0 0 0 6px color-mix(--faro 25%)` y vuelta a 0 en 450ms, una vez.

Variante `grilla`: ver H2.4.

**`ReglaDelDia`** (sin estado). Props `{ funcion: Funcion }`. Barra de 6px de alto a ancho completo, `aria-hidden`:
- pista `--linea` al 60% que representa `dia.ejeInicioMin` → `dia.ejeFinMin`;
- segmento de la función en `var(--sec)` desde `(inicioMin - ejeInicio)/(ejeFin - ejeInicio)` con ancho proporcional a la duración;
- si hay conversatorio, un segmento contiguo con rayado diagonal (`repeating-linear-gradient`) `var(--sec)` al 50%;
- ticks de 2px cada 2 horas y una marca un poco más alta en 00:00 cuando el eje cruza medianoche.
- Posiciones y anchos van en variables CSS en línea (`style={{ '--desde': '0.43', '--ancho': '0.18' }}`).
- Todas las tarjetas del mismo día usan el mismo eje, así que al recorrer la lista las barras solapadas se ven solapadas.

**Línea de conteo:** "39 funciones" / "3 funciones · Viernes 16 · Bruma Nocturna", con `role="status"` y `aria-live="polite"`.

**Casos borde:**
- Día y medianoche: f09, f10, f21, f22 y f39 se listan en su día de inicio, con "+1".
- Campos opcionales ausentes: no se renderiza nada, ni etiquetas vacías ni "null". Esto se comprueba con f01 (sin opcionales).
- Orden: `inicioMin` y luego `id`. No hay empates de hora en los datos, pero el desempate está definido.

**Verificación:**
1. `/programa`: contar en consola `document.querySelectorAll('[data-funcion]')` dentro de la vista visible: 39 ids únicos.
2. Viernes: f21 "23:00 – 00:22 +1".
3. Sábado: f39 "23:45 – 01:07 +1" bajo el encabezado "Sábado 17".
4. f22 con "Agotada".
5. f03 con "Conversatorio después (20 min)".
6. Clic en el título de f01 lleva a `/peliculas/el-canto-de-las-redes`.
7. "Agregar" en f06 cambia el botón al instante sin salir de la página.

### H2.2 Filtro por día

**`BarraFiltros`** (client). Props `{ filtros: FiltrosPrograma; interactiva: boolean; conteo: number }`.
- `position: sticky; top: 0; z-index: 20`, fondo `--noche` al 94% con blur de 8px y borde inferior `--linea`.
- **Fila 1, día:** control segmentado de 4 `<button aria-pressed>` de igual ancho: "Todos", "Jue 15", "Vie 16", "Sáb 17" (`dia.corta`; `aria-label` con `dia.etiqueta`). 48px de alto, Big Shoulders 18px. El activo lleva fondo `--faro` y texto `--sobre-faro`.
- En ≥1024 las etiquetas pasan a `dia.etiqueta` completa.
- Al cambiar: `window.history.replaceState(null, '', '/programa' + escribirFiltros(nuevos))`. Next sincroniza `useSearchParams` sin recargar ni pedir nada a la red (documentado en `01-getting-started/04-linking-and-navigating.md`). Se usa `replaceState`, no `pushState`, para no llenar el historial con cada toque. "Atrás" desde una ficha vuelve a la URL filtrada.
- También se guarda la query en `sessionStorage['festival-niebla:programa-query']`, dentro de try/catch (para H3.3).
- Tras cambiar de día, si el inicio de la lista quedó arriba del viewport, `scrollIntoView({ block: 'start' })` sobre el contenedor de resultados, con compensación de la barra sticky vía `scroll-margin-top`.
- Si `leerFiltros` detectó parámetros inválidos, en el primer efecto se limpia la URL con `replaceState` a la forma canónica.

**Verificación:** "Jue 15" muestra 10, "Vie 16" 12, "Sáb 17" 17 y "Todos" 39. Tras bajar hasta f39 con "Todos", la barra sigue visible arriba. Con sección elegida, cambiar de día conserva la sección en el chip y en la URL. En Red no hay peticiones de documento ni RSC al filtrar.

### H2.3 Filtro por sección
- **Fila 2 de `BarraFiltros`:** chips con "Todas" más las 4 secciones por su **nombre completo** (no se inventan abreviaturas), cada una con `PuntoSeccion`. Son `<button aria-pressed>` de 44px de alto. En <1024 van en una fila con `overflow-x: auto`, `scroll-snap-type: x proximity`, sin barra visible y con degradado de 24px en el borde derecho para indicar que hay más. En ≥1024 van en una fila que envuelve. Activo: borde 2px `var(--sec)` y fondo `var(--sec)` al 18%.
- Se combina con el día (`filtrarFunciones` aplica ambos).
- **`SinResultados`**. Props `{ filtros; alLimpiar }`. Texto "No hay funciones de {Bruma Nocturna} el {jueves 15}." (se omite la parte nula) y botón "Ver todo el programa", que limpia ambos filtros. Prueba manual: forzarlo en desarrollo pasando un filtro que no calce; hoy ninguna combinación está vacía.
- **Verificación:** `/programa?dia=viernes&seccion=nocturna` muestra exactamente f19, f21 y f22. Copiar esa URL en otra pestaña da el mismo resultado. `/programa?dia=domingo&seccion=xyz` muestra las 39 y la URL queda `/programa`. Desde portada, "Bruma Nocturna" llega filtrado.

### H2.4 Se usa bien en el celular (y aprovecha escritorio)
- **Móvil (<1024):** `ListaPrograma` como se describió. Lo primero que se lee en cada tarjeta es la hora (talón, 30px) y la sala (primera línea del cuerpo). Las simultáneas se perciben por la franja horaria compartida y por `ReglaDelDia`. Ejemplo jueves: bajo "19 h" f05; bajo "20 h" f06 y f07 con segmentos que se pisan con el de f05.
- **Escritorio (≥1024): `GrillaPrograma`.** Props `{ funciones: Funcion[]; diasVisibles: DiaFestival[]; interactiva }`. Un bloque por día visible (con "Todos" se apilan los tres, cada uno con su `h2`):
  - **Encabezado sticky** (bajo la barra de filtros): columna de eje de 64px vacía más 4 columnas, una por sala en el orden del JSON, con glifo, nombre (2 líneas máx.) y dirección 14px `--bruma-tenue`.
  - **Cuerpo:** contenedor relativo de alto `(ejeFin - ejeInicio) * 2px` (2px por minuto: jueves 1080px, sábado 1680px). Fondo con líneas horizontales cada hora (`--linea` al 50%) y cada 30 min (al 20%), con etiquetas de hora en el eje ("16:00", …, "00:00", "01:00"). A partir de las 00:00 el fondo del eje se oscurece un paso y la etiqueta "00:00" lleva debajo "día siguiente".
  - **Cada función:** `TarjetaFuncion variante="grilla"` con `position: absolute`, `top = (inicioMin - ejeInicio) * 2px`, `height = duracionMin * 2px` (mínimo 126px), columna según el índice de la sala (`left: calc(64px + idx * (100% - 64px) / 4)`, ancho de columna menos 8px). Van por variables CSS en línea.
  - **Conversatorio:** bloque contiguo debajo, alto `conversatorioMin * 2px`, rayado `var(--sec)` al 35%, rótulo "Conversatorio" si mide ≥ 40px.
  - **Orden del DOM:** cronológico, no por columna, para teclado y lectores de pantalla.
  - **Contenido de la variante `grilla`:** hora "19:30 – 21:08" (Big Shoulders 18px, "+1" si aplica), título (Fraunces 16px, `line-clamp: 3`), sección (punto y nombre en 13px con `line-clamp: 1`), "1 h 38 min · +14" 13px, chips reducidos a íconos de 18px con texto visualmente oculto y `title`, y `BotonItinerario variante="compacto"` (36×36, esquina superior derecha). `PistaFuncion` en una línea de 13px si el alto ≥ 170px; si no, solo el ícono del aviso con texto oculto. El texto completo llega igual por la notificación al marcar (H4.7).
  - La marca de la película en grilla se omite para priorizar el texto; la sección se ve por el borde izquierdo de 4px `var(--sec)`.
  - Filtro de sección en grilla: las funciones que no calzan no se renderizan y dejan el hueco (los conteos siguen cumpliendo CA2).
- **Entre 640 y 1023:** `ListaPrograma` centrada a 760px de máximo; la marca pasa a 64×85.
- **Verificación:**
  1. A 360 px, sábado: leer f33 "19:00", "Terraza Faro" y "Al aire libre" sin hacer zoom.
  2. A 1280 px, jueves: f05 (Teatro 19:30–21:08), f06 (Galpón 20:00) y f07 (Terraza 20:15) se ven en columnas distintas, superpuestas en altura.
  3. Viernes: f21 en Terraza baja más allá de "00:00"; f22 en Galpón empieza a las 23:30 al lado.
  4. A 1024 px no hay scroll horizontal.
  5. Con Tab en la grilla, el foco avanza cronológicamente.

### H2.5 Marca visual de cada película

**Archivos:** `lib/marca.ts` (puro) y `components/marcas/MarcaPelicula.tsx` (sin estado, apto para server y client).

**Determinismo:**
- `hash32(texto)`: FNV-1a de 32 bits (base 2166136261, primo 16777619, `Math.imul`, `>>> 0`) sobre `pelicula.id`.
- `azar(semilla)`: mulberry32, que devuelve una función `() => número en [0, 1)`.
- `generarMarca(pelicula): Marca` consume el generador **en un orden fijo documentado** y devuelve una estructura de primitivas ya calculadas (`{ viewBox: '0 0 120 160', fondo: {…}, horizonteY, formas: Forma[] }`, donde `Forma` es la unión `{tipo:'rect'|'circle'|'ellipse'|'path'|'line'|'polyline', atributos}`). Todo número se redondea a 1 decimal antes de convertirlo a texto, para un SVG compacto e idéntico en servidor y cliente.
- Nunca se usa `Math.random`, la fecha actual ni el índice del array.

**Composición común** (viewBox 120×160, proporción de afiche 3:4):
1. Fondo: rect completo `hsl(H, 32%, 13%)` más un segundo rect desde `horizonteY` `hsl(H, 40%, 20%)`, sin gradientes.
2. `H` = tono base de la sección + desvío `(r·30 − 15)`. Tonos base: competencia 330, panorama 165, nocturna 262, costa 208. Trazos principales `hsl(H, 70%, 74%)`.
3. `horizonteY` = 70 + r·40 (entre 70 y 110). Línea de horizonte de 1px `hsl(H, 30%, 60%)` al 60%. Es el hilo común a todas las marcas.
4. Niebla: 2–3 elipses `rx` 30–60, `ry` 6–12, color `#E8EEF0` con opacidad .06–.16, posiciones al azar cerca del horizonte.
5. Motivo por sección, que es lo que hace reconocible la sección de un vistazo:
   - **Competencia, "Hora azul":** disco (sol o luna) de r 9–20 en x 20–100, y 18–(horizonteY − 14), relleno `#F4C15D` a opacidad .85–1. Bajo el horizonte, 4–7 olas sinusoidales (amplitud 1.5–6, longitud 16–40, fase al azar, trazo 1.5–2.5px, opacidad decreciente hacia abajo) y el reflejo del disco como 3–5 guiones horizontales bajo su x.
   - **Panorama, "Rumbo":** centro (cx 25–95, cy 30–(horizonteY + 20)); 3–6 circunferencias concéntricas con paso de radio 9–16, cada una con `stroke-dasharray` al azar entre continuo, "4 3" o "1 4"; una recta de meridiano que cruza el centro con ángulo 20°–160°; un punto relleno r 2.5 sobre una de las circunferencias.
   - **Nocturna, "Dientes":** polilínea de sierra sobre el horizonte con 7–14 dientes de alto 6–26 (alterna altos y bajos), trazo 2px, y relleno del área bajo la sierra en `hsl(H, 35%, 9%)`. Sobre ella, 1–2 puntos de luz r 1.5–3 en `#FF7B6B` o `#E8EEF0`. Niebla más densa: 3 elipses con opacidad hasta .22.
   - **Costa, "Red":** retícula deformada sobre el mar: 5–9 líneas verticales y 5–8 horizontales entre `horizonteY` y 150, cada una desplazada con una sinusoide de amplitud 1–4. Nudos (círculos r 1.6) en ~30% de las intersecciones, elegidas con el generador. Arriba, una fila de 2–4 postes cortos (pilotes) sobre el horizonte.
6. Marco interior: rect inset 5 sin relleno, trazo `hsl(H, 30%, 60%)` al 25%.
- **Sin** `<defs>`, gradientes, filtros ni `id`. Una misma película aparece dos veces en el programa y los ids duplicados dentro de SVG ocultos por filtros pueden dejar de pintar en algunos navegadores.
- Sin texto, números ni letras dentro de la marca.

**`MarcaPelicula`**. Props `{ pelicula: Pelicula; tamano: 'mini' | 'tarjeta' | 'protagonista'; className?: string }`. Tamaños: mini 28×37, tarjeta 48×64, protagonista `width: 100%` con `max-width: 420px` y `aspect-ratio: 3 / 4`. Siempre `aria-hidden="true"`, porque el título está al lado. En `mini` se omiten niebla y marco (menos nodos). `shape-rendering: geometricPrecision`.

**Verificación:**
1. Abrir `/peliculas/las-cintas-del-faro` y `/programa?dia=sabado` y comparar la marca de f39 con la de la ficha: idénticas.
2. Recargar 3 veces: no cambian.
3. Mirar juntas las 5 marcas de "Bruma Nocturna" en la portada: todas tienen sierra y cada una se distingue por tono, dientes y luces.
4. Las 4 secciones son reconocibles por su motivo.
5. En consola, `document.querySelectorAll('svg [id]')` fuera de la portada devuelve 0.
6. Consola sin errores de hidratación.

---

## 7. Épica 3: ficha de película (`/peliculas/[id]`)

### H3.1 Datos de la película
- **`app/peliculas/[id]/page.tsx`** (server):
  - `export const dynamicParams = false`;
  - `generateStaticParams()` devuelve `peliculas.map(p => ({ id: p.id }))`;
  - `generateMetadata({ params })` hace `await params` y devuelve `{ title: pelicula.titulo, description: pelicula.sinopsis }`;
  - `export default async function` con `props: PageProps<'/peliculas/[id]'>`: `const { id } = await props.params`; si `peliculaPorId.get(id)` no existe, llama a `notFound()`.
- **Diseño:**
  - móvil: marca protagonista (ancho completo hasta 420px, centrada), luego texto;
  - ≥1024: grid 5/12 + 7/12, con la marca `position: sticky; top: var(--e-6)` a la izquierda.
  - Fondo de la parte superior: franja a ancho completo con `color-mix(var(--sec) 10%, var(--noche))` de 240px de alto detrás de la marca.
- **`FichaDatos`** (server). Props `{ pelicula: Pelicula }`:
  - rótulo con `PuntoSeccion` + nombre de sección enlazado a `/programa?seccion={id}`;
  - `h1` con el título;
  - si existe `tituloOriginal`: línea en Fraunces itálica 20px `--bruma-tenue` con "Título original: " + valor. Si no existe, no se renderiza la línea;
  - `Etiqueta estreno` con `ETIQUETA_ESTRENO`;
  - `<dl>` en grid de 2 columnas (≥640) o 1 (móvil) con Dirección (tal cual; "Varios directores" y "Colectivo Neblina" sin procesar), País (tal cual, "Chile, Francia"), Año, Duración (`formatoDuracion`), Clasificación (`ETIQUETA_CLASIFICACION`) y Sección;
  - sinopsis en `<p>` con estilo de sinopsis, máx. `--ancho-lectura`.
- **Verificación:**
  - `/peliculas/transbordador-de-invierno`: "Título original: Vinterferja", "1 h 41 min", "Todo espectador", "Estreno latinoamericano", "Noruega".
  - `/peliculas/sal-de-roca`: sin línea de título original ni hueco, "1 h 52 min".
  - `/peliculas/cortos-oficios-del-mar`: "Varios directores".
  - `/peliculas/cordillera-de-papel`: "Chile, Francia".
  - `/peliculas/ostrava-blues`: "Tomáš Vrba" con la š bien renderizada en Plex Sans (confirma `latin-ext`).

### H3.2 Funciones de la película
- **`FuncionesDePelicula`** (client). Props `{ peliculaId: string }`; obtiene `funcionesDePelicula(id)` (orden cronológico). `h2` "Funciones" y una `FilaFuncionFicha` por función.
- **`FilaFuncionFicha`** (client). Props `{ funcion: Funcion }`. Boleto horizontal (en móvil se apila):
  - día y hora: rótulo "Sábado 17" y hora "23:45 – 01:07"; si `terminaDiaSiguiente`, debajo "Termina a la 01:07 del domingo 18" (`etiquetaFin 'largo'`), que usa "a la" para 01:xx y "a las" en el resto;
  - sala: glifo, nombre y dirección;
  - precio: "$4.000" o "Gratis";
  - chips: agotada, aire libre y conversatorio ("Conversatorio después: 30 min, hasta las 19:38");
  - nota de función;
  - si `agotada`: bloque de aviso con borde `--choque`: "Agotada. " + `entradas.venta`. Se ve igual que las demás, no se atenúa, y se puede marcar;
  - si `aireLibre`: `sala.nota` tal cual;
  - `BotonItinerario variante="completo"` y `PistaFuncion`.
- **Misma película en otra función** (CA3): `PistaFuncion` incluye, cuando la función **no** está marcada y otra función de la misma película sí lo está, el texto "Ya tienes esta película el viernes 16 a las 18:00". Es informativo (color `--conversatorio`) y no bloquea. Si ambas están marcadas, cada una muestra "También la tienes el …".
- **Verificación:**
  - `/peliculas/las-cintas-del-faro`: f21 (Viernes 16, 23:00 – 00:22, Terraza Faro, Gratis, nota de lluvia) y f39 (Sábado 17, 23:45 – 01:07, "Termina a la 01:07 del domingo 18", Galpón 7, $4.000).
  - `/peliculas/la-hora-azul-del-puerto`: f05 con nota inaugural; f31 "Agotada" más la frase de boletería y "Conversatorio después: 30 min, hasta las 19:38".
  - Marcar f31: el botón queda "En mi itinerario".
  - En `/peliculas/sal-de-roca`, marcar f13: f32 muestra "Ya tienes esta película el viernes 16 a las 18:00".

### H3.3 Navegación desde la ficha
- **`VolverAlPrograma`** (client), al inicio de la ficha: `<Link>` con `IconoFlechaIzq` y "Volver al programa". El `href` inicial (servidor e hidratación) es `/programa`. En `useEffect` lee `sessionStorage['festival-niebla:programa-query']` y, si existe y pasa `leerFiltros` sin inválidos, cambia el `href` a `/programa?...`. El texto no cambia, así no hay salto visible.
- Al final de la ficha: enlace "Ver mi itinerario" (`/itinerario`). La navegación global también está disponible.
- Generación estática: el build lista `/peliculas/[id]` con 24 rutas ●.
- **Verificación:** filtrar Viernes + Bruma Nocturna, abrir f21 y usar "Volver al programa": vuelve con los dos filtros. Abrir una ficha directamente en una pestaña nueva: "Volver al programa" va a `/programa`. En la salida de `npm run build` aparecen las 24 rutas.

---

## 8. Épica 4: Mi itinerario

### 8.1 Tipos del itinerario (`lib/tipos.ts`)
- `EstadoTramo = 'choque' | 'traslado' | 'conversatorio' | 'holgura'`
- `Tramo { desde: Funcion; hacia: Funcion; estado: EstadoTramo; mismoDia: boolean; trasladoMin: number; salidaMin: number /* = desde.finMin */; llegadaMin: number /* finMin + traslado */; atrasoMin: number /* max(0, llegada − hacia.inicio) */; disponibleMin: number /* hacia.inicio − (finConversatorio ?? fin), puede ser negativo */; sobraMin: number /* disponible − traslado */; conversatorioVistoMin: number | null; salidaMaximaMin: number /* hacia.inicio − traslado */ }`
- `Choque { a: Funcion; b: Funcion; solapeMin: number /* min(a.fin, b.fin) − b.inicio */ }` (con `a.inicioMin <= b.inicioMin`)
- `EstadoFuncionItinerario { choquesCon: Funcion[]; llegaTardeDesde: Tramo | null; noAlcanzaA: Tramo | null; pierdeConversatorioPor: Tramo | null; mismaPeliculaEn: Funcion[] }`
- `AnalisisItinerario { funciones: Funcion[] /* válidas, únicas, ordenadas */; porDia: { dia: DiaFestival; funciones: Funcion[]; tramos: Tramo[]; resumen: ResumenDia }[]; choques: Choque[]; tramos: Tramo[]; estadoPorId: Map<FuncionId, EstadoFuncionItinerario>; idsInvalidos: string[] }`
- `ResumenDia { cantidad: number; primeraInicioMin: number; ultimaFinMin: number /* max(finConversatorio ?? fin) */; terminaDiaSiguiente: boolean }`
- `AvisoCandidata { tipo: 'choque' | 'traslado' | 'conversatorio' | 'mismaPelicula'; texto: string; otra: Funcion }`
- `EstadoItinerario` (almacén): `{ ids: FuncionId[]; listo: boolean; persistente: boolean }`

### H4.1 Marcar y quitar funciones

**`BotonItinerario`** (client). Props `{ funcionId: FuncionId; variante: 'completo' | 'compacto' }`. Usa `useItinerario()`.

| Estado | Condición | `completo` (≥44px alto, ancho mínimo 168px) | `compacto` (36×36, solo escritorio) |
|---|---|---|---|
| `pendiente` | `!listo` | borde `--linea`, texto "Itinerario", `aria-disabled="true"`, opacidad .7 | ícono + con opacidad .5 |
| fuera | `listo && !tiene` | borde `--bruma`, `IconoAgregar` + "Agregar" | ícono + |
| dentro | `listo && tiene` | fondo `--faro`, texto `--sobre-faro`, `IconoMarcada` + "En mi itinerario" | fondo `--faro`, ícono de visto |

- `aria-pressed={tiene}`. `aria-label`: "Agregar {título}, {día} a las {hora}, a mi itinerario" / "Quitar {título}, {día} a las {hora}, de mi itinerario".
- Al pulsar llama a `alternar(id)` y a `anunciar(...)`:
  - al agregar: "Agregaste {título}, {día} a las {hora}." más, si hay, los textos de `evaluarCandidata` calculados **antes** de agregar (por ejemplo, "Se topa con La hora azul del puerto, 19:30.");
  - al quitar: "Quitaste {título}." con acción "Deshacer", que vuelve a agregarla.
- Animación al agregar: el trazo del visto se dibuja con `stroke-dashoffset` en 200ms y la tarjeta hace `encender` (sección 6).
- Ancho fijo por variante: el cambio de texto no mueve el layout.

**`MiItinerario`** (client, en `app/itinerario/page.tsx`). El shell server pone `h1` "Mi itinerario" y la metadata.
- `!listo`: esqueleto con el alto aproximado (3 bloques `--noche-2`), sin textos que después cambien.
- `listo && ids.length === 0`: **estado vacío**:
  - dibujo estático de tres `GlifoSala` unidos por líneas punteadas;
  - texto: "Todavía no marcas funciones. En el programa o en la ficha de cada película toca «Agregar» y aquí se arma tu recorrido: a qué hora sales de cada sala y cuánto caminas hasta la siguiente.";
  - botón principal "Ir al programa".
- Con funciones: `<VistaItinerario analisis={analizarItinerario(ids)} modo="propio" />` más `AccionesItinerario`.
- Si `!persistente`: línea discreta arriba, 15px `--bruma-tenue` con `IconoNota`: "Tu navegador no permite guardar datos: este itinerario se perderá al cerrar la pestaña. Usa «Compartir» para guardarte el link."

**`VistaItinerario`** (client). Props `{ analisis: AnalisisItinerario; modo: 'propio' | 'compartido' }`:
- Por día: `h2` con `dia.etiqueta`, `ResumenDia` y una lista `<ol>` que alterna `ParadaItinerario` y `TramoItinerario` (el tramo va dentro del `<li>` de la parada de origen, para mantener la lista semántica).
- Choques no consecutivos (por ejemplo, A choca con C y B está entremedio): aparecen en el `EstadoFuncionItinerario` de ambas paradas (H4.2 CA5).

**`ParadaItinerario`**. Props `{ funcion: Funcion; estado: EstadoFuncionItinerario; modo }` (diseño en H4.7). En `modo="propio"`, botón "Quitar" (`IconoQuitar`, 44×44, `aria-label` "Quitar {título} de mi itinerario") que anuncia con "Deshacer". En `compartido` no hay botón.

**`TramoItinerario`**. Props `{ tramo: Tramo }`. Solo se renderiza si `tramo.mismoDia` o `tramo.estado !== 'holgura'`. Textos en la tabla de 8.9.

**Vaciar (CA4):** en `AccionesItinerario`, botón secundario "Vaciar itinerario". Al pulsarlo se reemplaza en el mismo lugar por "¿Vaciar las {n} funciones?" con "Sí, vaciar" (borde `--choque`) y "Cancelar". Si no se confirma en 6 s, vuelve al estado inicial. Tras vaciar, anuncio "Vaciaste tu itinerario." con "Deshacer", que restaura los ids previos. Doble resguardo: confirmación y deshacer.

**Duplicados (CA5):** `agregar` es idempotente, porque el almacén usa un conjunto.

**Verificación:**
1. Agregar f05 y f07 desde el programa y f06 desde la ficha de Vidrio.
2. En `/itinerario`, jueves: 3 paradas en orden 19:30, 20:00, 20:15.
3. Quitar f06: siguen f05 y f07; "Deshacer" la devuelve.
4. "Vaciar", "Sí, vaciar", "Deshacer": vuelven las tres.
5. Duplicados: en consola, `localStorage.setItem('festival-niebla:itinerario:v1', '{"v":1,"ids":["f05","f05"]}')` y recargar: f05 aparece una vez y el contador dice 1. Luego abrir `/itinerario/compartido?f=f05-f05` y "Sumar": no se duplica.
6. Vacío: el texto explicativo y el botón al programa son visibles.

### 8.2 Reglas (`lib/itinerario/reglas.ts`, puro, sin DOM)

**`normalizarIds(ids: readonly string[]): { validos: Funcion[]; invalidos: string[] }`**
- pasa a minúsculas y hace `trim`;
- descarta vacíos;
- separa los inexistentes en `funcionPorId`;
- deduplica conservando el primero;
- ordena por `inicioMin` y luego `id`.

**`analizarItinerario(ids): AnalisisItinerario`**

1. `s = normalizarIds(ids).validos`.
2. **Choques**, todos los pares `i < j` sobre `s` (ya ordenados, así que `s[i].inicioMin <= s[j].inicioMin`): hay choque si y solo si `s[i].finMin > s[j].inicioMin`.
   - `fin == inicio` **no** es choque (desigualdad estricta).
   - Mismo inicio: siempre choque, porque la duración es > 0.
   - El conversatorio **no** entra: se usa `finMin`, nunca `finConversatorioMin`.
   - Medianoche: se comparan minutos absolutos, así que f21 (fin 00:22 del 17) contra f22 (23:30 del 16) da choque.
3. **Tramos**, solo entre consecutivas `k` y `k+1` de `s` en orden global (H4.3 CA5). Para cada par `A = s[k]`, `B = s[k+1]`, con `t = traslado(A.salaId, B.salaId)`:
   1. si `A.finMin > B.inicioMin`, estado `'choque'`;
   2. si no, `llegada = A.finMin + t`; si `llegada > B.inicioMin`, estado `'traslado'` con `atraso = llegada − B.inicioMin`. `llegada == inicio` **sí** alcanza;
   3. si no, y `A.conversatorioMin`: `finConv = A.finMin + A.conversatorioMin`; si `finConv + t > B.inicioMin`, estado `'conversatorio'` con `conversatorioVistoMin = max(0, min(A.conversatorioMin, B.inicioMin − t − A.finMin))`;
   4. si no, estado `'holgura'`.
   - `mismoDia = A.dia.fecha === B.dia.fecha`.
   - La precedencia **choque > traslado > conversatorio** garantiza H4.3 CA4 y H4.4 CA3: nunca hay dos avisos para el mismo par.
4. **Estado por función:**
   - `choquesCon`: todas las otras del paso 2;
   - `noAlcanzaA`: tramo saliente con estado `traslado`; `llegaTardeDesde`: tramo entrante con estado `traslado`. Así ambas funciones del par muestran el aviso (H4.3 CA1);
   - `pierdeConversatorioPor`: tramo saliente con estado `conversatorio`. Solo se muestra en A;
   - `mismaPeliculaEn`: otras funciones de `s` con el mismo `peliculaId`.
5. **`porDia`**: agrupa por `dia.fecha` en el orden de `dias`; el resumen usa `ultimaFinMin = max(finConversatorioMin ?? finMin)`.

**Complejidad:** a lo más 39 funciones y 741 pares. Se recalcula en cada render con `useMemo` sobre `ids`.

**`evaluarCandidata(ids, candidataId): AvisoCandidata[]`** (para H4.2 CA6 y H4.7 CA2):
- si `candidataId` ya está en `ids`, se analiza `ids` tal cual; si no, `ids ∪ {candidata}`;
- se devuelven solo los avisos que involucran a la candidata, en este orden: choques (todos), traslado saliente o entrante, conversatorio (saliente de la candidata, o de su predecesora hacia ella, con texto adaptado) y misma película;
- insertar una candidata puede partir un tramo existente; eso se refleja solo en el itinerario, no en la pista.

**Casos borde obligatorios** (test manual o, si Sonnet agrega un script sin dependencias, con aserciones):

| Ids | Resultado esperado |
|---|---|
| f05, f06 | choque f05–f06 (solape 68 min); tramo `choque` |
| f06, f05 (desordenados) | igual que el anterior |
| f08, f10 | tramo `traslado`, llegada 22:42, atraso 12 |
| f07, f09 | tramo `traslado`, llegada 22:16, atraso 1 |
| f03, f05 | tramo `traslado`, llegada 19:32, atraso 2; **sin** aviso de conversatorio |
| f13, f16 | tramo `conversatorio`, llegada 20:04, visto 1 de 25, salida máxima 19:53 |
| f13, f18 | tramo `holgura`, disponible 13 (20:17 → 20:30), traslado 0 |
| f31, f34 | tramo `conversatorio`, visto 14 de 30, salida máxima 19:22 |
| f25, f28 | tramo `holgura`, disponible 7, traslado 0; ningún aviso |
| f25, f27 | tramo `traslado`, atraso 1; sin aviso de conversatorio |
| f14, f16 | tramo `holgura`, disponible 0, traslado 0, fin == inicio; ningún aviso |
| f21, f22 | choque a través de medianoche |
| f09, f10 | choque a través de medianoche |
| f05, f06, f07 | 3 choques; tramos f05→f06 y f06→f07 `choque`; f05 muestra "Se topa con" f06 y f07 |
| f10, f11 | tramo entre días (`mismoDia=false`, holgura); no se dibuja |
| "f99", "F05", "f05" | válidos [f05], inválidos ["f99"] |
| [] | análisis vacío, sin errores |
| las 39 | sin errores; muchos choques; render fluido |

### H4.2 Aviso de choque
- **Textos** (`lib/itinerario/mensajes.ts`):
  - en la parada: "Se topa con {título B}: {hora inicio B} – {hora fin B}, {sala B}.", uno por cada choque;
  - en el tramo de choque: "Estas dos funciones se topan: {título A} termina a las {fin A} y {título B} empieza a las {inicio B}.";
  - pista y anuncio al marcar: "Se topa con {título}, {hora inicio}.".
- **Visual:** la parada con choque lleva borde izquierdo de 4px sólido `--choque`. El bloque de aviso tiene fondo `--choque` al 14%, `IconoChoque` y texto. El tramo `choque` no dibuja la línea de caminata: la línea del recorrido se corta con un zigzag SVG de 16px `--choque` y el texto al lado.
- **Verificación:** f05 + f06; f21 + f22; f09 + f10; f05 + f06 + f07 (cada parada nombra a las otras dos, f06 a f05 y f07). f14 + f16 sin choque. f25 + f28 sin choque. Con f05 marcada, la tarjeta de f06 en el programa muestra "Se topa con La hora azul del puerto, 19:30" antes de agregarla.

### H4.3 Aviso de traslado
- **Textos:**
  - en A (`noAlcanzaA`): "No alcanzas a llegar a {título B}: sales a las {fin A} y son {t} min caminando a {sala B}. Llegarías {llegada}, {atraso} {minuto|minutos} tarde.";
  - en B (`llegaTardeDesde`): "Llegarías {atraso} {minuto|minutos} tarde desde {título A}.";
  - en el tramo: "No alcanzas: {t} min caminando a {sala B}. Llegarías {llegada}, {atraso} {minuto|minutos} tarde.";
  - pista y anuncio: "No alcanzas a llegar desde {título A}: {atraso} {minuto|minutos} tarde." o "No alcanzas a llegar a {título B}: {atraso} {minuto|minutos} tarde.", según el lado.
- **Holgura** (CA3, informativo, color `--holgura`, sin ícono de alerta; usa `IconoCaminar`):
  - `t > 0` y `sobra > 0`: "Tienes {disponible} min; son {t} caminando a {sala B}." Si A tiene conversatorio y lo ve completo, se agrega " (después del conversatorio)";
  - `t > 0` y `sobra == 0`: "Llegas justo: {t} min caminando a {sala B}, sin margen.";
  - `t == 0` y `disponible > 0`: "Te quedas en {sala}: {disponible} min hasta la siguiente.";
  - `t == 0` y `disponible == 0`: "Te quedas en {sala}: la siguiente empieza apenas termina, a las {hora}.";
  - `disponible` puede ser menor que `t` solo en estado `conversatorio`, que tiene su propio texto.
- **Visual:** parada con borde izquierdo de 4px **discontinuo** `--traslado`; tramo con línea de caminata en `--traslado` y `IconoCaminar`.
- **Verificación:** f08 + f10 muestra "Llegarías 22:42, 12 minutos tarde". f07 + f09 muestra "Llegarías 22:16, 1 minuto tarde" (singular). f03 + f05 muestra "Llegarías 19:32, 2 minutos tarde" y ningún texto de conversatorio. f14 + f16 muestra "Te quedas en Cine Arte El Muelle: la siguiente empieza apenas termina, a las 20:05." y ningún aviso. f25 + f27 muestra 1 minuto tarde. Con f05 + f06 + f08 (tramo f06→f08 choque, porque f06 termina 22:01 > 21:00) no aparece aviso de traslado para ese par.

### H4.4 Aviso de conversatorio
- **Textos** (tono informativo, color `--conversatorio`, `IconoConversatorio`):
  - visto == 0: "Si vas a {título B} te pierdes el conversatorio.";
  - visto > 0: "Si vas a {título B} te pierdes parte del conversatorio: alcanzas {visto} de {total} min y sales a las {salida máxima}.";
  - tramo: "Sales durante el conversatorio: {t} min caminando a {sala B}.";
  - pista en B antes de marcarla: "Te perderías el conversatorio de {título A}.".
- **Visual:** parada A con borde izquierdo punteado `--conversatorio`; el tramo usa línea punteada azul.
- **CA4:** toda parada con conversatorio muestra "Termina {fin} · conversatorio hasta las {finConv}" (con "+1" si cruza medianoche; no ocurre en los datos, pero está contemplado).
- Última función del día con conversatorio: sin aviso (no hay tramo saliente del mismo día).
- **Verificación:** f13 + f16 muestra "Si vas a Cortos II: Noches de puerto te pierdes parte del conversatorio: alcanzas 1 de 25 min y sales a las 19:53." f31 + f34 muestra "alcanzas 14 de 30 min y sales a las 19:22". f13 + f18 no muestra aviso y el tramo dice "Te quedas en Teatro Municipal de Puerto Bruma: 13 min hasta la siguiente." f25 + f28 no muestra aviso ("7 min"). f03 + f05 muestra traslado y no conversatorio (sección 0).

### H4.5 Persistencia en el navegador
- **`lib/itinerario/almacen.ts`**: almacén externo de módulo, sin React.
  - Clave `festival-niebla:itinerario:v1`. Valor JSON `{"v":1,"ids":["f05","f06"]}`, con ids en orden canónico.
  - **Lectura** (primera vez que se pide un snapshot en cliente): intenta `localStorage.getItem`. `JSON.parse` en try/catch. Acepta el objeto `{v:1, ids}` o un array plano de strings (tolerancia). Cualquier otra forma se trata como vacío. Pasa por `normalizarIds`; si hubo inválidos, reescribe la versión limpia (CA4).
  - **Disponibilidad:** al iniciar se prueba `setItem`/`removeItem` de `festival-niebla:prueba` en try/catch. Si falla, `persistente = false` y todo funciona en memoria.
  - **Mutaciones:** `agregar(id)`, `quitar(id)`, `alternar(id)`, `reemplazar(ids)`, `sumar(ids)` y `vaciar()`, que devuelve los ids previos. Cada una normaliza, crea un **nuevo array congelado** (solo si cambió), escribe en `localStorage` en try/catch (un `QuotaExceededError` pone `persistente = false`) y notifica a los suscriptores.
  - **Sincronización entre pestañas:** listener de `storage` para la clave; relee y notifica.
  - API para React: `suscribir(fn)`, `obtenerSnapshot(): EstadoItinerario` (devuelve **la misma referencia** mientras no cambie, requisito de `useSyncExternalStore`) y `obtenerSnapshotServidor()`, que devuelve una constante `{ ids: [], listo: false, persistente: true }` definida una sola vez.
- **`lib/itinerario/useItinerario.ts`** (client): `useSyncExternalStore(suscribir, obtenerSnapshot, obtenerSnapshotServidor)` más acciones y `tiene(id)`. En hidratación React usa el snapshot de servidor (`listo: false`) y enseguida el del cliente, sin error de hidratación.
- **Anti-salto (CA5):** todo lo que depende del itinerario renderiza un estado neutro de dimensiones fijas mientras `listo === false` (contador oculto, botones `pendiente`, esqueleto en `/itinerario`). Nunca se muestra "0" ni "Agregar" provisorios que después cambien.
- **Sin cookies ni red:** buscar `document.cookie` y `fetch(` en el código: 0 resultados.
- **Aviso de no persistencia:** además de la línea en `/itinerario`, la primera vez que se agrega una función con `!persistente` el anuncio agrega: "Ojo: tu navegador no guarda datos, se perderá al cerrar."
- **Verificación:**
  1. Agregar f05 y f08, recargar: siguen.
  2. Cerrar la pestaña y abrir `/itinerario`: siguen.
  3. En otra pestaña con `/programa` abierto, agregar f10 en la primera: el contador de la segunda se actualiza.
  4. En consola, `localStorage.setItem('festival-niebla:itinerario:v1', '{"v":1,"ids":["f05","zz","f05"]}')` y recargar: aparece solo f05 y el valor guardado queda `["f05"]`.
  5. `localStorage.setItem(clave, 'basura')` y recargar: itinerario vacío sin errores.
  6. Bloquear datos del sitio (Chrome → Configuración → Privacidad → Configuración de sitios → Datos de sitios → "No permitir que los sitios guarden datos" para `localhost:3000`): agregar funciona, aparece el aviso discreto y al recargar se pierde.
  7. Performance con recarga en `/programa` con 5 guardadas: ningún fotograma muestra "Agregar" en una función marcada ni "0" en el contador.

### H4.6 Compartir con un link
- **Formato** (`lib/itinerario/enlace.ts`, puro):
  - Ruta `/itinerario/compartido?f=f05-f06-f10`: ids canónicos (orden por inicio) unidos por `-`. Seguro en URL y en apps de mensajería (no termina en puntuación). 39 funciones ocupan 155 caracteres.
  - `crearEnlace(ids, origen)` devuelve `${origen}/itinerario/compartido?f=...`, con `origen = window.location.origin` al momento de compartir.
  - `leerEnlace(valor: string | null): { validos: Funcion[]; invalidos: string[]; estado: 'vacio' | 'invalido' | 'parcial' | 'ok' }`:
    - si `valor` es nulo o solo espacios, `vacio`;
    - si mide más de 1000 caracteres, se recorta a los primeros 1000;
    - se separa por `-`, `,`, `.`, `+` o espacios (tolerancia) y se toman como máximo 100 tokens;
    - se normaliza con `normalizarIds`;
    - `invalido` si no quedan válidos; `parcial` si hay de ambos.
- **`AccionesItinerario`** (client, en `modo="propio"`, con ≥1 función). Panel sticky a la derecha en ≥1024, bloque bajo el `h1` en móvil:
  - **"Compartir"** (principal):
    - si `typeof navigator.share === 'function'` y `matchMedia('(pointer: coarse)').matches`, llama a `navigator.share({ title: 'Mi itinerario · Festival de Cine Niebla', text: 'Mi recorrido por el Festival de Cine Niebla', url })`. `AbortError` se ignora; cualquier otro error cae al copiado;
    - si no, `navigator.clipboard.writeText(url)` y anuncio "Link copiado. Quien lo abra verá tu itinerario.";
    - si el portapapeles no está disponible o falla (http sin contexto seguro), se muestra un `<input readonly>` con el link seleccionado y el texto "Copia este link:".
  - **"Copiar link"** (secundario, siempre visible en pantallas táctiles junto a "Compartir"): siempre copia al portapapeles.
  - "Vaciar itinerario" (H4.1).
  - Con 0 funciones, los botones de compartir no se muestran; el estado vacío lo explica.
- **`app/itinerario/compartido/page.tsx`** (server): metadata con `robots: { index: false }`, `h1` "Itinerario compartido" y `<Suspense fallback={<p>Cargando itinerario compartido…</p>}><ItinerarioCompartido /></Suspense>`.
- **`ItinerarioCompartido`** (client): `useSearchParams().get('f')` → `leerEnlace`.
  - `vacio`: "Este link no trae funciones." con enlaces "Ver el programa" y "Ir a mi itinerario".
  - `invalido`: "No reconocemos las funciones de este link. Puede estar incompleto o ser de otra edición del festival." con los mismos enlaces.
  - `parcial` u `ok`:
    - franja superior con borde `--conversatorio` y `IconoItinerario`: "Estás viendo un itinerario que te compartieron. Tu itinerario no cambia a menos que lo copies.";
    - si `parcial`, además: "1 función del link no existe y se omitió." o "{n} funciones del link no existen y se omitieron.";
    - `<VistaItinerario analisis={analizarItinerario(ids válidos)} modo="compartido" />`, con los mismos avisos que en el propio (CA2);
    - `CopiarCompartido`.
  - **No** escribe nada en el almacén al abrir (CA3): solo lee `useItinerario()` para comparar.
- **`CopiarCompartido`** (client). Props `{ ids: FuncionId[] }`. Botón principal "Copiar a mi itinerario":
  - `!listo`: botón `pendiente`;
  - propio vacío: `reemplazar(ids)`, anuncio "Listo: ahora es tu itinerario." con "Deshacer" (restaura `[]`) y `router.replace('/itinerario')` (de `next/navigation`);
  - propio no vacío, con `nuevas = ids − propios`:
    - si `nuevas.length === 0`: texto "Ya tienes todas estas funciones en tu itinerario." y botón "Ir a mi itinerario" (`router.replace('/itinerario')`);
    - si no, panel en el mismo lugar (no modal): "Ya tienes {n} {función|funciones} en tu itinerario. ¿Qué hacemos?" con "Sumar {k} {nueva|nuevas} a las mías" (`sumar(ids)`, sin duplicar), "Reemplazar las mías" (`reemplazar(ids)`) y "Cancelar". El foco se mueve al primer botón del panel al abrirlo.
  - Tras sumar o reemplazar: anuncio con "Deshacer" (restaura el array previo) y `router.replace('/itinerario')` (CA5: al recargar no vuelve la vista ajena).
- **Verificación:**
  1. En el itinerario propio con f05, f08 y f10, "Copiar link": se lee `…/itinerario/compartido?f=f05-f08-f10`.
  2. Abrir en una ventana privada (sin datos): banner de itinerario ajeno y aviso "12 minutos tarde" entre f08 y f10.
  3. En esa ventana, "Copiar a mi itinerario": URL `/itinerario`, contador en 3, recargar mantiene 3.
  4. En la ventana normal, con el propio conteniendo f01, abrir un link con `f=f01-f02`: panel "Ya tienes 1 función… Sumar 1 nueva a las mías"; sumar deja 2 (f01 sin duplicar); repetir con "Reemplazar".
  5. Abrir el link compartido en la ventana normal y volver a `/itinerario` sin copiar: el propio no cambió.
  6. `/itinerario/compartido` sin parámetro y `?f=zz-yy` muestran sus mensajes. `?f=f05-zz` muestra f05 y "1 función del link no existe y se omitió."
  7. Generar un link con las 39 (marcar todo con "Todos"): abre y lista las 39.
  8. En un celular real o en DevTools con emulación táctil, "Compartir" abre la hoja del sistema si el navegador la soporta.

### H4.7 Armar el itinerario se siente bien
- **Respuesta inmediata (CA1):** botón con estado instantáneo, `encender` en la tarjeta, `latido` en el contador y anuncio visible.
- **`PistaFuncion`** (client, CA2). Props `{ funcionId: FuncionId }`. Con `listo` y el itinerario no vacío muestra, bajo el botón, **el primer** `AvisoCandidata` de `evaluarCandidata(ids, funcionId)` (prioridad choque > traslado > conversatorio > misma película) y, si hay más, "y {n} más" (lista completa en `title` y texto oculto). Para funciones ya marcadas muestra su estado actual con los mismos textos. Estilo: 15px, ícono de 16px y color del tipo. Si no hay avisos, no ocupa espacio. Se anuncia solo a través del anuncio al marcar, no con `aria-live` propio (serían 39 regiones).
- **El recorrido (CA3 y CA4), diseño de `/itinerario` a 360 px:**
  ```
  JUEVES 15                              3 funciones · 18:00 a 00:13 +1
  ┃
  ◉ 19:30  [glifo] TEATRO MUNICIPAL DE PUERTO BRUMA
  ┃        Plaza Aníbal Pinto 120
  ┃        La hora azul del puerto  ·  termina 21:08
  ┃        [Aviso: Se topa con Vidrio: 20:00 – 22:01, Galpón 7.]
  ┃                                                       [Quitar]
  ╳ (zigzag) Estas dos funciones se topan…
  ◉ 20:00  [glifo] GALPÓN 7
  ┆        Pasaje Los Estibadores 7
  ┆  Sal a las 22:01 · 8 min caminando a Teatro Municipal… · tienes 14 min   ← línea discontinua
  ◉ …
  ```
  - **Riel vertical** a 20px del borde: línea de 2px `--linea` que une las paradas del día. Cada parada es un **nodo** circular de 36px (`--noche-3`, borde 2px `var(--sec)`) con el `GlifoSala` adentro.
  - **Parada** a la derecha del riel:
    - hora de inicio 34px Big Shoulders `--bruma`;
    - sala en rótulo 18px con dirección 16px debajo (grande porque se lee caminando);
    - título Fraunces 20px enlazado a la ficha, con `MarcaPelicula mini` al lado;
    - "termina 21:08" o "termina 00:13 del viernes 16";
    - "conversatorio hasta las 19:44" cuando aplica;
    - chips de agotada y aire libre;
    - avisos;
    - botón Quitar.
  - **Tramo** entre paradas, en el riel:
    - `holgura` con cambio de sala: el riel se vuelve **discontinuo** (pasos) en `--holgura` y en su centro "Sal a las {hora de salida} · {t} min caminando a {sala}" en 16px, con el texto de holgura debajo en 15px;
    - misma sala: riel continuo y el texto correspondiente;
    - `traslado`: riel discontinuo `--traslado` y aviso;
    - `conversatorio`: riel punteado `--conversatorio`;
    - `choque`: zigzag `--choque`.
  - **Salida recomendada:** la "hora de salida" es `finMin`, o `finConversatorioMin` si A tiene conversatorio y el tramo es `holgura` (se ve el conversatorio completo).
- **Escritorio (≥1024):** dos columnas, recorrido 7/12 (máx. 720px) y panel sticky 5/12 con `AccionesItinerario`, los `ResumenDia` y un `MapaPuerto` con `ruta` = salas del día elegido en orden. Si hay más de un día, pestañas "Jue 15 / Vie 16 / Sáb 17" (`<button aria-pressed>`) solo con los días presentes, por defecto el primero. Etiqueta: "Tu caminata del jueves 15".
- **Animaciones (CA5):**
  - parada nueva al volver a la página tras agregar: `aparecer`, opacidad 0 → 1 y `translateY(8px)` → 0 en 220ms (solo las paradas cuyo id no estaba en el render anterior; se compara con un `useRef` de ids previos);
  - tramo recién creado: `trazar`, `scaleY(0)` → 1 desde arriba en 260ms;
  - quitar: sin animación de salida, porque el deshacer cubre el error;
  - todo se apaga con reduced motion.
- **Verificación:** con f01, f03, f06 y f09 (jueves) a 360 px se lee como recorrido sin avisos: "Sal a las 17:23 · 15 min caminando a Galpón 7" (tienes 37 min); "Te quedas en Galpón 7: 16 min hasta la siguiente" (después del conversatorio de f03, que termina 19:44); "Sal a las 22:01 · 8 min caminando a Teatro Municipal de Puerto Bruma" (tienes 14 min). Resumen del día: "4 funciones · de 16:00 a 00:13 del viernes 16". Agregar f05: aparecen los zigzag de choque con f06. Leer la pantalla con el brazo estirado: hora, sala y dirección legibles. En 1280, cambiar de pestaña de día actualiza la ruta del mapa.

### H4.8 Contexto útil (P2)
- **`ResumenDia`**. Props `{ resumen: ResumenDia; dia: DiaFestival }`. "3 funciones · de 18:00 a 00:13 del viernes 16" (usa `ultimaFinMin`, que incluye el conversatorio).
- **Recordatorios en `ParadaItinerario`:** si `aireLibre`, `sala.nota`; si `agotada`, "Agotada. " + `entradas.venta`.
- **Impresión** (`@media print` en `globals.css` y en los módulos del itinerario):
  - fondo blanco, texto `#111` (contraste 18.9);
  - ocultos: `Encabezado`, `NavegacionPrincipal`, `Pie`, `Anunciador`, botones, `MapaPuerto`, marcas y escena;
  - riel en gris, avisos con borde negro y su texto;
  - `break-inside: avoid` por parada; cada día empieza en página nueva salvo el primero;
  - encabezado de impresión solo visible al imprimir: "Mi itinerario · Festival de Cine Niebla · 15, 16 y 17 de octubre de 2026".
- **Verificación:** con f31 aparece el texto de agotada y boletería. Con f07, la nota de lluvia. Ctrl+P en `/itinerario` muestra la vista limpia en blanco y negro sin navegación.

### 8.8 Anuncios (`lib/anuncios.ts` + `components/anuncios/Anunciador.tsx`)
- `lib/anuncios.ts`: emisor de módulo. `anunciar(texto: string, opciones?: { accion?: { etiqueta: string; alHacer: () => void }; duracionMs?: number })` y `suscribirAnuncios(fn)`.
- **`Anunciador`** (client, montado una vez en el layout):
  - región `role="status" aria-live="polite"` visualmente oculta, a la que se copia el texto (para repetir el mismo texto, se vacía y se vuelve a escribir en el siguiente frame);
  - notificación visible: `position: fixed`, centrada abajo, sobre la barra inferior en móvil (`bottom: calc(--alto-nav-movil + 12px)`) y abajo a la derecha en escritorio, máx. 440px, fondo `--noche-3`, borde `--linea`, texto 16px, botón de acción (`--faro`, 44px) y cerrar (`IconoQuitar`, `aria-label` "Cerrar aviso");
  - dura 5 s, 8 s si tiene acción, y se pausa con hover o foco dentro;
  - un anuncio nuevo reemplaza al anterior (no se apilan);
  - entrada con `translateY(12px)` y opacidad en 180ms.

### 8.9 Textos esperados por ejemplo (para revisión)

| Ejemplo | Aviso visible en el itinerario |
|---|---|
| f05 + f06 | f05: "Se topa con Vidrio: 20:00 – 22:01, Galpón 7." · f06: "Se topa con La hora azul del puerto: 19:30 – 21:08, Teatro Municipal de Puerto Bruma." |
| f08 + f10 | f08: "No alcanzas a llegar a La niebla tiene dientes: sales a las 22:27 y son 15 min caminando a Galpón 7. Llegarías 22:42, 12 minutos tarde." · f10: "Llegarías 12 minutos tarde desde Los que cuidan el faro." |
| f07 + f09 | "… sales a las 21:56 y son 20 min caminando a Teatro Municipal de Puerto Bruma. Llegarías 22:16, 1 minuto tarde." |
| f03 + f05 | "… sales a las 19:24 y son 8 min caminando a Teatro Municipal de Puerto Bruma. Llegarías 19:32, 2 minutos tarde." (sin aviso de conversatorio) |
| f13 + f16 | f13: "Si vas a Cortos II: Noches de puerto te pierdes parte del conversatorio: alcanzas 1 de 25 min y sales a las 19:53." |
| f25 + f28 | ningún aviso; tramo: "Te quedas en Teatro Municipal de Puerto Bruma: 7 min hasta la siguiente." |
| f21 + f22 | f21: "Se topa con Marea roja: 23:30 – 01:15 +1, Galpón 7." |
| f14 + f16 | ningún aviso; tramo: "Te quedas en Cine Arte El Muelle: la siguiente empieza apenas termina, a las 20:05." |

---

## 9. Épica 5: entrega y documentación

### H5.1 Documento de entrega
- **`ENTREGA.md`** (raíz) con estas secciones:
  1. Qué se construyó, por página, con sus rutas.
  2. Cómo correrlo: `npm install`, `npm run dev` (http://localhost:3000), `npm run build` y `npm start`.
  3. Decisiones: paleta y fuentes; escena del faro; algoritmo de marcas (FNV-1a + mulberry32, motivo por sección); reglas de choque, traslado y conversatorio con su precedencia; formato `?f=` del link; clave de localStorage; filtros en la URL.
  4. Corrección del ejemplo f03+f05 (sección 0).
  5. Pendientes y limitaciones (por ejemplo, fuentes descargadas en build, compartir nativo según navegador).
- **`README.md`**: reemplazar el de la plantilla por 10–15 líneas sobre el sitio del festival, cómo correrlo y un enlace a `ENTREGA.md`.
- **Verificación:** leer ambos archivos; no quedan menciones de `create-next-app`, Vercel ni Geist.

### H5.2 Verificación manual mínima
La lista de BACKLOG H5.2 aplica con la corrección del punto 6: **f03 + f05 → "no alcanza, 2 minutos tarde"**. Para "llega pero pierde el conversatorio" se usa **f13 + f16**. Se agregan f14 + f16 (sin avisos, fin == inicio) y f05 + f06 + f07 (tres choques).

---

## 10. Orden de implementación sugerido

1. **Limpieza y base:** borrar restos de la plantilla, `globals.css` con tokens, reset, foco, reduced motion e impresión; `app/layout.tsx` con fuentes y metadata; `app/icon.svg`. Correr `npm run build`.
2. **Datos:** `lib/tipos.ts`, `lib/tiempo.ts`, `lib/formato.ts`, `lib/etiquetas.ts`, `lib/datos.ts` con validación. Comprobar en un Server Component temporal que salen 39 funciones y las horas de f09, f21, f22 y f39, y borrarlo.
3. **Reglas del itinerario:** `lib/itinerario/reglas.ts` y `mensajes.ts`. Verificar la tabla de casos borde de 8.2 (con un script sin dependencias en la carpeta de trabajo o en consola del navegador) **antes** de construir interfaz.
4. **Almacén y anuncios:** `almacen.ts`, `useItinerario.ts`, `anuncios.ts`, `Anunciador`.
5. **Piezas visuales:** `Iconos`, `GlifoSala`, `PuntoSeccion`, `Etiqueta`, `lib/marca.ts` + `MarcaPelicula`, `BotonItinerario`, `PistaFuncion`.
6. **Navegación global:** `Encabezado`, `NavegacionPrincipal`, `ContadorItinerario`, `Pie`, `not-found`.
7. **Programa:** `lib/filtros.ts`, `TarjetaFuncion`, `ReglaDelDia`, `ListaPrograma`, `BarraFiltros`, `ProgramaConFiltros` + `Suspense`, y después `GrillaPrograma`. `npm run build` para confirmar que `/programa` sigue ○.
8. **Ficha:** página con `generateStaticParams`, `FichaDatos`, `FuncionesDePelicula`, `VolverAlPrograma`.
9. **Itinerario:** `VistaItinerario`, `ParadaItinerario`, `TramoItinerario`, `ResumenDia`, `MiItinerario`, `AccionesItinerario`, luego `/itinerario/compartido` con `ItinerarioCompartido` y `CopiarCompartido`.
10. **Portada:** `EscenaPuerto` y sus animaciones, secciones, momentos, horarios, `MapaPuerto`, `TablaTraslados`, `InfoEntradas` y cierre. Después, `MapaPuerto` con ruta en el panel del itinerario.
11. **Pulido:** animaciones de itinerario, impresión, revisión a 360, 768, 1280 y 1920, reduced motion, teclado, Lighthouse.
12. **Entrega:** `ENTREGA.md`, `README.md`, `npm run lint`, `npm run build` final y recorrido completo de H5.2 corregido.
