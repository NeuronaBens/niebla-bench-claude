# Revisión del código: sitio del Festival de Cine Niebla

Revisor: Sonnet. Contra `docs/BACKLOG.md`, `docs/DETALLE.md` y `BRIEF.md`. Metodología: lectura completa de `app/`, `components/`, `lib/`, `types/`, `app/globals.css` y los `.module.css`; `npm run build` y `npm run lint`; `git diff --stat -- data/programa.json`; un script temporal (`npx tsx`, borrado al terminar) que ejecutó `calcularChoques`/`calcularAvisosTraslado`/`obtenerResumen` contra los 15 casos de la tabla del backlog y los 5 fines después de medianoche; y una sesión en el navegador (`npm run dev` en un puerto libre) recorriendo portada → programa (360px y desktop) → ficha → agregar `f05`+`f06` → itinerario → compartir → link compartido, con la consola abierta.

## Resumen de estado

**El motor de reglas de horario y de E5 es correcto** (ver "Qué está bien hecho"), pero **no está conectado a la interfaz**, y varias historias P0 tienen huecos o errores concretos. Con el estado actual, el sitio **no cumple** una parte importante de lo que exige el backlog para P0, aunque `next build` sí produce las 46 rutas estáticas correctamente.

P0 que fallan o están incompletos, verificados en esta ronda: H0.9 (falla `npm run lint`), H0.1 (nombres de día escritos a mano en 2 lugares), H0.2 (una de las 5 fechas límite muestra el día siguiente equivocado), H0.7 (hay emojis en el código), H1.3 (tiempos de caminata ausentes), H1.4 (texto de venta no literal del JSON), H3.1 (la sección no enlaza al programa), H4.1 (el botón «Quitar» no hace nada), H5.1–H5.4 (ningún aviso de choque/traslado/conversatorio se muestra en el itinerario, aunque el cálculo es correcto), H6.2 («Copiar a mi itinerario» no existe). H0.3/H0.4 tienen un defecto visual reproducible a 360px en la barra de navegación.

P0 que sí cumplen, verificados: H0.1 (datos completos, `data/programa.json` intacto), H0.2 (aritmética de horas correcta salvo el punto anterior), la generación estática completa (A1 de DETALLE), el sello de película con ids únicos (A3), el diseño de rutas de programa, `BotonVolver` (A2).

---

## A. Bloqueantes

### A1. `npm run lint` falla (10 errores) — incumple H0.9
**Dónde:** ver lista abajo.
**Problema:** el backlog exige "`npm run lint` termina sin errores" (H0.9, P0). Al ejecutarlo hay 10 errores:
- `app/page.tsx:19` — `@typescript-eslint/no-explicit-any` (`const trasladosMin = festival as any;`).
- `components/itinerario/ItinerarioProvider.tsx:32` — `react-hooks/set-state-in-effect`: "Calling setState synchronously within an effect can trigger cascading renders" sobre las tres llamadas `setFuncionesElegidas`/`setDisponible`/`setCargado` dentro del `useLayoutEffect`.
- `components/ui/AvisoInline.tsx:13,13,22,22,31,31` — 6× `react/no-unescaped-entities` por las comillas `"` sueltas dentro de JSX.
- `lib/tiempo.ts:70,110` — 2× `prefer-const` (`let actual` nunca se reasigna, solo se mutan sus propiedades).
**Por qué:** rompe un criterio de aceptación P0 explícito, y además el error de `ItinerarioProvider` señala un problema real de arquitectura (ver A2 más abajo: da la casualidad de que esta misma línea es la pieza central del guardado del itinerario).
**Qué hacer:**
- `app/page.tsx:19`: eliminar esa línea (ver A10, es además código muerto/erróneo).
- `ItinerarioProvider.tsx`: reemplazar el `useLayoutEffect` que llama `setState` por `useSyncExternalStore` con un `getServerSnapshot` que devuelva `[]` — es la alternativa que el propio `docs/DETALLE.md` (nota C2) ya autoriza como igual de válida, y no dispara esta regla porque no es un `setState` dentro de un efecto.
- `AvisoInline.tsx`: cambiar las comillas rectas `"..."` por comillas angulares «...» (además de arreglar el lint, es lo que pedía `docs/DETALLE.md` en sus ejemplos de texto, ej. `«Vidrio»`).
- `lib/tiempo.ts:70,110`: cambiar `let actual` por `const actual` en `obtenerDiasFestival` y `obtenerDiaIndice`.

