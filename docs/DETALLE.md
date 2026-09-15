# Detalle técnico y de diseño: sitio del Festival de Cine Niebla

> Este documento baja a implementación cada historia de `docs/BACKLOG.md`. Quien lo implemente tendrá solo `BRIEF.md`, `docs/BACKLOG.md`, este documento y `data/programa.json`.
>
> **Jerarquía ante contradicciones:** `BRIEF.md` > `docs/BACKLOG.md` (qué y criterios) > este documento (cómo). Donde este documento **precisa** una regla del backlog (sección 5.5), la precisión conserva todos los casos de prueba del backlog y es la que se implementa.
>
> No contiene código de la aplicación. Los fragmentos entre comillas invertidas son nombres, firmas o pseudocódigo para fijar contratos.

---

## Índice

0. Resumen de decisiones
1. Plataforma: Next.js 16.3.5 y lo que cambia
2. Configuración del proyecto y limpieza de la plantilla
3. Estructura de archivos y rutas
4. Tipos e interfaces (`lib/tipos.ts`)
5. Lógica pura (`lib/`) con casos límite
6. Estado del cliente: itinerario guardado
7. Dirección visual concreta
8. Movimiento y animación
9. Representación de cada película: el "cartel de niebla"
10. Portada: la escena del faro
11. Componentes
12. Detalle por historia (E0 a E8)
13. Textos de interfaz (microcopia)
14. Verificación: tests automáticos, revisión manual y comandos
15. Orden de implementación y lista de cierre

---

## 0. Resumen de decisiones

| Tema | Decisión |
|---|---|
| Framework | Next.js 16.3.5 (App Router, Turbopack por defecto), React 19.2, TypeScript estricto. Ya instalados; **no se agregan dependencias**. |
| Estilos | **CSS Modules** + un `app/globals.css` con variables (tokens). Sin Tailwind (no está instalado y no hace falta). |
| Animación | **Sin librería de animación** (se usa 0 de la 1 permitida): transiciones y `@keyframes` CSS, `@property` para ángulos animables y, puntualmente, Web Animations API. |
| Renderizado | Todo el sitio es **estático** (prerenderizado en build). No se usa la prop `searchParams` en páginas (volvería dinámica la ruta). Lo que depende de la URL o del navegador vive en Client Components. |
| Datos | `data/programa.json` se importa en un único módulo (`lib/programa.ts`) y se expone con tipos e índices. Nunca se modifica. |
| Tiempo | Las horas se manejan como **minutos absolutos "de pared"** calculados con `Date.UTC(...)` y se formatean a mano. Nunca `new Date("2026-10-15T16:00")` ni `toLocale*` para horas del programa. |
| Itinerario | Lista de ids de función en `localStorage` (clave `niebla:itinerario:v1`), leída con `useSyncExternalStore`. |
| Link compartido | `/itinerario/compartido?f=05-09-13` (ids sin la `f`, separados por `-`), opcional `&n=Nombre`. |
| Filtros | `/programa?dia=viernes&seccion=nocturna`, actualizados con `window.history.replaceState`. |
| Ficha | `/pelicula/[id]` con `generateStaticParams` para las 24 y `dynamicParams = false` (id inexistente → 404). |
| Visual | Concepto **"Luces en la niebla"**: papel de niebla y tinta para leer; noche para la portada; cada sección es una luz de puerto; cada película, un cartel SVG generado. |
| Tipografía | Big Shoulders Stencil (display), Big Shoulders (títulos de película), Atkinson Hyperlegible Next (texto), Atkinson Hyperlegible Mono (horas y cifras). Todas por `next/font/google`. |
| Tests | Lógica pura con `node --test` (Node ≥ 22.18 ejecuta TypeScript directamente). Verificado en este repo: funciona junto a `next build`. |

---

## 1. Plataforma: Next.js 16.3.5 y lo que cambia

La documentación de la versión instalada está en `node_modules/next/dist/docs/`. Leer antes de escribir código, como mínimo:
- `01-app/01-getting-started/03-layouts-and-pages.md`
- `01-app/03-api-reference/04-functions/use-search-params.md`
- `01-app/03-api-reference/04-functions/generate-static-params.md`
- `01-app/03-api-reference/03-file-conventions/not-found.md`
- `01-app/03-api-reference/02-components/font.md`
- `01-app/02-guides/preventing-flash-before-hydration.md`
- `01-app/02-guides/upgrading/version-16.md`

Puntos que afectan este proyecto y que suelen hacerse mal por costumbre de versiones anteriores:

1. **`params` es una Promesa.** En `app/pelicula/[id]/page.tsx`: la página es `async`, recibe `props: PageProps<'/pelicula/[id]'>` y hace `const { id } = await props.params`. Lo mismo en `generateMetadata`. Los tipos `PageProps` y `LayoutProps` son globales (no se importan) y se generan con `next dev`, `next build` o `npx next typegen`.
2. **`useSearchParams` en una ruta estática exige un `<Suspense>`** alrededor del Client Component que lo usa; si no, **el build falla** ("Missing Suspense boundary with useSearchParams"). En desarrollo no falla: probar siempre con `npm run build`.
3. **`window.history.replaceState/pushState` se integran con el router** y actualizan `useSearchParams`. Se usan para los filtros sin navegar.
4. **`generateStaticParams` + `export const dynamicParams = false`** hace que un id no generado devuelva 404 (usa `app/not-found.tsx`).
5. **`next lint` ya no existe.** Se usa `npm run lint` (ESLint CLI, ya configurado). `next build` no ejecuta lint.
6. **Turbopack es el empaquetador por defecto.** No agregar configuración `webpack`.
7. **Scroll suave:** Next 16 ya no anula `scroll-behavior: smooth` al navegar. No poner `scroll-behavior: smooth` global; si se quiere para anclas internas, aplicarlo solo dentro de `@media (prefers-reduced-motion: no-preference)` y agregar `data-scroll-behavior="smooth"` al `<html>`.
8. **No habilitar `cacheComponents`** ni otras opciones experimentales. No hacen falta.
9. El build ya **descarga fuentes de Google en tiempo de build** (verificado con la plantilla): `next/font/google` funciona en este entorno y las fuentes quedan autoalojadas, sin llamadas externas en el navegador.

---

## 2. Configuración del proyecto y limpieza de la plantilla

### 2.1 Cambios de configuración
- **`tsconfig.json`**: agregar `"allowImportingTsExtensions": true` en `compilerOptions` (compatible con `noEmit: true`, que ya está). Esto permite que los módulos de `lib/` se importen entre sí con extensión `.ts`, requisito para que `node --test` los ejecute sin herramientas extra. Probado: `next build` compila y pasa el chequeo de tipos con esta opción.
- **`package.json`**: agregar el script `"test": "node --test \"lib/**/*.test.ts\""`. No agregar dependencias. Node emite un aviso "Reparsing as ES module"; es inofensivo (no agregar `"type": "module"` para no alterar la configuración de Next/ESLint).
- **`next.config.ts`**: sin cambios.
- **`AGENTS.md` / `CLAUDE.md`**: no tocar.

### 2.2 Convención de imports
- Dentro de `lib/`: imports **relativos con extensión** (`./tiempo.ts`). Los imports solo de tipos usan `import type`.
- Desde `app/` y `components/`: alias `@/lib/tiempo`, `@/components/...` (sin extensión).
- Los módulos de lógica (`lib/*.ts` salvo `programa.ts` y `itinerario-store.ts`) **no importan el JSON**: reciben los datos por parámetro. Así los tests leen el JSON con `fs` y los módulos quedan puros.

### 2.3 Limpieza de la plantilla (E0-H1)
Borrar:
- `app/page.module.css` (se reemplaza por los estilos nuevos).
- `app/favicon.ico` (es el de Vercel) → reemplazar por `app/icon.svg` (ver 7.6).
- `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`.

Reescribir por completo `app/layout.tsx`, `app/page.tsx` y `app/globals.css`. El `README.md` puede quedar, pero conviene reemplazarlo por una descripción corta del proyecto en español con los comandos `npm run dev`, `npm run build`, `npm test`.

---

## 3. Estructura de archivos y rutas

### 3.1 Rutas

| URL | Archivo | Tipo | Historias |
|---|---|---|---|
| `/` | `app/page.tsx` | Estática (Server) con islas cliente | E2 |
| `/programa` | `app/programa/page.tsx` | Estática; lista y filtros en cliente dentro de `Suspense` | E3 |
| `/programa?dia=<dia>&seccion=<seccion>` | misma | Parámetros opcionales, ver 5.4 | E3-H2 a H6 |
| `/pelicula/[id]` | `app/pelicula/[id]/page.tsx` | 24 páginas estáticas (`generateStaticParams`), `dynamicParams = false` | E4 |
| `/itinerario` | `app/itinerario/page.tsx` | Estática; contenido en cliente | E5, E6, E7-H1 |
| `/itinerario/compartido?f=…&n=…` | `app/itinerario/compartido/page.tsx` | Estática; lectura de URL en cliente dentro de `Suspense` | E7-H2 a H5 |
| cualquier otra | `app/not-found.tsx` | 404 | E0-H8 |

`<dia>` ∈ `jueves | viernes | sabado` (sin tilde en la URL). `<seccion>` ∈ ids de `secciones` (`competencia | panorama | nocturna | costa`).

### 3.2 Árbol de archivos a crear

```
app/
  layout.tsx                  Layout raíz: <html lang="es">, fuentes, Cabecera, NavInferior, Pie, Anunciador
  globals.css                 Reset mínimo, tokens (color, tipo, espacio, movimiento), utilidades, reduced-motion
  fuentes.ts                  Definición de las 4 fuentes con next/font/google
  icon.svg                    Favicon propio (faro)
  not-found.tsx               404
  page.tsx                    Portada
  portada.module.css
  programa/
    page.tsx
    programa.module.css
  pelicula/
    [id]/
      page.tsx                generateStaticParams, dynamicParams=false, generateMetadata
      pelicula.module.css
  itinerario/
    page.tsx
    itinerario.module.css
    compartido/
      page.tsx
components/
  layout/      Cabecera.tsx, NavInferior.tsx, Pie.tsx, ContadorItinerario.tsx (+ .module.css)
  ui/          Icono.tsx, Etiqueta.tsx, Boton.tsx, Anunciador.tsx, Toast.tsx, Revelar.tsx,
               useHidratado.ts, useReducedMotion.ts (+ .module.css)
  cartel/      Cartel.tsx, motivos.tsx, cartel.module.css
  funcion/     HorarioFuncion.tsx, MarcasFuncion.tsx, BotonItinerario.tsx, TarjetaFuncion.tsx (+ .module.css)
  programa/    ProgramaCliente.tsx, FiltrosPrograma.tsx, ListaProgramaDias.tsx (+ .module.css)
  pelicula/    DatosPelicula.tsx, FuncionesPelicula.tsx, VolverAlPrograma.tsx, OtrasDeLaSeccion.tsx (+ .module.css)
  itinerario/  MiItinerario.tsx, VistaItinerario.tsx, DiaItinerario.tsx, ItemItinerario.tsx, Tramo.tsx,
               ResumenAvisos.tsx, CompartirItinerario.tsx, ItinerarioCompartido.tsx, CopiarItinerario.tsx,
               AvisoAlmacenamiento.tsx, EsqueletoItinerario.tsx, useItinerario.ts (+ .module.css)
  portada/     EscenaFaro.tsx, QueEs.tsx, Cifras.tsx, SeccionesPortada.tsx, TresDias.tsx, Salas.tsx,
               Entradas.tsx, Destacados.tsx, CuentaRegresiva.tsx (+ .module.css)
lib/
  tipos.ts                    Tipos del dominio
  programa.ts                 Único import del JSON; índices y consultas
  tiempo.ts                   Minutos absolutos, formateo de horas y fechas, "ahora en Chile"
  formato.ts                  Precios, clasificación, estreno, listas en español, pluralización
  filtros.ts                  Parseo y serialización de filtros del programa
  reglas-itinerario.ts        Topes, traslados, conversatorios, avisos informativos
  enlace-itinerario.ts        Codificar/decodificar el link compartido
  itinerario-store.ts         Estado persistente (solo cliente)
  cartel.ts                   Parámetros deterministas del cartel de cada película
  destacados.ts               Derivados para la portada (cifras, días, destacados)
  textos.ts                   Microcopia centralizada (sección 13)
  *.test.ts                   Tests con node:test (sección 14.1), incluido contenido.test.ts
```

Server vs Client: todo archivo sin estado del navegador es Server Component (sin `'use client'`). Llevan `'use client'`: `ContadorItinerario`, `NavInferior` y `Cabecera` (necesitan `usePathname` y contador), `BotonItinerario`, `ProgramaCliente`, `FiltrosPrograma`, `VolverAlPrograma`, todos los de `components/itinerario/`, `Anunciador`, `Toast`, `Revelar`, `EscenaFaro` (solo si sigue al puntero), `CuentaRegresiva`. `Cartel`, `TarjetaFuncion`, `HorarioFuncion` y `MarcasFuncion` deben poder usarse **desde Server y Client Components**: sin hooks, sin `'use client'`, solo props serializables.

---

## 4. Tipos e interfaces (`lib/tipos.ts`)

Tipos de datos crudos (espejo exacto del JSON; ningún campo inventado):

```
type SeccionId = 'competencia' | 'panorama' | 'nocturna' | 'costa'
type SalaId = 'teatro' | 'muelle' | 'galpon' | 'terraza'
type Clasificacion = 'TE' | '+14' | '+18'
type Estreno = 'mundial' | 'latinoamericano' | 'nacional'

interface FestivalCrudo {
  nombre: string; edicion: number; ciudad: string; region: string
  fechaInicio: string /* YYYY-MM-DD */; fechaFin: string; zonaHoraria: string
  entradas: { moneda: string; general: number; aireLibre: number; venta: string }
  contacto: { correo: string; instagram: string }
}
interface Sala { id: SalaId; nombre: string; direccion: string; capacidad: number; aireLibre: boolean; nota?: string }
interface Seccion { id: SeccionId; nombre: string; descripcion: string }
interface Pelicula {
  id: string; titulo: string; tituloOriginal?: string; direccion: string; pais: string
  anio: number; duracionMin: number; seccion: SeccionId; clasificacion: Clasificacion
  estreno: Estreno; sinopsis: string
}
interface FuncionCruda {
  id: string; peliculaId: string; salaId: SalaId; inicio: string /* YYYY-MM-DDTHH:mm */
  conversatorioMin?: number; agotada?: boolean; nota?: string
}
interface ProgramaCrudo {
  festival: FestivalCrudo; salas: Sala[]
  trasladosMin: { descripcion: string } & Record<SalaId, Record<SalaId, number>>
  secciones: Seccion[]; peliculas: Pelicula[]; funciones: FuncionCruda[]
}
```

