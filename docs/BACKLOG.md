# Backlog: sitio del Festival de Cine Niebla, 3ª edición

Fuente: `BRIEF.md` y `data/programa.json`. Este documento dice **qué** tiene que hacer el sitio y **cómo se verifica**; no decide cómo se implementa. Cada historia tiene prioridad:

- **P0**: sin esto no se entrega.
- **P1**: importante; se entrega salvo que falte tiempo.
- **P2**: deseable; solo cuando todo P0 y P1 esté verificado.

Los criterios de aceptación están escritos como comprobaciones concretas. Cuando citan funciones (`f03`, `f25`...) o películas, se refieren a los ids de `data/programa.json`.

---

## 0. Contexto en una frase

Festival chico de Puerto Bruma (costa de Chile), 3ª edición, **jueves 15, viernes 16 y sábado 17 de octubre de 2026**, 24 películas, 39 funciones, 4 salas, 4 secciones. Público local que llega apurado después del trabajo y revisa el programa **desde el celular, caminando entre salas**. Quieren personalidad, "de acá", nada de plantilla corporativa.

## 1. Glosario y reglas del dominio

Estas definiciones son vinculantes para todas las historias.

| Término | Definición |
|---|---|
| **Función** | Una proyección concreta: película + sala + hora de inicio. Puede tener `conversatorioMin`, `nota` y `agotada`. |
| **Fin de la película** | `inicio + duracionMin` de la película. Puede caer después de medianoche (p. ej. `f22`: 23:30 + 105 min = 01:15 del sábado; `f39`: 23:45 + 82 = 01:07 del domingo). |
| **Fin con conversatorio** | `fin de la película + conversatorioMin`. Solo existe en `f03` (20), `f13` (25), `f25` (30) y `f31` (30). |
| **Día de una función** | El día calendario en que **empieza**, aunque termine después de medianoche. `f22` es del viernes. |
| **Traslado** | Minutos caminando entre dos salas según `trasladosMin`. Misma sala = 0. Es simétrico. |
| **Hora de llegada** | `fin de la película A + traslado(sala A, sala B)`. |
| **Choque (se topan)** | Dos funciones elegidas cuyos intervalos `[inicio, fin de la película)` se superponen: `inicioB < finA` y `inicioA < finB`. Terminar exactamente cuando la otra empieza **no** es choque. El conversatorio **no** forma parte del intervalo. |
| **No alcanza a llegar** | No hay choque, pero `hora de llegada > inicioB`. Llegar exactamente a la hora **sí** alcanza. |
| **Se perdería el conversatorio** | A tiene conversatorio, no hay choque, y `fin con conversatorio de A + traslado > inicioB`. Es un aviso, nunca un choque. |
| **Agotada** | `agotada: true` (`f22`, `f31`). Se sigue mostrando; no desaparece del programa. |
| **Al aire libre** | Funciones en `terraza` (Terraza Faro). Entrada gratis (`entradas.aireLibre = 0`). Si llueve se trasladan al Galpón 7 a la misma hora (nota de la sala). |
| **Hora local** | Todas las horas son `America/Santiago` y se muestran **tal cual están en los datos**; nunca se convierten a la zona horaria del navegador del visitante. |

Hechos de los datos que el sitio debe reflejar sin inventar nada:

- Entrada general $4.000 CLP; Terraza Faro gratis. Venta **solo en boletería de cada sala desde una hora antes**; no hay venta en línea.
- Contacto: `hola@festivalniebla.cl` e Instagram `@festivalniebla`.
- `f05` es la función inaugural (con el equipo de la película). Antes de `f36` se entregan los premios del festival.
- 6 películas tienen `tituloOriginal`. Clasificaciones: `TE`, `+14`, `+18`. Estrenos: `mundial`, `nacional`, `latinoamericano`.
- Varias películas tienen más de una función (p. ej. `cordillera-de-papel` en `f12` y `f23`).

---

## 2. Épicas

