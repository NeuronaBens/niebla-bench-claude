# Backlog: sitio web Festival de Cine Niebla, 3ª edición

Fuente: `BRIEF.md` y `data/programa.json`. Este documento dice **qué** hay que construir y **cómo se comprueba**. El **cómo se construye** está en `docs/DETALLE.md`.

## Prioridades

- **P0 (imprescindible):** sin esto el sitio no cumple el brief. Todo P0 debe quedar terminado.
- **P1 (importante):** lo pide el brief de forma implícita o marca la diferencia entre "funciona" y "se siente como el festival". Se espera terminado.
- **P2 (deseable):** suma, pero puede quedar pendiente si se anota en `ENTREGA.md`.

Cada historia tiene un identificador (`H-x.y`) que `docs/DETALLE.md` y `docs/REVIEW.md` usan para referirse a ella. Orden sugerido de trabajo: Épica 0, Épica 4 (lógica), Épica 2, Épica 3, Épica 1, y al final los P2.

## Datos de referencia que usan los criterios

Calculados desde `data/programa.json` (hora de término = inicio + duración de la película):

| Función | Película | Sala | Inicio | Término | Extra |
|---|---|---|---|---|---|
| f03 | El último astillero | Galpón 7 | Jue 18:00 | 19:24 | conversatorio 20 min |
| f05 | La hora azul del puerto | Teatro | Jue 19:30 | 21:08 | nota: función inaugural |
| f07 | Transbordador de invierno | Terraza Faro | Jue 20:15 | 21:56 | aire libre |
| f09 | Mar negro | Teatro | Jue 22:15 | Vie 00:13 | pasa medianoche |
| f10 | La niebla tiene dientes | Galpón 7 | Jue 22:30 | Vie 00:04 | pasa medianoche |
| f13 | Sal de roca | Teatro | Vie 18:00 | 19:52 | conversatorio 25 min |
| f16 | Cortos II: Noches de puerto | El Muelle | Vie 20:05 | 21:13 | |
| f21 | Las cintas del faro | Terraza Faro | Vie 23:00 | Sáb 00:22 | aire libre, pasa medianoche |
| f22 | Marea roja | Galpón 7 | Vie 23:30 | Sáb 01:15 | agotada, pasa medianoche |
| f31 | La hora azul del puerto | Teatro | Sáb 17:30 | 19:08 | conversatorio 30 min, agotada |
| f34 | Ahogados | Galpón 7 | Sáb 19:30 | 21:09 | |
| f36 | Transbordador de invierno | Teatro | Sáb 21:00 | 22:41 | nota: entrega de premios |
| f38 | La niebla tiene dientes | Galpón 7 | Sáb 22:00 | 23:34 | |
| f39 | Las cintas del faro | Galpón 7 | Sáb 23:45 | Dom 01:07 | pasa medianoche |

Totales: 24 películas, 39 funciones (jueves 10, viernes 12, sábado 17), 4 salas, 4 secciones (Competencia Latinoamericana 8 películas, Panorama Internacional 6, Bruma Nocturna 5, Hecho en la Costa 5).

---

## Épica 0. Base del proyecto y reglas transversales

### H-0.1 Datos tipados y sin modificar (P0)
Como equipo, queremos leer `data/programa.json` con tipos, para que todo el sitio use una sola fuente de verdad.
- [ ] `data/programa.json` queda idéntico al del commit base (`git diff --stat -- data/` no muestra cambios).
- [ ] Ninguna pantalla muestra una película, función, horario, sala, precio, invitado, premio o dato que no esté en el JSON. Se permiten textos editoriales generales sobre el festival siempre que no inventen hechos.
- [ ] Las horas de término, los cruces de medianoche y los traslados se calculan desde los datos, nunca se escriben a mano.
- [ ] Las horas mostradas no dependen de la zona horaria del computador que construye ni del navegador que visita: con el sistema en UTC, en Chile o en Japón se ven las mismas horas.

### H-0.2 Build limpio (P0)
- [ ] `npm run build` termina sin errores.
- [ ] `npm run lint` termina sin errores.
- [ ] No quedan restos de la plantilla de create-next-app: textos en inglés, logos de Next o Vercel, `app/page.module.css` de ejemplo, título "Create Next App", favicon de Next ni svg sin uso en `public/`.
- [ ] Portada, programa, las 24 fichas, itinerario e itinerario compartido se generan estáticos en el build (en la salida de `next build` aparecen como estáticos o SSG, no como dinámicos).