Tipos derivados:

```
type Minutos = number        // minutos absolutos "de pared" (ver 5.1)
type DiaSlug = 'jueves' | 'viernes' | 'sabado'

interface DiaFestival {
  slug: DiaSlug; fecha: string /* YYYY-MM-DD */
  nombre: string /* "jueves" */; numero: number /* 15 */; mes: string /* "octubre" */
  corto: string /* "Jue 15" */; largo: string /* "jueves 15 de octubre" */
}

interface Funcion {                 // FuncionCruda enriquecida
  id: string; pelicula: Pelicula; sala: Sala; seccion: Seccion
  inicio: Minutos; fin: Minutos     // fin = inicio + pelicula.duracionMin
  finConversatorio: Minutos | null  // fin + conversatorioMin, o null
  conversatorioMin: number          // 0 si no hay
  agotada: boolean; nota: string | null
  dia: DiaFestival                  // día de INICIO
  cruzaMedianoche: boolean          // fecha(fin) !== fecha(inicio)
  precio: number                    // festival.entradas.general o .aireLibre según sala.aireLibre
}

type TipoAviso = 'tope' | 'noAlcanza' | 'conversatorio' | 'agotada' | 'peliculaRepetida' | 'lluvia'
type Gravedad = 'problema' | 'informativo'

type Aviso =
  | { tipo: 'tope'; gravedad: 'problema'; a: string; b: string; solapeMin: number }
  | { tipo: 'noAlcanza'; gravedad: 'problema'; a: string; b: string; margenMin: number; trasladoMin: number; faltanMin: number }
  | { tipo: 'conversatorio'; gravedad: 'informativo'; a: string; b: string; margenMin: number;
      trasladoMin: number; conversatorioMin: number; salidaMax: Minutos; minutosDeConversatorio: number }
  | { tipo: 'agotada'; gravedad: 'informativo'; funcion: string }
  | { tipo: 'peliculaRepetida'; gravedad: 'informativo'; peliculaId: string; funciones: string[] }
  | { tipo: 'lluvia'; gravedad: 'informativo'; a: string; b: string; trasladoNormal: number;
      trasladoConLluvia: number; alcanzaNormal: boolean; alcanzaConLluvia: boolean }

interface Tramo {                   // entre dos funciones consecutivas del mismo recorrido
  a: string; b: string; margenMin: number; trasladoMin: number; mismaSala: boolean
  aviso: Aviso | null               // el más grave del par, o null
}

interface ResultadoItinerario {
  funciones: Funcion[]              // válidas, ordenadas (5.5)
  avisos: Aviso[]                   // todos
  tramos: Tramo[]
  problemas: number                 // cantidad de avisos gravedad 'problema'
  avisosPorFuncion: Record<string, Aviso[]>
}

interface FiltrosPrograma { dia: DiaSlug | null; seccion: SeccionId | null }

interface EnlaceDecodificado {
  ids: string[]                     // válidos, sin repetir, en orden cronológico
  invalidos: number                 // tokens que no corresponden a funciones
  nombre: string | null
  malFormado: boolean               // falta f, vacío o sin ningún token válido
}

interface EstadoItinerario { ids: string[]; persistente: boolean }
```

Los ids de sala y sección se validan contra los datos al cargar (5.2); si el JSON trae un valor fuera de la unión, `lib/programa.ts` lanza un error en build (nunca pasa con los datos actuales, pero evita fallas silenciosas).

---

## 5. Lógica pura (`lib/`) con casos límite

### 5.1 `lib/tiempo.ts`

**Idea central.** Las horas del JSON son "hora de pared" en Chile. Se convierten a un número de minutos con `Date.UTC(año, mes-1, día, hora, minuto) / 60000` y se formatean leyendo con `getUTC*`. El resultado no depende de la zona horaria del servidor ni del dispositivo (RN1, E0-H3). Chile está en horario de verano (UTC−3) durante todo el festival: no hay cambio de hora que manejar.

Prohibido para horas del programa: `new Date('2026-10-15T16:00')` (se interpreta en la zona local del dispositivo), `toLocaleTimeString`, `toLocaleDateString` e `Intl.DateTimeFormat` sin `timeZone`. Además de dar horas erróneas, generan errores de hidratación.

| Firma | Comportamiento | Casos límite / tests |
|---|---|---|
| `aMinutos(iso: string): Minutos` | Valida `^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$`; si no calza, lanza `Error`. | `"2026-10-15T16:00"` y `"2026-10-16T00:00"` difieren en 480. |
| `fechaDe(m: Minutos): string` | `YYYY-MM-DD` de esos minutos. | `fechaDe(aMinutos("2026-10-16T23:30") + 105)` → `"2026-10-17"`. |
| `horaDe(m: Minutos): string` | `HH:mm`, 24 h, con cero a la izquierda. | `00:04`, `01:15`, `23:45`. |
| `diaSemana(fecha: string): string` | Nombre en minúscula desde `getUTCDay()` con el arreglo `domingo … sábado`. | `2026-10-15` → `jueves`; `2026-10-18` → `domingo`. |
| `nombreMes(fecha)` | Arreglo de meses en minúscula. | `octubre`. |
| `fechaLarga(fecha)` | `"jueves 15 de octubre"`; `fechaLargaConAnio` agrega `" de 2026"`. | Sin mayúscula inicial (se capitaliza por CSS o en el título si corresponde). |
| `describirFin(f: Funcion)` | Si no cruza medianoche: `{ hora: "21:08", sufijo: null }`. Si cruza: `{ hora: "01:15", sufijo: "del sábado" }`. | `f39` → `01:07` + `del domingo`; `f10` → `00:04` + `del viernes`. |
| `duracionTexto(min)` | `"98 min"`; `duracionLarga(min)` → `"1 h 38 min"`. | `60` → `"1 h"`. |
| `ahoraEnChile(ahora = new Date()): Minutos` | `Intl.DateTimeFormat('en-CA', { timeZone: 'America/Santiago', year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23' }).formatToParts(ahora)` y arma los minutos de pared. | `new Date('2026-10-17T20:00:00Z')` → `aMinutos('2026-10-17T17:00')`. **Solo en el cliente, después de montar.** |

### 5.2 `lib/programa.ts` (único import de `data/programa.json`)

- Importa el JSON y exporta la función pura `construirPrograma(crudo: ProgramaCrudo): Programa` y la constante `programa = construirPrograma(datos)`. Los tests llaman a `construirPrograma` con el JSON leído por `fs`.

`Programa` expone:

```
festival: FestivalCrudo
dias: DiaFestival[]                            // de fechaInicio a fechaFin: 3
salas: Sala[]; secciones: Seccion[]; peliculas: Pelicula[]
funciones: Funcion[]                           // 39; orden: inicio, nombre de sala (localeCompare 'es'), id
salaPorId(id): Sala; seccionPorId(id): Seccion
peliculaPorId(id): Pelicula | undefined
funcionPorId(id): Funcion | undefined
funcionesDePelicula(peliculaId): Funcion[]     // cronológicas
funcionesDelDia(slug): Funcion[]
peliculasDeSeccion(seccionId): Pelicula[]      // alfabético por título (localeCompare 'es')
traslado(desde: SalaId, hasta: SalaId): number // lee trasladosMin; si falta el par, lanza Error
```

Validaciones al construir (lanzan `Error` con mensaje claro, para que una inconsistencia rompa el build y no la interfaz):
- toda `funcion.peliculaId`, `funcion.salaId` y `pelicula.seccion` existe;
- `trasladosMin[a][b]` existe para todo par y es simétrico;
- ids de función únicos con formato `^f\d{2}$` (lo exige el enlace compartido, 5.6);
- la fecha de inicio de cada función está entre `fechaInicio` y `fechaFin`.

Slugs de día: el nombre del día sin tildes (`normalize('NFD')` y quitar diacríticos): `jueves`, `viernes`, `sabado`.

### 5.3 `lib/formato.ts`

| Función | Salida |
|---|---|
| `precio(n)` | `0` → `"Gratis"`; `4000` → `"$4.000"` (separador de miles hecho a mano, no `toLocaleString`). |
| `clasificacionLarga(c)` | `TE` → `"Todo espectador"`, `+14` → `"Mayores de 14 años"`, `+18` → `"Mayores de 18 años"`. |
| `clasificacionCorta(c)` | `"TE"`, `"+14"`, `"+18"` (siempre acompañada de la larga como texto accesible). |
| `estrenoTexto(e)` | `"Estreno mundial"`, `"Estreno latinoamericano"`, `"Estreno nacional"`. |
| `plural(n, singular, plural)` | `1 función`, `3 funciones`. |
| `listaEs(items)` | `"a"`, `"a y b"`, `"a, b y c"`. |
| `nombreCortoSeccion(id)` | `Competencia`, `Panorama`, `Nocturna`, `Costa` (chips a 360 px; el nombre completo va en encabezados y `aria-label`). |
| `nombreCortoSala(id)` | `Teatro Municipal`, `El Muelle`, `Galpón 7`, `Terraza Faro`. |
| `instagramUrl(handle)` | `@festivalniebla` → `https://www.instagram.com/festivalniebla/`. |

### 5.4 `lib/filtros.ts`

- `leerFiltros(params: URLSearchParams | null, programa): FiltrosPrograma`. `dia` válido solo si está en `programa.dias[].slug` (se acepta `sábado` con tilde como alias); `seccion` válida solo si está en `secciones[].id`. Cualquier otro valor, vacío o en mayúsculas → `null`. Si se repite el parámetro, se toma el primero.
- `escribirFiltros(f): string` → `""` o `"?dia=viernes&seccion=nocturna"` (orden fijo; omite los `null`).
- `filtrarFunciones(funciones, f): Funcion[]` filtra por `funcion.dia.slug` (día de inicio, RN4) y `funcion.seccion.id`.
- Tests (backlog secciones 5 y E3-H4): sin filtros 39; `jueves` 10; `viernes` 12; `sabado` 17; `competencia` 16; `panorama` 9; `nocturna` 8; `costa` 6; `viernes`+`nocturna` = [`f19`,`f21`,`f22`]; `sabado`+`competencia` 8; `jueves`+`nocturna` = [`f10`]; `viernes` no incluye `f09` ni `f10`; `?dia=domingo` → sin filtro de día.

### 5.5 `lib/reglas-itinerario.ts` (RN13 a RN18)

Firma: `evaluarItinerario(ids: string[], programa: Programa, opciones?: { lluvia?: boolean }): ResultadoItinerario`.

**Paso 0. Normalizar.** Descartar ids inexistentes, quitar repetidos, mapear a `Funcion` y ordenar por `inicio`, nombre de sala, id.

**Paso 1. Topes (RN13).** Para todo par `i < j`: hay tope si `F[j].inicio < F[i].fin`. `solapeMin = min(F[i].fin, F[j].fin) − F[j].inicio`. Al comparar minutos absolutos, los cruces de medianoche funcionan solos. Si `F[j].inicio === F[i].fin` → **no** hay tope.

**Paso 2. Pares encadenables (precisión de RN14).** Un par `(A, B)` con `B.inicio ≥ A.fin` es **encadenable** si **no** existe otra función elegida `X` que quepa completa entre ambas (`X.inicio ≥ A.fin` y `X.fin ≤ B.inicio`). Para cada par encadenable:
- `margen = B.inicio − A.fin`; `traslado = programa.traslado(A.sala.id, B.sala.id)`.
- Si `margen < traslado` → `noAlcanza`, con `faltanMin = traslado − margen`.
- Si no, y `A.conversatorioMin > 0` y `margen < A.conversatorioMin + traslado` → `conversatorio`, con `salidaMax = B.inicio − traslado` y `minutosDeConversatorio = salidaMax − A.fin` (puede ser 0).
- Si no, sin aviso.

Por qué "encadenable" y no solo "la siguiente": si después de A se eligieron dos funciones que se topan entre sí, la persona puede ir a cualquiera, así que A se evalúa contra ambas. Cuando hay una función completa en medio, basta evaluar los tramos cortos (la tabla cumple la desigualdad triangular). En los datos reales esto agrega un solo caso respecto de "solo la siguiente": {`f13`,`f16`,`f17`} (caso P1 en 14.1). Todos los casos de la sección 8 del backlog dan el mismo resultado.

**Paso 3. Un aviso por par (RN16).** Los pares encadenables no se topan por construcción; un `noAlcanza` excluye el `conversatorio`.

**Paso 4. Informativos (RN18).**
- `agotada` por cada función elegida con `agotada: true`.
- `peliculaRepetida` por cada película con 2 o más funciones elegidas (un aviso por película, con todas sus funciones).
- `lluvia` (solo con `opciones.lluvia`, E6-H6 Could): para cada par encadenable donde A o B está en `terraza`, recalcular el traslado reemplazando `terraza` por `galpon` e informar si cambia "alcanza". Nunca es problema.

**Paso 5. Tramos.** Entre funciones **consecutivas del mismo día** en el orden normalizado (`F[k]`, `F[k+1]`): margen, traslado, `mismaSala` y el aviso de ese par si existe (tope, noAlcanza o conversatorio). Si se topan, `margenMin` es negativo. Los avisos de pares encadenables no consecutivos (como `f13→f17` en P1) se muestran en la tarjeta de la función de origen.

**Paso 6. Resumen.** `problemas` = cantidad de avisos `tope` + `noAlcanza`. `avisosPorFuncion[id]` incluye cada aviso donde participa la función (ambas del par).

**Previsualización en el programa (E3-H7):** `avisosAlAgregar(seleccion, candidata, programa): Aviso[]` = `evaluarItinerario([...seleccion, candidata])` filtrado a `tope` y `noAlcanza` que involucran a la candidata; `[]` si la candidata ya está elegida. En `ProgramaCliente` se calcula un `Map<funcionId, Aviso[]>` para las funciones visibles con `useMemo` dependiente de `seleccion`.

Tests obligatorios: todos los casos de la sección 8 del backlog y los de 14.1.

### 5.6 `lib/enlace-itinerario.ts`

- **Formato:** `f=` + ids sin la `f`, ordenados por número y unidos con `-`. {`f05`,`f13`,`f09`} → `f=05-09-13`. Con las 39 funciones el parámetro mide 116 caracteres; la URL completa queda muy por debajo de 300 (E7-H1 CA5).
- `codificarEnlace(ids, nombre?)` → ruta relativa `"/itinerario/compartido?f=05-09-13"` + `"&n=" + encodeURIComponent(nombre)` si hay nombre. La absoluta se arma en el cliente con `window.location.origin`.
- `decodificarEnlace(params, programa): EnlaceDecodificado`:
  - sin `f` o `f` vacío → `malFormado: true`, `ids: []`;
  - separar por `-` (aceptar también `,`, `.`, `+` y espacios); máximo 200 tokens;
  - token `^\d{1,3}$` → id `"f" + token.padStart(2, "0")`; si existe, es válido; si no, `invalidos++`;
  - repetidos cuentan una vez y no suman a `invalidos`;
  - `ids` en orden cronológico; si queda vacío → `malFormado: true`;
  - `n`: `URLSearchParams` ya decodifica; quitar caracteres de control, colapsar espacios, recortar a 40 caracteres; vacío → `null`. Siempre se renderiza como texto de React.