- **E0 Base transversal**: identidad, navegación, accesibilidad, responsive, datos, calidad.
- **E1 Portada**
- **E2 Programa**
- **E3 Ficha de película**
- **E4 Mi itinerario: armar y guardar**
- **E5 Mi itinerario: avisos (choques, traslados, conversatorio)**
- **E6 Compartir itinerario por link**
- **E7 Entrega**

Dependencias: E0 antes que todo. E2 y E3 dependen de E0. E4 depende de E2/E3 (desde ahí se agregan funciones). E5 depende de E4. E6 depende de E4 y E5. E7 al final.

---

## E0. Base transversal

### H0.1 (P0) Datos únicos y sin modificar
Como equipo del festival, quiero que todo el sitio salga de `data/programa.json` para no mantener información duplicada.

Criterios:
- [ ] `data/programa.json` queda byte a byte igual al original (`git diff` vacío sobre ese archivo).
- [ ] No aparece en el sitio ninguna película, función, sala, sección, hora, precio ni texto de contacto que no esté en el JSON.
- [ ] Las 24 películas y las 39 funciones aparecen en el sitio (ninguna se pierde por filtros, agrupaciones o errores).
- [ ] Los nombres de día ("jueves", "viernes", "sábado") y las fechas se derivan de las fechas del JSON, no están escritos a mano.

### H0.2 (P0) Horas y duraciones correctas
Como asistente, quiero ver las horas exactamente como las publica el festival.

Criterios:
- [ ] Una función con `inicio` `2026-10-15T20:15` se muestra "20:15" aunque el navegador esté configurado en otra zona horaria (probar cambiando la zona del sistema o del navegador a UTC y a Asia/Tokyo).
- [ ] Toda función muestra hora de inicio y hora de fin de la película (formato 24 h, `HH:MM`).
- [ ] Funciones que terminan después de medianoche muestran el fin correcto (`f22` → 01:15, `f39` → 01:07, `f09` → 00:13, `f10` → 00:04, `f21` → 00:22) y dejan claro que es del día siguiente.
- [ ] Las duraciones se muestran en minutos o en horas y minutos de forma consistente en todo el sitio.

### H0.3 (P0) Navegación global
Como visitante, quiero moverme entre portada, programa y mi itinerario desde cualquier página.

Criterios:
- [ ] Todas las páginas comparten una navegación con enlaces a Portada, Programa y Mi itinerario.
- [ ] El enlace a Mi itinerario muestra cuántas funciones tiene elegidas (0 se distingue visualmente de 1+). El número se actualiza al agregar o quitar sin recargar.
- [ ] La página actual está indicada en la navegación.
- [ ] En 360 px la navegación es usable con el pulgar (objetivos táctiles de al menos 44×44 px) y no tapa contenido de forma permanente.
- [ ] Un pie de página común muestra correo e Instagram del festival (texto, sin iconos de terceros).
- [ ] Una URL que no existe (p. ej. una película con id inventado) muestra una página "no encontrado" en español con enlace a la portada y al programa.

### H0.4 (P0) Funciona de 360 px a escritorio
Criterios:
- [ ] En 360, 390, 768, 1024 y 1440 px de ancho ninguna página tiene desplazamiento horizontal ni texto cortado.
- [ ] Ningún texto de contenido queda por debajo de 14 px en móvil; el cuerpo de lectura (sinopsis) tiene al menos 16 px.
- [ ] Los títulos largos ("Transbordador de invierno", "Cortos I: Oficios del mar") se ajustan en varias líneas sin romper el diseño.

