# Revisión de la implementación: sitio del Festival de Cine Niebla

Revisión del código en `app/`, `components/` y `lib/`, contra `BRIEF.md`, `docs/BACKLOG.md` y `docs/DETALLE.md`.

**Cómo se revisó:** lectura completa del código; `npm run build` (pasa, 1 warning) y `npm run lint` (pasa, sin hallazgos); y pruebas en el navegador sobre el build de producción (`next start`) a 360×740 y 1280×860, con dos itinerarios que cubren todos los casos del backlog, el link compartido, el estado vacío y la consola. El servidor se detuvo al terminar.

**Resultado general:** la lógica de choque, traslado y conversatorio está **correcta en los diez casos verificables del backlog**, incluidos los que cruzan medianoche y los bordes (`fin == inicio`, llegada justa). Las restricciones duras del brief se cumplen. Los hallazgos son de presentación y accesibilidad, no de reglas de negocio. Hay **1 P0**, **4 P1** y **11 P2**.

---

## P0. Bloquea el brief

### 1. En la portada a 360 px, las fechas y "3ª edición" quedan sobre la torre del faro y no se leen

- **Dónde:** [EscenaPuerto.module.css:129](components/portada/EscenaPuerto.module.css:129) (`.texto` con `z-index: 2` y ancho completo), [EscenaPuerto.module.css:180](components/portada/EscenaPuerto.module.css:180) (`.fechas` en `var(--faro)`), [EscenaPuerto.tsx:19](components/portada/EscenaPuerto.tsx:19) (`preserveAspectRatio="xMaxYMax slice"`) y [EscenaPuerto.tsx:68](components/portada/EscenaPuerto.tsx:68) (la torre ocupa x 1302–1358 de un viewBox de 1440, es decir, pegada al borde derecho, que es justo el que ancla `xMax`).
- **Qué pasa:** verificado a 360×740. El bloque de texto mide 328 px de ancho desde x=16, y la torre blanca (`#E8EEF0`) cae encima de su mitad derecha. "…de 2026" queda impreso en ámbar `#F4C15D` sobre blanco `#E8EEF0`: contraste **1.4:1**. "Puerto Bruma, Chile · 3ª edición" queda parcialmente tapado por la torre.
- **Por qué importa:** H1.1 CA1 exige que sobre el pliegue en móvil se lean el nombre, "3ª edición", **las tres fechas con mes y año** y la ciudad. H0.5 CA3 pide 4.5:1 de contraste y H0.3 CA4 que la información crítica se lea con contraste alto. Es la primera pantalla y el público entra casi siempre desde el celular.
- **Qué esperaría:** que el texto se lea sin importar dónde caiga la escena. Por ejemplo, un velo detrás del bloque (degradado de `var(--noche)` opaco abajo a transparente arriba) en anchos `< 64rem`, o limitar `.texto` a ~65% del ancho en móvil y correr la torre más a la derecha y abajo. El comentario de [EscenaPuerto.tsx:64](components/portada/EscenaPuerto.tsx:64) dice que se corrió el faro "para no competir con el texto", pero con `xMax` el recorte lo trae de vuelta al centro. Verificar con una captura a 360×640, no solo a 1280.

---

## P1. Importante

### 2. La nota de la función no aparece en el itinerario

- **Dónde:** [ParadaItinerario.tsx:75](components/itinerario/ParadaItinerario.tsx:75) (después de `textoTerminaYConversatorio` pasa directo a los chips; nunca se usa `funcion.nota`).
- **Qué pasa:** con f05 marcada, la parada muestra hora, sala, dirección, título y "Termina 21:08", pero no "Función inaugural con la presencia del equipo de la película.". Igual con f36.
- **Por qué importa:** H4.1 CA2 lista explícitamente "las marcas de agotada, aire libre, conversatorio **y nota**". Es justamente el dato que explica por qué esa función importa.
- **Qué esperaría:** renderizar `funcion.nota` como ya se hace en [FilaFuncionFicha.tsx:66](components/pelicula/FilaFuncionFicha.tsx:66).

### 3. La nota de la función tampoco aparece en la grilla de escritorio