- Tests: ida y vuelta; `f=05-05-09` → 2 ids; `f=05-99-xx` → 1 id, `invalidos: 2`; `f=` → malFormado; `f=5` → `f05`; `n=<b>hola</b>` se conserva literal.

### 5.7 `lib/destacados.ts`

Derivados para la portada, **todos calculados**:
- `cifras(programa)` → `{ peliculas: 24, funciones: 39, salas: 4, dias: 3, estrenosMundiales: 9 }`.
- `resumenDia(programa, slug)` → `{ cantidad, primeraHora, finMasTarde (describirFin), conNota, alAireLibre }`. Jueves: 10 funciones, de 16:00 a 00:13 del viernes. Viernes: 12, de 16:30 a 01:15 del sábado. Sábado: 17, de 12:00 a 01:07 del domingo.
- `destacados(programa)` → con `nota` (`f05`, `f36`), con conversatorio (`f03`, `f13`, `f25`, `f31`), al aire libre (`f07`, `f17`, `f21`, `f33`, `f37`). Sin criterios de calidad.
- `rangoTraslados(programa)` → `{ min: 8, max: 22 }` (sin contar la misma sala).

---

## 6. Estado del cliente: itinerario guardado (`lib/itinerario-store.ts`)

Módulo que solo importan Client Components. Implementa una tienda externa para `useSyncExternalStore`.

**Almacenamiento**
- Clave `niebla:itinerario:v1`; valor `{"v":1,"ids":["f05","f13"]}`.
- Lectura con `try/catch`. JSON inválido, `v` distinto, `ids` que no es arreglo o elementos que no son string → vacío. Ids inexistentes y repetidos se descartan (E5-H3 CA6).
- Escritura con `try/catch`. Si falla (modo privado, cuota), el estado sigue en memoria y `persistente = false` (E5-H3 CA5). Al iniciar, probar escribir y borrar `niebla:prueba`.

**API.** El módulo exporta una fábrica `crearTienda(almacen: AlmacenSimple | null, idsValidos: Set<string>)`, donde `AlmacenSimple` = `{ getItem, setItem, removeItem }`, para poder testearla con un almacén simulado. La tienda del sitio se crea una sola vez, de forma perezosa en el primer uso del cliente, con `globalThis.localStorage` (dentro de `try/catch`; si acceder a `localStorage` lanza, se pasa `null` y queda en memoria con `persistente: false`). La tienda expone:

```
suscribir(callback): () => void       // también escucha 'storage' de otras pestañas (E5-H5)
obtenerEstado(): EstadoItinerario     // misma referencia mientras no cambie (cachear por el string crudo)
obtenerEstadoServidor(): EstadoItinerario   // constante { ids: [], persistente: true }
agregar(id); quitar(id); alternar(id); vaciar()
reemplazar(ids); unir(ids)            // unir agrega sin duplicar
```

`useItinerario()` (en `components/itinerario/useItinerario.ts`) = `useSyncExternalStore(suscribir, obtenerEstado, obtenerEstadoServidor)` más las acciones. Programa, ficha, itinerario y contador usan este hook: una sola fuente de verdad (E5-H3 CA7).

**Hidratación.** El HTML prerenderizado no conoce el itinerario. Para no mostrar un estado falso:
- `useHidratado()` = `useSyncExternalStore(() => () => {}, () => true, () => false)`.
- `BotonItinerario` antes de hidratar se dibuja neutro (mismo tamaño, sin estado, `aria-disabled`, opacidad 0.6) y al hidratar hace `transition: opacity 120ms`.
- `MiItinerario` muestra un esqueleto (no el estado vacío) hasta hidratar. El contador de la navegación no muestra número hasta hidratar.

**Deshacer (E5-H4).** No vive en la tienda: `MiItinerario` guarda en estado local la última función quitada y muestra un `Toast` durante 6 s con "Deshacer", que llama a `agregar(id)`. Un nuevo borrado reemplaza al anterior. El toast no se cierra solo mientras tiene foco o el puntero encima.

---

## 7. Dirección visual concreta

### 7.1 Concepto: "Luces en la niebla"

Puerto Bruma de noche: la niebla lo tapa todo y lo que se ve son luces. Las luces de sodio del muelle, las luces de navegación de los barcos, el faro. El sitio se construye con esa idea:
- **La niebla es el soporte.** Las páginas de uso (programa, ficha, itinerario) son **papel de niebla**: un gris cálido claro, como un programa de mano impreso, con tinta casi negra. Se lee bien a pleno sol del sábado.
- **La noche es el escenario.** La portada, la cabecera de la ficha y el pie son **noche**: azul tinta muy oscuro, con niebla que se mueve.
- **Cada sección es una luz de puerto**, con color propio: Competencia = luz de sodio (ámbar), Panorama = luz de estribor (verde), Bruma Nocturna = luz ultravioleta de medusa (violeta), Hecho en la Costa = azul de bote pesquero.
- **Cada película es un cartel de niebla** (sección 9): una escena SVG con la luz de su sección y una figura sacada de su sinopsis.
- **El itinerario es un recorrido a pie** entre luces: una línea de pasos que une funciones, con el tiempo caminando escrito sobre ella.
- **Tipografía de estiba:** títulos en letra condensada de rotulado industrial, con variante stencil (la de los contenedores y las bodegas del puerto) para los grandes números y el nombre del festival.

Evitar (lo que haría ver el sitio "de seguros"): tarjetas blancas con sombra difusa y bordes muy redondeados, degradados azul-violeta genéricos, íconos de librería, fotos (prohibidas), botones píldora de color corporativo, centrado de todo.

Rasgos de la gráfica: bordes rectos o radio de 2 px, líneas de 1,5 px en tinta, sin sombras (la profundidad se da con capas de niebla y superposiciones), etiquetas como rótulos pintados (mayúsculas, tracking amplio y fondo de color de luz), números grandes en stencil.

### 7.2 Color: tokens (definir en `:root` de `app/globals.css`)

Base:

| Token | Valor | Uso |
|---|---|---|
| `--papel` | `#EEEBE3` | Fondo de páginas de uso |
| `--papel-2` | `#E2DDD1` | Superficies (tarjetas, bloques), bandas alternas |
| `--tinta` | `#12171B` | Texto principal, líneas |
| `--tinta-2` | `#454E55` | Texto secundario (salas, direcciones, metadatos) |
| `--noche` | `#0B1116` | Fondo de portada, pie, cabecera de ficha |
| `--noche-2` | `#18222A` | Superficies sobre noche |
| `--blanco-niebla` | `#F6F4EE` | Texto principal sobre noche |
| `--bruma` | `#A7B2B8` | Texto secundario sobre noche |

Luces de sección (cada una con variante `luz`, para fondos y detalles, y `tinta`, para texto de color sobre papel):

| Sección | `--sec-<id>-luz` | `--sec-<id>-tinta` |
|---|---|---|
| competencia | `#F2A33A` | `#8A4A00` |
| panorama | `#3DC47E` | `#1A6A3F` |
| nocturna | `#B690FF` | `#6A3FC0` |
| costa | `#56B8EA` | `#1D5E8A` |

Estados:

| Estado | `luz` | `tinta` | Forma que lo acompaña (nunca solo color) |
|---|---|---|---|
| `--tope` | `#FF6B5B` | `#B3261E` | Ícono triángulo con `!`, borde izquierdo de 4 px con rayado diagonal, texto "Se topa" |
| `--no-alcanza` | `#FF8A3D` | `#9A3C00` | Ícono de pasos, línea de tramo en zigzag, texto "No alcanzas" |
| `--conversatorio` | `#7FB2C9` | `#2F5D73` | Ícono de dos globos de diálogo, borde punteado, texto "Conversatorio" |
| `--agotada` | `#C9C4B8` | `#5A5650` | Sello rectangular con texto "AGOTADA" rotado −3° (estático) |

**Contrastes verificados** (WCAG 2.2, calculados):
- `--tinta` sobre `--papel` 15,1:1; sobre `--papel-2` 13,3:1. `--tinta-2` sobre `--papel` 7,1:1; sobre `--papel-2` 6,3:1.
- `--blanco-niebla` sobre `--noche` 17,3:1; `--bruma` sobre `--noche` 8,8:1 y sobre `--noche-2` 7,5:1.
- Todas las variantes `luz` sobre `--noche`: entre 6,8:1 y 10,9:1. `--tinta` sobre cualquier `luz`: entre 6,5:1 y 10,4:1 (por eso las etiquetas de color llevan **texto en tinta**, nunca texto blanco).
- Todas las variantes `tinta` sobre `--papel`: entre 5,5:1 y 6,1:1; sobre `--papel-2`: entre 4,8:1 y 5,4:1 (pasan AA para texto normal).
- **Prohibido:** texto de color `luz` sobre papel (no pasa contraste) y texto `tinta` de sección sobre noche.

Foco visible: `outline: 3px solid var(--tinta)` con `outline-offset: 2px` sobre papel; sobre noche, `outline-color: var(--blanco-niebla)`. Nunca `outline: none` sin reemplazo.

El sitio no cambia con `prefers-color-scheme`: la identidad es fija (quitar el bloque oscuro de la plantilla). Declarar `color-scheme: light` en `html` y, en las zonas de noche, `color-scheme: dark` para que los controles nativos combinen.

### 7.3 Tipografía

Definir en `app/fuentes.ts` con `next/font/google`, cada una con `variable`, `display: 'swap'` y `subsets: ['latin', 'latin-ext']` (`latin-ext` es necesario: "Tomáš Vrba", "Élise", "nætter").

| Variable CSS | Fuente | Configuración | Uso |
|---|---|---|---|
| `--f-stencil` | Big Shoulders Stencil | variable (wght 100–900, eje `opsz` opcional) | Nombre del festival, números de día ("15"), cifras de portada, encabezados de día del programa, nombres de sección en portada |
| `--f-rotulo` | Big Shoulders | variable | Títulos de película, encabezados de página, etiquetas en mayúsculas |
| `--f-texto` | Atkinson Hyperlegible Next | variable (wght 200–800) | Todo el texto corrido, botones, filtros, sinopsis |
| `--f-mono` | Atkinson Hyperlegible Mono | variable (wght 200–800) | Horas, duraciones, minutos de traslado, precios |

Agregar las cuatro clases `variable` al `<html>` en `app/layout.tsx`. Fallbacks en CSS: `--f-stencil`/`--f-rotulo` → `"Arial Narrow", "Roboto Condensed", sans-serif`; `--f-texto` → `system-ui, sans-serif`; `--f-mono` → `ui-monospace, "Cascadia Mono", monospace`. Solo `--f-texto` y `--f-rotulo` con `preload: true`; las otras dos con `preload: false`.

Escala (tokens):

| Token | Valor | Uso |
|---|---|---|
| `--t-hero` | `clamp(4.5rem, 22vw, 14rem)`, `--f-stencil`, wght 800, line-height 0.85, mayúsculas, tracking 0.01em | "NIEBLA" en portada |
| `--t-display` | `clamp(2.5rem, 9vw, 5rem)`, `--f-stencil` 700, lh 0.9 | Números de día, cifras |
| `--t-h1` | `clamp(2.25rem, 7vw, 3.75rem)`, `--f-rotulo` 800, lh 0.95 | Título de página y de ficha |
| `--t-h2` | `clamp(1.75rem, 5vw, 2.5rem)`, `--f-rotulo` 750, lh 1 | Encabezados de bloque |
| `--t-titulo-funcion` | `clamp(1.375rem, 4.8vw, 1.75rem)`, `--f-rotulo` 700, lh 1.05 | Título en tarjeta de función |
| `--t-cuerpo` | `1.0625rem` (17 px), `--f-texto` 400, lh 1.5 | Texto corrido |
| `--t-chico` | `0.9375rem` (15 px), `--f-texto` 400/600, lh 1.4 | Metadatos, salas |
| `--t-etiqueta` | `0.8125rem` (13 px), `--f-rotulo` 700, mayúsculas, tracking 0.06em | Rótulos de sección, estados |
| `--t-hora` | `1.5rem`, `--f-mono` 700, `font-variant-numeric: tabular-nums` | Hora de inicio en tarjetas |

Nada de texto bajo 13 px. Títulos de película en su grafía original (no forzar mayúsculas: "Bruma, 1987", "Cortos I: Oficios del mar").

### 7.4 Espacio, grilla y puntos de quiebre

- Unidad base 4 px. Tokens `--e-1` 4px, `--e-2` 8px, `--e-3` 12px, `--e-4` 16px, `--e-6` 24px, `--e-8` 32px, `--e-12` 48px, `--e-16` 64px.
- Margen lateral de página: `clamp(16px, 4vw, 48px)`. Ancho máximo del contenido: 1200 px (portada puede ir a sangre completa).
- Puntos de quiebre (usar estos valores literales en `@media`): **600 px** (tableta chica), **1024 px** (escritorio), **1440 px** (escritorio amplio).
- Área tocable mínima: 44×44 px para todo control. Separación mínima entre controles vecinos: 8 px.
- Navegación: **< 1024 px**, barra inferior fija (`NavInferior`, 64 px + `env(safe-area-inset-bottom)`) con tres destinos al alcance del pulgar, y `body` con `padding-bottom` igual a su altura; cabecera superior mínima con el logotipo. **≥ 1024 px**: cabecera superior con los tres destinos y sin barra inferior. Agregar `viewport-fit=cover` en `generateViewport`/`viewport` del layout.

### 7.5 Iconografía

Iconos propios, SVG en línea, en `components/ui/Icono.tsx` con `nombre` como prop. Grilla 24×24, trazo 1,75 px, `stroke="currentColor"`, extremos rectos. `aria-hidden="true"` siempre (el significado va en el texto al lado).

Set necesario: `faro` (marca), `programa` (hoja con líneas), `ruta` (dos puntos unidos por línea de pasos, para Mi itinerario), `inicio` (faro chico), `mas`, `check`, `quitar` (x), `pasos` (dos huellas), `tope` (triángulo con !), `conversatorio` (dos globos), `luna` (aire libre), `lluvia`, `agotada` (círculo tachado), `compartir` (flecha saliendo de caja), `copiar`, `flecha-izq`, `flecha-der`, `ubicacion` (alfiler), `entrada` (boleto), `correo`, `instagram` (cuadrado redondeado con círculo, trazado propio sin logotipo oficial), `deshacer`.

### 7.6 Marca y favicon