### A2. Ningún aviso de E5 se muestra en el itinerario — incumple H5.1, H5.2, H5.3, H5.4 (todos P0)
**Dónde:** `components/itinerario/ItinerarioVista.tsx:57-58` (calcula `avisos` y `avisosTraslado`) y el `.map` de funciones en líneas 78-101 (nunca los consulta); `AvisoInline` se importa (línea 8) pero no se usa en ningún JSX del archivo.
**Problema:** el motor de cálculo (`lib/itinerario-reglas.ts`) es correcto (ver "Qué está bien hecho"), pero su resultado nunca llega a la pantalla. Confirmado en el navegador: agregando `f05` (La hora azul del puerto, teatro 19:30–21:08) y `f06` (Vidrio, galpón 20:00–22:01) desde `/programa/jueves` — un choque de manual — la página `/itinerario` lista ambas funciones sin ninguna marca, texto ni ícono de choque. `npm run lint` también lo delata: `avisos`, `avisosTraslado` y `AvisoInline` salen como "assigned/defined but never used".
**Por qué:** H5.1–H5.4 son P0 y ninguno se cumple: no hay aviso de choque, no hay aviso de "no alcanzas a llegar", no hay aviso de conversatorio perdido, y el resumen no muestra cuántos hay.
**Qué hacer:** en el `.map` de cada función dentro de `ItinerarioVista.tsx`, consultar `avisos.get(f.id)` y `avisosTraslado.get(f.id)` y renderizar un `<AvisoInline aviso={...} />` por cada uno (puede haber varios choques para la misma función). Mostrar también el resumen con `obtenerResumen(funciones)` (arreglar antes A3) cerca de la cabecera, tal como pide H5.4. Aplica igual a `modo="compartido"` (H5.4 último punto: "los avisos usan los mismos textos y criterios en el itinerario propio y en uno compartido").

### A3. `obtenerResumen` cuenta mal los choques — incumple H5.4 (P0)
**Dónde:** `lib/itinerario-reglas.ts:143` (dentro de `obtenerResumen`): `const key = [aviso.con.id, ''].sort().join('|');`.
**Problema:** la clave de deduplicación de parejas nunca incluye el id de la función **dueña** de cada aviso (se pierde porque el bucle exterior es `for (const avisos of choques.values())`, descartando la clave del `Map`). Cada choque está grabado dos veces (una vez en la lista de cada función), y cada vez usa como "con.id" un id distinto — así que las dos direcciones de la misma pareja casi nunca comparten clave y se cuentan por separado, mientras que dos parejas distintas que comparten un extremo sí pueden colisionar por error.
**Por qué lo verifiqué:** con un itinerario `{f21, f22, f05, f06}` hay exactamente 2 parejas reales en choque (`f21`+`f22`, `f05`+`f06`), pero `obtenerResumen(...).choques` devuelve **4** (confirmado con un script temporal contra el código real). En general, esta función duplica el conteo real salvo coincidencia.
**Qué hacer:** iterar `choques.entries()` (no `.values()`) para tener el id dueño, y construir la clave como `[idDueño, aviso.con.id].sort().join('|')` para deduplicar correctamente por pareja real.

### A4. El botón «Quitar» del itinerario no hace nada — incumple H4.1 (P0)
**Dónde:** `components/itinerario/ItinerarioVista.tsx:98`: `<button className={styles.quitar} onClick={() => {}}>Quitar</button>`. Nótese además que `quitar` ni siquiera se extrae de `useItinerario()` en la línea 19 de ese archivo (`const { funcionesElegidas, disponible, cargado, vaciar } = useItinerario();`).
**Problema:** el `onClick` es una función vacía. Confirmado en el navegador: al hacer clic en «Quitar» sobre "La hora azul del puerto", el itinerario se queda exactamente igual ("2 funcións" antes y después).
**Por qué:** H4.1 exige explícitamente "una acción para quitarla"; hoy simplemente no existe.
**Qué hacer:** agregar `quitar` a la desestructuración de `useItinerario()` en la línea 19 y usar `onClick={() => quitar(f.id)}`.

