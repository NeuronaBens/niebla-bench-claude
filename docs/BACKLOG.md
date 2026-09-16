# Backlog: sitio web del Festival de Cine Niebla, 3ª edición

Fuente de verdad: `BRIEF.md` y `data/programa.json`. Este documento traduce el brief a épicas e historias de usuario priorizadas con criterios de aceptación verificables. No toma decisiones de implementación (estilos, estructura de archivos, nombres de componentes): eso va en `docs/DETALLE.md`.

## Cómo leer este documento

- **Prioridad P0**: sin esto el sitio no cumple el brief. **P1**: el brief lo pide o lo implica con fuerza; se entrega salvo que haya un motivo documentado. **P2**: mejora la experiencia; se hace si hay tiempo.
- Cada historia tiene criterios de aceptación (CA) que se pueden verificar mirando el sitio o el resultado de un comando. Cuando un CA usa un ejemplo concreto, el ejemplo sale de `data/programa.json` y se puede comprobar a mano.
- "Función" = una proyección concreta (`funciones[]`). "Película" = un título del catálogo (`peliculas[]`). "Sección" = `secciones[]`. "Sala" = `salas[]`.

## Hechos del brief y de los datos que condicionan todo

No todos están dichos en el brief; salen de leer los datos. Cualquier historia que los contradiga está mal.

| Hecho | Detalle |
|---|---|
| Fechas | Jueves 15, viernes 16 y sábado 17 de octubre de 2026. Puerto Bruma, Chile. Zona horaria `America/Santiago`. |
| Volumen | 24 películas, 39 funciones, 4 salas, 4 secciones. Por día: jueves 10, viernes 12, sábado 17. |
| Fin de función | inicio + `duracionMin`. El conversatorio (`conversatorioMin`) va **después** del fin de la película y no forma parte de la función a efectos de choque. |
| Después de medianoche | f09 (jueves 22:15, termina 00:13), f10 (jueves 22:30, termina 00:04), f21 (viernes 23:00, termina 00:22), f22 (viernes 23:30, termina 01:15), f39 (sábado 23:45, termina 01:07). Pertenecen al día en que **empiezan**. |
| Agotadas | f22 (Marea roja, viernes 23:30) y f31 (La hora azul del puerto, sábado 17:30, con conversatorio). |
| Al aire libre | Toda función en Terraza Faro: f07, f17, f21, f33, f37. Entrada gratis. Si llueve se traslada al Galpón 7 a la misma hora. |
| Conversatorios | f03 (20 min), f13 (25 min), f25 (30 min), f31 (30 min). |
| Funciones con nota | f05 (inaugural, con el equipo de la película), f36 (antes se entregan los premios). |
| Traslados | Minutos caminando entre salas, simétricos, 0 dentro de la misma sala. Rango: 8 a 22 min. |
| Entradas | General $4.000 CLP; aire libre gratis; **solo en boletería de cada sala desde una hora antes de la función; no hay venta en línea**. El sitio no vende ni reserva. |
| Contacto | hola@festivalniebla.cl, Instagram @festivalniebla. |
| Películas con más de una función | 15 de las 24 tienen dos funciones; las otras 9 tienen una sola. Ninguna tiene tres. |
| Campos opcionales | `tituloOriginal`, `conversatorioMin`, `nota` (de función), `agotada`, `nota` (de sala). El sitio no puede romperse ni mostrar huecos raros cuando faltan. |
| Valores de `estreno` | `mundial`, `nacional`, `latinoamericano`. Se muestran como "Estreno mundial", "Estreno nacional", "Estreno latinoamericano". |
| Valores de `clasificacion` | `TE`, `+14`, `+18`. TE se muestra como "Todo espectador". |
| Horas | Vienen sin zona (`2026-10-15T16:00`). Son hora local de Chile y se muestran **tal cual**, sin que la zona horaria del navegador las cambie. Formato 24 h. |

---

## Épica 0. Base técnica y reglas transversales (P0)

Reglas que aplican a todas las pantallas. Se verifican una vez y se re-verifican en la revisión.