- **Marca textual:** "Festival de Cine" en `--f-rotulo` pequeño, mayúsculas; debajo "NIEBLA" en `--f-stencil` 800; a la derecha, "3ª edición" en `--t-etiqueta`. En la cabecera móvil se reduce a `faro` + "NIEBLA".
- **`app/icon.svg`:** `viewBox="0 0 32 32"`, fondo `--noche` (#0B1116) con esquinas rectas, silueta de faro en `#F6F4EE` (trapecio de 8 px de base, 18 px de alto), linterna en `#F2A33A` y dos rayos triangulares ámbar al 60 % de opacidad. Sin texto. Es un archivo de imagen hecho a mano en código SVG, no una imagen externa.

---

## 8. Movimiento y animación

### 8.1 Principios
1. El movimiento es **niebla y luz**: lento, continuo y de fondo. La interfaz responde rápido y seco.
2. Nunca bloquea: nada se anima antes de que el contenido sea legible. Sin animaciones de entrada que oculten el programa.
3. Solo se animan `transform`, `opacity` y propiedades registradas con `@property` (ángulos). Nada de animar `width`, `height`, `top` ni `filter` en bucle.
4. **Todo lo que se mueve solo tiene su versión quieta** con `prefers-reduced-motion: reduce`.

### 8.2 Tokens

| Token | Valor |
|---|---|
| `--m-rapido` | 120ms |
| `--m-medio` | 240ms |
| `--m-lento` | 480ms |
| `--ease-marea` | `cubic-bezier(.2, .7, .2, 1)` (salida suave) |
| `--ease-boya` | `cubic-bezier(.34, 1.4, .64, 1)` (pequeño rebote, solo para confirmaciones) |

### 8.3 Catálogo de animaciones

| # | Dónde | Qué | Detalle | Con `reduce` |
|---|---|---|---|---|
| A1 | Portada | Niebla a la deriva | 3 capas SVG de niebla con `translateX` en `@keyframes` alternados: 38 s, 52 s y 71 s, `ease-in-out`, desplazamientos de 6 %, 10 % y 14 %. | Capas quietas |
| A2 | Portada | Haz del faro | Elemento con `conic-gradient` que rota con la propiedad registrada `--angulo` (`@property --angulo { syntax: '<angle>'; inherits: true; initial-value: 200deg }`), barrido de 200° a 340° y vuelta en 14 s. Ver sección 10. | `--angulo` fijo en 250° |
| A3 | Portada | "NIEBLA" iluminado | Copia del título por encima con `mask-image: conic-gradient(from var(--angulo) at <x del faro> <y del faro>, transparent 0 8deg, #000 12deg 26deg, transparent 30deg)`; se enciende al pasar el haz. | Máscara fija que deja iluminadas las letras "EB" |
| A4 | Portada (≥1024 y `hover: hover`) | El haz sigue al puntero | `pointermove` calcula el ángulo desde el faro y lo aplica con `requestAnimationFrame`, suavizando con interpolación de 0,12 por cuadro; al salir el puntero, vuelve al barrido automático. | Desactivado |
| A5 | Portada | Aparición al hacer scroll | `Revelar` agrega `data-visible` con `IntersectionObserver` (umbral 0,15, una sola vez): `opacity 0→1` y `translateY(12px)→0`, 480 ms `--ease-marea`, desfase de 60 ms entre hijos. El contenido **empieza visible si no hay JS** (la clase que lo oculta la agrega el propio componente al montar y solo si el elemento está bajo la parte visible). | Sin efecto, todo visible |
| A6 | Cartel grande (ficha) | Niebla del cartel | Bandas de niebla con `translateX` 24–40 s alternado. | Quietas |
| A7 | Botón "Voy" | Confirmación al agregar | Fondo rellena de izquierda a derecha con `transform: scaleX` (240 ms `--ease-marea`); el `check` se dibuja con `stroke-dashoffset` 24→0 en 240 ms; el botón hace `scale(1)→(1.06)→(1)` con `--ease-boya` 240 ms. Al quitar: 120 ms sin rebote. | Cambio instantáneo de estado |
| A8 | Contador de la navegación | Latido | `scale(1)→(1.25)→(1)` 300 ms `--ease-boya` cuando cambia el número. | Sin latido |
| A9 | Filtros | Indicador activo | En el control de días, un bloque de fondo `--tinta` se desliza (`translateX`) al día elegido, 240 ms. | Salta sin transición |
| A10 | Itinerario | Tramo con problema | La línea de pasos se vuelve zigzag (dos `path` que cruzan opacidad 240 ms). | Cambio instantáneo |
| A11 | Itinerario | Quitar función | La tarjeta hace `opacity 1→0` y `translateX(−16px)` 240 ms antes de desmontarse; el resto se reacomoda sin animar alturas. | Desaparece de inmediato |
| A12 | Toast | Entrada/salida | `translateY(100%)→0` 240 ms. | Aparece sin movimiento |

### 8.4 Implementación de `prefers-reduced-motion`
- En `globals.css`: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }`.
- Además, cada animación en bucle (A1, A2, A6) se declara **solo** dentro de `@media (prefers-reduced-motion: no-preference)`, para que el estado quieto sea el elegido por diseño (A2/A3 quedan en un ángulo que ilumina parte del título) y no el primer cuadro de una animación cortada.
- En JS (A4, A5): `useReducedMotion()` en `components/ui/` = `useSyncExternalStore` sobre `matchMedia('(prefers-reduced-motion: reduce)')` con escucha de `change`.
- Nada parpadea: el haz cruza las letras en ~1,6 s; ningún cambio de luminosidad supera 1 ciclo por segundo.

---

## 9. Representación de cada película: el "cartel de niebla"

### 9.1 Qué es
Un SVG generado por `components/cartel/Cartel.tsx` a partir de `lib/cartel.ts`. Proporción 3:4 (`viewBox="0 0 300 400"`). Es una escena nocturna de puerto con niebla, la luz de la sección y **una figura propia de cada película** tomada de su sinopsis. No lleva texto (el título está siempre al lado, en HTML) y no imita afiches: sin taglines, créditos, laureles ni logos.

### 9.2 Capas (de atrás hacia adelante)
1. **Cielo:** `linearGradient` vertical `cieloArriba → cieloHorizonte` de la paleta.
2. **Luz:** círculo de radio 22–34 con halo (`radialGradient` de `luz` al 55 % → 0 %, radio ×3). Posición x = 0,2–0,8 del ancho (PRNG), y = 0,18–0,34 del alto. Si la película es **estreno mundial**, el halo lleva un segundo anillo fino (trazo 1,5 de `luz` al 50 %).
3. **Luces de horizonte:** tantos puntos de `luz` (radio 2,5) como países tiene la película (`pais.split(',').length`: 1 o 2), sobre la línea de horizonte.
4. **Horizonte / agua:** rectángulo desde `yHorizonte` (0,58–0,70 del alto, PRNG) con `figura` al 85 % y 3 líneas horizontales finas de `niebla` al 15 % (reflejos).
5. **Figura (motivo):** silueta en color `figura`, con detalles de `luz` (ventanas, linterna, reflejos). Ver tabla 9.4.
6. **Niebla:** N bandas (elipses muy anchas, `rx` 180–260, `ry` 18–40) de color `niebla` con opacidad 0,10–0,32. **N depende de la duración**: `N = 3 + round((duracionMin − 63) / (121 − 63) × 4)` (de 3 para la más corta, 63 min, a 7 para la más larga, 121 min). Cuanto más larga la película, más espesa la niebla. En la variante `grande`, las bandas llevan `feGaussianBlur` (stdDeviation 5); en `mini` y `tarjeta`, sin filtro.
7. **Grano** (solo `grande`): `feTurbulence` baseFrequency 0,9, opacidad 0,06.

### 9.3 Determinismo y paletas
- `semilla = fnv1a32(pelicula.id)`; PRNG `mulberry32(semilla)`. Los números aleatorios se consumen **siempre en el mismo orden** (luz x, luz y, radio, yHorizonte, luego bandas de niebla y variaciones del motivo). Nunca `Math.random()`.
- `lib/cartel.ts` exporta `parametrosCartel(pelicula): ParametrosCartel` (pura, testeable) con `{ paleta, motivo, luz: {x,y,r,doble}, lucesHorizonte, yHorizonte, bandas: {cx,cy,rx,ry,opacidad,duracionS}[] }`. `Cartel.tsx` solo dibuja.
- Ids internos del SVG (gradientes, filtros): prefijo con la prop obligatoria `idBase` (ej. `"f05-tarjeta"`, `"la-hora-azul-del-puerto-ficha"`), única por instancia en la página. No usar `useId` (el componente debe servir en Server Components).

| Sección | cieloArriba | cieloHorizonte | niebla | luz | figura |
|---|---|---|---|---|---|
| competencia | `#1B2530` | `#3A3B3F` | `#E9D9BF` | `#F2A33A` | `#0E1419` |
| panorama | `#0F2226` | `#29423F` | `#D5E4DA` | `#3DC47E` | `#0A1614` |
| nocturna | `#0B0B17` | `#231B36` | `#C9BFE0` | `#B690FF` | `#06060C` |
| costa | `#10202E` | `#2D4B5E` | `#DCE8EE` | `#56B8EA` | `#0B1822` |

### 9.4 Motivos por película

Cada película tiene un motivo distinto (así las 24 son distinguibles aunque compartan paleta). Se definen en `components/cartel/motivos.tsx` como funciones que devuelven un `<g>` en coordenadas del `viewBox`, reciben `{ yHorizonte, paleta, rnd }` y usan formas simples (rectángulos, polígonos, arcos). El mapa `peliculaId → motivo` vive en `lib/cartel.ts`; si llega un id sin motivo, se usa `faro` y un test lo detecta.

| Película | Motivo | Figura (qué dibujar) | Dato de origen |
|---|---|---|---|
| La hora azul del puerto | `grua` | Grúa pórtico de muelle (dos patas, brazo horizontal) y una pila de 5 contenedores; 1 ventana de cabina encendida en `luz` | Estibadora, muelle automatizado |
| Sal de roca | `salinas` | 3–4 montículos triangulares en `niebla` al 80 % sobre el horizonte, casa pequeña a un lado | Salinas, casa familiar |
| Los que cuidan el faro | `faro` | Faro alto con linterna encendida y dos figuras pequeñas (grande y chica) en la base | Niña, abuelo, faro |
| Temporada seca | `sequia` | Sin agua: el horizonte es tierra con grietas (polilínea quebrada en `luz` al 40 %) y un camión cisterna en silueta | Pueblo sin agua, pipas |
| Cordillera de papel | `papel` | 3 cordilleras dentadas superpuestas, cada una desplazada 3 px con borde `niebla` (efecto recorte) y un sobre pequeño en el cielo | Animación con recortes, cartas |
| Madrugada en Paysandú | `taxi` | Calle en perspectiva (dos líneas convergentes), fila de faroles en `luz` y un auto con dos focos | Taxista, una noche, la ciudad |
| Vidrio | `vidrio` | 3 formas de botella/gota superpuestas en `luz` con opacidad 0,25–0,5 y borde fino | Sopladora de vidrio |
| El canto de las redes | `red` | Red en malla de rombos colgando de dos palos sobre el agua, con ondas concéntricas | Pescadoras, redes, canto |
| Transbordador de invierno | `transbordador` | Barco ancho en el horizonte con 3 ventanas en `luz`, líneas diagonales de tormenta arriba | Transbordador, tormenta |
| Mar negro | `hielo` | Plano de hielo (`niebla` al 70 %) que cubre el agua con un agujero circular oscuro y una silueta pequeña bajo el agujero | Buzo, bajo el hielo |
| Horas muertas | `lavanderia` | Fila de 3 ventanillas circulares de lavadora (anillos concéntricos), una con `luz` | Lavandería nocturna |
| Ostrava Blues | `mina` | Castillete minero (torre reticulada con rueda arriba) y 3 notas/formas de guitarra simples | Exminero, banda de blues |
| Línea de sal | `marea` | Casas bajas con la línea del agua subiendo por encima de la mitad de sus puertas; una regla vertical con marcas | Ingeniera mide el avance del mar |
| Doce noches claras | `edificio` | Edificio de 3 × 4 = **12 ventanas**, algunas encendidas; sol bajo en el horizonte (no hay noche) y un gato en el techo | 12 noches, 12 vecinos, un gato |
| La niebla tiene dientes | `dientes` | Banco de niebla espeso cuyo borde inferior es una fila de triángulos (dientes) sobre una caleta con 2 casitas | Niebla que no se levanta |
| Marea roja | `mareaRoja` | Olas en la paleta pero con la cresta en `#C2413A` (único acento no paleta, contraste irrelevante: es decorativo), costa rocosa | Marea roja en Galicia |
| Casa de pescadores | `casaRedes` | Casa de pescadores de dos aguas, redes colgando llenas (puntos en `luz`), sin bote | Redes llenas sin pescar |
| Las cintas del faro | `vhs` | Faro pequeño dentro de un marco rectangular con barras horizontales de interferencia (tracking) y una franja de ruido abajo | Metraje encontrado, VHS, farero |
| Ahogados | `campanario` | Campanario de iglesia que asoma por el agua (el horizonte cubre 2/3 de la torre) y reflejo invertido | Pueblo inundado por represa |
| Cortos I: Oficios del mar | `seisOficios` | **6** paneles verticales estrechos, cada uno con una silueta simple: balde, remo, bote, pez, gancho, canasto | Seis cortos sobre oficios |
| Cortos II: Noches de puerto | `cincoBares` | **5** letreros rectangulares de bar en fila; 4 apagados (contorno) y 1 encendido en `luz` | Cinco cortos, bares cerrados |
| Caleta Sur | `caleta` | 4 botes artesanales varados en fila con sus números pintados como rayas (no dígitos), y un cartel vacío clavado (inmobiliaria) | Sindicato, caleta en disputa |
| El último astillero | `astillero` | Esqueleto de lancha en construcción (quilla y 6 cuadernas curvas) sobre caballetes | Carpintero de ribera, última lancha |
| Bruma, 1987 | `super8` | Fotograma con perforaciones laterales, esquinas redondeadas y dentro una silueta de familia en la playa; grano fuerte en todas las variantes | Archivo Súper 8 de familias |

### 9.5 Variantes

| Variante | Tamaño en pantalla | Dónde | Detalle |
|---|---|---|---|
| `mini` | 56×75 px | Itinerario, "otras de la sección" | Sin niebla con filtro, sin grano, sin luces de horizonte |
| `tarjeta` | 72×96 px (móvil), 96×128 px (≥600) | Programa, ficha (funciones), destacados | Sin filtros; niebla con opacidad |
| `grande` | ancho 100 % hasta 360 px (móvil), 420 px (escritorio) | Cabecera de la ficha | Filtros, grano, animación A6 |
| `portada` | fila de 24 carteles `tarjeta` | Bloque "24 películas" de portada | Estático |