### A5. Falta por completo «Copiar a mi itinerario» — incumple H6.2 (P0)
**Dónde:** `components/itinerario/ItinerarioVista.tsx` completo (no hay ningún botón ni lógica para esto en modo `"compartido"`).
**Problema:** confirmado leyendo el archivo y abriendo `/itinerario/compartido?i=f05,f06` en el navegador: se ve el itinerario compartido de solo lectura (correcto), pero no hay ningún botón "Copiar a mi itinerario" en ninguna parte de la página.
**Por qué:** H6.2 (P0) exige explícitamente esta acción, con el agravante de que `docs/DETALLE.md` (hallazgo B8 de la ronda anterior) ya especificó el texto exacto del botón ("Sumar N funciones a mi itinerario" / deshabilitado "Ya tienes todas estas funciones" si N=0).
**Qué hacer:** en `modo === 'compartido'`, agregar un botón que calcule `N = idsCompartidos.filter(id => !tieneFuncion(id)).length`, se etiquete según ese N (ver DETALLE H6.2), y al pulsarlo llame `agregar(id)` por cada id de `idsCompartidos` que no esté ya en el propio, y luego navegue a `/itinerario` o muestre una confirmación. De paso, el estado vacío para `ids.length === 0` en modo compartido debería decir algo como "Este link no tiene funciones válidas" en vez del genérico "Tu itinerario está vacío" (líneas 24-32), para no confundir "tu itinerario" con "el link que abriste".

### A6. Hay emojis en el código — incumple BRIEF.md y H0.7 (P0)
**Dónde:**
- `components/ui/AvisoInline.tsx:12` — `⚠` (choque).
- `components/ui/AvisoInline.tsx:21` — `⏱` (traslado).
- `components/ui/AvisoInline.tsx:30` — `💬` (conversatorio).
- `components/itinerario/BotonCompartir.tsx:38` — `✓ Copiado`.
**Problema:** el brief prohíbe explícitamente emojis ("No uses emojis en la interfaz... ni como icono, ni en textos"), y H0.7 lo repite como criterio de aceptación. `AvisoInline` no se renderiza hoy (ver A2), así que estos tres no son visibles todavía — pero en cuanto se resuelva A2 lo serán, así que hay que arreglarlos en la misma pasada. `✓ Copiado` en `BotonCompartir` sí es visible hoy.
**Qué hacer:** quitar los cuatro caracteres. Para los íconos de `AvisoInline`, usar SVG inline simples (un triángulo, un reloj, una burbuja de diálogo — coherente con "cada aviso lleva además un ícono de forma distinta por tipo" de H0.5) o directamente texto ("Choque", "Traslado", "Conversatorio") en vez de un glifo. Para `BotonCompartir`, dejar solo el texto ("Copiado").

### A7. Nombres y fechas de día escritos a mano en dos lugares — incumple H0.1 (P0)
**Dónde:**
- `components/programa/RedirigirHoy.tsx:5,11-12`: importa `obtenerDiasFestival` de `lib/tiempo` (no `getDiasFestival` de `lib/datos`) y llama `obtenerDiasFestival('2026-10-15', '2026-10-17')` con las fechas del festival **hardcodeadas**, en vez de usar `getFestival().fechaInicio`/`fechaFin` (vía `getDiasFestival()` de `lib/datos.ts`, que es exactamente para esto).
- `components/itinerario/ItinerarioVista.tsx:76`: `{funcionesDelDia[0]?.diaIndice === 0 ? 'Jueves 15 de octubre' : funcionesDelDia[0]?.diaIndice === 1 ? 'Viernes 16 de octubre' : 'Sábado 17 de octubre'}` — tres strings de fecha completos escritos a mano.
**Problema:** H0.1 dice explícitamente "Los nombres de día... y las fechas se derivan de las fechas del JSON, no están escritos a mano." Ambos casos duplican y hardcodean lo que `getDiasFestival()` ya calcula correctamente a partir del JSON — si el JSON cambiara de fechas (otra edición del festival), estos dos lugares quedarían desincronizados y mostrarían fechas falsas sin que ningún test lo detecte.
**Qué hacer:**
- `RedirigirHoy.tsx`: importar `getDiasFestival` de `@/lib/datos` (no `obtenerDiasFestival` de `lib/tiempo`) y llamarlo sin argumentos.
- `ItinerarioVista.tsx:76`: reemplazar el ternario por `getDiasFestival()[diaIndice]?.etiqueta` (o pasar el objeto `DiaFestival` completo agrupando por él en vez de por el número).