### H0.1 El proyecto compila y respeta las restricciones del brief (P0)
- CA1: `npm run build` termina sin errores.
- CA2: Next.js con App Router y TypeScript; no hay archivos `.js/.jsx` de aplicación.
- CA3: No hay ninguna librería de componentes en `package.json` (shadcn/ui, MUI, Chakra, Mantine, DaisyUI, Radix como sistema de componentes, etc.). Como máximo una librería de animación.
- CA4: No se carga ninguna imagen, foto, ícono ni recurso desde una URL externa. No hay peticiones a servicios externos en tiempo de ejecución. Las fuentes, si se usan, van por `next/font`.
- CA5: `data/programa.json` queda byte a byte igual al del commit base. Toda la información del sitio deriva de él; no hay películas, funciones, horarios, salas ni textos de programación inventados o duplicados a mano.
- CA6: No queda contenido de la plantilla de `create-next-app` visible en el sitio (logos de Next/Vercel, textos de bienvenida, íconos de `public/` sin uso).
- CA7: El sitio funciona entero en el navegador: sin backend, base de datos, API propia ni cookies de sesión.

### H0.2 Todo el texto de interfaz está en español (P0)
- CA1: Etiquetas, botones, avisos, estados vacíos, títulos de pestaña, textos de accesibilidad (`aria-label`, `alt`) y mensajes de error están en español neutro con vocabulario chileno cuando corresponde ("función", "sala", "boletería", "conversatorio").
- CA2: Los días se nombran como "Jueves 15", "Viernes 16", "Sábado 17" (o forma equivalente en español) y las horas en formato 24 h ("19:30").
- CA3: No hay emojis en ningún texto ni en ningún ícono de la interfaz.
- CA4: No se muestran puntajes, estrellas, rankings, "más vistas", "destacadas por votación" ni ningún indicador de calidad de las películas.

### H0.3 Funciona desde 360 px hasta escritorio (P0)
- CA1: A 360 px de ancho ninguna pantalla tiene scroll horizontal, texto cortado ni controles superpuestos.
- CA2: Los puntos de interacción (botones, filtros, marcar función) tienen área táctil de al menos 44×44 px en móvil.
- CA3: A 1280 px o más el contenido aprovecha el ancho (no es una columna de móvil estirada) y sigue siendo legible (líneas de texto de lectura no superan aprox. 75 caracteres).
- CA4: El sitio se puede usar de pie y caminando: la información crítica (hora, sala, aviso de choque) se lee con contraste alto y tamaño de texto de al menos 16 px en móvil.

### H0.4 Respeta `prefers-reduced-motion` (P0)
- CA1: Con la preferencia activada no hay animaciones de entrada, parallax, autoplay, transiciones de más de ~150 ms ni movimiento decorativo. Los cambios de estado siguen siendo visibles (por ejemplo, un cambio de color instantáneo en vez de un deslizamiento).
- CA2: Sin la preferencia, ninguna animación bloquea la interacción ni retrasa la lectura del programa más de un instante.
- CA3: Nada parpadea más de 3 veces por segundo.

### H0.5 Accesibilidad básica (P1)
- CA1: Todo se puede operar con teclado: navegación, filtros, marcar y quitar funciones, copiar link. El foco es visible.
- CA2: Los avisos de choque, traslado y conversatorio no dependen solo del color: llevan texto o ícono con texto alternativo.
- CA3: Contraste texto/fondo de al menos 4.5:1 en texto normal y 3:1 en texto grande, en toda la paleta elegida.
- CA4: Los cambios dinámicos (función agregada al itinerario, link copiado) se anuncian a lectores de pantalla.
- CA5: `<html lang="es">`, jerarquía de encabezados coherente (un `h1` por página), enlaces con texto descriptivo.

### H0.6 Metadatos y navegación global (P1)
- CA1: Cada página tiene `<title>` y descripción propios en español: portada, programa, cada película ("Título, Festival de Cine Niebla"), itinerario.
- CA2: Hay una navegación persistente con acceso a Portada, Programa y Mi itinerario, usable con una mano en móvil.
- CA3: El acceso a "Mi itinerario" muestra cuántas funciones tiene marcadas (0 cuando está vacío), y se actualiza al instante al marcar o quitar.
- CA4: Una URL de película inexistente muestra una página de "no encontrada" en español con enlace al programa; no un error de servidor.
- CA5: Hay un pie de página con contacto (correo e Instagram), lugar y fechas, e información de entradas.