Accesibilidad: el `<svg>` lleva `aria-hidden="true"` y `focusable="false"` en todas las variantes (el título de la película está al lado). Con `prefers-reduced-motion`, A6 no corre.

---

## 10. Portada: la escena del faro

### 10.1 Primera pantalla (`components/portada/EscenaFaro.tsx`)
Sección de fondo `--noche`, altura `min(100svh, 900px)` y al menos 640 px. **Todo el contenido de E2-H1 CA1 y CA2 cabe en 360×640 sin scroll.**

Composición (de atrás hacia adelante):
1. Fondo `--noche` con degradado vertical a `--noche-2` en el tercio inferior.
2. **Faro** en SVG: silueta en el borde derecho (móvil: x = 82 % del ancho, alto 38 % de la escena; escritorio: x = 78 %, alto 55 %), con linterna ámbar.
3. **Haz** (A2): `div` absoluto centrado en la linterna, de 250vmax × 250vmax, `background: conic-gradient(from var(--angulo), transparent 0deg, rgb(242 163 58 / 0.20) 10deg, rgb(246 244 238 / 0.10) 22deg, transparent 34deg)`. El haz apunta hacia la izquierda y barre el título.
4. **Título** en tres líneas alineadas a la izquierda:
   - "Festival de Cine" (`--f-rotulo`, `--t-h2`, `--bruma`)
   - "NIEBLA" (`--t-hero`, color `--noche-2` con `-webkit-text-stroke: 1px var(--bruma)`: letras apenas visibles en la niebla)
   - copia exacta de "NIEBLA" superpuesta, color `--blanco-niebla`, con la máscara A3: solo se ve donde pasa el haz. Esta copia lleva `aria-hidden="true"`; el `<h1>` accesible es el texto completo "Festival de Cine Niebla".
5. **Datos** debajo del título: "3ª edición" (etiqueta ámbar con texto en tinta) · "15, 16 y 17 de octubre de 2026" (`--f-stencil`, `--t-h2`, `--blanco-niebla`) · "Puerto Bruma, Chile" (`--t-cuerpo`, `--bruma`). Las fechas se arman con `programa.dias`, no se escriben a mano.
6. **Acciones:** botón principal "Ver el programa" (fondo `--sec-competencia-luz`, texto `--tinta`, 52 px de alto, ancho completo en móvil) y enlace secundario "Mi itinerario" (texto `--blanco-niebla` subrayado).
7. **Niebla** (A1): 3 capas SVG a sangre sobre el tercio inferior y cruzando el título, `--blanco-niebla` con opacidades 0,06, 0,10 y 0,16.
8. Indicador de scroll al pie: línea vertical de 32 px con el texto "Bajar" (estático).

Sin JavaScript la escena se ve completa (animaciones CSS). `EscenaFaro` solo necesita `'use client'` para A4; aislar esa lógica en un subcomponente `SeguirPuntero` para que el resto sea Server Component.

### 10.2 Bloques siguientes (en orden, sobre `--papel` salvo que se indique)
1. **Qué es** (`QueEs`): 2–3 frases (texto en sección 13) + `Cifras`: "24 películas · 39 funciones · 4 salas · 3 días" con los números en `--t-display` stencil y la palabra en `--t-etiqueta`. Grilla 2×2 en móvil, 4 columnas en ≥600.
2. **Cuatro luces: las secciones** (`SeccionesPortada`, fondo `--noche`): 4 bloques, cada uno con una franja superior de 6 px en su `luz`, el nombre en `--f-stencil` `--t-h2` `--blanco-niebla`, la descripción del JSON en `--bruma`, "8 películas" en `--f-mono` y el enlace "Ver en el programa" → `/programa?seccion=<id>`. Debajo de cada bloque, 3 carteles `mini` de películas de la sección (las 3 primeras en orden alfabético). Una columna en móvil, 2×2 en ≥600, 4 en ≥1440.
3. **Tres días** (`TresDias`): 3 bandas horizontales. Cada una: número del día en `--t-display` stencil ("15"), nombre ("jueves"), "10 funciones · de 16:00 a 00:13 del viernes", notas del día (jueves: "19:30 Función inaugural: La hora azul del puerto"; sábado: "21:00 Entrega de premios antes de Transbordador de invierno") y enlace a `/programa?dia=<slug>`. El sábado lleva la etiqueta "El día fuerte" (dato del brief: 17 funciones).
4. **Salas** (`Salas`): 4 filas con nombre, dirección y, para Terraza Faro, ícono `luna` + "Al aire libre y gratis. Si llueve, se hace en el Galpón 7 a la misma hora." (texto de la nota del JSON). Debajo, **tabla de distancias a pie** de 4×4 (`<table>` con `<th scope>`), celdas con minutos en `--f-mono` y la diagonal con "—". Encabezado: "Todo queda cerca: entre 8 y 22 minutos a pie" (rango calculado). No se dibuja mapa (D9).
5. **Entradas** (`Entradas`): "Entrada general $4.000" · "Funciones al aire libre: gratis" · el texto de venta del JSON · "No hay venta en línea". Ícono `entrada`. Sin botones de compra.
6. **Para anotar** (`Destacados`): tarjetas con cartel `tarjeta` + día y hora + motivo del destacado, en este orden: función inaugural (`f05`), entrega de premios (`f36`), las 4 funciones con conversatorio, las 5 al aire libre. Título del bloque "Para anotar" (nunca "imperdibles" ni "lo mejor").
7. **Pie** (`Pie`, en layout, fondo `--noche`): marca, "Festival de Cine Niebla · 3ª edición · Puerto Bruma, Chile", correo (`mailto:`), Instagram (enlace), resumen de entradas en una línea y "Hecho en la costa, con fondos concursables y mucha ayuda de voluntarios." (del brief).

`CuentaRegresiva` (E8, Could) va en la primera pantalla, bajo las fechas, solo en el cliente tras montar.

---

## 11. Componentes

Contratos de props. Todos reciben objetos ya enriquecidos de `lib/programa.ts`; ningún componente lee el JSON ni recalcula horas por su cuenta.

### 11.1 Layout y UI

| Componente | Tipo | Props | Comportamiento clave |
|---|---|---|---|
| `Cabecera` | Client | — | Marca con enlace a `/`. En ≥1024: enlaces "Programa" y "Mi itinerario" (+ `ContadorItinerario`), `aria-current="page"` según `usePathname()` (`/pelicula/*` marca "Programa"; `/itinerario/*` marca "Mi itinerario"). Fondo `--noche` en `/` y `/pelicula/*`, `--papel` con línea inferior de tinta en el resto. |
| `NavInferior` | Client | — | Solo < 1024. `<nav aria-label="Principal">` con 3 enlaces de 64 px de alto (ícono + texto): "Inicio", "Programa", "Mi itinerario". Destino activo: barra superior de 3 px en tinta + texto 700 + `aria-current`. |
| `ContadorItinerario` | Client | — | Muestra la cantidad solo tras hidratar y si es > 0, en un círculo `--sec-competencia-luz` con texto en tinta; A8 al cambiar. Texto accesible dentro del enlace: "Mi itinerario, 3 funciones". |
| `Pie` | Server | — | Ver 10.2 punto 7. |
| `Anunciador` | Client | — | Provee `anunciar(mensaje: string)` por contexto. Renderiza un `<div role="status" aria-live="polite">` visualmente oculto. Para repetir el mismo mensaje, vaciar y reescribir en el cuadro siguiente. Montado una vez en el layout. |
| `Toast` | Client | `mensaje`, `accion?: { texto, alHacer }`, `duracionMs = 6000`, `alCerrar` | Fijo abajo (sobre `NavInferior` en móvil). Pausa el temporizador con foco o `hover`. Un solo toast a la vez. |
| `Etiqueta` | Server | `tono: SeccionId \| 'tope' \| 'noAlcanza' \| 'conversatorio' \| 'agotada' \| 'neutra'`, `icono?`, `children` | Rótulo `--t-etiqueta` sobre fondo `luz` con texto `--tinta` (o borde tinta y fondo transparente para `neutra`). |
| `Boton` | Server | `variante: 'principal' \| 'secundario' \| 'texto'`, `as?: 'button' \| 'a'`, resto de props nativas | Altura mínima 44 px. Siempre con texto visible. |
| `Icono` | Server | `nombre`, `tamano = 24` | Ver 7.5. |
| `Revelar` | Client | `children`, `retrasoMs?` | A5. |

### 11.2 Película y función

| Componente | Tipo | Props | Comportamiento clave |
|---|---|---|---|
| `Cartel` | Server-safe | `pelicula: Pelicula`, `variante: 'mini' \| 'tarjeta' \| 'grande'`, `idBase: string` | Sección 9. |
| `HorarioFuncion` | Server-safe | `funcion: Funcion`, `formato: 'compacto' \| 'completo'` | `<time dateTime="2026-10-16T23:30">` con la hora de inicio (`--t-hora`) y debajo "→ 01:15" + sufijo "del sábado" si cruza medianoche (`--t-chico`). `completo` antepone el día ("viernes 16"). El `dateTime` es el ISO de pared **sin zona** (tal como el JSON). |
| `MarcasFuncion` | Server-safe | `funcion`, `avisosPrevios?: Aviso[]` | En este orden: `Agotada` (sello), `Al aire libre · Gratis` (ícono luna), `Conversatorio 25 min` (ícono), nota (texto en cursiva, ícono ninguno). Si hay `avisosPrevios` (E3-H7): una línea `--t-chico` en `--tope-tinta` o `--no-alcanza-tinta`, con ícono: "Se topa con Vidrio (20:00, Galpón 7)" o "No alcanzas a llegar desde El último astillero". Máximo 2 líneas; si hay más: "+2 choques más". |
| `BotonItinerario` | Client | `funcion: Funcion`, `variante: 'tarjeta' \| 'ancho'` | `<button aria-pressed>`. Texto visible: "Quiero ir" (con `mas`) / "Voy" (con `check`). `aria-label`: "Agregar a mi itinerario: Marea roja, viernes 16 a las 23:30" / "Quitar de mi itinerario: …". Al alternar llama `alternar(id)` y `anunciar("Agregaste Marea roja, viernes 23:30, a tu itinerario")`; si al agregar aparecen topes o no alcanza, el anuncio agrega ". Se topa con Las cintas del faro". Estados de hidratación en 6. A7. |
| `TarjetaFuncion` | Server-safe (con `BotonItinerario` cliente dentro) | `funcion`, `avisosPrevios?`, `mostrarDia?: boolean`, `enlazarPelicula = true`, `seleccionada?: boolean` | Ver 12.E3-H1 para la grilla. `<article aria-labelledby>`; título en `<h3>` con `<Link href="/pelicula/<id>">`. |

### 11.3 Programa, ficha, itinerario, portada

| Componente | Tipo | Props |
|---|---|---|
| `ProgramaCliente` | Client | `funciones: Funcion[]` (serializable), `dias`, `secciones`. Lee filtros con `useSearchParams`, lee `useItinerario`, calcula lista filtrada y `avisosPrevios`. |
| `FiltrosPrograma` | Client | `filtros`, `dias`, `secciones`, `total: number`, `alCambiar(f: FiltrosPrograma)` |
| `ListaProgramaDias` | Server-safe | `funciones`, `dias`, `avisosPorFuncion?`, `seleccion?: string[]` — agrupa por día, renderiza encabezados y tarjetas. Se usa también como `fallback` del `Suspense` (sin filtros ni avisos). |
| `DatosPelicula` | Server | `pelicula`, `seccion` |
| `FuncionesPelicula` | Server | `funciones: Funcion[]` |
| `VolverAlPrograma` | Client | — (lee `sessionStorage['niebla:programa:filtros']`) |
| `OtrasDeLaSeccion` | Server | `pelicula`, `peliculas: Pelicula[]` |
| `MiItinerario` | Client | — |
| `VistaItinerario` | Client | `resultado: ResultadoItinerario`, `modo: 'propio' \| 'compartido'`, `alQuitar?(id)` |
| `DiaItinerario` | Client | `dia`, `funciones`, `tramos`, `avisosPorFuncion`, `modo`, `alQuitar?` |
| `ItemItinerario` | Client | `funcion`, `avisos: Aviso[]`, `modo`, `alQuitar?` |
| `Tramo` | Server-safe | `tramo: Tramo`, `desde: Funcion`, `hasta: Funcion` |
| `ResumenAvisos` | Client | `resultado`, `modo` |
| `CompartirItinerario` | Client | `ids: string[]` |
| `ItinerarioCompartido` | Client | — (usa `useSearchParams`; va dentro de `Suspense`) |
| `CopiarItinerario` | Client | `idsCompartidos: string[]` |
| `AvisoAlmacenamiento` | Client | — (visible si `persistente === false`) |
| `EscenaFaro`, `QueEs`, `Cifras`, `SeccionesPortada`, `TresDias`, `Salas`, `Entradas`, `Destacados` | Server (salvo `SeguirPuntero`) | Reciben los derivados de `lib/destacados.ts` |

**Serialización a Client Components:** `Funcion` contiene objetos planos (sin funciones ni `Date`), así que se puede pasar como prop. Para no duplicar datos, `ProgramaCliente` recibe `funciones` y reconstruye mapas por id con `useMemo`. Las reglas del itinerario en el cliente usan `programa` importado directamente (`@/lib/programa`): es un módulo puro y el JSON es chico (17 KB); no hay problema en incluirlo en el bundle del cliente.

---

## 12. Detalle por historia

Formato: **Archivos** · **Implementación** · **Casos límite** · **Verificación**. Los criterios de aceptación completos están en el backlog; aquí no se repiten salvo cuando hace falta precisarlos.

### E0. Base transversal

#### E0-H1. Español y sin restos de plantilla
- **Archivos:** `app/layout.tsx`, `app/icon.svg`, borrados de 2.3, `generateMetadata` en `app/pelicula/[id]/page.tsx`, `metadata` en cada `page.tsx`.
- **Implementación:**
  - `<html lang="es">` con las 4 variables de fuente.
  - En el layout: `metadata = { title: { default: 'Festival de Cine Niebla · 15 al 17 de octubre de 2026', template: '%s · Festival de Cine Niebla' }, description: 'Tercera edición del Festival de Cine Niebla en Puerto Bruma, Chile: 24 películas y 39 funciones en 4 salas, del jueves 15 al sábado 17 de octubre de 2026.', openGraph: { title, description, locale: 'es_CL', type: 'website', siteName: 'Festival de Cine Niebla' } }`. No usar `metadataBase` ni imágenes OG (no hay dominio conocido; una ruta relativa sin `metadataBase` rompe el build).
  - Títulos por página: Programa → `'Programa'`; Mi itinerario → `'Mi itinerario'`; Compartido → `'Itinerario compartido'`; ficha → título de la película; 404 → `'Página no encontrada'`.
  - `viewport` exportado en el layout: `{ themeColor: '#0B1116', viewportFit: 'cover' }`.
