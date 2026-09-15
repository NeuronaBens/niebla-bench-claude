# Festival de Cine Niebla · guía de diseño y contrato técnico

Documento de trabajo para todas las personas/agentes que construyen el sitio.
Léelo entero antes de escribir código. Si algo no está aquí, decide con criterio
y anótalo en tu resumen final.

## 1. Idea

"Una noche de puerto con niebla." El sitio es oscuro, húmedo, con luz de faro.
No es una web corporativa: hay tipografía grande con carácter, niebla que se
mueve despacio, y cada película tiene un afiche generado con código.

Sensación buscada: cercano, de acá, bien hecho. Nada de plantillas.

## 2. Reglas duras (del brief)

- Next.js 16 App Router + TypeScript. `npm run build` sin errores. `npm run lint` limpio.
- Estilos: **CSS Modules** + variables globales en `app/globals.css`. Sin Tailwind.
- **Sin** librerías de componentes ni de animación. Todo con CSS (y SVG). No instalar dependencias nuevas.
- **Sin** imágenes externas, fotos, ni emojis. Iconos: SVG inline pequeños (trazos simples).
- **Sin** puntajes, estrellas ni rankings.
- Textos de interfaz en español (de Chile, cercano: "pega", "de acá", tuteo).
- `prefers-reduced-motion: reduce` desactiva animaciones/transiciones no esenciales.
- Funciona de 360 px a escritorio. Diseñar primero para celular.
- `data/programa.json` se usa tal cual, no se modifica ni se inventan datos.
- Sin backend ni servicios externos. Fuentes solo con `next/font/google`.
- Trabajar solo dentro de esta carpeta. No hacer commits.
- Next 16: `params` y `searchParams` son Promesas (`await params`). Leer `node_modules/next/dist/docs/` ante cualquier duda.

## 3. Tokens (definidos en `app/globals.css`, usar siempre las variables)

Colores (tema único, oscuro):

| variable | valor | uso |
|---|---|---|
| `--noche-950` | `#070c15` | fondo más profundo |
| `--noche-900` | `#0b1220` | fondo base de página |
| `--noche-800` | `#121b2c` | tarjetas, superficies |
| `--noche-700` | `#1b2739` | superficies elevadas, bordes suaves |
| `--noche-600` | `#2a3850` | bordes, separadores |
| `--niebla-100` | `#eef1f5` | texto principal |
| `--niebla-200` | `#c7d0dc` | texto secundario |
| `--niebla-400` | `#8593a8` | texto terciario, metadatos |
| `--faro` | `#f2b544` | acento principal (CTA, foco, "ir") |
| `--faro-suave` | `rgba(242,181,68,.16)` | fondos de acento |
| `--alerta` | `#ff7a59` | avisos de choque / no alcanza |
| `--ok` | `#62c79b` | confirmaciones |

Color por sección (`--sec-<id>`): competencia `#f2b544` (ámbar faro), panorama `#5ec8e5` (cian hielo), nocturna `#e5476b` (marea roja), costa `#62c79b` (verde alga). Cada sección también tiene `--sec-<id>-suave` (mismo color al 16%).

Tipografía (cargada en `app/layout.tsx` con `next/font/google`):
- `--font-display`: **Fraunces** (variable, con itálica). Títulos, horas grandes, números. Usar `font-variation-settings: "opsz" 144` en títulos grandes y `"SOFT" 100` para el logo.
- `--font-sans`: **Instrument Sans** (variable). Todo lo demás. Horas con `font-variant-numeric: tabular-nums`.

Escala: `--paso-1` 0.8rem, `--paso0` 1rem, `--paso1` 1.25rem, `--paso2` 1.6rem, `--paso3` 2.2rem, `--paso4` 3rem, `--paso5` clamp(3rem, 10vw, 6.5rem).
Espacio: `--esp-1` 4px, `--esp-2` 8px, `--esp-3` 12px, `--esp-4` 16px, `--esp-5` 24px, `--esp-6` 32px, `--esp-7` 48px, `--esp-8` 80px.
Radios: `--radio-s` 6px, `--radio-m` 12px, `--radio-l` 20px. Ancho contenido: `--ancho` 1120px. Padding lateral: `--gutter` clamp(16px, 4vw, 40px).
Movimiento: `--suave` 200ms cubic-bezier(.2,.7,.2,1). Todo `transition`/`animation` va anulado bajo reduced-motion (ya está en globals).