---

## Épica 1. Portada (P0)

Objetivo del brief: "quien entre tiene que tener ganas de ir", que se sienta como el festival, de Puerto Bruma, y que "nos sorprenda". No puede parecer la web de una empresa de seguros.

### H1.1 Presentación del festival (P0)
Como vecino del puerto que llega por primera vez, quiero entender en segundos qué es esto, cuándo y dónde, para decidir ir.
- CA1: Sobre el pliegue en móvil (360×640) se lee: nombre del festival, "3ª edición" (o equivalente), las tres fechas con el mes y el año, y la ciudad.
- CA2: Hay un texto breve que dice qué es el festival (cine chico, de puerto, organizado por cuatro personas y voluntarios) sin copiar el brief textualmente ni sonar corporativo.
- CA3: Hay un llamado a la acción principal claramente visible que lleva al programa. Un segundo acceso lleva a "Mi itinerario".
- CA4: Se muestra que hay 24 películas y 4 salas en 3 días (cifras derivadas de los datos, no escritas a mano).
- CA5: Nada de la portada depende de imágenes externas; la identidad visual (niebla, puerto, faro, mar, noche) está resuelta con código.

### H1.2 Secciones del festival (P0)
- CA1: Se listan las 4 secciones con su nombre y descripción tal cual en los datos.
- CA2: Cada sección enlaza al programa ya filtrado por esa sección.
- CA3: Cada sección muestra cuántas películas tiene (derivado de los datos: Competencia 8, Panorama 6, Nocturna 5, Costa 5).

### H1.3 Dónde es: salas (P0)
- CA1: Se listan las 4 salas con nombre y dirección.
- CA2: Terraza Faro se marca como al aire libre y muestra su nota de lluvia.
- CA3: Se muestran los minutos caminando entre salas de alguna forma legible (tabla, lista o mapa esquemático dibujado con código). No hace falta un mapa real.

### H1.4 Información práctica (P1)
- CA1: Entradas: general $4.000, aire libre gratis, y la frase de venta (solo boletería, desde una hora antes, sin venta en línea). El sitio no ofrece comprar ni reservar.
- CA2: Se mencionan los momentos especiales derivados de los datos: función inaugural (jueves 19:30, La hora azul del puerto, con el equipo) y entrega de premios (sábado 21:00, antes de Transbordador de invierno).
- CA3: Se destaca que jueves y viernes las funciones empiezan desde la tarde (primera 16:00 / 16:30) y el sábado desde el mediodía (12:00), porque el público trabaja. Cifras derivadas de los datos.

### H1.5 La portada sorprende y tiene personalidad (P1)
- CA1: La portada tiene al menos un elemento visual generado con código que remite al lugar (niebla, faro, mar, puerto, noche) y que no es un bloque de color plano ni un gradiente genérico.
- CA2: La tipografía y el color son una decisión de identidad consistente en todo el sitio (misma paleta y familias en portada, programa, fichas e itinerario).
- CA3: Las animaciones, si las hay, refuerzan el tema (por ejemplo, la niebla) y se apagan con `prefers-reduced-motion`.
- CA4: No hay carruseles automáticos, sliders de "testimonios", tarjetas de "nuestros valores" ni otros patrones de sitio corporativo.

---

## Épica 2. Programa (P0)

Objetivo: ver las 39 funciones de los tres días, filtrar por día y sección, y usarlo bien desde el celular caminando entre salas.