### A8. La hora de fin después de medianoche del sábado dice "sábado" en vez de "domingo" — incumple H0.2 (P0)
**Dónde:** `components/pelicula/FichaFuncion.tsx:14-16`:
```
const horaFin = funcion.cruzaMedianoche
  ? `${formatearHora(funcion.finMin)} (${funcion.diaIndice === 0 ? 'viernes' : 'sábado'})`
  : formatearHora(funcion.finMin);
```
**Problema:** para `diaIndice === 0` (jueves) el día siguiente es "viernes" ✓; para `diaIndice === 1` (viernes) el ternario da "sábado" ✓; pero para `diaIndice === 2` (**sábado**, el último día del festival) el ternario **también** da "sábado" porque solo compara contra `0` — cuando el día siguiente real es **domingo**.
**Por qué lo verifiqué:** `f39` (Las cintas del faro, galpón, sábado 23:45 + 82 min) es uno de los 5 casos de medianoche que el propio backlog cita por nombre (`f39`→01:07). Confirmé con el motor de horas que `f39.finMin` cae en un día distinto (18 de octubre, domingo), pero `FichaFuncion` etiqueta su fin como "01:07 (sábado)", lo cual es factualmente incorrecto y contradice exactamente el criterio que el backlog pide verificar a mano.
**Qué hacer:** no usar `diaIndice` para adivinar el nombre del día siguiente. Usar `obtenerFechaDeMinutos(funcion.finMin)` + `obtenerNombreDia(...)` (ya existen en `lib/tiempo.ts`, pensados exactamente para esto) para obtener el nombre real del día en que cae el fin, sea cual sea.

### A9. La sección de una película no enlaza al programa filtrado — incumple H3.1 (P0)
**Dónde:** `components/ui/InsigniaSeccion.tsx` (todo el archivo: es un `<span>`, nunca un `<Link>`); usado sin envoltorio de enlace en `app/pelicula/[id]/page.tsx:77` y en `components/pelicula/FichaFuncion.tsx:44`.
**Problema:** H3.1 pide explícitamente "sección (con enlace al programa filtrado)". Confirmado visualmente (captura de pantalla en `/pelicula/vidrio`): la insignia "Competencia Latinoamericana" se ve como una etiqueta con borde, sin ningún comportamiento de enlace. (La portada sí lo hace bien: sus tarjetas de sección en `app/page.tsx:66` envuelven la insignia en un `<Link>` — ese caso está correcto.)
**Qué hacer:** envolver `<InsigniaSeccion />` en un `<Link href={`/programa/${diaSlugPorDefecto}/${seccionId}`}>` en `app/pelicula/[id]/page.tsx` y en `FichaFuncion.tsx` (usando el primer día del festival como `diaSlugPorDefecto`, tal como especifica `docs/DETALLE.md` para este mismo caso).