- **Casos límite:** los textos de `aria-label`, `title` y los mensajes del `Anunciador` también en español (usar sección 13).
- **Verificación:** `grep -ri "create next app\|vercel\|next.js logo" app components` sin resultados; test automático de emojis (14.1 T-CONT-1); ver pestaña y vista previa de un link en un chat.

#### E0-H2. Datos fieles
- **Archivos:** `lib/programa.ts`, `lib/destacados.ts`, test `lib/programa.test.ts`.
- **Implementación:** toda cifra, fecha, nombre de sala, precio y texto de venta se obtiene de `programa`. Los únicos textos editoriales permitidos son los de la sección 13, que salen del brief.
- **Casos límite:** no escribir "24 películas" a mano en JSX (usar `cifras()`); no mostrar capacidad de salas como aforo "disponible".
- **Verificación:** `git diff --exit-code -- data/programa.json` sin diferencias; tests de conteos de la sección 5 del backlog; revisión con la lista 14.3.

#### E0-H3. Horas correctas en cualquier dispositivo
- **Archivos:** `lib/tiempo.ts`, `HorarioFuncion`.
- **Implementación:** 5.1. Ningún `Date` local para horas del programa.
- **Casos límite:** los 5 cruces de medianoche; `f39` termina el domingo (el sufijo dice "del domingo", aunque el festival termina el sábado).
- **Verificación:** tests de 5.1; `TZ=Asia/Tokyo npm run build && npm start` y, en Chrome DevTools > Sensors, zona horaria `Europe/Madrid`: las horas de programa, ficha e itinerario son idénticas a las de 8.1 del backlog y no hay errores de hidratación en consola.

#### E0-H4. 360 px a escritorio
- **Archivos:** todos los `.module.css`, `globals.css`.
- **Implementación:** diseño móvil primero; `min-width: 0` en hijos de grillas; `overflow-wrap: anywhere` en títulos y direcciones; la tabla de distancias va dentro de un contenedor con `overflow-x: auto` solo si no cabe (a 360 px cabe con celdas de 56 px y encabezados cortos). `html, body { overflow-x: clip }` **no** se usa para esconder desbordes: se corrigen.
- **Casos límite:** títulos largos ("Transbordador de invierno", "Cortos II: Noches de puerto"), direcciones ("Plaza Aníbal Pinto 120"), el nombre de sala más largo ("Teatro Municipal de Puerto Bruma"), 3 marcas a la vez (`f31`: agotada + conversatorio).
- **Verificación:** DevTools en 360, 390, 768, 1024 y 1440 en las 5 rutas; en consola `document.documentElement.scrollWidth <= innerWidth` → `true`.

#### E0-H5. Movimiento reducido
- **Implementación:** 8.4.
- **Verificación:** DevTools > Rendering > Emulate CSS `prefers-reduced-motion: reduce`, recargar: portada quieta con el título parcialmente iluminado; botones cambian sin rebote; nada se mueve solo durante 30 s de observación.

#### E0-H6. Accesibilidad
- **Implementación:**
  - Enlace "Saltar al contenido" como primer elemento del `body` (visible al recibir foco) → `<main id="contenido">`.
  - Un `<h1>` por página; tarjetas con `<h3>` bajo encabezados de día `<h2>`.
  - Filtros: día como grupo de botones `aria-pressed` dentro de `<fieldset>` con `<legend>` "Día" (visualmente oculto si hace falta); sección igual con `<legend>` "Sección".
  - `BotonItinerario`, `Anunciador`, iconos `aria-hidden`, marcas con texto: ver 11.
  - Avisos del itinerario: cada aviso es texto con prefijo visible ("Se topa:", "No alcanzas:", "Conversatorio:") y el resumen es un `<h2>`.
  - Tabla de distancias con `<caption>`.
- **Verificación:** recorrido completo solo con teclado (agregar 3 funciones desde programa, abrir itinerario, quitar una, deshacer, copiar link); Lighthouse Accesibilidad ≥ 95; NVDA o VoiceOver: el botón anuncia película, día, hora y estado.

#### E0-H7. Rendimiento (Should)
- **Implementación:** páginas estáticas; 2 fuentes precargadas; carteles SVG en línea sin filtros salvo `grande`; A1 y A2 solo con `transform`; `content-visibility: auto` y `contain-intrinsic-size: auto 180px` en tarjetas de funciones del programa.
- **Verificación:** `npm run build && npm start`, Lighthouse móvil en `/`, `/programa`, `/pelicula/vidrio`, `/itinerario`: Performance ≥ 90, Accessibility ≥ 95.

#### E0-H8. 404 (Should)
- **Archivos:** `app/not-found.tsx`; `dynamicParams = false` y `notFound()` de respaldo en la ficha si `peliculaPorId` devuelve `undefined`.
- **Implementación:** fondo `--noche`, niebla quieta, título "Esta página se perdió en la niebla", texto "Puede que el link esté incompleto o que la dirección tenga un error.", botones "Ver el programa" y "Ir al inicio".
- **Verificación:** `/pelicula/no-existe` y `/cualquier-cosa` muestran la página con estado 404 en `npm start`.

### E1. Identidad visual

#### E1-H1. Identidad propia y consistente
- **Archivos:** `app/globals.css` (tokens de 7.2 a 7.4 y 8.2), `app/fuentes.ts`, `Etiqueta`, `Icono`.
- **Implementación:** secciones 7 y 8. Clase utilitaria global `.luz-<seccion>` que define `--luz` y `--luz-tinta` para que los componentes usen `var(--luz)` sin condicionales. En tarjetas del programa, la sección se ve como: franja vertical de 4 px en `--luz` a la izquierda + `Etiqueta` con el nombre corto.
- **Verificación:** captura de las 5 rutas a 390 px lado a lado: misma familia tipográfica, mismos rótulos y colores por sección; la fuente del `body` es Atkinson Hyperlegible Next (DevTools > Computed > Rendered fonts), no Geist ni Arial.

#### E1-H2. Cartel de cada película
- **Archivos:** `lib/cartel.ts`, `lib/cartel.test.ts`, `components/cartel/*`.
- **Implementación:** sección 9.
- **Casos límite:** dos tarjetas de la misma película en la misma página (ids SVG distintos gracias a `idBase`); títulos con coma; película sin motivo en el mapa (test que falla).
- **Verificación:** tests 14.1 (determinismo: dos llamadas dan parámetros idénticos; las 24 tienen motivo distinto; N de bandas: *Bruma, 1987* 3 y *Vidrio* 7); página de revisión manual: abrir las 24 fichas; no hay IDs duplicados (`document.querySelectorAll('[id]')` sin repetidos en `/programa`).

#### E1-H3. Movimiento con intención (Should)
- **Implementación:** catálogo 8.3 (A7 a A12).
- **Verificación:** en DevTools > Performance, alternar un botón: primer cambio visual en < 100 ms; se puede seguir desplazando mientras corre A7.

### E2. Portada

#### E2-H1. Entender el festival en un vistazo
- **Archivos:** `app/page.tsx`, `app/portada.module.css`, `EscenaFaro`, `QueEs`, `Cifras`.
- **Implementación:** 10.1 y 10.2 punto 1.
- **Casos límite:** a 360×640 el bloque de datos + botón debe caber: si la altura es < 700 px, `--t-hero` baja a `clamp(4rem, 20vw, …)` y el faro se reduce al 30 % del alto; probar también 320×568 (no exigido, pero no debe romperse). La barra inferior de navegación ocupa 64 px: contarla.
- **Verificación:** DevTools 360×640: sin scroll se ven nombre, "3ª edición", fechas, "Puerto Bruma" y "Ver el programa".

#### E2-H2. Secciones
- **Archivos:** `SeccionesPortada`.
- **Verificación:** 4 bloques con los textos exactos del JSON; conteos 8, 6, 5, 5; cada enlace abre el programa filtrado (E3-H6).

#### E2-H3. Salas
- **Archivos:** `Salas`.
- **Casos límite:** la tabla se lee con lector de pantalla ("Desde Teatro Municipal, hasta El Muelle: 12 minutos"): usar `<th scope="row">` y `<th scope="col">` con nombres cortos y `abbr` con los nombres largos.
- **Verificación:** 16 celdas coinciden con `trasladosMin`; nota de la Terraza Faro visible.

#### E2-H4. Entradas
- **Archivos:** `Entradas`, también resumen en `Pie`.
- **Verificación:** textos de 10.2 punto 5 con `precio()`; ningún botón con "comprar", "reservar" ni "entradas online".

#### E2-H5. Destacados (Should)
- **Archivos:** `Destacados`, `lib/destacados.ts`.
- **Verificación:** 11 tarjetas (2 notas, 4 conversatorios, 5 aire libre) con enlace a su ficha; `f31` aparece como conversatorio y marcada agotada.

#### E2-H6. Contacto (Should)
- **Archivos:** `Pie`.
- **Implementación:** `<a href="mailto:hola@festivalniebla.cl">` y `<a href={instagramUrl(...)} rel="noopener noreferrer">` (sin `target="_blank"`, para no sacar a la persona del sitio en el navegador interno de las apps).
- **Verificación:** ambos enlaces abren lo esperado en un celular.

#### E2-H7. Acceso a Mi itinerario
- **Archivos:** `EscenaFaro` (enlace secundario), `NavInferior`, `Cabecera`, `ContadorItinerario`.
- **Verificación:** agregar 2 funciones en `/programa`, volver a `/`: el contador muestra 2 en la navegación.

### E3. Programa

#### E3-H1. Ver todas las funciones
- **Archivos:** `app/programa/page.tsx`, `ProgramaCliente`, `ListaProgramaDias`, `TarjetaFuncion`, `HorarioFuncion`, `MarcasFuncion`.
- **Implementación:**
  - `page.tsx` (Server): `<h1>Programa</h1>`, intro corta, y `<Suspense fallback={<ListaProgramaDias funciones={programa.funciones} dias=… />}><ProgramaCliente … /></Suspense>`. Así el HTML inicial ya trae las 39 funciones (bueno para rendimiento y sin JS).
  - Encabezado de día (`<h2>`): número en stencil ("16") + "viernes" + "12 funciones" (del filtro actual). `position: sticky; top: 0` (debajo de la cabecera en ≥1024), fondo `--papel` con línea inferior de tinta, 48 px de alto.
  - **Tarjeta en móvil** (grilla `grid-template-columns: 4.25rem 1fr 4.5rem`, gap 12 px, padding 12 px, borde inferior de 1,5 px en tinta al 20 %):
    - Col. 1: `HorarioFuncion compacto` (inicio grande y "→ fin" debajo).
    - Col. 2: `Etiqueta` de sección (nombre corto) · título `<h3>` enlazado · sala (`nombreCortoSala`, `--tinta-2`) · `MarcasFuncion`.
    - Col. 3: `Cartel tarjeta` (72×96) y debajo `BotonItinerario variante="tarjeta"` (72 px de ancho, 44 de alto).
    - Franja de 4 px de `--luz` de la sección en el borde izquierdo.
    - Seleccionada: fondo `--papel-2` y el botón en estado "Voy".
    - Agotada: título con `--tinta-2` y sello; no se atenúa lo suficiente para bajar el contraste.
  - **≥ 1024:** filtros en columna izquierda fija de 280 px (`position: sticky`); lista en 2 columnas de tarjetas por día; la tarjeta crece a `5rem 1fr 6rem` con cartel 96×128.
  - Orden según D7 (ya viene de `programa.funciones`).
- **Casos límite:** una función que empieza justo cuando termina otra (`f14` termina 20:05, `f16` empieza 20:05) va después por hora de inicio; dos funciones a la misma hora no existen hoy, pero el orden por nombre de sala lo resuelve; el encabezado de día sigue mostrando el conteo del filtro actual (ej.: viernes + Nocturna → "3 funciones").
- **Verificación:** contar 39 tarjetas (`document.querySelectorAll('article').length`); `f22` en viernes con "→ 01:15 del sábado"; marcas de 5 aire libre, 4 conversatorios, 2 agotadas, 2 notas.

#### E3-H2 y E3-H3. Filtros por día y sección
- **Archivos:** `FiltrosPrograma`, `lib/filtros.ts`.
- **Implementación:**
  - **Día:** control segmentado de 4 botones iguales a lo ancho ("Todos", "Jue 15", "Vie 16", "Sáb 17"), 48 px de alto, borde tinta, activo con fondo `--tinta` y texto `--papel` (A9). `aria-pressed`.
  - **Sección:** 5 botones que envuelven en 2 filas a 360 px ("Todas" + 4 nombres cortos), cada uno con un punto de 10 px en su `luz` antes del texto; activo con fondo de su `luz` y borde tinta de 2 px, más ícono `check`. `aria-label` con el nombre completo.
  - Debajo: "Mostrando 3 funciones" (`aria-live="polite"` en ese texto) y, si hay algún filtro, botón texto "Quitar filtros".
  - Los filtros **no** son pegajosos en móvil (ocupan ~140 px); los encabezados de día sí.
- **Verificación:** conteos de 5.4.

#### E3-H4. Combinar filtros
- **Implementación:** `alCambiar` calcula el nuevo `FiltrosPrograma`, llama `window.history.replaceState(null, '', '/programa' + escribirFiltros(f))` y guarda el mismo string en `sessionStorage['niebla:programa:filtros']` (con `try/catch`). La lista se deriva de `useSearchParams()`, que se actualiza con `replaceState` (sección 1, punto 3). Elegir de nuevo el filtro activo lo deja en "Todos/Todas".
- **Casos límite:** estado vacío (no ocurre con los datos, pero se implementa): "No hay funciones con estos filtros." + "Quitar filtros". Al cambiar filtro, si el primer resultado queda fuera de la pantalla, no desplazar automáticamente (evita saltos al usar con una mano).
- **Verificación:** `viernes`+`nocturna` → f19, f21, f22; recargar mantiene; marcar una función y cambiar filtros no la desmarca.

#### E3-H5. Agregar y quitar desde el programa
- **Archivos:** `BotonItinerario`, `useItinerario`.
- **Verificación:** agregar `f05`, recargar: sigue marcada; el contador suma; con teclado, `Enter` y `Espacio` alternan.

#### E3-H6. Filtros en la URL (Should)
- **Implementación:** E3-H4 (`replaceState`: el botón atrás sale del programa en un paso). Entrada desde la portada con `<Link href="/programa?seccion=nocturna">`.
- **Casos límite:** `?dia=Viernes`, `?seccion=xyz`, `?dia=` → se ignoran (5.4) y además se reescribe la URL limpia con `replaceState` al montar.
- **Verificación:** abrir `/programa?dia=sabado&seccion=competencia` en ventana privada → 8 funciones.