Clases globales disponibles: `.contenedor` (ancho máx + gutter), `.visually-hidden`, `.boton`, `.boton--primario`, `.boton--fantasma`, `.chip`, `.chip--activo`, `.etiqueta` (texto pequeño mayúsculas espaciadas), `.tarjeta`.

## 4. Componentes compartidos (`components/`)

- `Cabecera.tsx` (client): logo "Niebla" (tipográfico, con SVG de haz de faro), nav: Portada, Programa, Mi itinerario (con contador de funciones elegidas). Sticky arriba, fondo translúcido con blur. En móvil tiene que caber en 360 px.
- `Pie.tsx`: datos del festival (fechas, ciudad, entradas, contacto), salas con dirección. Texto pequeño.
- `Afiche.tsx`: afiche generativo de una película, SVG determinista a partir del id (hash) y coloreado por sección. Props: `pelicula`, `tamano?: 'chico' | 'mediano' | 'grande'`. Proporción 2:3. Debe verse distinto por película (horizonte, bandas de niebla, luna/faro, olas, grano) pero de una misma familia. Título en Fraunces dentro del afiche. Sin `feTurbulence` pesado en las versiones chicas (rendimiento en celular).
- `TarjetaFuncion.tsx` (client): una función en el programa/ficha/itinerario. Muestra hora inicio–fin, sala, sección (color), título (link a la ficha), etiquetas: "Agotada", "Al aire libre", "Conversatorio +N min", "Estreno mundial/nacional/latinoamericano", nota. Contiene `BotonItinerario`.
- `BotonItinerario.tsx` (client): botón alternar "Agregar a mi itinerario" / "En mi itinerario" usando `useItinerario()`. Si la función está agotada, el botón igual funciona pero se avisa "Agotada".
- `Niebla.tsx`: fondo decorativo de niebla animada (capas con `radial-gradient` + `filter: blur`, keyframes lentos). Se apaga con reduced-motion. `aria-hidden`.

## 5. Contrato de `lib/` (lo escribe la coordinación; usar exactamente estas firmas)

### `lib/datos.ts` (server-safe, sin `use client`)

```ts
export type DiaId = '2026-10-15' | '2026-10-16' | '2026-10-17';
export interface Dia { id: DiaId; nombre: 'Jueves' | 'Viernes' | 'Sábado'; corto: 'Jue' | 'Vie' | 'Sáb'; numero: number; etiqueta: string /* "Jueves 15" */ }
export const dias: Dia[];
export interface Sala { id: string; nombre: string; direccion: string; capacidad: number; aireLibre: boolean; nota?: string; corto: string /* "Teatro", "El Muelle", "Galpón 7", "Terraza Faro" */ }
export interface Seccion { id: string; nombre: string; descripcion: string }
export type Clasificacion = 'TE' | '+14' | '+18';
export type Estreno = 'mundial' | 'nacional' | 'latinoamericano';
export interface Pelicula { id; titulo; tituloOriginal?; direccion; pais; anio; duracionMin; seccion; clasificacion: Clasificacion; estreno: Estreno; sinopsis }
export interface Funcion {
  id: string; peliculaId: string; salaId: string; inicio: string; conversatorioMin?: number; agotada?: boolean; nota?: string;
  pelicula: Pelicula; sala: Sala; seccion: Seccion;
  dia: DiaId;            // día del festival al que pertenece (por fecha de inicio)
  inicioMin: number;     // minutos desde 2026-10-15 00:00 (hora local, sin Date ni zonas horarias)
  finMin: number;        // inicioMin + duracionMin
  conversatorioFinMin?: number; // finMin + conversatorioMin
  horaInicio: string;    // "19:30"
  horaFin: string;       // "21:08" (si cruza medianoche igual se muestra "01:07")
  cruzaMedianoche: boolean;
}
export const festival, salas: Sala[], secciones: Seccion[], peliculas: Pelicula[], funciones: Funcion[] /* ordenadas por inicioMin */;
export function getPelicula(id): Pelicula | undefined;
export function getFuncion(id): Funcion | undefined;
export function getSala(id): Sala | undefined;
export function getSeccion(id): Seccion | undefined;
export function getDia(id): Dia | undefined;
export function funcionesDePelicula(peliculaId): Funcion[];
export function funcionesDelDia(dia: DiaId): Funcion[];
export function traslado(salaA: string, salaB: string): number;
export function formatoDuracion(min): string; // "1 h 38 min", "48 min"
export function formatoCLP(n): string;        // "$4.000"
export function etiquetaEstreno(e: Estreno): string; // "Estreno mundial" ...
export function etiquetaClasificacion(c): string;    // "Todo espectador", "Mayores de 14", "Mayores de 18"
```