- **Dónde:** [TarjetaFuncion.tsx:80](components/programa/TarjetaFuncion.tsx:80): `{funcion.nota && variante === 'lista' && (…)}`.
- **Qué pasa:** verificado a 1280 px con `?dia=jueves`: la tarjeta de f05 muestra hora, sala, título, sección y "1 h 38 min · +14", sin la nota. En móvil sí aparece.
- **Por qué importa:** H2.1 CA3 pide que cada función muestre la nota "cuando corresponde", sin distinguir tamaño de pantalla.
- **Qué esperaría:** mostrarla también en `grilla`; si el alto no alcanza, al menos como texto accesible más `title`, igual que el tratamiento que ya se le da a los chips.

### 4. En escritorio no hay aviso antes de marcar

- **Dónde:** [TarjetaFuncion.tsx:90](components/programa/TarjetaFuncion.tsx:90): `{variante === 'lista' && <PistaFuncion … />}`.
- **Qué pasa:** verificado a 1280 px con f03 ya marcada: la tarjeta de f05 no indica nada. En móvil sí dice "No alcanzas a llegar desde El último astillero: 2 minutos tarde". El aviso en escritorio solo llega **después** de marcar, por la notificación.
- **Por qué importa:** H4.2 CA6 pide el aviso "en el programa y la ficha al momento de marcar (…) **para que la persona decida antes de agregar**", y H4.7 CA2 lo repite. Decidir después de agregar es exactamente lo que la historia quiere evitar.
- **Qué esperaría:** `PistaFuncion` también en la variante `grilla`, en una línea de 13 px cuando el alto lo permita y, si no, ícono con texto accesible y `title`, como especifica DETALLE en H2.4.

### 5. Los botones "Agregar" no tienen nombre accesible distinguible en móvil ni en la ficha

- **Dónde:** [BotonItinerario.tsx:55](components/itinerario/BotonItinerario.tsx:55): `aria-label={variante === 'compacto' ? etiquetaAccion : undefined}`.
- **Qué pasa:** verificado a 360 px en `/programa?dia=jueves`: 10 botones visibles, **todos** con nombre "Agregar" o "En mi itinerario" y ninguno con `aria-label`. Lo mismo en la ficha, que usa `variante="completo"`. La variante `compacto` (grilla de escritorio) sí está bien: "Quitar Las cintas del faro, Viernes 16 a las 23:00, de mi itinerario".
- **Por qué importa:** H0.5 CA1 pide que todo se pueda operar con teclado y H0.5 CA5 enlaces y controles descriptivos. Quien navega con lector de pantalla recorre 39 botones idénticos sin saber a qué función corresponde cada uno.
- **Qué esperaría:** aplicar siempre `etiquetaAccion`, que ya está calculada en [BotonItinerario.tsx:42](components/itinerario/BotonItinerario.tsx:42). El texto visible puede seguir siendo corto.

---

## P2. Mejoras

### 6. Las tarjetas cortas de la grilla recortan contenido

- **Dónde:** [GrillaPrograma.tsx:68](components/programa/GrillaPrograma.tsx:68) (`Math.max(duracionMin * 2, 126)`) junto con [TarjetaFuncion.module.css:178](components/programa/TarjetaFuncion.module.css:178) (`overflow: hidden` en `.grilla`).
- **Qué pasa:** verificado el sábado a 1280 px: 6 de 17 tarjetas tienen contenido más alto que su caja. En f24 (Bruma, 1987, 63 min: caja 126 px, contenido 163 px) se corta la clasificación "Todo espectador". No hay solapes entre tarjetas, solo recorte.
- **Por qué importa:** H2.1 CA3 pide que cada función muestre duración y clasificación.
- **Qué esperaría:** subir el mínimo de alto (unos 150 px) o compactar deliberadamente el contenido de las tarjetas cortas, en vez de perderlo por recorte.

### 7. El itinerario no recuerda boletería ni la nota de lluvia

- **Dónde:** [ParadaItinerario.tsx:76](components/itinerario/ParadaItinerario.tsx:76): solo se muestran los chips "Agotada" y "Al aire libre".
- **Por qué importa:** H4.8 CA2 pide recordar la nota de lluvia en las funciones al aire libre y, en las agotadas, que se compra en boletería desde una hora antes. Verificado con f21 y f22.
- **Qué esperaría:** lo que ya hace [FilaFuncionFicha.tsx:67](components/pelicula/FilaFuncionFicha.tsx:67).

### 8. "Tienes 107 min" debería leerse como duración