### H0.5 (P0) Accesibilidad básica
Criterios:
- [ ] El documento declara idioma español.
- [ ] Todo se puede operar con teclado: filtros, agregar/quitar del itinerario, compartir, copiar. El foco es visible en todo momento.
- [ ] Botones e interruptores tienen nombre accesible en español y exponen su estado (p. ej. "En mi itinerario: sí/no", filtro activo).
- [ ] Contraste mínimo 4.5:1 en texto normal y 3:1 en texto grande e iconos informativos, en todos los estados (incluidos los avisos de choque).
- [ ] Ningún significado se transmite solo por color: estados como agotada, choque, no alcanza, conversatorio en riesgo tienen también texto o forma.
- [ ] Los avisos del itinerario que aparecen al agregar una función se anuncian a lectores de pantalla (región viva o equivalente).
- [ ] Hay un enlace "saltar al contenido" o equivalente.
- [ ] Encabezados jerárquicos (un `h1` por página) y listas semánticas para programa e itinerario.

### H0.6 (P0) Movimiento respetuoso
Criterios:
- [ ] Con `prefers-reduced-motion: reduce` activado, no hay animaciones de entrada, parallax, desplazamientos continuos ni efectos ambientales; las transiciones se reducen a cambios instantáneos o fundidos muy cortos. Verificar en portada, programa e itinerario.
- [ ] Sin la preferencia activada, las animaciones no bloquean la lectura ni retrasan la interacción más de ~300 ms.
- [ ] Nada parpadea ni destella más de 3 veces por segundo.

### H0.7 (P0) Identidad visual propia y sin imágenes externas
Como organizadores, queremos que el sitio se sienta como el festival (niebla, puerto, costa, noche), no como una plantilla.

Criterios:
- [ ] No hay ninguna petición a dominios externos salvo las fuentes cargadas mediante el mecanismo de fuentes del framework. No hay `<img>` ni fondos con fotos ni imágenes remotas.
- [ ] Se eliminan los restos de la plantilla inicial (logos y SVG de ejemplo, estilos y textos de bienvenida).
- [ ] La paleta, la tipografía y el lenguaje visual son coherentes en todas las páginas y evocan el tema del festival.
- [ ] Ningún emoji en la interfaz (ni como icono, ni en textos, ni en títulos).
- [ ] No hay puntajes, estrellas, notas ni rankings de películas en ningún lugar.
- [ ] Cada película tiene una **representación visual generada con código** (ver H3.2) que se reutiliza en portada, programa, ficha e itinerario.

### H0.8 (P0) Textos en español y metadatos
Criterios:
- [ ] Toda la interfaz está en español (incluidos mensajes de error, estados vacíos, botones, `title` y descripciones de página, textos alternativos).
- [ ] Cada página tiene `title` y descripción propios: portada (nombre y fechas), programa, cada película (título y director), itinerario.
- [ ] Los textos usan un tono cercano y local, consistente con el brief (evitar jerga corporativa).

### H0.9 (P0) Calidad técnica
Criterios:
- [ ] `npm run build` termina sin errores ni advertencias de tipos.
- [ ] `npm run lint` termina sin errores.
- [ ] Al abrir cada página en el navegador no hay errores en consola (incluidos errores de hidratación ni advertencias de React).
- [ ] Sin librerías de componentes. Como máximo una librería de animación. Sin backend, base de datos, ni servicios externos.
- [ ] El contenido de portada, programa y fichas está presente en el HTML inicial (se puede leer con JavaScript deshabilitado; solo el itinerario requiere JavaScript).

---

## E1. Portada

### H1.1 (P0) Presentación del festival
Como alguien que entra por primera vez, quiero entender en segundos qué es, cuándo y dónde, y tener ganas de ir.

Criterios:
- [ ] Nombre del festival, número de edición, ciudad y las tres fechas (día de semana + día + mes + año) visibles sin desplazarse en móvil y en escritorio.
- [ ] Un texto breve que diga qué es el festival (cine chico, de la costa, hecho por cuatro personas y voluntarios; se puede redactar a partir del brief, sin inventar cifras).
- [ ] Llamado a la acción principal claramente visible que lleva al Programa; llamado secundario a Mi itinerario.
- [ ] La primera pantalla tiene un elemento visual generado con código que sorprenda (ambiente de niebla/puerto/noche) y que se degrada correctamente con movimiento reducido (H0.6).
- [ ] Sin texto de relleno tipo "lorem ipsum" ni afirmaciones no respaldadas por el brief o los datos.