#### E3-H7. Anticipar topes (Should)
- **Implementación:** `avisosAlAgregar` (5.5) → `MarcasFuncion avisosPrevios`. Solo para funciones no elegidas y solo `tope`/`noAlcanza`. Nombre de la otra función: título + hora + sala corta.
- **Verificación:** con {`f05`}: jueves muestra "Se topa" en f04, f06, f07, f08 y "No alcanzas" en f03; ninguna en f01, f02, f09, f10. Con {`f13`}: f16 **no** muestra nada (el conversatorio no se previsualiza como choque).

#### E3-H8. Navegación
- **Archivos:** `Cabecera`, `NavInferior`, `app/layout.tsx`.
- **Verificación:** 360 px: la barra inferior no tapa la última tarjeta (padding del `body`); `aria-current` correcto en las 5 rutas.

#### E3-H9. Lo que viene durante el festival (Could)
- **Implementación:** en `ProgramaCliente`, tras montar: `ahora = ahoraEnChile()`. Si la fecha de `ahora` es un día del festival y **no** hay `dia` en la URL, aplicar ese día (con `replaceState`) y mostrar un aviso "Hoy es viernes 16. Ver todos los días". Las funciones con `fin < ahora` llevan `data-pasada` (opacidad 0,55 del cartel y la hora tachada con una línea; título sin atenuar) y quedan en su lugar. Recalcular cada 60 s con `setInterval`.
- **Casos límite:** entre 00:00 y 02:00 del 16 o 17, el "hoy" para el público todavía es la noche anterior: si `ahora` es antes de las 04:00, usar el día anterior. El 18 antes de las 04:00 cuenta como sábado.
- **Verificación:** exponer en desarrollo un parámetro `?ahora=2026-10-16T21:00` (solo cuando `process.env.NODE_ENV !== 'production'`) que reemplaza `ahoraEnChile()`.

### E4. Ficha de película

#### E4-H1. Datos
- **Archivos:** `app/pelicula/[id]/page.tsx`, `pelicula.module.css`, `DatosPelicula`.
- **Implementación:**
  - `export function generateStaticParams() { return programa.peliculas.map(p => ({ id: p.id })) }`, `export const dynamicParams = false`, `generateMetadata` con `title: pelicula.titulo` y `description: pelicula.sinopsis`.
  - Cabecera sobre `--noche`: `Cartel grande` (móvil arriba a ancho completo con margen; ≥1024 a la izquierda), `Etiqueta` de sección, `<h1>` título en `--blanco-niebla`, título original en cursiva `--bruma` precedido de "Título original:" (visualmente "*Vinterferja*"), línea "Dirección: Signe Holm".
  - Bloque de datos sobre `--papel` como lista de definiciones `<dl>` en grilla de 2 columnas: País · Año · Duración (`98 min`) · Clasificación (larga) · Estreno · Sección (enlace `/programa?seccion=…`).
  - Sinopsis en `--t-cuerpo` a 1,125 rem, ancho máximo 60 caracteres.
- **Verificación:** criterios CA4 y CA5 del backlog.

#### E4-H2. Funciones
- **Archivos:** `FuncionesPelicula`.
- **Implementación:** título "Funciones" (o "Función" si hay una). Cada función es una tarjeta ancha: `HorarioFuncion completo`, sala (nombre completo) y dirección con ícono `ubicacion`, precio ("$4.000" o "Gratis"), `MarcasFuncion` (incluye la nota de lluvia completa si es Terraza Faro) y `BotonItinerario variante="ancho"`. Sin cartel (ya está arriba).
- **Verificación:** CA5 y CA6 del backlog; una película con una función (`mar-negro`) muestra el singular.

#### E4-H3. Dirección propia
- **Archivos:** `VolverAlPrograma`.
- **Implementación:** enlace "Volver al programa" arriba de la cabecera; `href` = `/programa` + valor de `sessionStorage['niebla:programa:filtros']` leído tras montar (antes de montar, `/programa`).
- **Verificación:** `npm run build` lista `/pelicula/[id]` con 24 rutas prerenderizadas; filtrar por sábado, abrir una ficha, volver: sigue en sábado.

#### E4-H4. Otras de la sección (Could)
- **Archivos:** `OtrasDeLaSeccion`.
- **Implementación:** título "Más de Bruma Nocturna"; lista horizontal que envuelve con `Cartel mini` + título, en orden alfabético, excluyendo la actual.
- **Verificación:** en *Marea roja* aparecen las otras 4 películas de Bruma Nocturna.

### E5. Mi itinerario: armar y guardar

#### E5-H1. Ver mi itinerario
- **Archivos:** `app/itinerario/page.tsx`, `itinerario.module.css`, `MiItinerario`, `VistaItinerario`, `DiaItinerario`, `ItemItinerario`, `Tramo`, `ResumenAvisos`.
- **Implementación:**
  - `page.tsx` (Server): `<h1>Mi itinerario</h1>` y `<MiItinerario />`. No usa `useSearchParams`: no necesita `Suspense`.
  - `MiItinerario`: `useItinerario()` → `evaluarItinerario(ids, programa)` con `useMemo` → `VistaItinerario modo="propio"`.
  - **Encabezado:** `ResumenAvisos` (E6-H5) + acciones "Compartir" y "Vaciar".
  - **Por día** (`DiaItinerario`, solo días con funciones): `<h2>` con número stencil + "sábado 17" + "4 funciones".
  - **Recorrido:** columna con una **línea vertical de pasos** a la izquierda (SVG de 2 px con guiones de 4/6 en `--tinta` al 40 %) que une los puntos de cada función (círculo de 14 px con borde tinta y relleno `--luz` de su sección).
  - **`ItemItinerario`:** grilla `4.25rem 1fr 3.5rem`: `HorarioFuncion compacto` · título enlazado, sala + dirección, `MarcasFuncion`, avisos de la función que no están en un tramo (por ejemplo, el par no consecutivo f13→f17) · `Cartel mini` y botón "Quitar" (ícono `quitar`, 44×44, `aria-label` "Quitar Sal de roca, viernes 18:00") en modo propio.
  - **`Tramo`** entre dos ítems del mismo día: franja de 40–56 px sobre la línea de pasos, con ícono `pasos` y el texto:
    - misma sala sin aviso: "Misma sala · tienes 11 min";
    - otra sala sin aviso: "A pie 12 min · tienes 17 min" (`--f-mono` para números);
    - `noAlcanza`: línea en zigzag `--no-alcanza-tinta`, `Etiqueta` "No alcanzas" y "Terminas 19:24 en Galpón 7. La siguiente empieza 19:30 en el Teatro Municipal. Tienes 6 min y a pie son 8.";
    - `tope`: línea cortada, `Etiqueta` "Se topan" y "Vidrio empieza a las 20:00, antes de que termine La hora azul del puerto (21:08). Se pisan 68 min.";
    - `conversatorio`: línea punteada `--conversatorio-tinta`, `Etiqueta` "Conversatorio" y "Después de Sal de roca hay conversatorio de 25 min. Para llegar a tiempo tienes que salir a las 19:53, así que te lo perderías."; si `minutosDeConversatorio > 0`: "…alcanzas a quedarte 1 min.".
  - Las funciones que se topan no se dibujan superpuestas: siguen en lista; el tramo con "Se topan" lo deja claro.
- **Casos límite:** itinerario de un solo ítem (sin tramos); funciones de días distintos (sin tramo entre días); función que cruza medianoche seguida por otra del día siguiente (sin tramo; distinto día de inicio); los 39 elegidos (debe seguir siendo usable y sin cálculos lentos).
- **Verificación:** caso 8.6 del backlog en pantalla; 360 px sin scroll horizontal; los datos de tramos coinciden con 14.1.

#### E5-H2. Estado vacío
- **Implementación:** tras hidratar y con `ids.length === 0`: faro pequeño en SVG con haz quieto, título "Tu recorrido está en blanco", texto de 13.3 y botón "Ver el programa".
- **Verificación:** borrar `localStorage` y abrir `/itinerario`.

#### E5-H3. Guardado local
- **Archivos:** `lib/itinerario-store.ts`, `AvisoAlmacenamiento`.
- **Implementación:** 6. Nota fija bajo el resumen, `--t-chico`: "Se guarda solo en este navegador. Para verlo en otro teléfono, compártelo con un link." Si `persistente === false`, en su lugar: "Este navegador no deja guardar datos (quizás estás en modo privado). Tu itinerario se perderá al cerrar la pestaña: compártelo con un link para no perderlo."
- **Casos límite:** `localStorage` con `{"v":1,"ids":["f05","f99",5,"f05"]}` → queda `["f05"]`; valor `"hola"` → vacío sin error; Safari modo privado.
- **Verificación:** tests de `itinerario-store.test.ts` con un `localStorage` simulado (objeto con `getItem/setItem/removeItem`, inyectable por parámetro en una función `crearTienda(almacen)`; la tienda del sitio es `crearTienda(globalThis.localStorage)` protegida con `try/catch`); manual: recargar, cerrar y abrir.

#### E5-H4. Quitar, deshacer y vaciar
- **Implementación:** "Quitar" → A11 → `quitar(id)` → `Toast` "Quitaste Vidrio" con acción "Deshacer" → `anunciar`. "Vaciar itinerario" (botón texto) → `<dialog>` nativo modal con `showModal()`: "¿Vaciar tu itinerario? Se quitarán las 5 funciones." botones "Vaciar" y "Cancelar" (foco inicial en "Cancelar"; `Esc` cancela).
- **Verificación:** quitar y deshacer deja el mismo conjunto y los mismos avisos.

#### E5-H5. Sincronía entre pestañas (Could)
- **Implementación:** evento `storage` en `suscribir` (6).
- **Verificación:** dos pestañas; agregar en una, la otra se actualiza sin recargar.

#### E5-H6. Costo estimado (Could)
- **Implementación:** en `ResumenAvisos`: "Entradas: $8.000 · se pagan en la boletería de cada sala, desde una hora antes." Suma de `funcion.precio`. Si todo es gratis: "Entradas: gratis".
- **Verificación:** {f05, f07, f13} → $8.000; caso 8.6 → $28.000.

#### E5-H7. Próxima función (Could)
- **Implementación:** tras montar, `ahoraEnChile()` cada 60 s. Primera función elegida con `inicio > ahora` (o en curso: `inicio ≤ ahora < fin`, "En curso") se destaca arriba: "Tu próxima función: Ahogados · Galpón 7, Pasaje Los Estibadores 7 · empieza en 35 min". Funciones con `fin < ahora` con `data-pasada` (como E3-H9). Mismo parámetro de desarrollo `?ahora=`.
- **Verificación:** `?ahora=2026-10-17T19:00` con el itinerario 8.6.

### E6. Avisos

#### E6-H1 a E6-H3. Tope, no alcanza, conversatorio
- **Archivos:** `lib/reglas-itinerario.ts` (+ test), `Tramo`, `ItemItinerario`, `ResumenAvisos`.
- **Implementación:** 5.5 y textos de 13.4. Un aviso aparece en el tramo cuando el par es consecutivo; si no, en ambas tarjetas ("Se topa con …"). Los avisos de problema llevan `Etiqueta` de estado y rayado/zigzag; los de conversatorio van con borde punteado y nunca con la palabra "choque".
- **Casos límite:** tres funciones que se topan entre sí (T5): tres avisos, tramos con "Se topan" entre consecutivas y, en f05, "Se topa también con Los que cuidan el faro (21:00)"; `f31` con agotada + conversatorio a la vez; margen igual a traslado (no hay casos exactos en datos: cubrir con test sintético, 14.1 S1); el par con `solapeMin` de 1 minuto (T2) debe decir "Se pisan 1 min".
- **Verificación:** todos los casos de la sección 8 del backlog y 14.1.

#### E6-H4. Informativos (Should)
- **Implementación:** `agotada`: sello en la tarjeta + línea "Agotada: no quedan entradas para esta función."; aire libre: marca + nota de lluvia completa; `peliculaRepetida`: en ambas tarjetas, "Ya tienes otra función de esta película (sábado 13:00)."
- **Verificación:** {f01, f25} muestra película repetida y `problemas` = 0.

#### E6-H5. Resumen (Should)
- **Implementación:** bloque arriba del itinerario:
  - 0 problemas: ícono `check` + "Todo calza: 5 funciones sin topes y con tiempo para caminar." (si hay avisos de conversatorio: "+ 1 aviso de conversatorio").
  - con problemas: `<h2>` "2 problemas en tu recorrido" + lista de enlaces a cada aviso (`href="#aviso-<a>-<b>"`; cada tramo o aviso tiene ese `id`); al saltar, el destino recibe foco (`tabIndex={-1}`).
- **Verificación:** 8.6 → "1 problema"; C1 → "Todo calza" + "1 aviso de conversatorio".

#### E6-H6. Plan de lluvia (Could)
- **Implementación:** `evaluarItinerario(ids, programa, { lluvia: true })`; en tramos con Terraza Faro, línea adicional `--t-chico` con ícono `lluvia`: "Si llueve y se hace en el Galpón 7: a pie serían 15 min, no alcanzarías." o "…igual alcanzas." Solo si el resultado cambia respecto de lo normal.
- **Verificación:** {f14, f17} → aparece "no alcanzarías"; {f16, f19} (sin terraza) → no aparece nada.

### E7. Compartir

#### E7-H1. Compartir con un link
- **Archivos:** `CompartirItinerario`, `lib/enlace-itinerario.ts`.
- **Implementación:**
  - Botón "Compartir mi itinerario" (deshabilitado con texto de ayuda "Agrega funciones para poder compartir" si está vacío).
  - Al tocar: `url = location.origin + codificarEnlace(ids, nombre)`. Si existe `navigator.share` y `navigator.canShare?.({ url })`: `navigator.share({ title: 'Mi itinerario · Festival de Cine Niebla', text: 'Estas son las funciones a las que voy en el Festival de Cine Niebla:', url })`; si la persona cancela (`AbortError`), no mostrar error. Si no hay `share` o falla de otra forma: `navigator.clipboard.writeText(url)`; si también falla, mostrar un `<input readonly>` con el link seleccionado y el texto "Copia este link".
  - Siempre visible también un botón secundario "Copiar link" (en escritorio es el principal).
  - Confirmación: `Toast` "Link copiado" + `anunciar`.
  - Metadatos de `/itinerario/compartido`: `title: 'Itinerario compartido'`, `description: 'Mira a qué funciones del Festival de Cine Niebla va esta persona y copia el itinerario al tuyo.'`.
- **Casos límite:** navegador interno de WhatsApp/Instagram (a veces sin `clipboard`: el `<input>` de respaldo lo resuelve); link con nombre con tildes (`encodeURIComponent`).
- **Verificación:** test de longitud con 39 funciones (≤ 300 con un origen de 40 caracteres); en un celular, compartir por WhatsApp y abrir desde otro teléfono.