### H2.1 Listado completo de funciones (P0)
- CA1: Con todos los filtros abiertos se ven las 39 funciones, ninguna repetida ni faltante.
- CA2: Están ordenadas cronológicamente por hora de inicio dentro de cada día, y los días en orden (jueves, viernes, sábado).
- CA3: Cada función muestra como mínimo: hora de inicio, hora de fin, título de la película, sala, sección, duración y clasificación. Cuando corresponde: "Agotada", "Al aire libre", "Conversatorio después (N min)", la nota de la función.
- CA4: Las funciones que terminan después de medianoche muestran la hora de fin de forma inequívoca (por ejemplo "23:45 – 01:07" con una marca de que termina el día siguiente) y siguen listadas en el día en que empiezan.
- CA5: Desde cada función se llega a la ficha de la película.
- CA6: Desde cada función se puede marcar o desmarcar para el itinerario sin salir del programa, y el estado (marcada / no marcada) se ve al instante.

### H2.2 Filtro por día (P0)
- CA1: Hay un selector de día con tres opciones (jueves 15, viernes 16, sábado 17) y una forma de ver todos.
- CA2: Al elegir un día se ven solo sus funciones (jueves: 10, viernes: 12, sábado: 17).
- CA3: El selector de día está siempre accesible sin volver arriba en móvil (fijo o al alcance), porque se usa caminando.
- CA4: Cambiar de día no recarga la página ni pierde la sección elegida.

### H2.3 Filtro por sección (P0)
- CA1: Se puede filtrar por cada una de las 4 secciones y volver a "todas".
- CA2: Los filtros de día y sección se combinan (por ejemplo, viernes + Bruma Nocturna = f19, f21, f22).
- CA3: El estado del filtro se refleja en la URL para que se pueda compartir o volver atrás con el navegador, y para que los enlaces de sección de la portada lleguen ya filtrados.
- CA4: Si una combinación no tiene funciones (hoy ninguna combinación día+sección está vacía, pero el estado debe existir), se muestra un mensaje en español y un acceso a limpiar filtros.

### H2.4 Se usa bien en el celular (P0)
- CA1: A 360 px cada función se lee de un vistazo: hora y sala son lo primero que se ve, en tamaño grande.
- CA2: Se distinguen visualmente las 4 salas y las 4 secciones (color, marca o forma) de manera consistente con las fichas y el itinerario.
- CA3: Funciones simultáneas o solapadas (por ejemplo, jueves 19:30 Teatro, 20:00 Galpón 7, 20:15 Terraza) se perciben como tales sin tener que leer todas las horas: por ejemplo, agrupadas por franja o mostradas sobre un eje de tiempo.
- CA4: En escritorio el programa puede aprovechar el ancho (por ejemplo, salas en columnas o una grilla por horas), sin que la versión móvil sea una versión "encogida" de esa.

### H2.5 Marca visual de cada película sin afiches (P1)
- CA1: Cada película tiene una representación visual propia generada con código (CSS, SVG o canvas) que es **determinista** (la misma película siempre se ve igual en programa, ficha e itinerario).
- CA2: Dos películas distintas no se confunden entre sí a simple vista; la sección influye en la representación de forma reconocible.
- CA3: No se usan imágenes externas, fotos ni afiches; tampoco iconos de terceros cargados por red.

---

## Épica 3. Ficha de cada película (P0)

### H3.1 Datos de la película (P0)
- CA1: Cada una de las 24 películas tiene su propia página con URL estable basada en su `id` (por ejemplo `/peliculas/sal-de-roca` o equivalente).
- CA2: Muestra: título, título original si existe (nada raro si no existe), dirección, país, año, duración en formato legible ("1 h 52 min"), sección (enlazada al programa filtrado), clasificación en texto ("Todo espectador", "+14", "+18"), tipo de estreno y sinopsis.
- CA3: "Varios directores" se muestra tal cual, sin intentar separarlo.
- CA4: Países con coma ("Chile, Francia") se muestran completos.
- CA5: La representación visual de la película (H2.5) aparece en la ficha en tamaño protagonista.

### H3.2 Funciones de la película (P0)
- CA1: Lista todas las funciones de esa película en orden cronológico, con día, hora inicio-fin, sala (con dirección), aire libre, agotada, conversatorio y nota cuando corresponda.
- CA2: Cada función se puede marcar o quitar del itinerario desde la ficha, con estado visible.
- CA3: Si la función ya está en el itinerario, se indica; si la película ya está en el itinerario en **otra** función, se avisa ("Ya tienes esta película el viernes 18:00") sin impedir marcar la segunda.
- CA4: Si una función está agotada, se ve igual, con el aviso de agotada y la información de boletería; no se oculta ni se bloquea, y se puede marcar en el itinerario (la persona puede tener entrada).