### H1.2 (P0) Secciones del festival
Criterios:
- [ ] Se muestran las 4 secciones con su nombre y descripción del JSON.
- [ ] Cada sección enlaza al programa ya filtrado por esa sección.
- [ ] Cada sección se distingue visualmente (color, forma o textura) de forma consistente con el resto del sitio.

### H1.3 (P0) Dónde es: salas
Criterios:
- [ ] Se listan las 4 salas con nombre y dirección.
- [ ] Terraza Faro se identifica como al aire libre y muestra su nota de lluvia y que la entrada es gratis.
- [ ] Se comunican los tiempos de caminata entre salas de forma comprensible (tabla, esquema o texto); todos los pares del JSON son consultables.

### H1.4 (P0) Entradas y contacto
Criterios:
- [ ] Precio general $4.000 (formato chileno, con punto de miles y moneda clara) y aire libre gratis.
- [ ] Texto de venta tal como está en los datos: solo en boletería de cada sala desde una hora antes; no hay venta en línea.
- [ ] Correo e Instagram visibles y el correo es un enlace `mailto:`.

### H1.5 (P1) Momentos destacados
Criterios:
- [ ] Se destacan la función inaugural (`f05`: jueves 19:30, Teatro Municipal, "La hora azul del puerto", con el equipo presente) y la premiación (antes de `f36`: sábado 21:00, Teatro Municipal), usando solo lo que dicen las notas del JSON.
- [ ] Cada destacado enlaza a la ficha de la película correspondiente.

### H1.6 (P2) Muestra de películas
Criterios:
- [ ] La portada muestra una selección de películas (p. ej. una por sección) con su representación visual y enlace a su ficha, sin repetir la lista completa.

---

## E2. Programa

### H2.1 (P0) Ver todas las funciones por día
Como asistente, quiero ver las funciones de cada día ordenadas por hora para decidir a qué ir.

Criterios:
- [ ] Hay un selector de día con los tres días (jueves 15, viernes 16, sábado 17). Al cargar sin parámetros se muestra el jueves.
- [ ] Dentro del día, las funciones aparecen ordenadas por hora de inicio; en caso de misma hora, por nombre de sala.
- [ ] Cada función muestra al menos: hora de inicio, hora de fin, título, sala, sección, duración, clasificación y su representación visual. Si aplica: "agotada", "al aire libre", "conversatorio después (N min)", y la `nota` de la función.
- [ ] El título enlaza a la ficha de la película.
- [ ] Sumando los tres días se ven las 39 funciones (10 + 12 + 17).
- [ ] Las funciones que terminan después de medianoche siguen en el día en que empiezan (`f22` en viernes, `f39` en sábado).

### H2.2 (P0) Filtrar por sección
Criterios:
- [ ] Filtro por sección con opción "todas" y las 4 secciones. Se combina con el día (día Y sección).
- [ ] Cambiar filtro no recarga la página ni pierde el día elegido.
- [ ] Se indica cuántas funciones se están mostrando y qué filtros están activos; hay una acción para limpiar filtros.
- [ ] Si una combinación no tiene funciones, aparece un estado vacío en español con una acción para quitar filtros (aunque hoy todas las combinaciones tienen resultados, debe existir).
- [ ] El estado de día y sección se refleja en la URL, de modo que un enlace desde la portada (H1.2) abre el programa ya filtrado y el botón "atrás" del navegador funciona como se espera.

### H2.3 (P0) Se usa bien en el celular caminando
Criterios:
- [ ] En 360 px se ven al menos 3 funciones completas sin desplazarse en una pantalla de 640 px de alto, con hora y sala legibles de un vistazo (jerarquía tipográfica clara).
- [ ] Día y sección se pueden cambiar con una mano, sin abrir menús anidados, y los controles permanecen accesibles mientras se recorre la lista (fijos o alcanzables de vuelta con un gesto).
- [ ] Agregar o quitar una función del itinerario se hace con un solo toque desde la lista, con respuesta visual inmediata (< 100 ms) y sin abandonar la página.
- [ ] Al volver al programa desde una ficha, se conserva el día y el filtro.