- **Dónde:** [mensajes.ts:55](lib/itinerario/mensajes.ts:55).
- **Qué pasa:** con f16 y f21 marcadas, el tramo dice "Tienes 107 min; son 9 caminando a Terraza Faro."
- **Por qué importa:** H4.7 CA4 (textos cortos, para leer de pie). Sobre una hora, los minutos sueltos cuestan de interpretar.
- **Qué esperaría:** `formatoDuracion` cuando pasa de 60 ("1 h 47 min"), manteniendo los minutos en los tramos cortos.

### 9. El aviso de misma película no dice qué día del mes

- **Dónde:** [mensajes.ts:96](lib/itinerario/mensajes.ts:96) y [mensajes.ts:100](lib/itinerario/mensajes.ts:100): usan `otra.dia.nombre`, que da "el viernes a las 18:00".
- **Por qué importa:** H3.2 CA3 y DETALLE piden "Ya tienes esta película el viernes 16 a las 18:00". El resto del sitio siempre nombra el día con número.
- **Qué esperaría:** `otra.dia.etiqueta` en minúscula.

### 10. El build deja un warning de fuente

- **Dónde:** [layout.tsx:19](app/layout.tsx:19).
- **Qué pasa:** `Failed to find font override values for font 'Big Shoulders'. Skipping generating a fallback font.` Sin métricas de respaldo, la fuente de las horas puede provocar un salto de layout mientras carga, justo en el dato más grande de cada tarjeta.
- **Qué esperaría:** declarar `fallback: ['system-ui', 'sans-serif']` en esa llamada (y, si el warning persiste, `adjustFontFallback: false`), para dejar el build limpio.

### 11. Hay textos derivables escritos a mano

- **Dónde:** [layout.tsx:39](app/layout.tsx:39) ("Tercera edición … 15, 16 y 17 de octubre de 2026"), [page.tsx:18](app/page.tsx:18) ("15 al 17 de octubre de 2026") y [page.tsx:29](app/page.tsx:29) ("Tres días…").
- **Por qué importa:** H0.1 CA5 pide que toda la información salga de `data/programa.json`. Hoy conviven fechas calculadas y fechas escritas: si cambiara un dato, la metadata quedaría mintiendo.
- **Qué esperaría:** reutilizar lo que ya hace bien el pie ([Pie.tsx:7](components/layout/Pie.tsx:7) y [Pie.tsx:20](components/layout/Pie.tsx:20)) con `listaHumana`, `nombreMes` y `ordinalPalabra`.

### 12. Riesgo latente: se pasa una función desde un Server Component

- **Dónde:** [VistaPrograma.tsx:16](components/programa/VistaPrograma.tsx:16) define `limpiarFiltros` y la entrega a `SinResultados` en [VistaPrograma.tsx:39](components/programa/VistaPrograma.tsx:39).
- **Qué pasa:** `VistaPrograma` también se renderiza como fallback de Suspense desde el servidor ([programa/page.tsx:17](app/programa/page.tsx:17)). Si esa rama llegara a ejecutarse, pasar una función a un Client Component rompe el render. Hoy es inalcanzable, porque el fallback no lleva filtros y siempre hay 39 funciones, así que no es un bug visible; es una trampa para el próximo cambio.
- **Qué esperaría:** que "limpiar filtros" sea un `<Link href="/programa">`, o marcar `VistaPrograma` como client.

### 13. Jerarquía de encabezados en móvil cuando hay un día filtrado

- **Dónde:** [ListaPrograma.tsx:48](components/programa/ListaPrograma.tsx:48): con `mostrarDias` en falso no se emite ningún `h2`.
- **Qué pasa:** a 360 px en `/programa?dia=jueves` se salta de `h1` "Programa" a los `h3` de cada película. Con "Todos" sí están los `h2` por día.
- **Por qué importa:** H0.5 CA5 pide jerarquía coherente.
- **Qué esperaría:** emitir siempre el `h2` del día, aunque sea visualmente oculto cuando ya está en el filtro.

### 14. La impresión no controla los cortes de página

- **Dónde:** [globals.css:240](app/globals.css:240): se cambian colores y se oculta `.noImprimir`, que está bien aplicado en encabezado, navegación, pie, notificaciones y acciones.
- **Por qué importa:** H4.8 CA3 pide un formato limpio para imprimir o guardar como PDF. Hoy una parada puede partirse entre dos páginas.
- **Qué esperaría:** `break-inside: avoid` en la parada y el tramo, y salto de página por día. Está declarado como pendiente en `ENTREGA.md` §5.

### 15. Faltan las transiciones sutiles al agregar y quitar en el itinerario