### H-0.3 Restricciones del brief (P0)
- [ ] No hay librerías de componentes en `package.json` (shadcn/ui, MUI, Chakra, Mantine, DaisyUI, Radix, Headless UI, React Aria ni similares).
- [ ] Hay como máximo una librería de animación en `package.json`.
- [ ] No hay imágenes externas ni fotos: ningún `img`, `background` o `url()` apunta a otro dominio y no hay archivos jpg, png, webp o gif en el proyecto.
- [ ] Sin backend: no hay route handlers, server actions, proxy, bases de datos ni `fetch` a servicios externos.
- [ ] Todos los textos visibles, `alt`, `aria-label`, títulos de pestaña y mensajes de error están en español, con `lang="es-CL"` en el documento.
- [ ] No aparece ningún emoji en la interfaz, incluidos títulos de pestaña, botones y mensajes.
- [ ] No aparecen puntajes, estrellas, "destacadas", "imperdibles", "más vistas", "top" ni ningún orden que sugiera ranking. Los listados se ordenan por hora o por el orden de los datos.

### H-0.4 Movimiento reducido (P0)
- [ ] Con `prefers-reduced-motion: reduce` no hay desplazamientos, rotaciones, escalados, parallax ni animaciones en bucle. Solo se permiten transiciones de opacidad o color de 200 ms o menos.
- [ ] Todo el contenido que entra con animación es visible y usable si la animación no corre (nada queda con opacidad 0).

### H-0.5 Responsivo de 360 px a escritorio (P0)
- [ ] A 360 px de ancho no hay scroll horizontal en ninguna página (`document.documentElement.scrollWidth` es 360 o menos).
- [ ] A 360 px ningún texto se corta ni se superpone, incluidos "Cortos II: Noches de puerto", "Transbordador de invierno" y "Teatro Municipal de Puerto Bruma".
- [ ] Los controles táctiles miden al menos 44 × 44 px.
- [ ] A 1440 px el contenido tiene un ancho máximo o una grilla pensada para escritorio y no se estira de borde a borde sin control.

### H-0.6 Accesibilidad básica (P1)
- [ ] Todo se puede usar solo con teclado, con foco visible en cada control.
- [ ] Hay un enlace "Saltar al contenido" al inicio de cada página.
- [ ] El texto cumple contraste WCAG AA (4,5:1 texto normal, 3:1 texto grande de 24 px o más).
- [ ] La información nunca depende solo del color: sección, agotada, aire libre y avisos del itinerario tienen texto.
- [ ] Los botones para marcar una función exponen su estado (`aria-pressed` o equivalente) y un nombre accesible que incluye película, día y hora.
- [ ] Los cambios importantes (función agregada o quitada, link copiado, cantidad de resultados al filtrar) se anuncian en una región `aria-live`.
- [ ] Cada página tiene un único `h1` y los encabezados siguen un orden lógico.

### H-0.7 Identidad visual propia (P1)
Como organizadores, queremos que el sitio no parezca "la web de una empresa de seguros".
- [ ] Hay un sistema visual consistente (tipografías, paleta, texturas y motivos) definido en variables CSS y aplicado en todas las páginas.
- [ ] Cada sección del festival tiene un color y un motivo gráfico reconocibles que se repiten en portada, programa, ficha e itinerario.
- [ ] No hay tarjetas genéricas con sombra suave y esquinas redondeadas, íconos de stock ni degradados morado-azul de plantilla.
- [ ] Las tipografías se cargan con `next/font`.

### H-0.8 Navegación global (P0)
- [ ] Desde cualquier página se llega a Portada, Programa y Mi itinerario en un toque.
- [ ] En celular la navegación queda al alcance del pulgar mientras se hace scroll.
- [ ] "Mi itinerario" muestra cuántas funciones tiene guardadas la persona, sin mostrar un "0" falso antes de leer lo guardado.
- [ ] La página actual se marca visualmente y con `aria-current="page"`.