### H2.4 (P1) Vista de escritorio aprovechada
Criterios:
- [ ] Desde ~1024 px la disposición aprovecha el ancho (p. ej. por salas o por franjas horarias) manteniendo el orden cronológico legible y sin duplicar funciones.
- [ ] La misma información y las mismas acciones existen en móvil y escritorio.

### H2.5 (P1) Contexto del itinerario dentro del programa
Criterios:
- [ ] Las funciones ya elegidas se distinguen visualmente en el programa.
- [ ] Si el visitante abre el programa durante el festival (fecha del sistema entre el 15 y el 17 de octubre de 2026), el día seleccionado por defecto es el de hoy; el resto del tiempo, el jueves.

### H2.6 (P2) Aviso previo de conflicto
Criterios:
- [ ] Una función que chocaría con algo ya elegido (según reglas de E5) lo insinúa en el programa antes de agregarla, sin impedir agregarla.

---

## E3. Ficha de cada película

### H3.1 (P0) Datos de la película
Criterios:
- [ ] Cada película tiene una URL propia y estable derivada de su `id` del JSON.
- [ ] La ficha muestra: título, título original (si existe), dirección, país, año, duración, sección (con enlace al programa filtrado), clasificación con su significado (TE = todo espectador; +14; +18), tipo de estreno en español ("Estreno mundial" / "Estreno nacional" / "Estreno latinoamericano") y sinopsis completa.
- [ ] Sin puntajes, estrellas ni rankings.
- [ ] Un enlace claro para volver al programa.

### H3.2 (P0) Representación visual sin afiches
Como organizadores, queremos que cada película tenga una identidad visual aunque no tengamos afiches.

Criterios:
- [ ] Cada película tiene una pieza visual generada con código (CSS/SVG/canvas), **determinista**: la misma película se ve igual en cada carga, en cada página y en cada dispositivo.
- [ ] Dos películas cualesquiera se distinguen a simple vista; las de una misma sección comparten un aire de familia.
- [ ] La pieza no depende de imágenes externas ni de fotos, y no contiene emojis.
- [ ] Funciona en tamaño pequeño (lista del programa e itinerario) y grande (cabecera de la ficha) sin verse pixelada ni deformada.
- [ ] Con movimiento reducido, la pieza es estática.

### H3.3 (P0) Todas las funciones de la película
Criterios:
- [ ] Se listan todas las funciones de la película, ordenadas por fecha y hora, con día, hora de inicio y fin, sala y dirección, y las marcas de agotada, aire libre (con nota de lluvia), conversatorio (con minutos) y `nota`.
- [ ] Desde cada función se puede agregar o quitar del itinerario con estado visible.
- [ ] Verificación: `cordillera-de-papel` muestra `f12` (viernes 17:30, Galpón 7) y `f23` (sábado 12:00, Cine Arte El Muelle); `la-hora-azul-del-puerto` muestra `f05` con su nota inaugural y `f31` como agotada con conversatorio de 30 min.

### H3.4 (P1) Información práctica en la ficha
Criterios:
- [ ] Junto a las funciones se indica el precio aplicable (general $4.000; gratis si es en Terraza Faro) y que la venta es en boletería desde una hora antes.
- [ ] Navegación a la película anterior y siguiente dentro de la misma sección, o enlace a "más de esta sección".

---

## E4. Mi itinerario: armar y guardar

### H4.1 (P0) Agregar y quitar funciones
Como asistente, quiero marcar las funciones a las que quiero ir y ver mi recorrido.

