# Revisión de la implementación

Revisión única del código entregado, contra `BRIEF.md`, `docs/BACKLOG.md` y `docs/DETALLE.md`. Los hallazgos están priorizados y no se corrigió nada. Cada uno dice qué pasa, cómo se reproduce, dónde está la causa y qué criterio incumple. La dirección de la corrección es una sugerencia: lo que manda es que el criterio se cumpla.

## Cómo se revisó

- Lectura de todo `lib/`, `app/` y `components/`, y del CSS global y de los módulos clave.
- `npm run build` y `npm run lint` corridos de nuevo.
- Recorrido en el build de producción (`npm start`) a 360 × 640, a 800 × 900 y en escritorio, con mediciones en la consola del navegador.
- Itinerario de prueba con f03, f05, f06, f07, f09, f10, f13, f16 y f28, más pruebas de dato corrupto y de avisos al agregar desde el programa.

## Lo que está bien (no tocar)

- Build y lint sin errores. Portada, programa, itinerario, compartido y las 24 fichas son estáticos.
- `data/programa.json` sin cambios. Sin emojis, sin recursos externos, sin librerías de componentes ni de animación.
- La lógica de `lib/itinerario/avisos.ts` da los resultados de la tabla de casos de `docs/DETALLE.md`: choques, traslados, conversatorios y medianoche están bien calculados.
- El tiempo se trabaja en minutos absolutos, sin `Date` sobre los datos, y las fuentes del afiche se resuelven bien.
- Todos los colores de la paleta pasan AA sobre su fondo.
- No hay scroll horizontal a 360 px en portada, programa ni ficha, ni errores de hidratación en consola.
- A 360 × 640, nombre, edición, fechas, lugar y botón al programa se ven sin scroll.
- Un JSON corrupto en `localStorage` deja el itinerario vacío sin romper nada.
- La portada tiene identidad propia y cumple la intención del brief.

---

## Prioridad alta

Incumplen criterios P0 o dejan información equivocada frente a la persona usuaria.

### R-01. Los avisos del itinerario se refieren a la misma función o no dicen de qué par hablan
**Historias:** H-4.3, H-4.6 y H-4.7.

**Reproducir:** itinerario con f03, f05, f06, f07, f09, f10, f13, f16 y f28.
- El boleto de "Transbordador de invierno" (jue 20:15) dice: "Se topa con Transbordador de invierno (jue 20:15)". Habla de sí mismo; el choque real es con "La hora azul del puerto".
- El boleto de "Vidrio" del jueves 20:00 dice: "Ya tienes Vidrio el jueves a las 20:00", o sea, él mismo. Solo el del sábado tiene sentido.
- En el resumen aparecen líneas como "Se topa con Vidrio (jue 20:00)" y "No alcanzas a llegar a Teatro Municipal de Puerto Bruma…" sin decir qué función se topa o desde dónde se camina. Hay dos líneas casi iguales sobre Transbordador de invierno que no se distinguen.

**Causa:** `lib/itinerario/textos.ts` arma la frase siempre desde el mismo lado del par: nombra a la segunda función en choque y a la primera en repetida. `components/itinerario/BoletoFuncion.tsx` pinta el mismo texto en los dos boletos del par, sin saber cuál es el boleto actual. `ResumenItinerario.tsx` usa el mismo texto sin nombrar las dos funciones.

**Dirección:**
- El texto de un aviso de par tiene que recibir desde qué función se lee, para nombrar siempre a la otra.
- En el resumen, nombrar ambas funciones ("La hora azul del puerto y Transbordador de invierno se topan de 20:15 a 21:08").

### R-02. Los tramos entre boletos pierden los datos que pide el backlog
**Historias:** H-4.3, H-4.4 y H-4.5.