#### E7-H2. Ver un itinerario compartido
- **Archivos:** `app/itinerario/compartido/page.tsx`, `ItinerarioCompartido`.
- **Implementación:** `page.tsx` (Server) con `<Suspense fallback={<EsqueletoItinerario />}><ItinerarioCompartido /></Suspense>` (**obligatorio**, sección 1 punto 2). `ItinerarioCompartido`: `decodificarEnlace(useSearchParams())` → `evaluarItinerario(ids)` → encabezado sobre `--noche` con `<h1>` "Itinerario compartido" o "El itinerario de {nombre}", texto "Alguien te compartió las funciones a las que va. No cambia tu itinerario a menos que lo copies." y `CopiarItinerario` arriba y abajo; luego `VistaItinerario modo="compartido"` (sin botones de quitar, pero con enlaces a fichas y todos los avisos).
- **Casos límite:** mismo enlace abierto por quien lo creó (se muestra igual, con el aviso "Ya tienes todas estas funciones" si coincide).
- **Verificación:** abrir el link en ventana privada: mismas funciones y avisos que el original; `localStorage` sin cambios tras abrirlo.

#### E7-H3. Copiar al mío
- **Archivos:** `CopiarItinerario`.
- **Implementación:** con `propios = useItinerario().ids` y `compartidos`:
  - `compartidos ⊆ propios` → texto "Ya tienes todas estas funciones en tu itinerario." + enlace "Ver mi itinerario".
  - `propios` vacío → botón "Copiar a mi itinerario" → `reemplazar(compartidos)` → `Toast` "Copiado. Ya está en tu itinerario." con acción "Ver" → `/itinerario`.
  - si no → dos botones: "Agregar a mi itinerario" (`unir`) y "Reemplazar mi itinerario" (abre `<dialog>`: "¿Reemplazar tu itinerario? Tus 3 funciones se cambiarán por las 5 de este link." "Reemplazar" / "Cancelar") y una línea que informa cuántas son nuevas: "3 de estas funciones no están en tu itinerario."
- **Verificación:** CA6 del backlog.

#### E7-H4. Links dañados
- **Implementación:** `malFormado` → bloque con título "Este link no trae un itinerario", texto "Puede que se haya cortado al copiarlo. Pide que te lo manden de nuevo." y botones "Ver el programa" / "Mi itinerario". `invalidos > 0` con ids válidos → aviso arriba "Algunas funciones del link no se pudieron cargar (2)." y el resto normal.
- **Verificación:** `/itinerario/compartido`, `?f=`, `?f=abc`, `?f=05-99`, `?f=05-05-09`.

#### E7-H5. Nombre (Could)
- **Implementación:** en `CompartirItinerario`, campo opcional `<input maxLength={40}>` con etiqueta "Tu nombre (opcional)" y ejemplo "Ej.: Carla". Se recuerda en `localStorage['niebla:nombre']`.
- **Verificación:** `?f=05&n=%3Cb%3EHola%3C%2Fb%3E` muestra literalmente "El itinerario de <b>Hola</b>".

### E8. Extras

#### E8-H1. Antes y después (Could)
- **Archivos:** `CuentaRegresiva`.
- **Implementación:** tras montar, `ahora = ahoraEnChile()`; `inicio = aMinutos('2026-10-15T00:00')`, `fin` = fin de `f39` (último `fin` de todas las funciones). Antes: "Faltan 30 días" (redondear hacia arriba por días de calendario; "Falta 1 día"; el mismo 15 antes de la primera función: "Hoy parte el festival"). Durante: "Hoy en el festival" + enlace al programa del día. Después: "La 3ª edición terminó. Gracias por venir." Nada antes de hidratar.
- **Verificación:** parámetro `?ahora=` en desarrollo con 2026-09-15, 2026-10-16T12:00 y 2026-10-18T02:00.

---

## 13. Textos de interfaz (microcopia)

Tuteo, español de Chile, frases cortas. Se centralizan en `lib/textos.ts` (constantes y funciones que arman frases con datos), para revisar ortografía y ausencia de emojis en un solo lugar.

### 13.1 Navegación y generales
| Clave | Texto |
|---|---|
| nav.inicio / nav.programa / nav.itinerario | Inicio / Programa / Mi itinerario |
| saltar | Saltar al contenido |
| boton.quieroIr / boton.voy | Quiero ir / Voy |
| boton.verPrograma | Ver el programa |
| boton.quitarFiltros | Quitar filtros |
| filtros.dia / filtros.seccion | Día / Sección |
| filtros.todos / filtros.todas | Todos / Todas |
| filtros.mostrando | Mostrando {n} función/funciones |
| marca.agotada | Agotada |
| marca.aireLibre | Al aire libre · Gratis |
| marca.conversatorio | Conversatorio de {n} min |
| volver | Volver al programa |

### 13.2 Portada (texto editorial basado en el brief)
- **Qué es:** "Un festival de cine chico, hecho en Puerto Bruma, en la costa de Chile. Lo organizamos entre cuatro personas, con fondos concursables y mucha ayuda de voluntarios. Esta es nuestra tercera edición: tres días de películas en cuatro salas del puerto."
- **Tres días (sábado):** "El día fuerte"
- **Salas:** "Todo queda cerca: entre {min} y {max} minutos a pie"
- **Entradas:** "Entrada general {precio}" · "Funciones al aire libre: gratis" · "{venta del JSON}"
- **Destacados:** "Para anotar"

### 13.3 Itinerario
| Clave | Texto |
|---|---|
| vacio.titulo | Tu recorrido está en blanco |
| vacio.texto | Marca en el programa las funciones a las que quieres ir. Te avisamos si se topan, si no alcanzas a llegar caminando o si te perderías un conversatorio. Se guarda en este navegador, sin cuentas. |
| guardado | Se guarda solo en este navegador. Para verlo en otro teléfono, compártelo con un link. |
| resumen.ok | Todo calza: {n} funciones sin topes y con tiempo para caminar. |
| resumen.problemas | {n} problema/problemas en tu recorrido |
| quitado | Quitaste {titulo} |
| deshacer | Deshacer |
| vaciar.pregunta | ¿Vaciar tu itinerario? Se quitarán las {n} funciones. |
| compartir | Compartir mi itinerario |
| copiarLink | Copiar link |
| linkCopiado | Link copiado |
| agregado (anuncio) | Agregaste {titulo}, {dia} {hora}, a tu itinerario |

### 13.4 Avisos
| Tipo | Texto |
|---|---|
| tope (tramo) | {tituloB} empieza a las {horaB}, antes de que termine {tituloA} ({finA}). Se pisan {solape} min. |
| tope (tarjeta) | Se topa con {titulo} ({hora}, {sala}) |
| noAlcanza | Terminas {finA} en {salaA}. La siguiente empieza {horaB} en {salaB}. Tienes {margen} min y a pie son {traslado}. |
| noAlcanza (programa) | No alcanzas a llegar desde {titulo} / hasta {titulo} |
| conversatorio | Después de {tituloA} hay conversatorio de {conv} min. Para llegar a tiempo tienes que salir a las {salida}, así que te lo perderías. |
| agotada | Agotada: no quedan entradas para esta función. |
| repetida | Ya tienes otra función de esta película ({dia} {hora}). |
| lluvia | Si llueve y se hace en el Galpón 7: a pie serían {n} min, {no alcanzarías / igual alcanzas}. |
| sinAviso (otra sala) | A pie {traslado} min · tienes {margen} min |
| sinAviso (misma sala) | Misma sala · tienes {margen} min |

Palabras prohibidas en la interfaz: "imperdible", "lo mejor", "top", "favorita", "recomendada", "comprar", "reservar", "error" (usar lenguaje llano).

---

## 14. Verificación

### 14.1 Tests automáticos (`npm test`)

| Archivo | Tests |
|---|---|
| `lib/tiempo.test.ts` | 5.1 completo; `horaDe` de los 5 cruces de medianoche; `ahoraEnChile` con 3 instantes UTC. |
| `lib/programa.test.ts` | Conteos de la sección 5 del backlog (días, películas, funciones, por día, por sección, por día y sección, estrenos, películas con 1 función, conversatorios, agotadas, aire libre, notas, títulos originales); horas de término de las 39 contra la tabla 8.1 del backlog; validaciones que lanzan error con datos alterados en memoria (nunca en el archivo). |
| `lib/filtros.test.ts` | 5.4. |
| `lib/reglas-itinerario.test.ts` | T1–T6, N1–N5, C1–C3, OK1–OK8, 8.6 del backlog (tipo de aviso, par, minutos y `problemas`), más: **P1** {f13, f16, f17} → tope f16–f17, conversatorio f13→f16 (salida 19:53), conversatorio f13→f17 (salida 19:55), `problemas` 1; **P2** {f05, f06, f08} → 3 topes, `problemas` 3, sin noAlcanza; **P3** {f01, f25} → `peliculaRepetida`, `problemas` 0; **S1** (programa sintético en memoria: sala X→Y 10 min, A termina 20:00, B empieza 20:10) → sin aviso; con B a 20:09 → `noAlcanza` con `faltanMin` 1; **S2** sintético: A con conversatorio 20 termina 20:00 en X, B en X a las 20:20 → sin aviso; a 20:19 → conversatorio; **P4** `avisosAlAgregar(['f05'], c)` para las 10 funciones del jueves (ver E3-H7); **P5** ids inválidos y repetidos se ignoran; **P6** orden de entrada no altera el resultado. |
| `lib/enlace-itinerario.test.ts` | 5.6; longitud con 39 funciones. |
| `lib/cartel.test.ts` | Determinismo; 24 motivos distintos y todos definidos; bandas 3 (Bruma, 1987) y 7 (Vidrio); luces de horizonte 2 para *Cordillera de papel* y 1 para *Vidrio*; doble anillo solo en los 9 estrenos mundiales. |
| `lib/itinerario-store.test.ts` | Con almacén simulado: agregar, quitar, alternar, unir sin duplicados, reemplazar, vaciar; datos corruptos; almacén que lanza en `setItem` → `persistente: false` y el estado en memoria sigue funcionando; `obtenerEstado` devuelve la misma referencia si no hubo cambios. |
| `lib/contenido.test.ts` | **T-CONT-1:** recorre `app/`, `components/` y `lib/textos.ts` y falla si encuentra `\p{Extended_Pictographic}` o `\u{FE0F}`. **T-CONT-2:** falla si encuentra `estrella`, `puntaje`, `ranking`, `imperdible`, `comprar` (insensible a mayúsculas) en esos archivos. **T-CONT-3:** falla si encuentra `toLocaleTimeString`, `toLocaleDateString` o `new Date("20` / `new Date('20` en `app/`, `components/` o `lib/` (salvo en tests). **T-CONT-4:** `package.json` no tiene dependencias fuera de `next`, `react`, `react-dom` y las de desarrollo existentes. |

### 14.2 Comandos
Ejecutar, en este orden, y todos deben terminar sin errores:

```bash
npm test
```

```bash
npm run lint
```

```bash
npm run build
```

```bash
git diff --exit-code -- data/programa.json
```

En la salida de `npm run build`, las rutas deben aparecer como estáticas (`○`) o prerenderizadas con parámetros (`●` para `/pelicula/[id]`, 24 rutas); ninguna dinámica (`ƒ`).

### 14.3 Revisión manual (con `npm run build && npm start`)
1. **Móvil 360×640 (DevTools, dispositivo con touch):** portada primera pantalla (E2-H1); programa completo; filtros viernes + Nocturna; agregar f19 y f21 → "No alcanzas" en f21 previsualizado antes de agregar; abrir itinerario → tramo "No alcanzas" con 1 min y 22 a pie; quitar y deshacer; compartir (copiar link); abrir el link en ventana privada; copiar al itinerario vacío.
2. **Escritorio 1440:** mismas rutas; haz del faro sigue al puntero.
3. **Zona horaria:** DevTools > Sensors > Location > zona `Asia/Tokyo`, recargar programa y ficha de *Las cintas del faro*: horas iguales a la tabla 8.1 del backlog.
4. **Movimiento reducido** (E0-H5).
5. **Teclado y lector de pantalla** (E0-H6).
6. **Sin JavaScript** (DevTools > Settings > Disable JavaScript): portada, programa y fichas se leen completos (los botones de itinerario no funcionan, aceptable).
7. **Red:** pestaña Network tras cargar cada ruta: ninguna solicitud a otro dominio.
8. **Contenido:** leer las 24 fichas buscando datos que no estén en el JSON, emojis, puntajes o textos en inglés.
9. **Lighthouse móvil** en 4 rutas (E0-H7).

---

## 15. Orden de implementación y lista de cierre

1. Configuración (2.1), limpieza (2.3), `lib/tipos.ts`, `lib/tiempo.ts`, `lib/programa.ts`, `lib/formato.ts` con tests. `npm test` en verde.
2. `lib/reglas-itinerario.ts`, `lib/filtros.ts`, `lib/enlace-itinerario.ts`, `lib/itinerario-store.ts` con todos sus tests (sección 14.1). **No avanzar a interfaz sin estos tests en verde.**
3. `globals.css` (tokens), `fuentes.ts`, layout, `Cabecera`, `NavInferior`, `Pie`, `Icono`, `Etiqueta`, `Boton`, `Anunciador`, `icon.svg`, `not-found.tsx`.
4. `HorarioFuncion`, `MarcasFuncion`, `BotonItinerario`, `TarjetaFuncion`; `lib/cartel.ts` con un motivo provisorio (`faro`) para todos.
5. Programa completo (E3), `npm run build` para confirmar el `Suspense`.
6. Ficha (E4).
7. Mi itinerario, avisos y compartir (E5, E6, E7), verificados contra 14.1 y la sección 8 del backlog en pantalla.
8. Portada (E2) con la escena del faro.
9. Los 24 motivos del cartel (9.4) y la variante `grande`.
10. Should y Could en el orden del backlog.
11. Revisión 14.2 y 14.3 completa.

**Lista de cierre** (todo debe estar marcado):
- [ ] `npm test`, `npm run lint`, `npm run build` sin errores; `data/programa.json` sin cambios.
- [ ] Sin dependencias nuevas; sin archivos de la plantilla (`public/*.svg`, `favicon.ico`, `page.module.css`).
- [ ] `<html lang="es">`; títulos y descripciones en español.
- [ ] 39 funciones, 24 fichas, conteos por filtro correctos.
- [ ] Todos los casos de la sección 8 del backlog y de 14.1 correctos en tests **y** en pantalla.
- [ ] 360 px sin desborde en las 5 rutas; movimiento reducido respetado; navegación por teclado completa.
- [ ] Link compartido probado en otro navegador; abrirlo no modifica el itinerario propio.
- [ ] Ningún emoji, puntaje, ranking, botón de compra ni dato inventado.