Criterios:
- [ ] Se puede agregar cualquier función desde el programa y desde la ficha; la misma función no se puede agregar dos veces (la acción es un interruptor).
- [ ] Las funciones agotadas se pueden agregar, pero se muestran marcadas como agotadas también dentro del itinerario.
- [ ] La página Mi itinerario lista las funciones elegidas ordenadas cronológicamente y agrupadas por día, mostrando por cada una: representación visual, título (enlace a ficha), sala y dirección, inicio y fin, conversatorio si tiene, agotada/aire libre si aplica, y una acción para quitarla.
- [ ] Entre dos funciones consecutivas del mismo día se muestra el tiempo disponible y los minutos de caminata entre salas (0 si es la misma sala).
- [ ] Hay un resumen: cantidad de funciones por día y total.
- [ ] Estado vacío en español con explicación breve y enlace al programa.
- [ ] Existe una acción para vaciar el itinerario que pide confirmación o permite deshacer.

### H4.2 (P0) Se guarda en el navegador
Criterios:
- [ ] Sin cuentas, registro ni envío de datos a ningún servidor.
- [ ] Al recargar, cerrar y volver a abrir el navegador, el itinerario sigue igual.
- [ ] Al cargar, el contador de la navegación y la página del itinerario muestran el estado guardado sin parpadeo de "0" ni errores de hidratación.
- [ ] Si el almacenamiento no está disponible (modo privado restrictivo, permisos), el sitio sigue funcionando en la sesión y avisa que no se podrá guardar.
- [ ] Si lo guardado contiene ids que ya no existen en los datos, se ignoran en silencio y no rompen la página.

### H4.3 (P1) Se siente bien, no como un formulario
Criterios:
- [ ] Agregar una función produce una respuesta visual y textual inmediata en el lugar donde se hizo (no un modal ni una alerta del navegador).
- [ ] El itinerario tiene una lectura tipo recorrido/línea de tiempo del día (se percibe el orden y los huecos), no una tabla de datos.
- [ ] Quitar una función tiene una transición suave (respetando H0.6).

---

## E5. Mi itinerario: avisos

### H5.1 (P0) Aviso de choque
Criterios:
- [ ] Toda pareja de funciones elegidas que se topen (según el glosario) queda marcada como choque en ambas funciones, con texto explícito (p. ej. "Se topa con «Vidrio» (20:00–22:01)") y sin depender del color.
- [ ] Si más de dos se topan, cada una indica con cuáles.
- [ ] El choque no impide tener ambas en el itinerario.
- [ ] Casos de verificación (tabla de la sección 3): `f05`+`f06` choque; `f05`+`f08` choque (por 8 min); `f21`+`f22` choque cruzando medianoche; `f22`+`f23` **no** choca; `f13`+`f18` **no** choca.

### H5.2 (P0) Aviso de traslado imposible
Criterios:
- [ ] Para cada par de funciones consecutivas del mismo día (ordenadas por inicio) sin choque, si `fin A + traslado > inicio B`, se muestra "no alcanzas a llegar", indicando los minutos que faltan y la caminata (p. ej. "Faltan 2 min: la película termina 19:24 y son 8 min caminando").
- [ ] Llegar exactamente a la hora cuenta como alcanzar.
- [ ] Misma sala: traslado 0.
- [ ] Casos: `f03`→`f05` no alcanza (faltan 2 min); `f04`→`f06` no alcanza (faltan 6 min); `f25`→`f27` no alcanza (falta 1 min); `f04`→`f07` alcanza (sobran 15 min); `f38`→`f39` alcanza (misma sala, 11 min).

### H5.3 (P0) Aviso de conversatorio perdido
Criterios:
- [ ] Si A tiene conversatorio y no hay choque con B, pero `fin A + conversatorio + traslado > inicio B`, se muestra un aviso distinto al de choque y al de traslado: "Te perderías el conversatorio (o parte) de «A» por ir a «B»".
- [ ] El aviso nunca se presenta como choque ni cambia la cuenta de choques.
- [ ] Si además no alcanza a llegar ni siquiera sin conversatorio, prevalece el aviso de traslado (H5.2) y el conversatorio se menciona como dato secundario o no se repite.
- [ ] Casos: `f13`→`f17` alcanza (3 min de margen) pero pierde conversatorio; `f13`→`f18` ve el conversatorio completo (misma sala, termina 20:17, la siguiente es 20:30); `f31`→`f34` alcanza pero pierde parte del conversatorio; `f25`→`f28` todo bien; `f03`→`f05` es "no alcanza" (no conversatorio).