**Reproducir:** con el mismo itinerario de R-01:
- **Tramo de choque:** entre f09 y f10 solo dice "Mar negro y La niebla tiene dientes se cruzan.", sin el horario del cruce (22:30 a 00:04).
- **Tramo de conversatorio:** entre f13 y f16 dice "Sales antes de que termine el conversatorio de Sal de roca.", sin decir que alcanzas 1 de 25 minutos.
- **Tramo de traslado:** entre f03 y f05 no menciona que también te pierdes el conversatorio de El último astillero.

Esa información existe solo en el resumen de arriba, lejos del par.

**Causa:** `components/itinerario/TramoEntreFunciones.tsx` escribe sus propias frases en vez de usar el aviso calculado. Además, `lib/itinerario/agrupar.ts` quita esos avisos de los boletos cuando hay tramo, así que el tramo es el único lugar junto al par.

**Dirección:** el tramo debe mostrar el texto completo del aviso correspondiente (solape, minutos que alcanzas, pérdida de conversatorio), con las mismas funciones de `textos.ts`.

### R-03. La nota real de lluvia de Terraza Faro no aparece en el itinerario
**Historia:** H-4.6.

**Reproducir:** agregar f07. El boleto dice "Función al aire libre. Si llueve, revisa el cambio de sala.", que es un texto inventado. La nota de los datos dice que, si llueve, la función se traslada al Galpón 7 con la misma hora de inicio.

**Causa:** en `lib/itinerario/textos.ts`, el caso `aireLibre` lee la nota de la función en vez de la nota de la sala, y como la función no tiene nota cae en el texto por defecto.

**Dirección:** usar la nota de la sala. Eliminar el texto por defecto inventado.

### R-04. La barra fija de filtros tapa el 31 % de la pantalla del celular
**Historia:** H-2.4 (máximo 25 % de 640 px).

**Reproducir:** `/programa` a 360 × 640, hacer scroll. La barra fija mide 197 px.

**Causa:** en `components/programa/FiltrosPrograma.module.css` el contenedor completo (día, cuatro secciones en 2 × 2 y contador) es `position: sticky`. `docs/IMPLEMENTACION.md` dice que solo la fila de día queda fija, pero el CSS no hace eso.

**Dirección:** dejar fija solo la fila de días, o compactar secciones al hacer scroll, hasta 160 px o menos. Medir con la consola a 360 × 640.

### R-05. Entre 768 y 1023 px la barra de filtros queda debajo de la cabecera fija
**Historias:** H-2.4 y H-0.5.

**Reproducir:** `/programa` a 800 × 900, hacer scroll. La barra fija se pega en `top: 0`, pero desde 768 px la cabecera es fija con 56 px de alto y está encima (z-index 800 frente a 500). El botón "Vie 16" queda tapado por la cabecera y no se puede tocar.

**Causa:** `FiltrosPrograma.module.css` solo corrige el `top` desde 1024 px.

**Dirección:** desde 768 px, `top` igual al alto de la cabecera.

### R-06. Al cambiar de día con la página desplazada, la lista no vuelve a su inicio
**Historia:** H-2.4.

**Reproducir:** `/programa?dia=jueves` a 360 × 640, bajar hasta 1400 px y tocar "Vie 16". El scroll se queda en 1400 y el encabezado "VIERNES 16" queda 1015 px por encima de la pantalla. La persona ve la mitad de la lista y no el comienzo.

**Causa probable:** en `components/programa/ProgramaInteractivo.tsx`, `scrollIntoView` corre en el mismo clic, antes de que la lista filtrada se pinte (la navegación es asíncrona). Además, `scroll-margin-top` de la lista no considera el alto de la barra fija.

**Dirección:** hacer el scroll después de que cambie el día (por ejemplo, reaccionando al nuevo filtro). Dejar el encabezado del día visible bajo la barra fija.

### R-07. El afiche en miniatura no es la misma pieza que el afiche grande
**Historia:** H-3.2 ("la misma pieza aparece grande en la ficha y en tamaño reducido").