### A10. Portada: faltan los tiempos de caminata y el texto de venta/precio no sale del JSON — incumple H1.3 y H1.4 (ambos P0)
**Dónde:** `app/page.tsx:19` y la sección "Entradas" (líneas ~87-91).
**Problema:**
- H1.3 exige mostrar los tiempos de caminata entre salas (los 6 pares de `trasladosMin`) de forma consultable. No hay ninguna tabla, esquema ni texto con esta información en toda la portada. La única línea relacionada, `const trasladosMin = festival as any; // Acceso al JSON`, es código roto: asigna el objeto `festival` (que no contiene `trasladosMin`, es una clave separada del JSON) a una variable mal nombrada, y esa variable nunca se usa después (confirmado por el warning de lint "assigned a value but never used" y por el error `no-explicit-any`).
- H1.4 exige "Texto de venta tal como está en los datos" y precio con formato chileno. El texto actual está escrito a mano: `"Venta sólo en boletería de cada sala desde una hora antes de cada función. No hay venta en línea."` en vez de interpolar `festival.entradas.venta` (el JSON dice, literal: `"Solo en boletería de cada sala, desde una hora antes de cada función. No hay venta en línea."` — nótese además la coma que falta y el "sólo" con tilde que ya no es la ortografía del dato). El precio "$4.000 CLP" también está escrito a mano en vez de derivarse de `festival.entradas.general`/`moneda`.
**Por qué:** ambos son P0; H1.3 está completamente ausente, y H1.4, aunque el resultado visual "parece" correcto hoy, no sale de los datos (si el precio o el texto de venta cambiaran en el JSON, la portada seguiría mostrando el texto viejo).
**Qué hacer:** agregar una lista o tabla con los 6 pares de `trasladosMin` (usar `getTrasladoMinutos` de `lib/datos.ts` y `getSalas()` para armar los pares, ya que `trasladosMin` no está expuesto en el objeto que devuelve `getFestival()` — habría que exponerlo, ej. un `getTrasladosMinutos()` que devuelva la matriz completa, o iterar los pares con `getTrasladoMinutos(a.id, b.id)`). Cambiar el texto de venta y el precio para interpolar `festival.entradas.venta`, `festival.entradas.general` y `festival.entradas.moneda` en vez de texto fijo.

### A11. La navegación se rompe visualmente a 360 px — incumple H0.4 y afecta H0.3 (P0)
**Dónde:** `components/layout/NavPrincipal.tsx:10`: `<Link href="/itinerario" className={styles.link}>Mi itinerario (<ContadorItinerario />)</Link>`.
**Problema:** confirmado con una captura de pantalla a exactamente 360×740px (en `/pelicula/vidrio`, con 2 funciones en el itinerario): el texto "Mi itinerario (2)" se parte en tres líneas dentro de la barra inferior fija ("Mi" / "itinerario 2)" / "("), superponiéndose y quedando ilegible — exactamente el ancho mínimo que H0.4 exige soportar sin texto cortado. Además, cuando el itinerario está vacío (el estado por defecto de cualquier visitante nuevo) o antes de que `ItinerarioProvider` termine de montar, `ContadorItinerario` no renderiza nada (`{funcionesElegidas.length > 0 && funcionesElegidas.length}` da `false`, que React no pinta), así que el enlace queda mostrando literalmente "Mi itinerario ()" con paréntesis vacíos — confirmado también con captura de pantalla.
**Por qué:** H0.4 (P0) exige "ningún texto de contenido queda... cortado" en 360px, y esto se rompe en un elemento presente en cada página del sitio. Lo de los paréntesis vacíos además contradice el espíritu de H0.3 ("0 se distingue visualmente de 1+" no debería verse como una etiqueta rota).
**Qué hacer:** achicar/reestructurar la etiqueta para que quepa en una línea a 360px — por ejemplo, quitar los paréntesis y usar una insignia numérica aparte (`<span className={styles.badge}>{n}</span>`) que solo aparezca cuando `n > 0`, en vez de intercalar el contador dentro del propio texto del enlace.

---

## B. Importantes

### B1. Formateo de hora duplicado en vez de reutilizar `formatearHora`
**Dónde:** `lib/itinerario-reglas.ts:45,51` (horario de los avisos de choque) y `components/itinerario/ItinerarioVista.tsx:94` (`` `${String(Math.floor(f.inicioMin / 60) % 24).padStart(2, '0')}...` ``).
**Por qué:** `docs/DETALLE.md` (0.5) pide "una sola función `formatearHora` reutilizada en toda la app" precisamente para no arriesgarse a que una reimplementación tenga un bug distinto. Hoy hay tres implementaciones del mismo cálculo.
**Qué hacer:** importar y usar `formatearHora` de `lib/tiempo.ts` en los tres lugares.