### H5.4 (P0) Resumen y ubicación de los avisos
Criterios:
- [ ] Los avisos aparecen junto a las funciones implicadas dentro del recorrido, y el resumen del itinerario indica cuántos choques y cuántos traslados imposibles hay.
- [ ] Los avisos se recalculan al instante al agregar o quitar cualquier función, desde cualquier página.
- [ ] Los avisos usan los mismos textos y criterios en el itinerario propio y en uno compartido (E6).

### H5.5 (P2) Cuánto conversatorio alcanzaría a ver
Criterios:
- [ ] En el aviso de conversatorio se indica cuántos minutos del conversatorio podría ver antes de salir (`inicio B − traslado − fin A`, si es > 0), p. ej. `f31`→`f34`: 14 de 30 min.

---

## E6. Compartir itinerario por link

### H6.1 (P0) Generar el link
Criterios:
- [ ] Desde Mi itinerario (con al menos una función) hay una acción "Compartir" que genera una URL que contiene el itinerario completo, sin servidor ni cuenta.
- [ ] La URL se copia al portapapeles con confirmación visible; si copiar falla, la URL se muestra en pantalla seleccionable para copiarla a mano.
- [ ] El link es razonablemente corto (para 10 funciones, menos de 200 caracteres) y solo depende de los ids de las funciones.
- [ ] El link se mantiene válido mientras los ids de las funciones no cambien.

### H6.2 (P0) Abrir un link compartido
Criterios:
- [ ] Al abrir el link, se ve el itinerario compartido con los mismos elementos y avisos que el propio (H4.1, E5), claramente etiquetado como "itinerario compartido" y de solo lectura.
- [ ] Abrir un link **no** modifica el itinerario propio del visitante.
- [ ] Ids inexistentes en el link se ignoran; si no queda ninguna función válida, se muestra un mensaje claro con enlace al programa.
- [ ] Hay una acción "Copiar a mi itinerario" que agrega al propio todas las funciones del compartido (sin duplicar las que ya tenía) y luego lleva al itinerario propio o muestra confirmación con enlace.
- [ ] Si el visitante ya tiene funciones propias, se le informa que se van a **sumar** (no reemplazar) antes o al momento de copiar; la opción de reemplazar es P2.
- [ ] Desde la vista compartida se puede ir al propio itinerario y al programa.

### H6.3 (P1) Compartir desde el celular
Criterios:
- [ ] En navegadores con función nativa de compartir, se ofrece además de copiar; si no existe, solo copiar. En ambos casos el resultado es la misma URL.

---

## E7. Entrega

### H7.1 (P0) Documentación de entrega
Criterios:
- [ ] Existe `ENTREGA.md` con: qué se construyó (páginas y funcionalidades), cómo correrlo (`npm install`, `npm run dev`, `npm run build`, `npm start`), decisiones importantes (identidad visual, cómo se representa cada película, cómo se guarda y comparte el itinerario, reglas de choque/traslado/conversatorio) y qué quedó pendiente o fuera de alcance.
- [ ] `README.md` deja de ser el de la plantilla y apunta a `ENTREGA.md` o contiene lo esencial.

### H7.2 (P0) Verificación final
Criterios:
- [ ] Se recorrieron manualmente en 360 px y escritorio: portada → programa (cambiar día y sección) → ficha → agregar 4 funciones que reproduzcan choque, no alcanza y conversatorio perdido → itinerario muestra los tres avisos → compartir → abrir el link en ventana privada → copiar al propio.
- [ ] Se probó con `prefers-reduced-motion` activado.
- [ ] Se probó con zona horaria del navegador distinta de Chile.