**Reproducir:** HTML servido de "La hora azul del puerto".
- En la ficha, el círculo del motivo tiene `cx=137.5` y `r=44.6`.
- En el programa, la miniatura tiene `cx=136.3` y `r=38.85`.

Pasa lo mismo con el resto: el número de dientes, las olas y la posición del barco cambian entre tamaños.

**Causa:** en `components/afiche/AfichePelicula.tsx` el generador pseudoaleatorio es uno solo y se va consumiendo en orden. Las nieblas llaman al generador solo cuando el tamaño no es `mini`, y el motivo lo consume después, así que recibe otros números. Además, el generador (mutable) se pasa como prop a un componente hijo que lo consume al renderizar. Eso hace el render impuro: un doble render de React en desarrollo o un cambio de orden produce otra pieza.

**Dirección:** calcular todos los parámetros de la pieza en una función pura antes de dibujar. Usar generadores separados por propósito (motivo, fondo, niebla) sembrados con el id más una sal fija. Así cada tamaño solo decide qué capas dibuja, no qué números salen.

---

## Prioridad media

Degradan la experiencia o incumplen criterios P1.

### R-08. Cada cambio de filtro pide datos al servidor
**Historia:** H-2.4 ("el filtrado ocurre en el navegador, sin recargar la página ni esperas visibles").

**Reproducir:** en `/programa`, tocar "Vie 16". Se hace una petición `GET /programa?dia=viernes&_rsc=…`. En local tarda 25 ms, pero en un celular con mala señal, caminando entre salas, el filtro espera a la red.

**Causa:** `ProgramaInteractivo.tsx` usa `router.replace` para cada cambio.

**Dirección:** actualizar la URL con la History API nativa (`window.history.replaceState`), que Next integra con `useSearchParams` sin ir al servidor. Revisar la guía `01-getting-started/04-linking-and-navigating.md` en `node_modules/next/dist/docs/01-app/`. Verificar en la pestaña de red que no haya peticiones al filtrar.

### R-09. El aviso al agregar desde el programa invierte la dirección
**Historia:** H-2.5.

**Reproducir:** con f09 (Teatro, 22:15) en el itinerario, agregar f07 (Terraza Faro, termina 21:56) desde el programa. El aviso dice: "No alcanzas a llegar desde Teatro Municipal de Puerto Bruma…". El Teatro es el destino, no el origen.

**Causa:** en `components/funcion/BotonItinerario.tsx` la frase asume que la función recién agregada es siempre la segunda del par. El aviso de conversatorio tiene el mismo problema ("te pierdes parte del conversatorio con X después" no dice de qué película es el conversatorio).

**Dirección:** usar las mismas frases de `textos.ts` corregidas en R-01, leídas desde la función recién agregada.

### R-10. Aviso falso de "no se puede guardar", y aviso ausente cuando de verdad no se puede
**Historia:** H-4.1.

**Reproducir:** poner texto inválido en la clave `niebla.itinerario.v1`, abrir `/programa`, agregar una función, ir a Mi itinerario y quitarla. Aparece "Tu navegador no deja guardar el itinerario…", pero `localStorage` quedó guardado correctamente.

**Causa:** en `lib/itinerario/almacen.ts` un `JSON.parse` fallido cae en el mismo `catch` que marca `persistible = false`.

**Al revés:** si el almacenamiento realmente falla, agregar desde el programa o la ficha nunca avisa, porque solo `ItinerarioPropio.tsx` llama a `consumirAvisoPersistencia` al quitar o vaciar.

**Dirección:**
- Distinguir "no hay acceso a `localStorage`" de "el dato guardado es inválido".
- Decidir la persistencia según si la escritura funciona.
- Mostrar el aviso una vez desde cualquier lugar donde se modifique el itinerario.

### R-11. La página del itinerario compartido se titula "Mi itinerario"
**Historias:** H-4.10 y H-0.6.