### H-0.9 Metadatos y página 404 (P1)
- [ ] Cada página tiene título de pestaña en español, por ejemplo "Programa · Festival de Cine Niebla" y "Sal de roca · Festival de Cine Niebla".
- [ ] Hay descripción, `theme-color` e ícono propio del festival hecho con código.
- [ ] Una ruta inexistente y una película inexistente (`/pelicula/no-existe`) muestran una página 404 en español, con el estilo del sitio y enlaces al programa y a la portada.

---

## Épica 1. Portada

### H-1.1 Presentación del festival (P0)
Como vecina del puerto que entra por primera vez, quiero entender en segundos qué es, cuándo y dónde, para decidir si voy.
- [ ] A 360 × 640 px, sin hacer scroll, se ven el nombre del festival, "3ª edición", las fechas (15, 16 y 17 de octubre de 2026) y "Puerto Bruma".
- [ ] Sin scroll se ve también un llamado claro a ver el programa que lleva a `/programa`.
- [ ] Se explica qué es: un festival de cine en Puerto Bruma con 24 películas, 4 salas y 3 días. Los números se calculan desde los datos.

### H-1.2 Una portada que sorprenda (P1)
- [ ] La primera pantalla tiene una pieza visual hecha con código (CSS, SVG o canvas) ligada al nombre y al lugar: niebla, faro, mar o puerto. No es un fondo plano con un título.
- [ ] Tiene movimiento sutil y una versión estática cuidada con `prefers-reduced-motion`.
- [ ] La animación no traba el scroll en un celular: solo se animan `transform` y `opacity`, sin `setInterval` ni `requestAnimationFrame` permanentes.
- [ ] El título y las fechas mantienen contraste AA sobre la pieza visual en todo momento de la animación.

### H-1.3 Las secciones del festival (P0)
- [ ] Se muestran las 4 secciones con su nombre y descripción tal como vienen en los datos.
- [ ] Cada sección muestra cuántas películas tiene (8, 6, 5 y 5) y su color y motivo propios.
- [ ] Cada sección enlaza al programa filtrado por esa sección.

### H-1.4 Dónde: las salas (P0)
- [ ] Se listan las 4 salas con nombre, dirección y capacidad.
- [ ] Terraza Faro se marca "al aire libre" y muestra su nota de lluvia.
- [ ] Se muestran los minutos caminando entre salas (tabla, esquema o mapa dibujado con código) sacados de `trasladosMin`. Si es un esquema, se aclara que no está a escala.

### H-1.5 Cuándo: los tres días (P1)
- [ ] Se resume cada día con su cantidad de funciones, la hora de la primera función y la hora de término de la última: jueves 10 funciones de 16:00 a 00:13, viernes 12 de 16:30 a 01:15, sábado 17 de 12:00 a 01:07.
- [ ] Cada día enlaza al programa filtrado por ese día.
- [ ] Se mencionan los hitos que están en los datos: la función inaugural (jueves 19:30, La hora azul del puerto) y la entrega de premios (sábado 21:00, antes de Transbordador de invierno).

### H-1.6 Entradas y contacto (P0)
- [ ] Se informa: entrada general $4.000, funciones al aire libre gratis, venta solo en la boletería de cada sala desde una hora antes de cada función, sin venta en línea.
- [ ] Se muestran el correo `hola@festivalniebla.cl` como enlace `mailto:` y el Instagram `@festivalniebla`.
- [ ] Correo, Instagram y forma de venta también están en el pie de página de todo el sitio.

---

## Épica 2. Programa

### H-2.1 Ver todas las funciones (P0)
Como persona que revisa el programa caminando, quiero ver rápido qué hay y a qué hora.
- [ ] `/programa` muestra las 39 funciones agrupadas por día y ordenadas por hora de inicio; a igual hora, por nombre de sala.
- [ ] Cada función muestra hora de inicio, hora de término, título, sección, sala y duración.
- [ ] Las funciones que terminan después de medianoche lo dicen sin ambigüedad: Mar negro (jueves 22:15) muestra que termina a las 00:13 de la madrugada del viernes.
- [ ] Se marcan con texto las funciones agotadas (f22 y f31), al aire libre (f07, f17, f21, f33 y f37), con conversatorio y su duración (f03, f13, f25 y f31) y con nota especial (f05 y f36).
- [ ] Cada función enlaza a la ficha de su película.
- [ ] El tipo de estreno ("Estreno mundial", "latinoamericano", "nacional") se ve de forma discreta, sin aspecto de premio o ranking.