---

## 3. Casos de referencia con datos reales

Horas calculadas con `inicio + duracionMin`. Sirven para criterios de aceptación y pruebas manuales.

| Funciones (A → B) | A termina | Conv. A hasta | Traslado | Llega | B empieza | Resultado esperado |
|---|---|---|---|---|---|---|
| `f05` La hora azul (teatro 19:30) + `f06` Vidrio (galpon 20:00) | 21:08 | – | – | – | 20:00 | **Choque** |
| `f05` + `f08` Los que cuidan el faro (muelle 21:00) | 21:08 | – | – | – | 21:00 | **Choque** (8 min) |
| `f03` El último astillero (galpon 18:00) → `f05` (teatro 19:30) | 19:24 | 19:44 | 8 | 19:32 | 19:30 | **No alcanza** (faltan 2 min) |
| `f04` Doce noches claras (muelle 18:15) → `f06` (galpon 20:00) | 19:51 | – | 15 | 20:06 | 20:00 | **No alcanza** (faltan 6 min) |
| `f04` → `f07` Transbordador (terraza 20:15) | 19:51 | – | 9 | 20:00 | 20:15 | Alcanza (15 min de margen) |
| `f13` Sal de roca (teatro 18:00) → `f17` Los que cuidan el faro (terraza 20:15) | 19:52 | 20:17 | 20 | 20:12 | 20:15 | Alcanza, **pierde conversatorio** |
| `f13` → `f18` Línea de sal (teatro 20:30) | 19:52 | 20:17 | 0 | 20:17 | 20:30 | Todo bien, ve el conversatorio |
| `f25` El canto de las redes (teatro 13:00) → `f26` Caleta Sur (muelle 14:00) | 14:23 | 14:53 | – | – | 14:00 | **Choque** |
| `f25` → `f27` Temporada seca (galpon 14:30) | 14:23 | 14:53 | 8 | 14:31 | 14:30 | **No alcanza** (falta 1 min) |
| `f25` → `f28` Vidrio (teatro 15:00) | 14:23 | 14:53 | 0 | 14:53 | 15:00 | Todo bien |
| `f31` La hora azul (teatro 17:30, agotada) → `f33` Temporada seca (terraza 19:00) | 19:08 | 19:38 | – | – | 19:00 | **Choque** |
| `f31` → `f34` Ahogados (galpon 19:30) | 19:08 | 19:38 | 8 | 19:16 | 19:30 | Alcanza, **pierde parte del conversatorio** (vería 14 de 30 min) |
| `f21` Las cintas del faro (terraza vie 23:00) + `f22` Marea roja (galpon vie 23:30) | 00:22 sáb | – | – | – | 23:30 | **Choque** cruzando medianoche |
| `f22` (vie 23:30) → `f23` Cordillera de papel (muelle sáb 12:00) | 01:15 sáb | – | – | – | 12:00 | Sin aviso (días distintos) |
| `f38` La niebla tiene dientes (galpon 22:00) → `f39` Las cintas del faro (galpon 23:45) | 23:34 | – | 0 | 23:34 | 23:45 | Alcanza (misma sala) |

Funciones por día: jueves `f01`–`f10` (10), viernes `f11`–`f22` (12), sábado `f23`–`f39` (17).

---

## 4. Orden sugerido

1. E0 (base, datos, navegación, identidad, representación visual de película H3.2).
2. E2 programa + E3 ficha (contenido estático completo).
3. E4 itinerario (agregar, guardar, listar).
4. E5 avisos, verificados contra la tabla de la sección 3.
5. E6 compartir.
6. E1 portada terminada (los destacados y la muestra dependen de lo anterior).
7. P1 y P2 en ese orden; E7.

## 5. Fuera de alcance

- Venta o reserva de entradas, cuentas de usuario, notificaciones, mapas de terceros, imágenes o fotos, calendario exportable, varios idiomas, modo de administración de datos.