**Reproducir:** `/itinerario/compartido?f=05.09`. El h1 dice "Mi itinerario" aunque el itinerario es de otra persona. En la navegación, "Mi itinerario" queda marcado como página actual (`aria-current`) porque la comparación usa `startsWith('/itinerario')`.

**Dirección:** h1 "Itinerario compartido" o equivalente. No marcar "Mi itinerario" como actual en la ruta compartida.

---

## Prioridad baja

Pulido, accesibilidad fina y mantenimiento.

### R-12. En el programa los encabezados saltan de h1 a h3
**Historia:** H-0.6. `components/programa/ListaFunciones.tsx` usa h3 para los días y no hay h2 entre medio. Usar h2.

### R-13. El contador de Mi itinerario no llega a lectores de pantalla y late en cada carga
**Historia:** H-0.8. En `NavegacionPrincipal.tsx` el número tiene `aria-hidden` y el enlace se llama solo "Mi itinerario". El nombre accesible debería incluir la cantidad ("Mi itinerario, 3 funciones"). Además, la referencia del valor anterior parte en 0 durante la hidratación, así que la insignia hace el pulso en cada carga de página aunque no se haya agregado nada.

### R-14. Los filtros del programa aparecen tarde y empujan la lista
El fallback del `Suspense` en `app/programa/page.tsx` pinta la lista sin la barra de filtros. Al hidratar aparece la barra (197 px en celular) y la lista salta hacia abajo. Conviene que el fallback incluya la barra con "Todos" marcado, aunque no sea interactiva todavía.

### R-15. La banda de niebla no pasa por delante del título en la portada
**Historia:** H-1.2 (intención visual de `docs/DETALLE.md` 4). En `HeroNiebla.module.css` la banda del medio tiene `z-index: 5`, pero dentro de una capa con `z-index: 3`, que queda debajo del contenido (`z-index: 4`). La palabra NIEBLA nunca queda velada por la niebla. Si se corrige, volver a comprobar el contraste del título.

### R-16. Datos escritos a mano que deberían salir del JSON
**Historia:** H-0.1.
- Fechas en texto fijo en `HeroNiebla.tsx` y `PiePagina.tsx` ("15, 16 y 17 de octubre").
- Ids f05 y f36 fijos en `DiasFestival.tsx`; conviene tomar las funciones con `nota`.
- Nombres cortos de salas fijos en `MapaSalas.tsx`.

Hoy muestran lo correcto, pero se desalinean si cambian los datos.

### R-17. Advertencia del build por la fuente Big Shoulders
El build avisa: "Failed to find font override values for font `Big Shoulders`. Skipping generating a fallback font." Sin fuente de respaldo ajustada, los títulos grandes saltan al cargar la fuente. Revisar las opciones de `next/font` (`fallback`, `adjustFontFallback`) en `03-api-reference/02-components/font.md`, o aceptar y anotar la advertencia en `ENTREGA.md`.

### R-18. Archivo nuevo fuera del alcance del sitio
Se creó `.claude/launch.json` en la raíz del proyecto. No afecta el sitio, pero mencionarlo en `ENTREGA.md` o dejarlo fuera de la entrega.

---

## Pendientes declarados que deben quedar en ENTREGA.md

- **H-2.6:** vista de grilla por salas (P2), no implementada.
- **H-2.7:** "ahora" durante el festival (P2), no implementada.
- **H-4.11:** impresión (P2), parcial.
- **Desvíos aceptados, sin corrección necesaria:** el choque visual simplificado en el itinerario y el motivo de sección con CSS en vez del generador SVG. El resumen compacto de filtros solo importa si se usa para resolver R-04.

## Orden sugerido de corrección

1. R-01, R-02 y R-03, con un solo cambio de fondo en `textos.ts` y en quién pinta cada aviso.
2. R-04, R-05, R-06 y R-08, todo en la barra de filtros y en `ProgramaInteractivo.tsx`.
3. R-07, el afiche.
4. R-09, R-10 y R-11.
5. Los de prioridad baja que alcancen.