### `lib/itinerario.ts` (puro, sin React)

```ts
export type TipoAviso = 'choque' | 'traslado' | 'conversatorio';
export interface Aviso {
  tipo: TipoAviso;
  a: Funcion; b: Funcion;   // a empieza antes que b
  minutos: number;          // choque: minutos de superposición; traslado: minutos que faltan; conversatorio: minutos del conversatorio que se pierden
  mensaje: string;          // texto listo para mostrar, en español
}
export interface Hueco { desde: Funcion; hasta: Funcion; minutosLibres: number; minutosCaminando: number } // pares consecutivos sin problema
export interface Analisis {
  funciones: Funcion[];                 // las elegidas, ordenadas por inicio
  porDia: { dia: Dia; funciones: Funcion[] }[];
  avisos: Aviso[];
  avisosDe(funcionId: string): Aviso[];  // avisos donde participa esa función
  huecos: Hueco[];
}
export function analizarItinerario(ids: string[]): Analisis;
export function codificarItinerario(ids: string[]): string;      // "f01.f05.f09" (orden por inicio, sin repetidos)
export function decodificarItinerario(texto: string | null | undefined): string[]; // solo ids válidos
export const PARAM_COMPARTIR = 'f';   // /itinerario?f=f01.f05
```

Reglas del análisis (para cada par a<b por inicio):
1. `b.inicioMin < a.finMin` → **choque** (el conversatorio NO cuenta).
2. si no, `b.inicioMin < a.finMin + traslado(a.sala, b.sala)` → **traslado** (no alcanza a llegar caminando). Misma sala = 0 min.
3. si no, y `a` tiene conversatorio, `b.inicioMin < a.conversatorioFinMin + traslado` → **conversatorio** (se lo perdería entero o en parte; `minutos` = cuánto se pierde).
Solo se revisan pares del mismo día festival.

### `lib/almacen.tsx` (client; contexto React)

```ts
export function ItinerarioProvider({ children }): JSX.Element;   // ya montado en app/layout.tsx
export function useItinerario(): {
  ids: string[];            // ids de funciones elegidas
  listo: boolean;           // false hasta leer localStorage (evitar desajustes de hidratación: no mostrar estado "elegido" hasta que sea true)
  tiene(id: string): boolean;
  alternar(id: string): void;
  agregar(ids: string[]): void;
  quitar(id: string): void;
  vaciar(): void;
};
```

## 6. Rutas

- `/` portada (`app/page.tsx`)
- `/programa` (`app/programa/page.tsx`) filtros por día y sección
- `/pelicula/[id]` (`app/pelicula/[id]/page.tsx`) con `generateStaticParams`; 404 con `notFound()` si no existe
- `/itinerario` (`app/itinerario/page.tsx`); compartido: `/itinerario?f=f01.f05` (leer en cliente con `useSearchParams` dentro de `<Suspense>`)

## 7. Tono de los textos

Cercano y directo. Ejemplos: "Arma tu recorrido", "Se topa con…", "No alcanzas a llegar caminando", "Te perderías el conversatorio", "Copiar a mi itinerario", "Agotada", "Al aire libre". Nada de "¡Bienvenido a nuestra plataforma!".