### H3.3 Navegación desde la ficha (P1)
- CA1: Enlace de vuelta al programa que conserva el filtro desde el que se llegó cuando es posible, o al programa completo en su defecto.
- CA2: Acceso a "Mi itinerario" desde la ficha.
- CA3: La página se genera para las 24 películas en tiempo de build (no depende de datos en tiempo de ejecución).

---

## Épica 4. Mi itinerario (P0)

Objetivo del brief: armar el recorrido marcando funciones, con avisos de choque, de traslado y de conversatorio; guardado en el navegador sin cuentas; compartible por link. "Que armar el itinerario se sienta bien, no como llenar un formulario."

### H4.1 Marcar y quitar funciones (P0)
- CA1: Desde el programa, la ficha y el propio itinerario se puede agregar o quitar cualquier función con una sola acción.
- CA2: El itinerario muestra las funciones marcadas ordenadas por hora de inicio y agrupadas por día, con hora inicio-fin, película, sala y dirección, y las marcas de agotada, aire libre, conversatorio y nota.
- CA3: Entre dos funciones consecutivas del mismo día se muestra el traslado necesario ("8 min caminando al Galpón 7") y el tiempo disponible.
- CA4: Quitar una función no borra las demás; hay una acción para vaciar todo el itinerario que es reversible o que exige una segunda acción (evitar borrado accidental).
- CA5: Marcar la misma función dos veces no la duplica.
- CA6: Estado vacío: un texto en español que explica cómo se arma el itinerario y un enlace al programa.

### H4.2 Aviso de choque (P0)
Dos funciones se topan cuando sus intervalos de proyección se solapan. Intervalo = [inicio, inicio + duración). El conversatorio **no** cuenta.
- CA1: Si el fin de A es posterior al inicio de B (o viceversa), ambas se marcan como en choque, con texto que dice con cuál chocan. Ejemplo: f05 (jueves 19:30–21:08, Teatro) y f06 (jueves 20:00–22:01, Galpón 7) chocan.
- CA2: Si A termina exactamente cuando empieza B (fin == inicio) **no** es choque (aunque puede haber aviso de traslado, ver H4.3).
- CA3: Choques que cruzan medianoche se detectan con la fecha real: f21 (viernes 23:00–00:22) y f22 (viernes 23:30) chocan; f09 (jueves 22:15–00:13) y f10 (jueves 22:30) chocan.
- CA4: El conversatorio de A no produce choque: f25 (sábado 13:00–14:23, conversatorio hasta 14:53) y f28 (sábado 15:00, mismo Teatro) **no** chocan.
- CA5: Con tres o más funciones se avisan todos los pares en conflicto, no solo el primero.
- CA6: El aviso se ve dentro del itinerario junto a las funciones afectadas, y también en el programa y la ficha al momento de marcar (por ejemplo, el botón o la tarjeta indica "choca con Vidrio 20:00"), para que la persona decida antes de agregar.

### H4.3 Aviso de traslado (P0)
Se llega si `fin(A) + traslado(salaA, salaB) <= inicio(B)`. Traslado dentro de la misma sala = 0.
- CA1: Si no se llega, ambas funciones muestran un aviso claro con los minutos que faltan. Ejemplos verificables: f08 (jueves, Muelle, termina 22:27) y f10 (jueves 22:30, Galpón 7; traslado 15 min): "no alcanzas a llegar, llegarías 22:42, 12 minutos tarde". f07 (jueves, Terraza, termina 21:56) y f09 (jueves 22:15, Teatro; traslado 20 min): llegaría 22:16, 1 minuto tarde.
- CA2: Si se llega justo (llegada == inicio) no hay aviso de no alcanzar.
- CA3: Cuando sí se llega, se muestra el tiempo de sobra de forma informativa ("Tienes 22 min, son 8 caminando"), sin tono de alerta.
- CA4: El aviso de traslado y el de choque no se muestran los dos a la vez para el mismo par: si chocan, se muestra choque.
- CA5: El traslado se calcula solo entre funciones **consecutivas** en el itinerario (ordenadas por inicio), no entre todos los pares.