### H-2.2 Filtrar por día (P0)
- [ ] Hay un control con "Todos", "Jue 15", "Vie 16" y "Sáb 17".
- [ ] "Jue 15" muestra exactamente 10 funciones, "Vie 16" 12 y "Sáb 17" 17.
- [ ] Una función pertenece al día en que empieza: f22 (viernes 23:30, termina sábado 01:15) aparece solo en viernes.
- [ ] El filtro queda en la URL (`/programa?dia=sabado`): recargar, volver atrás desde una ficha o compartir el link mantiene el filtro.

### H-2.3 Filtrar por sección (P0)
- [ ] Hay un control con las 4 secciones que permite elegir una o varias y volver a todas.
- [ ] Día y sección se combinan: "Sáb 17" con "Hecho en la Costa" muestra exactamente f24 y f26.
- [ ] El filtro de sección queda en la URL (`/programa?seccion=nocturna`, `/programa?dia=jueves&seccion=costa,competencia`).
- [ ] Parámetros inválidos (`?dia=lunes`, `?seccion=xyz`) se ignoran sin romper la página.
- [ ] Se muestra cuántas funciones coinciden ("12 funciones").
- [ ] Si no hay resultados, aparece un mensaje en español con un botón para limpiar los filtros.
- [ ] Los enlaces de la portada a una sección o a un día abren el programa ya filtrado.

### H-2.4 Programa cómodo en celular (P0)
- [ ] A 360 px cada función se lee sin zoom y la hora de inicio es el dato más visible de la fila.
- [ ] Los filtros quedan a mano al hacer scroll (fijos arriba o abajo) sin tapar más del 25 % del alto de una pantalla de 640 px.
- [ ] Al cambiar el filtro de día, la lista vuelve a su inicio.
- [ ] El filtrado ocurre en el navegador, sin recargar la página ni esperas visibles.
- [ ] Sin JavaScript, o antes de que cargue, se ve el programa completo sin filtrar.

### H-2.5 Marcar funciones desde el programa (P0)
- [ ] Cada función tiene un control para agregarla o quitarla de Mi itinerario sin entrar a la ficha.
- [ ] El control muestra claramente si la función ya está en el itinerario.
- [ ] Al marcar, el contador de Mi itinerario en la navegación se actualiza al instante.
- [ ] Si la función recién marcada se topa, no alcanza o hace perder un conversatorio respecto de otra ya elegida, se avisa en ese momento de forma breve y sin bloquear, nombrando la otra función.
- [ ] Marcar una función agotada está permitido, porque la persona puede tener entrada, y la función sigue indicando "Agotada".

### H-2.6 Vista de grilla por salas en escritorio (P2)
- [ ] Desde 1024 px se puede ver cada día como grilla: una columna por sala y un eje vertical de horas, con bloques de alto proporcional a la duración.
- [ ] Las funciones que pasan medianoche se dibujan hasta su término real.
- [ ] En celular esta vista no se ofrece.

### H-2.7 "Ahora" durante el festival (P2)
- [ ] Si la fecha y hora actuales en `America/Santiago` caen dentro de un día del festival y la URL no trae `dia`, el programa abre en ese día y marca las funciones en curso y la siguiente.
- [ ] Fuera de las fechas del festival no se muestra nada de esto.
- [ ] No produce errores de hidratación en consola.

---

## Épica 3. Ficha de película

### H-3.1 Datos de la película (P0)
- [ ] Existe una página estática por película en `/pelicula/<id>` para las 24 películas.
- [ ] Muestra título, título original cuando existe (8 películas lo tienen), dirección, país, año, duración legible ("1 h 38 min"), sección con su color y enlace al programa filtrado, clasificación, tipo de estreno y sinopsis completa.
- [ ] La clasificación "TE" se explica como "Todo espectador"; "+14" y "+18" se muestran tal cual.
- [ ] No hay puntajes, estrellas, reseñas ni tráiler.