### B2. El sello de película no usa la mitad de sus propios parámetros
**Dónde:** `lib/visual.ts:24,28,29,37,44-45` (`anguloFondo`, `angulosOndas`, `amplitudesOndas`); `components/pelicula/SelloPelicula.tsx:31,45-60`.
**Problema:** `generarParametrosSello` calcula `anguloFondo` (para variar el ángulo del degradado) y `angulosOndas`/`amplitudesOndas` (para curvas onduladas en las capas de niebla), pero `SelloPelicula.tsx` nunca los usa: el degradado siempre va de 0% a 100% verticalmente sin rotación, y las "capas de niebla" son `<rect>` planos, no los "paths con curvas Bézier cúbicas" que pide `docs/DETALLE.md` (1.4).
**Por qué:** reduce la distinción visual entre películas de la misma sección (dos películas con el mismo número de `capasNiebla` — solo 4 valores posibles, 3 a 6 — y una posición de luz parecida pueden verse casi idénticas, arriesgando el criterio de H3.2 "dos películas cualesquiera se distinguen a simple vista").
**Qué hacer:** aplicar `anguloFondo` al `linearGradient` (rotarlo o variar `x1/y1/x2/y2` según el ángulo) y usar `angulosOndas`/`amplitudesOndas` para dibujar las capas de niebla como `<path>` con curvas en vez de `<rect>` planos.

### B3. El anuncio de accesibilidad no menciona el choque
**Dónde:** `components/itinerario/ItinerarioProvider.tsx:83-101` (`anunciarCambio`).
**Problema:** `docs/DETALLE.md` (A5) especifica que el mensaje anunciado debería incluir el choque si lo hay (ej. `"Agregada «Vidrio»... Se topa con «La hora azul del puerto»."`). La implementación actual solo dice `Agregada "X" a tu itinerario. Tu itinerario tiene N funciones.`, sin calcular el choque.
**Qué hacer:** dentro de `anunciarCambio`, cuando `agregada` es `true`, calcular con `calcularChoques` si la función recién agregada choca con alguna del resto de `itinerario` y añadirlo al mensaje.

### B4. Pluralización incorrecta: "funcións" en vez de "funciones"
**Dónde:** `components/layout/ContadorItinerario.tsx:11`, `components/itinerario/ItinerarioProvider.tsx:99`, `components/itinerario/ItinerarioVista.tsx:69` — los tres usan el patrón `` función${n !== 1 ? 's' : ''} `` que da "funcións" en plural (agregar "s" a "función" no la pluraliza correctamente en español).
**Por qué:** confirmado en el navegador: el resumen del itinerario muestra literalmente "2 funcións" en pantalla (no solo en un `aria-label`). Incumple H0.8 ("toda la interfaz está en español").
**Qué hacer:** cambiar el patrón por `` ${n} ${n === 1 ? 'función' : 'funciones'} `` en los tres archivos.

### B5. "Vaciar itinerario" usa `confirm()` del navegador en vez del `<dialog>` decidido
**Dónde:** `components/itinerario/ItinerarioVista.tsx:108-114`.
**Problema:** `docs/DETALLE.md` (B7) decidió en firme usar un `<dialog>` nativo de HTML para esta confirmación (accesible, estilizable, consistente con el resto de la interfaz), descartando explícitamente otras alternativas. La implementación usa `window.confirm(...)`, un diálogo nativo del navegador que no se puede estilizar y que en algunos navegadores/dispositivos se ve claramente "fuera" de la aplicación.
**Qué hacer:** reemplazar por un `<dialog>` con `showModal()`/`close()` y dos acciones ("Vaciar itinerario" / "Cancelar"), tal como quedó decidido.