### H4.4 Aviso de conversatorio (P0)
Si A tiene conversatorio, la persona lo ve completo si `fin(A) + conversatorio + traslado <= inicio(B)`.
- CA1: Si alcanza a la película B pero no a todo el conversatorio, se muestra un aviso **distinto** al de choque y al de traslado, en tono informativo: "Si vas a X te pierdes el conversatorio (o parte)". Ejemplo: f13 (viernes, Teatro, termina 19:52, conversatorio 25 min hasta 20:17) y f16 (viernes 20:05, Muelle; traslado 12 min): llega a la película, ve solo 1 min del conversatorio. Ejemplo 2: f31 (sábado, Teatro, termina 19:08, conversatorio 30 min hasta 19:38) y f34 (sábado 19:30, Galpón 7; traslado 8 min): llega, ve 14 de 30 min. Contraejemplo: f03 (jueves, Galpón 7, termina 19:24, conversatorio hasta 19:44) y f05 (jueves 19:30, Teatro; traslado 8 min) llegaría 19:32, así que prevalece el aviso de traslado (CA3), no el de conversatorio.
- CA2: Si alcanza al conversatorio completo no hay aviso: f13 y f18 (viernes 20:30, mismo Teatro).
- CA3: Si ni siquiera alcanza a B sin conversatorio, prevalece el aviso de traslado o el de choque, y no se muestra además el de conversatorio.
- CA4: El conversatorio se muestra en el itinerario como parte de la función (por ejemplo "termina 19:24, conversatorio hasta 19:44"), para que la persona entienda la razón del aviso.

### H4.5 Persistencia en el navegador (P0)
- CA1: El itinerario sobrevive a recargar la página, cerrar la pestaña y volver, y navegar entre páginas.
- CA2: No hay cuentas, registro, correo, cookies de sesión ni envío de datos a ningún servidor.
- CA3: Si el almacenamiento del navegador no está disponible (modo privado restringido), el itinerario sigue funcionando durante la sesión y se avisa de manera discreta que no se guardará.
- CA4: Si lo guardado contiene ids de funciones que ya no existen en los datos, se ignoran sin romper nada.
- CA5: Al cargar una página, el estado guardado se muestra sin "saltos" visibles notorios (no se ve el contador en 0 y luego en 5 de manera evidente).

### H4.6 Compartir con un link (P0)
- CA1: Desde el itinerario hay una acción "Compartir" que produce un link que contiene el itinerario completo (sin servidor: todo va en la URL). El link se copia al portapapeles con confirmación visible, y en celulares que lo permitan se ofrece el sistema de compartir del teléfono.
- CA2: Quien abre el link ve ese itinerario con los mismos avisos (choques, traslados, conversatorios), identificado como un itinerario compartido, no como el suyo.
- CA3: Abrir un link compartido **no** modifica el itinerario propio de quien lo abre.
- CA4: Hay una acción "Copiar a mi itinerario". Si el propio está vacío, se copia tal cual. Si no lo está, la persona elige entre reemplazar o sumar (sin duplicar funciones que ya tenía).
- CA5: Después de copiar, la URL deja de ser la compartida (para que recargar no vuelva a mostrar la ajena) y se ve el itinerario propio.
- CA6: Un link con ids inválidos o vacío muestra un mensaje en español y no rompe la página. Un link con 39 funciones sigue funcionando.
- CA7: El link compartido funciona sin que la persona que lo abre tenga nada guardado previamente.

### H4.7 Armar el itinerario se siente bien (P1)
- CA1: Marcar una función da una respuesta inmediata en el lugar donde se hizo (cambio de estado del botón o la tarjeta) y en el contador de la navegación.
- CA2: Los avisos aparecen en el momento de marcar, no solo al ir a la página del itinerario.
- CA3: El itinerario se lee como un recorrido: se entiende a qué hora hay que salir de una sala y a cuál caminar, no como una tabla de filas.
- CA4: El itinerario está pensado para leerse de pie en el celular la noche del festival: hora, sala y dirección grandes; los avisos con texto corto.
- CA5: Las transiciones al agregar y quitar son sutiles y se apagan con `prefers-reduced-motion`.