### H-3.2 Afiche hecho con código (P0)
- [ ] Cada película tiene una pieza visual propia generada con código, sin imágenes.
- [ ] Las 24 piezas son distintas entre sí, se reconoce la sección de cada una y la misma película siempre produce la misma pieza (no cambia al recargar ni genera errores de hidratación).
- [ ] La pieza aparece grande en la ficha y en tamaño reducido en al menos otro lugar (portada, programa o itinerario).
- [ ] Es decorativa para lectores de pantalla porque el título ya está en texto.
- [ ] Se ve bien a 360 px y en escritorio.

### H-3.3 Todas las funciones de la película (P0)
- [ ] La ficha lista todas las funciones de la película en orden cronológico: "Cordillera de papel" muestra f12 (viernes 17:30, Galpón 7) y f23 (sábado 12:00, El Muelle); "Bruma, 1987" muestra solo f24.
- [ ] Cada función muestra día, hora de inicio y de término, sala con dirección y, cuando aplica, agotada, aire libre con nota de lluvia, conversatorio y nota especial.
- [ ] Cada función tiene el mismo control de itinerario que el programa, sincronizado con él.
- [ ] Se muestra el precio de cada función: $4.000, o gratis si es al aire libre.

### H-3.4 Seguir explorando (P2)
- [ ] Al final de la ficha se muestran las otras películas de la misma sección, en el orden de los datos, con enlace.
- [ ] El enlace "Volver al programa" conserva los filtros con los que se llegó desde el programa.

---

## Épica 4. Mi itinerario

### H-4.1 Armar y guardar el itinerario (P0)
Como persona que llega corriendo después de la pega, quiero marcar lo que quiero ver y encontrarlo después en el celular, sin crear cuenta.
- [ ] `/itinerario` muestra las funciones marcadas, agrupadas por día y en orden cronológico.
- [ ] Se guarda en el navegador: al cerrar la pestaña y volver, sigue ahí.
- [ ] Con el sitio abierto en dos pestañas, marcar en una se refleja en la otra.
- [ ] No hay formularios, registro ni pedidos de datos personales.
- [ ] Si el almacenamiento no está disponible o el dato guardado está corrupto, el sitio no se rompe: parte con un itinerario vacío y, si no se puede guardar, lo avisa una vez.
- [ ] Identificadores guardados que no existen en los datos se descartan en silencio.
- [ ] Sin funciones marcadas se muestra un estado vacío con personalidad y un enlace al programa.

### H-4.2 Quitar funciones y deshacer (P0)
- [ ] Cada función se puede quitar desde el itinerario.
- [ ] Al quitar aparece durante unos segundos la opción "Deshacer", que la restituye.
- [ ] "Vaciar itinerario" existe, también permite deshacer y no usa `window.confirm`.

### H-4.3 Aviso de choques (P0)
- [ ] Dos funciones elegidas **se topan** cuando la que empieza después lo hace antes de que termine la película de la otra. El aviso aparece en ambas y nombra a la otra.
- [ ] f09 (Teatro, jueves 22:15 a 00:13) con f10 (Galpón 7, jueves 22:30 a 00:04): aviso de choque.
- [ ] f21 (viernes 23:00 a 00:22) con f22 (viernes 23:30 a 01:15): aviso de choque, aunque ambas terminen el sábado.
- [ ] Terminar exactamente a la hora en que empieza otra función en la misma sala no es choque.
- [ ] El conversatorio no cuenta para el choque: se compara con el término de la película.
- [ ] El choque se detecta entre cualquier par de funciones elegidas, no solo entre contiguas, y compara fechas y horas completas (no solo horas del día).

### H-4.4 Aviso de traslado imposible (P0)
- [ ] Si dos funciones no se topan pero entre el término de una y el inicio de la otra hay menos minutos que los de caminata entre sus salas, se avisa que no alcanza a llegar caminando, con los minutos necesarios y los disponibles.
- [ ] f07 (Terraza Faro, termina 21:56) con f09 (Teatro, 22:15): necesita 20 min y tiene 19. Aviso.
- [ ] f03 (Galpón 7, termina 19:24) con f05 (Teatro, 19:30): necesita 8 y tiene 6. Aviso.
- [ ] f38 (Galpón 7, termina 23:34) con f39 (Galpón 7, 23:45): misma sala, sin aviso.
- [ ] Si los minutos disponibles son exactamente iguales a los de caminata, no hay aviso.
- [ ] Entre dos funciones seguidas sin problemas se muestra el tramo: minutos caminando hasta la siguiente sala y margen que sobra.