### B6. H3.4 (información práctica en la ficha) no implementado — P1
**Dónde:** `app/pelicula/[id]/page.tsx` (no hay ningún precio por función ni navegación anterior/siguiente).
**Qué hacer:** agregar el precio aplicable junto a cada función de la lista (gratis si `salaId === 'terraza'`, si no `festival.entradas.general` formateado) y los enlaces anterior/siguiente dentro de la sección, sin wraparound, tal como decidió `docs/DETALLE.md` (C5).

### B7. H1.5 (momentos destacados) no implementado — P1
**Dónde:** `app/page.tsx` (no hay ninguna mención a `f05` ni a `f36`).
**Qué hacer:** agregar un destacado para la función inaugural (`f05`) y la premiación (nota de `f36`), enlazando a sus fichas respectivas, usando literalmente el texto de `nota`.

### B8. El fondo animado de la portada no coincide con lo documentado
**Dónde:** `app/page.tsx:30-43` (el `<svg className={styles.fondo}>`); `app/globals.css:154-162` (`@keyframes respirarLuz` y `desvanecerSalida` definidos pero nunca referenciados por ninguna regla `animation:` en todo el proyecto — confirmado por búsqueda en todo el código).
**Problema:** `docs/DETALLE.md` (1.5/B9) especifica capas de niebla con deriva horizontal de 40-60s y un disco de faro con halo que "respira" en 8s. La portada actual es un SVG estático (rectángulos planos + dos círculos) sin ninguna animación — las keyframes correspondientes existen en `globals.css` pero no se usan en ningún lado.
**Qué hacer:** aplicar `animation: derivaNiebla ...` a las capas de niebla del SVG de portada (igual que ya se hace en `SelloPelicula.module.css`) y `animation: respirarLuz 8s ease-in-out infinite alternate` al halo del disco de luz, ambos dentro de la media query de `prefers-reduced-motion: no-preference` que ya existe.

### B9. Mensaje de itinerario compartido vacío no distingue el caso
**Dónde:** `components/itinerario/ItinerarioVista.tsx:24-32`.
**Problema:** cuando `idsCompartidos` queda vacío tras filtrar ids inválidos, se muestra el mismo "Tu itinerario está vacío / Explora el programa..." que para el itinerario propio recién estrenado, en vez del mensaje específico que pide H6.2 ("Este link no tiene funciones válidas").
**Qué hacer:** cuando `modo === 'compartido'` y `ids.length === 0`, mostrar un texto distinto que dej claro que el problema es el link, no el itinerario del visitante.

---

## C. Menores

### C1. Advertencias de ESLint (no bloquean el build, pero conviene limpiarlas junto con A1)
Variables/importaciones sin usar: `app/page.tsx:3` (`SelloPelicula`), `app/page.tsx:22` (`muestraPeliculas`), `app/pelicula/[id]/page.tsx:52` (`dias`), `components/itinerario/ItinerarioVista.tsx:8` (`AvisoInline`, se resuelve solo con A2), `components/pelicula/SelloPelicula.tsx:22` (`sec`), `components/programa/ListaPrograma.tsx:1` (`getFuncionesDePelicula`), `lib/tiempo.ts:3` (`MESES_ESP`, nunca se usó — revisar si `formatearFecha` con nombre de mes hace falta en algún lado, ej. H1.1).

### C2. `formatearDuracion` omite los minutos cuando son 0
**Dónde:** `lib/tiempo.ts:48-53`. Da "2 h" en vez de "2 h 0 min" cuando la duración es un múltiplo exacto de 60. No afecta a ninguna película real de los datos (todas tienen minutos no-cero), pero es menos consistente que el ejemplo de `docs/DETALLE.md` ("1 h 52 min").

### C3. `document.execCommand('copy')` como respaldo de copiar
**Dónde:** `components/itinerario/BotonCompartir.tsx:28`. Es una API deprecada; sigue funcionando en todos los navegadores evergreen actuales, pero conviene saber que está deprecada si se revisa a futuro.

### C4. `padding-bottom` de `<main>` reservado para el nav fijo se aplica también en escritorio
**Dónde:** `app/globals.css:116-119`. En escritorio la navegación es `position: sticky; top: 0` (no ocupa espacio fijo abajo), pero el `padding-bottom` extra de ~96px se sigue aplicando siempre, dejando un espacio en blanco innecesario al final de cada página en escritorio.