### H4.8 Contexto útil del itinerario (P2)
- CA1: Muestra un resumen por día: cuántas funciones, a qué hora empieza la primera y termina la última (incluyendo la hora de conversatorio si aplica).
- CA2: Para funciones al aire libre, recuerda la nota de lluvia; para agotadas, recuerda que se compra en boletería desde una hora antes.
- CA3: Se puede imprimir o guardar como PDF desde el navegador con un formato limpio (sin navegación ni fondos pesados).

---

## Épica 5. Entrega y documentación (P0)

### H5.1 Documento de entrega (P0)
- CA1: Existe `ENTREGA.md` con: qué se construyó (por página), cómo correrlo (`npm install`, `npm run dev`, `npm run build`), decisiones importantes (identidad visual, cómo se representan las películas, reglas de choque/traslado/conversatorio, formato del link compartido) y qué quedó pendiente.
- CA2: `README.md` no describe la plantilla de Next.js sino el sitio del festival, o remite a `ENTREGA.md`.

### H5.2 Verificación manual mínima (P0)
Lista que la revisión debe recorrer y que la implementación debe dejar pasando:
1. `npm run build` pasa.
2. Portada a 360 px y a 1280 px: sin scroll horizontal, fechas y llamado a la acción visibles.
3. Programa: 39 funciones sin filtro; jueves 10, viernes 12, sábado 17; viernes + Bruma Nocturna = 3.
4. Ficha de `las-cintas-del-faro`: dos funciones, la del sábado marcada como que termina 01:07 del día siguiente.
5. Ficha de `la-hora-azul-del-puerto`: f31 aparece agotada y con conversatorio de 30 min.
6. Itinerario con f05 + f06: aviso de choque. Con f08 + f10: no alcanza (12 min tarde). Con f07 + f09: no alcanza (1 min tarde). Con f13 + f16: llega pero pierde el conversatorio. Con f03 + f05: no alcanza (2 min tarde), sin aviso de conversatorio. Con f25 + f28: sin avisos. Con f14 + f16: misma sala, fin == inicio (20:05), sin avisos. Con f21 + f22: choque a través de medianoche. Con f05 + f06 + f07: tres choques.
7. Recargar la página: el itinerario sigue.
8. Compartir: abrir el link en una ventana privada muestra el itinerario ajeno; "Copiar a mi itinerario" lo convierte en propio; la URL vuelve a la normal.
9. Activar `prefers-reduced-motion`: sin animaciones decorativas.
10. Sin emojis, sin puntajes, todo en español, sin recursos externos en la pestaña Red del navegador.

---

## Fuera de alcance (explícito)

- Venta o reserva de entradas, disponibilidad en tiempo real, cuentas de usuario, notificaciones, mapa con servicio externo, traducción a otros idiomas, panel de administración, edición de datos.
- Calificar, votar o rankear películas.

## Preguntas abiertas resueltas con supuestos

| Duda | Supuesto adoptado |
|---|---|
| ¿Se puede marcar una función agotada? | Sí, con aviso visible. La persona puede tener entrada o querer intentar en boletería. |
| ¿Dos funciones que se tocan exactamente (fin == inicio) chocan? | No. Si hay traslado > 0 sí hay aviso de que no alcanza. |
| ¿Se comparan traslados entre todos los pares? | No, solo entre consecutivas. Los choques sí se comparan entre todos los pares. |
| ¿Qué pasa con el conversatorio de la última función del día? | Nada: se muestra su hora de fin y no hay aviso. |
| ¿Se puede marcar la misma película en dos funciones? | Sí, con un aviso informativo de que ya está en otra función. |
| ¿La zona horaria del navegador afecta las horas? | No. Se muestran las horas de los datos tal cual (hora de Chile). |
| ¿Copiar un itinerario compartido reemplaza o suma? | Si el propio está vacío se copia directo; si no, la persona elige. |