### H-4.5 Aviso de conversatorio perdido (P0)
- [ ] Si una función tiene conversatorio y la siguiente función elegida obliga a salir antes de que termine (término de la película + conversatorio + caminata > inicio de la siguiente), se avisa que se lo perdería. No se presenta como choque ni con el mismo tono.
- [ ] El aviso dice cuánto del conversatorio alcanza a ver. f13 (Teatro, termina 19:52, conversatorio 25) con f16 (El Muelle, 20:05, caminata 12): alcanza 1 de 25 minutos.
- [ ] f31 (Teatro, termina 19:08, conversatorio 30) con f34 (Galpón 7, 19:30, caminata 8): alcanza 14 de 30 minutos.
- [ ] Si ese mismo par ya tiene aviso de choque o de traslado, no se agrega un aviso separado de conversatorio; el aviso principal menciona que también se lo pierde.
- [ ] Una función con conversatorio sin otra función elegida después no genera aviso.

### H-4.6 Otros avisos útiles (P1)
- [ ] Si se eligen dos funciones de la misma película, se avisa de forma informativa indicando la otra función.
- [ ] Las funciones agotadas del itinerario lo indican ("Agotada: sirve solo si ya tienes entrada").
- [ ] Las funciones al aire libre recuerdan la nota de lluvia.
- [ ] (P2) Para funciones en Terraza Faro, el itinerario revisa también el caso de lluvia con cambio a Galpón 7 y avisa si en ese caso no alcanza a llegar.

### H-4.7 Resumen del recorrido (P1)
- [ ] Arriba del itinerario se resume: cantidad de funciones, películas distintas, horas totales de cine y cantidad de avisos.
- [ ] Desde el resumen se puede ir a cada aviso.
- [ ] Se muestra el total estimado en entradas ($4.000 por cada función que no es al aire libre) y se aclara que se paga en boletería.

### H-4.8 Armar el itinerario se siente bien (P1)
- [ ] Marcar una función tiene respuesta visual inmediata y animada, propia del festival, que no parece un checkbox.
- [ ] El itinerario se ve como un recorrido por el puerto a lo largo del día (línea de tiempo, boletos, tramos caminando), no como una tabla.
- [ ] Los avisos están escritos en tono cercano y claro, en español de Chile, sin tecnicismos.

### H-4.9 Compartir el itinerario con un link (P0)
- [ ] Desde el itinerario hay un botón "Compartir" que genera un link con todas las funciones elegidas.
- [ ] Si el dispositivo tiene menú nativo de compartir, se usa. Si no, el link se copia al portapapeles y se confirma. Si copiar falla, el link se muestra seleccionable.
- [ ] El link funciona sin backend: toda la información va en la URL.
- [ ] El parámetro con las funciones mide menos de 200 caracteres incluso con las 39 funciones.
- [ ] Con el itinerario vacío el botón no se ofrece.

### H-4.10 Abrir un itinerario compartido (P0)
Como amiga que recibe el link por WhatsApp, quiero ver lo que armó la otra persona y copiarlo al mío.
- [ ] Al abrir el link se ve el itinerario compartido con el mismo formato y los mismos avisos que uno propio, rotulado claramente como compartido.
- [ ] Abrir el link no modifica el itinerario propio guardado.
- [ ] Hay una acción para copiarlo. Si el propio está vacío, lo copia directo. Si no, ofrece "Sumar al mío" (unión sin duplicados) y "Reemplazar el mío".
- [ ] Tras copiar se confirma y se ofrece ir a Mi itinerario, donde los avisos se recalculan con el resultado.
- [ ] Se indica qué funciones del compartido ya estaban en el itinerario propio.
- [ ] Identificadores inexistentes se ignoran con el aviso "Algunas funciones del link ya no están en el programa". Un link sin funciones válidas muestra un mensaje y un enlace al programa.
- [ ] Identificadores repetidos o desordenados se muestran una sola vez y en orden cronológico.

### H-4.11 Llevarlo en el bolsillo (P2)
- [ ] El itinerario se imprime limpio en papel: sin navegación, fondo claro y texto oscuro.