### C5. `SelloPelicula` no se marca como decorativo para lectores de pantalla
**Dónde:** `components/pelicula/SelloPelicula.tsx:29` (el `<svg>` no tiene `aria-hidden="true"` ni `role="img"`/etiqueta). Como el título, sección, etc. ya se muestran como texto aparte, lo más simple es marcar el SVG como puramente decorativo.

### C6. Lista de programa duplicada en el DOM (móvil + escritorio)
**Dónde:** `components/programa/ListaPrograma.tsx:68-73`. Ambas variantes (grilla de escritorio y lista simple de móvil) se renderizan siempre; se ocultan correctamente por CSS (`display:none`, fuera del árbol de accesibilidad y del orden de tabulación — no es un bug de accesibilidad), pero duplica el HTML de cada página de programa. No urgente.

### C7. `numPuntitos` no sigue exactamente la fórmula documentada
**Dónde:** `lib/visual.ts:43`: `4 + ((anio % 7) || 1)` en vez de `4 + (anio % 7)` de `docs/DETALLE.md`. Solo cambia el resultado cuando el año de una película es múltiplo de 7 exacto; no ocurre con ninguna película de los datos actuales (2025/2026).

---

## Qué está bien hecho (no tocar)

- **La aritmética de horas (`lib/tiempo.ts`) es correcta y no depende de ninguna zona horaria real**: verificado contra los 5 casos de medianoche del backlog (`f22`→01:15, `f39`→01:07, `f09`→00:13, `f10`→00:04, `f21`→00:22, todos exactos) y confirmado que no hay ni un solo `new Date('AAAA-MM-DD...')`, `.getDate()/.getHours()/.getMonth()/.getDay()` ni `toLocale*` sin `timeZone` fijo en todo el código nuevo.
- **El motor de reglas de E5 (`lib/itinerario-reglas.ts`) es correcto**: `calcularChoques` y `buscarAvisoTraslado` fueron probados contra los 15 casos de la tabla de la sección 3 del backlog (incluidos los más delicados: `f13`→`f17` conversatorio parcial, `f31`→`f34` "14 de 30 min" exacto, `f22`→`f23` correctamente sin aviso por ser días distintos) y los 15 coinciden exactamente con lo esperado. El único problema es que no está conectado a la interfaz (A2) y que el resumen de conteo tiene un bug aparte (A3) — la lógica de negocio en sí está bien resuelta, incluida la regla corregida de "primera función posterior que no se solapa" (B2 de la ronda anterior de DETALLE).
- **Las 46 rutas salen estáticas en `next build`**, cero rutas dinámicas por request — confirmado leyendo la salida real del build. `/programa`, `/programa/[dia]` (3), `/programa/[dia]/[seccion]` (12) y `/pelicula/[id]` (24) están implementadas exactamente como se rediseñó en DETALLE (A1), con `generateStaticParams` + `dynamicParams = false` en los tres archivos dinámicos.
- **Los ids de gradientes SVG del sello están correctamente prefijados** con el id de la película (`grad-fondo-${id}`, `grad-luz-${id}`), sin riesgo de colisión aun con películas repetidas en la misma página (`temporada-seca` en `f27`+`f33`) — implementa bien la corrección A3 de la ronda anterior.
- **`BotonVolver` implementa correctamente** el diseño de `router.back()` con reserva a `/programa` si no hay historial (corrección A2 de la ronda anterior).
- **La barra de navegación móvil usa `position: fixed; bottom: 0` con `env(safe-area-inset-bottom)`**, y `position: sticky; top: 0` en escritorio — implementa bien la corrección B6 de la ronda anterior (el único defecto es el texto que se corta, A11, no el posicionamiento en sí).
- **Las variables de contraste por sección** (`--color-seccion-X` / `--color-seccion-X-texto`) están definidas y usadas correctamente en `InsigniaSeccion.tsx`, implementando la corrección A4 de la ronda anterior.
- **`data/programa.json` no fue modificado** (`git diff --stat` vacío).
- **`npm run build` (TypeScript incluido) no tiene errores.**
