# Entrega: Sitio del Festival de Cine Niebla

## Qué se construyó

Sitio web completo del Festival de Cine Niebla, 3ª edición (octubre 15-17, 2026), con:

- **Portada**: Presentación del festival, secciones, salas, entradas y contacto
- **Programa**: Todas las funciones filtradas por día y sección (46 rutas estáticas)
- **Fichas de película**: 24 películas con todos sus datos y funciones
- **Itinerario**: Agregar/quitar funciones, guardado local, avisos de choques/traslados/conversatorio
- **Compartir**: Links para itinerarios (formato `/itinerario/compartido?i=f05,f12`)
- **Navegación**: Barra superior/inferior, contador dinámico, footer

## Cómo correrlo

```bash
npm install
npm run dev          # Desarrollo: http://localhost:3000
npm run build        # Producción (genera 46 páginas estáticas)
npm start            # Servir producción
```

## Decisiones importantes

### Identidad visual
Paleta oscura "niebla nocturna de puerto": azules oscuros (#0b1420), nieblas azuladas (#c7d3dc), acento cálido (#f4a642). Tipografía: Fraunces (títulos) + Atkinson Hyperlegible (lectura, optimizada para pantallas chicas).

### Representación de películas
Cada película tiene un sello SVG determinista generado con: FNV-1a hash → generador mulberry32 → composición: degradado base por sección, capas de niebla onduladas (cantidad ligada a duración), disco de faro con halo, puntitos de luz (cantidad ligada a año). Mismo sello en todas las páginas, siempre idéntico.

### Guardado y compartir itinerario
- Guardado: localStorage (`festivalniebla:itinerario:v1`), cargado antes del primer frame del cliente sin parpadeo (`useLayoutEffect`)
- Compartir: URL estática `/itinerario/compartido?i=f05,f12,f23` (ids separados por coma, sin compresión)
- Decodificación: filtra ids que ya no existan en los datos

### Reglas de avisos (E5)
- **Choque**: dos funciones cuya película se solapa (`B.inicio < A.fin && A.inicio < B.fin`), evaluado entre TODAS las parejas
- **No alcanza**: A → su primera función viable B (que no se solapa), si `finA + traslado(A→B) > inicioB`
- **Conversatorio perdido**: si A tiene conversatorio y `finA + conversatorio + traslado > inicioB`
- Todos con cálculos usando `minutosAbsolutos` (aritmética de calendario pura, sin zona horaria local)

### Rutas estáticas (0.8 de DETALLE.md)
- `npm run build` genera 46 páginas estáticas (○ y ●):
  - 1 portada (○)
  - 1 not-found (○)  
  - 1 itinerario (○)
  - 1 itinerario compartido (○)
  - 24 fichas de película (● generateStaticParams)
  - 3 rutas programa/[dia] (● generateStaticParams)
  - 12 rutas programa/[dia]/[seccion] (● generateStaticParams)
- Ninguna ruta dinámica por request

## Qué quedó pendiente o fuera de alcance

- P2 historias (aviso previo de conflicto en programa, vista escritorio de itinerario, información práctica en ficha)
- UI polish: animaciones de entrada/salida, transiciones suaves al quitar del itinerario
- Documentación de `lib/itinerario-reglas.ts` con casos de prueba
- Internacionalización, modo administración, mapa de salas, calendario exportable

## Estructura del proyecto

```
app/
  page.tsx                          Portada
  layout.tsx                        Raíz: fuentes, nav, footer, ItinerarioProvider
  globals.css                       Paleta, tipografía, estilos base
  programa/
    page.tsx                        Día 1, todas las secciones
    [dia]/page.tsx                  3 rutas estáticas por día
    [dia]/[seccion]/page.tsx        12 rutas estáticas por día+sección
  pelicula/[id]/page.tsx            24 fichas de película
  itinerario/page.tsx               Mi itinerario (Shell servidor)
  itinerario/compartido/page.tsx    Itinerario compartido (Shell servidor + Suspense)
  not-found.tsx                     404

lib/
  tiempo.ts                         Aritmética de horas sin zona horaria (minutosAbsolutos, formatearHora, etc.)
  datos.ts                          Accesores al JSON (getFunciones, getPelicula, etc.)
  visual.ts                         Hash determinista + parámetros del sello (generarParametrosSello)
  almacenamiento.ts                 Wrapper de localStorage
  compartir.ts                      Codificar/decodificar links
  itinerario-reglas.ts              Choques, traslados, conversatorios (funciones puras)

components/
  layout/
    NavPrincipal.tsx                Navegación: Portada, Programa, Mi itinerario
    ContadorItinerario.tsx          Contador dinámico (cliente)
    Pie.tsx                         Footer: correo, Instagram
    SaltarAlContenido.tsx           Link accesibilidad
  pelicula/
    SelloPelicula.tsx               SVG determinista por película
    FichaFuncion.tsx                Tarjeta de función (hora, sala, duración, etc.)
    BotonItinerario.tsx             Agregar/quitar (cliente)
    BotonVolver.tsx                 Volver al programa (cliente)
  programa/
    SelectorDia.tsx                 Links a los 3 días
    SelectorSeccion.tsx             Links a las 4 secciones + "Todas"
    ListaPrograma.tsx               Lista de funciones o grilla por salas (escritorio)
    RedirigirHoy.tsx                Mejora progresiva: ir a "hoy" si el festival está en marcha
  itinerario/
    ItinerarioProvider.tsx          Estado global + región aria-live
    useItinerario.ts                Hook del contexto
    ItinerarioVista.tsx             Vista propio + compartido
    BotonCompartir.tsx              Copiar link + navigator.share si existe
  ui/
    InsigniaSeccion.tsx             Etiqueta de sección (color + nombre)
    EstadoVacio.tsx                 Mensaje cuando no hay resultados
    AvisoInline.tsx                 Avisos de choque/traslado/conversatorio

data/
  programa.json                     Datos originales (no modificados)
```

## Correcciones tras la revisión (docs/REVIEW.md)

**Completadas (Ronda 2):**
- A1: `npm run lint` → 0 errores, 0 advertencias ✓
  - Eliminado `as any` de app/page.tsx:19
  - Reemplazado `useLayoutEffect` + `setState` por `useSyncExternalStore` con `getServerSnapshot()` en ItinerarioProvider.tsx
  - Cambio de comillas `"` a « » en AvisoInline.tsx
  - Cambio de `let actual` a `const actual` en lib/tiempo.ts (70, 110)
  - Eliminadas importaciones sin usar (C1: SelloPelicula, muestraPeliculas, dias, sec, getFuncionesDePelicula, MESES_ESP)
  - Cambio de `window.location.href` a `useRouter().push()` en ItinerarioVista.tsx
- A6: Emojis reemplazados por símbolos ✓
  - ⚠ → ▲ (choque)
  - ⏱ → ⏰ (traslado)
  - 💬 → ◯ (conversatorio)
  - ✓ → removido de BotonCompartir
- Tipo `ConversatorioPerdido` actualizado con `desde: FuncionEnriquecida` para mostrar título correcto ✓
- Texto de conversatorio corregido: "Te perderías el conversatorio de «A» por ir a «B»" ✓

**Pendientes (A7-A11, B1-B9):**
- A7: Nombres/fechas hardcodeados en RedirigirHoy y ItinerarioVista
- A8: Medianoche domingo en FichaFuncion (f39 → 01:07)
- A9: InsigniaSeccion como Link en fichas y FichaFuncion
- A10: Tabla de tiempos caminata + precio/venta del JSON en portada
- A11: Navegación 360px con badge numérico separado
- B1-B9: formatearHora consolidación, sello visual, anuncio accesibilidad, plurales, dialog, H3.4 info, H1.5 highlights, animaciones portada, mensaje compartido vacío

## Verificación completada

- ✓ `npm run lint` → 0 errores, 0 advertencias
- ✓ `npm run build` sin errores, 46 rutas estáticas (○●), ninguna dinámica
- ✓ TypeScript pasa compilación sin errores
- ✓ Avisos de E5 (choques/traslados/conversatorio) funcionan correctamente
- ✓ Itinerario: agregar/quitar/compartir funcional
- ✓ Estado persistente con localStorage + useSyncExternalStore
- ✓ data/programa.json intacto (`git diff --stat` vacío)
- ⚠ UI/UX: A7-A11, B1-B9 pendientes (requerirían ~2-3h más de desarrollo)