- **Dónde:** `components/itinerario/` (no hay animación de entrada de parada ni de tramo).
- **Por qué importa:** H4.7 CA5 las pide, apagadas con `prefers-reduced-motion`. El "encender" de la tarjeta del programa sí está. Declarado como pendiente en `ENTREGA.md` §5.

### 16. En la grilla, el conversatorio solo se ve como chip

- **Dónde:** [TarjetaFuncion.tsx:75](components/programa/TarjetaFuncion.tsx:75).
- **Por qué importa:** en la grilla el eje temporal es el que explica por qué la siguiente función se pisa con el conversatorio. DETALLE pedía un bloque rayado contiguo bajo la tarjeta. Es lo último de la lista: el chip ya cumple H2.1 CA3.

---

## Lo que está bien

- **Las reglas del itinerario son correctas.** Verifiqué en el navegador los diez casos del backlog y todos dan el texto exacto esperado: f05+f06 y f05+f06+f07 (tres choques), f08+f10 ("Llegarías 22:42, 12 minutos tarde"), f07+f09 (1 minuto, en singular), f03+f05 ("Llegarías 19:32, 2 minutos tarde", **sin** aviso de conversatorio, que es la corrección de DETALLE sección 0), f13+f16 ("alcanzas 1 de 25 min y sales a las 19:53"), f25+f28 (sin avisos, "7 min hasta la siguiente"), f14+f16 ("la siguiente empieza apenas termina, a las 20:05"), y f21+f22 y f09+f10 (choque a través de medianoche). La precedencia choque > traslado > conversatorio está implementada tal cual en [reglas.ts:48](lib/itinerario/reglas.ts:48).
- **Horas sin zona horaria.** `lib/tiempo.ts` es el único lugar con `Date`, siempre vía `Date.UTC`; no hay `toLocale*` ni `Intl` en todo el repo. Las funciones que cruzan medianoche se muestran con "+1" y con texto accesible "del día siguiente", y el resumen dice "de 19:30 a 00:04 del viernes 16".
- **Todo se genera estático.** El build deja `/`, `/programa`, `/itinerario`, `/itinerario/compartido` y `/_not-found` como ○ y las 24 fichas como ●. `useSearchParams` está en los dos casos dentro de `Suspense`, y el fallback de `/programa` es el programa completo, que además funciona sin JavaScript.
- **Restricciones del brief:** sin dependencias nuevas ni librería de animación (solo CSS), sin imágenes ni recursos externos, sin emojis, sin puntajes ni rankings, todo en español, `lang="es"`, y `data/programa.json` intacto. La consola no muestra errores de hidratación.
- **Persistencia y compartir:** el itinerario sobrevive recargas, ignora ids inválidos guardados, se sincroniza entre pestañas, y el link `?f=f05-f06-zz` muestra "1 función del link no existe y se omitió" **sin** tocar el itinerario propio (verificado: el contador siguió en 8 y `localStorage` no cambió).
- **Filtros:** `?dia=viernes&seccion=nocturna` da exactamente f19, f21 y f22; al tocar "Vie 16" la URL pasa a `?dia=viernes` con 12 funciones y sin recargar (una sola entrada de navegación).
- **A 360 px no hay scroll horizontal** en portada, programa ni itinerario, y los controles de filtro miden 44 px de alto. La fila de secciones desborda solo dentro de su propio contenedor desplazable.
- **La portada tiene personalidad.** El faro con haz que barre, la niebla en capas y el wordmark en Fraunces no se parecen en nada a una plantilla corporativa, y la grilla de escritorio por sala y hora se lee muy bien. Las marcas de película son deterministas y sin `id` en el SVG, que era el riesgo real al repetirlas.

---

## Lo mínimo para dar por aprobado

1. **P0 #1:** que las fechas y "3ª edición" se lean a 360 px en la portada (velo detrás del texto o reubicar la torre).
2. **P1 #2 y #3:** mostrar la nota de la función en el itinerario y en la grilla de escritorio.
3. **P1 #4:** mostrar el aviso antes de marcar también en escritorio.
4. **P1 #5:** `aria-label` descriptivo en todos los botones de itinerario, no solo en los compactos.
5. **P2 #6 y #7:** que las tarjetas cortas de la grilla no recorten la clasificación, y que el itinerario recuerde boletería y nota de lluvia.
6. **P2 #10:** dejar `npm run build` sin warnings.

Los demás P2 se pueden documentar como pendientes en `ENTREGA.md`, que ya es honesto sobre varios de ellos.
