# Backlog de producto: sitio web del Festival de Cine Niebla (3ª edición)

> Documento de producto. Define **qué** tiene que hacer el sitio y **cómo sabemos que está bien hecho**. No define cómo se implementa: arquitectura, estructura de carpetas, librerías y estilos los deciden quienes hagan el detalle técnico, respetando las restricciones de la sección 3.
>
> Fuentes: `BRIEF.md` y `data/programa.json`. Si este documento y el brief se contradicen, manda el brief. Si algo no está aquí, se resuelve siguiendo el espíritu de la sección 1 y **sin inventar datos**.

---

## Índice

1. Contexto, público y objetivos
2. Cómo leer este backlog (prioridades y formato)
3. Restricciones no negociables
4. Reglas de negocio y glosario (fuente de verdad para calcular)
5. Datos de referencia para verificar
6. Decisiones de producto tomadas
7. Épicas e historias de usuario
   - E0. Base transversal (calidad, idioma, datos fieles)
   - E1. Identidad visual y representación de películas
   - E2. Portada
   - E3. Programa
   - E4. Ficha de película
   - E5. Mi itinerario: armar y guardar
   - E6. Mi itinerario: avisos de topes, traslados y conversatorios
   - E7. Compartir itinerario
   - E8. Extras (solo si sobra tiempo)
8. Casos de prueba del itinerario con datos reales
9. Definición de terminado (aplica a todas las historias)
10. Fuera de alcance
11. Observaciones sobre los datos para el equipo organizador (no bloquean)
12. Orden sugerido de entrega

---

## 1. Contexto, público y objetivos

**Quiénes son.** Festival de cine chico de Puerto Bruma, puerto de la costa de Chile. Lo organizan cuatro personas con fondos concursables y voluntarios. Tercera edición: **jueves 15, viernes 16 y sábado 17 de octubre de 2026**, 24 películas, 39 funciones, 4 salas.

**Qué había antes.** Un PDF con la programación y una página hecha con plantilla que "parecía la web de una empresa de seguros". Este sitio tiene que ser lo contrario: con personalidad, de acá, bien hecho.

**Público y situaciones de uso** (lo que sigue sale del brief, dicho o implícito, y condiciona todo el backlog):

| Persona | Situación | Qué necesita del sitio |
|---|---|---|
| **La que llega corriendo después de la pega** (jueves y viernes; las funciones de esos días parten a las 16:00) | Revisa en el celular, en la micro o caminando, con poco tiempo y quizás mala señal | Ver en segundos qué hay hoy, a qué hora termina y dónde queda la sala. Nada de pasos innecesarios |
| **El que va todo el sábado** (el día fuerte: 17 funciones, de 12:00 a pasada la 1 de la madrugada) | Arma un recorrido de varias funciones seguidas entre salas | Saber si alcanza a llegar caminando, si se topa algo, si se pierde un conversatorio |
| **El grupo de amigos / la familia** | Una persona arma el plan y lo manda por chat al resto | Compartir con un link que abra bien en el celular del otro, sin cuentas |
| **La vecina curiosa del puerto o la región** | Llega a la portada por un link o por Instagram | Entender en un vistazo qué es, cuándo, dónde, cuánto cuesta, y quedar con ganas de ir |

**Contexto de uso implícito que hay que respetar:**
- **Celular primero.** "Casi todos revisan el programa desde el celular, muchas veces caminando de una sala a otra": pantallas angostas (desde 360 px), una mano, sol o noche, conexión móvil irregular.
- **Todo pasa en la hora de Chile.** Las horas del programa son horas locales de Puerto Bruma, sin importar dónde esté o cómo esté configurado el teléfono de quien mira.
- **La noche cruza la medianoche.** Varias funciones terminan al día siguiente; para la gente eso sigue siendo "la función del viernes en la noche".
- **No hay venta en línea.** Las entradas se compran solo en la boletería de cada sala, desde una hora antes. El sitio informa; no vende ni reserva.
- **Es un festival que no califica películas.** Nada de puntajes, estrellas, rankings, "lo más visto" ni "recomendadas" que ordenen por calidad.

**Objetivos del producto (en orden):**
1. Que cualquier persona encuentre, desde el celular, qué función hay, cuándo, dónde y a qué hora termina.
2. Que armar un itinerario realista sea fácil y hasta entretenido, y que el sitio avise de los problemas antes de que ocurran en la calle.
3. Que el itinerario se pueda compartir con un link.
4. Que el sitio transmita la identidad del festival y dé ganas de ir.

---

## 2. Cómo leer este backlog

**Prioridad (MoSCoW):**
- **Must**: sin esto no se puede publicar. Todo lo que el brief pide explícitamente es Must.
- **Should**: importante para que la experiencia sea buena; se hace después de todos los Must.
- **Could**: mejora deseable si sobra tiempo.

Dentro de cada épica, las historias están en orden de prioridad. Las épicas están numeradas en el orden en que conviene construirlas (ver sección 12).

**Formato.** Cada historia tiene un identificador (p. ej. `E3-H2`), la historia ("Como… quiero… para…"), su prioridad y **criterios de aceptación verificables** (CA). Un criterio se considera cumplido solo si alguien puede comprobarlo mirando o usando el sitio, sin interpretar intenciones. Cuando un criterio usa datos reales, los ids de función (`f01`…`f39`) corresponden a `data/programa.json`.

---

## 3. Restricciones no negociables

Vienen del brief. Aplican a todas las historias y cualquier incumplimiento bloquea la entrega.

| # | Restricción | Cómo se verifica |
|---|---|---|
| R1 | Next.js (App Router) con TypeScript | Inspección del proyecto |
| R2 | `npm run build` pasa sin errores | Se ejecuta y termina con éxito |
| R3 | Estilos con Tailwind CSS o CSS Modules. **Sin librerías de componentes** (shadcn/ui, MUI, Chakra, Mantine, DaisyUI ni similares) | Revisión de dependencias |
| R4 | Como máximo **una** librería de animación | Revisión de dependencias |
| R5 | **Sin imágenes externas ni fotos.** Lo visual de cada película se resuelve con código (CSS, SVG, canvas, etc.). Fuentes solo mediante `next/font` | No hay archivos de foto ni cargas de imágenes desde otros dominios; revisión de red en el navegador |
| R6 | Sin backend, base de datos ni servicios externos. Todo funciona en el navegador | Revisión de red: no hay llamadas a APIs propias ni de terceros (fuera de la carga del propio sitio y sus fuentes) |
| R7 | `data/programa.json` se usa **tal cual** y **no se modifica** | El archivo queda idéntico al del commit base |
| R8 | **No se inventan** películas, funciones, horarios ni datos que no estén en los datos o el brief | Revisión de contenido (ver E0-H2) |
| R9 | Todos los textos de la interfaz en **español** | Revisión de contenido, incluidos mensajes de error, textos para lectores de pantalla y título de pestaña |
| R10 | **Sin emojis** en la interfaz | Revisión de contenido |
| R11 | **Sin puntajes, estrellas ni rankings** de películas | Revisión de contenido |
| R12 | Respeta `prefers-reduced-motion` | Ver E0-H5 |
| R13 | Funciona bien desde **360 px** de ancho hasta escritorio | Ver E0-H4 |
| R14 | Se trabaja solo dentro de la carpeta del proyecto | Inspección |

---

## 4. Reglas de negocio y glosario

Esta sección es la **fuente de verdad** para todo cálculo. Si una historia dice "se topa" o "no alcanza", significa exactamente lo que dice aquí.

### 4.1 Hora y zona horaria
- **RN1.** Todas las horas de `funciones[].inicio` son hora local de Chile (`America/Santiago`). Se muestran **tal como están en los datos**, en formato de 24 horas (`21:15`), **sin convertirlas a la zona horaria del dispositivo**. Un teléfono configurado en otro país muestra las mismas horas.
- **RN2.** Cualquier cosa que dependa de "ahora" (por ejemplo, destacar la próxima función) usa la hora actual de Chile, no la del dispositivo.

### 4.2 Función
- **RN3. Hora de término** = hora de inicio + `duracionMin` de la película. El conversatorio **no** forma parte de la función.
- **RN4. Día de una función** = la fecha de su hora de **inicio**. Una función que empieza el viernes 16 a las 23:30 y termina el sábado 17 a la 01:15 es **del viernes**: aparece en el viernes, se filtra como viernes y se agrupa en el viernes del itinerario.
- **RN5. Funciones que terminan después de medianoche**: cuando la hora de término cae en el día siguiente, se indica de forma explícita e inequívoca (por ejemplo, que se entienda "termina a las 01:15 de la madrugada del sábado"). Nunca debe parecer que termina antes de empezar.
- **RN6. Conversatorio**: si la función tiene `conversatorioMin`, después de la película hay un conversatorio de esa duración, en la misma sala. Empieza cuando termina la película.
- **RN7. Agotada**: si la función tiene `agotada: true`, no quedan entradas. Se sigue mostrando en todas partes, claramente marcada como agotada.
- **RN8. Nota de función**: si tiene `nota`, se muestra junto a la función (ej.: función inaugural, entrega de premios).

### 4.3 Salas, traslados y aire libre
- **RN9. Sala**: cada función ocurre en una sala con nombre y dirección. La Terraza Faro es **al aire libre** y tiene una nota: si llueve, la función se traslada al Galpón 7 con la misma hora de inicio. Esa nota se muestra siempre que aparezca una función de la Terraza Faro en programa, ficha e itinerario.
- **RN10. Traslado**: los minutos caminando entre salas están en `trasladosMin`. La tabla es simétrica y entre la misma sala es 0.

### 4.4 Entradas
- **RN11.** Entrada general: **$4.000** (pesos chilenos). Funciones al aire libre (Terraza Faro): **gratis**. Venta: "Solo en boletería de cada sala, desde una hora antes de cada función. No hay venta en línea." Los montos se escriben con formato chileno (`$4.000`).
- **RN12.** El sitio **no** tiene botones de "comprar", "reservar" ni similares.

### 4.5 Reglas del itinerario (el corazón del producto)

Sean dos funciones elegidas **A** y **B**, con A empezando antes que B (o a la misma hora).

- **RN13. Tope (choque).** A y B **se topan** si B empieza **antes** de que termine A (término según RN3). Si B empieza exactamente a la hora en que termina A, **no** se topan.
  - Se evalúa entre **todos los pares** de funciones elegidas, no solo entre funciones seguidas.
  - Se compara con fecha y hora completas: una función que termina pasada la medianoche puede toparse con otra que empezó antes de la medianoche.
- **RN14. No alcanza a llegar caminando.** Si A y B **no** se topan, sean `margen` = minutos entre el término de A y el inicio de B, y `traslado` = minutos de A a B según RN10. **No alcanza** si `margen < traslado`. Si `margen = traslado`, **sí alcanza**.
  - Se evalúa entre cada función y la **siguiente** función elegida en orden cronológico con la que no se tope. (Con la tabla de traslados actual, esto basta para detectar todos los casos.)
- **RN15. Se perdería el conversatorio.** Si A tiene conversatorio, A y B no se topan y sí alcanza a llegar (RN14), entonces **se perdería el conversatorio** (entero o en parte) si `margen < conversatorioMin + traslado`. La hora límite para salir de la sala de A es `inicio de B − traslado`.
  - **El conversatorio no cuenta como choque**: no se presenta como tope ni como problema de traslado, no suma en el contador de problemas y se ve distinto (es un aviso informativo).
- **RN16. Un aviso por par, el más grave.** Para un mismo par A→B se muestra solo el aviso más grave: tope > no alcanza > conversatorio. (Si no alcanza a llegar, obviamente también se pierde el conversatorio; no hace falta decirlo aparte.)
- **RN17. Los avisos nunca impiden elegir.** Se puede tener en el itinerario funciones que se topan, que no alcanzan o que están agotadas. El sitio avisa; la persona decide (puede querer salir antes, o ver solo un pedazo).
- **RN18. Avisos informativos adicionales** (no son choques): función agotada (RN7), función al aire libre con plan de lluvia (RN9), y la misma película elegida en dos funciones distintas.

### 4.6 Glosario de interfaz
Vocabulario cercano y chileno, tuteando, sin caricatura. Palabras que el brief usa y que el público reconoce: **"se topan"**, **"no alcanzas a llegar"**, **"te perderías el conversatorio"**, **"función"**, **"sala"**, **"boletería"**, **"agotada"**, **"al aire libre"**, **"Mi itinerario"**.

Valores de los datos que deben mostrarse en lenguaje claro:

| Dato | Se muestra como |
|---|---|
| `clasificacion: "TE"` | Todo espectador |
| `clasificacion: "+14"` | Mayores de 14 años (se puede abreviar "+14" si queda explicado en algún lugar visible) |
| `clasificacion: "+18"` | Mayores de 18 años (ídem) |
| `estreno: "mundial"` | Estreno mundial |
| `estreno: "latinoamericano"` | Estreno latinoamericano |
| `estreno: "nacional"` | Estreno nacional (en Chile) |
| `seccion: <id>` | Nombre de la sección (`secciones[].nombre`) |
| `salaId: <id>` | Nombre de la sala (`salas[].nombre`); dirección donde corresponda |
| Fecha `2026-10-15` | jueves 15 de octubre (día de la semana en minúscula, en español) |

---

## 5. Datos de referencia para verificar

Todo número que muestre el sitio sobre el festival debe **salir de los datos**, no escribirse a mano. Estos son los valores correctos a la fecha, para comprobar:

- **Días:** 3 (jueves 15, viernes 16, sábado 17 de octubre de 2026).
- **Películas:** 24. **Funciones:** 39. **Salas:** 4. **Secciones:** 4.
- **Funciones por día:** jueves 10 (`f01`–`f10`), viernes 12 (`f11`–`f22`), sábado 17 (`f23`–`f39`).
- **Funciones por sección:** Competencia Latinoamericana 16, Panorama Internacional 9, Bruma Nocturna 8, Hecho en la Costa 6.
- **Funciones por día y sección:**

| | Competencia | Panorama | Nocturna | Costa | Total |
|---|---|---|---|---|---|
| Jueves 15 | 4 | 3 | 1 | 2 | 10 |
| Viernes 16 | 4 | 3 | 3 | 2 | 12 |
| Sábado 17 | 8 | 3 | 4 | 2 | 17 |

- **Películas por sección:** Competencia 8, Panorama 6, Nocturna 5, Costa 5.
- **Estrenos:** 9 mundiales, 8 latinoamericanos, 7 nacionales.
- **Películas con una sola función (9):** El último astillero, Mar negro, Cortos I: Oficios del mar, Ostrava Blues, Cortos II: Noches de puerto, Horas muertas, Marea roja, Bruma, 1987, Ahogados. Las otras 15 tienen dos funciones.
- **Funciones con conversatorio (4):** `f03` (20 min), `f13` (25 min), `f25` (30 min), `f31` (30 min).
- **Funciones agotadas (2):** `f22` Marea roja (viernes 23:30, Galpón 7) y `f31` La hora azul del puerto (sábado 17:30, Teatro Municipal; además tiene conversatorio).
- **Funciones al aire libre, Terraza Faro (5):** `f07`, `f17`, `f21`, `f33`, `f37`. Son gratis.
- **Funciones con nota (2):** `f05` (función inaugural con el equipo de la película) y `f36` (antes de la función se entregan los premios del festival).
- **Funciones que terminan después de medianoche (5):** `f09` Mar negro (termina 00:13), `f10` La niebla tiene dientes (00:04), `f21` Las cintas del faro (00:22), `f22` Marea roja (01:15), `f39` Las cintas del faro (01:07 del domingo 18).
- **Primera función:** jueves 15, 16:00 (`f01`). **Última en terminar:** `f39`, domingo 18 a la 01:07.
- **Películas con título original distinto (6):** Transbordador de invierno (*Vinterferja*), Mar negro (*Kuroi Umi*), Horas muertas (*Les heures creuses*), Línea de sal (*Salt Line*), Doce noches claras (*Tolv lyse nætter*), Las cintas del faro (*The Lighthouse Tapes*).

---

## 6. Decisiones de producto tomadas

El brief deja algunos puntos abiertos. Estas son las decisiones, para que nadie tenga que adivinar:

| # | Tema | Decisión | Por qué |
|---|---|---|---|
| D1 | ¿Se puede agregar al itinerario una función que se topa o no alcanza? | **Sí.** Se avisa, no se bloquea (RN17). | La persona puede querer salir antes o ver parte; bloquear se siente como formulario. |
| D2 | ¿Se puede agregar una función agotada? | **Sí**, con aviso claro de que está agotada. | Puede que ya tenga entrada o quiera probar suerte; además puede venir en un itinerario compartido. |
| D3 | ¿A qué día pertenece una función que cruza la medianoche? | Al día en que **empieza** (RN4). | Así la entiende el público y así está organizado el festival. |
| D4 | ¿El conversatorio es choque? | **No.** Es un aviso informativo, visualmente distinto (RN15). | Lo dice el brief. |
| D5 | ¿Qué pasa al abrir un link compartido si ya tengo itinerario? | **Nunca** se modifica el propio sin una acción explícita. Se ofrece agregar (unir, sin duplicados) o reemplazar (con confirmación). | Evitar perder el itinerario propio por abrir un link. |
| D6 | ¿El link compartido se actualiza si quien lo mandó cambia su itinerario? | **No.** El link es una foto del itinerario al momento de compartir. | No hay backend ni cuentas. |
| D7 | Orden del programa | Cronológico por hora de inicio; a igual hora, por nombre de sala. | Es como se recorre un festival. |
| D8 | ¿Se muestran precios? | Sí, desde los datos: $4.000 general, gratis al aire libre, y cómo se compra. | La gente trabaja y cuida la plata; es información práctica real. |
| D9 | ¿Hay mapa de salas? | Solo si **no** inventa ubicaciones. Los datos tienen direcciones y minutos caminando, no coordenadas. Un esquema ilustrativo es aceptable solo si no se presenta como mapa real a escala. | R8: no inventar datos. |
| D10 | Plan de lluvia de la Terraza Faro | Se muestra la nota tal cual. El sitio **no** recalcula horarios ni cambia la sala por su cuenta. | No sabemos si llueve; no inventar. |
| D11 | Tono | Español de Chile, tuteo, cercano y claro. Nada de voseo ni "vosotros". | Público del puerto y la región. |

---

## 7. Épicas e historias de usuario

### E0. Base transversal: calidad, idioma y datos fieles

Lo que tiene que ser cierto en **todo** el sitio. No es una pantalla: son condiciones que se verifican en cada una.

#### E0-H1. El sitio está en español y sin restos de la plantilla — **Must**
Como visitante, quiero que todo el sitio esté en español y se vea como el sitio del festival, para confiar en que es el oficial.

- **CA1.** El documento declara idioma español (los lectores de pantalla leen en español).
- **CA2.** Cada página tiene un título de pestaña en español que identifica la página y el festival (ej.: nombre de la película + "Festival de Cine Niebla"). No aparece "Create Next App" ni textos de la plantilla.
- **CA3.** La descripción de la página (la que se ve al compartir el link en un chat o buscador) está en español y describe el festival.
- **CA4.** No quedan logos, íconos ni favicon de Next.js o Vercel; el favicon es propio del festival.
- **CA5.** Todo texto visible o leído por lectores de pantalla (botones, etiquetas, mensajes, estados vacíos, errores, página no encontrada) está en español.
- **CA6.** No hay emojis en ningún texto de la interfaz.

#### E0-H2. Los datos que se muestran son los del archivo, sin inventos — **Must**
Como organizadora, quiero que el sitio muestre exactamente la información de `data/programa.json`, para no tener que desmentir nada durante el festival.

- **CA1.** `data/programa.json` no tiene cambios respecto al commit base.
- **CA2.** Cada una de las 24 películas y 39 funciones aparece en el sitio; no aparece ninguna película, función, horario, sala, precio, invitado, premio, auspiciador, cita de prensa o dato que no esté en los datos o en el brief.
- **CA3.** Los conteos y resúmenes que muestre el sitio coinciden con la sección 5.
- **CA4.** No se muestran puntajes, estrellas, rankings, "favoritas del público", "más vistas" ni nada que ordene o destaque películas por calidad o popularidad.
- **CA5.** Los textos de presentación del festival (qué es, quiénes lo hacen) se basan en lo que dice el brief; si se agrega texto editorial, no contiene afirmaciones de hechos nuevos (cifras, historia, nombres).

#### E0-H3. Horas y fechas correctas en cualquier dispositivo — **Must**
Como persona que mira el programa, quiero ver las horas reales del festival, para no llegar tarde por un error de zona horaria.

- **CA1.** Las horas se muestran en formato 24 horas y coinciden con los datos (RN1).
- **CA2.** Con el dispositivo configurado en otra zona horaria (por ejemplo, Tokio o Madrid), todas las horas y días mostrados son los mismos que con la zona de Chile.
- **CA3.** Las horas de término se calculan según RN3 y coinciden con la tabla de la sección 8.1.
- **CA4.** Las funciones que terminan después de medianoche (sección 5) muestran su término de forma inequívoca (RN5).
- **CA5.** Las fechas se escriben en español con día de la semana (ej.: "sábado 17 de octubre").

#### E0-H4. Se usa bien desde 360 px hasta escritorio — **Must**
Como persona que revisa el programa caminando, quiero que todo se lea y se toque bien en mi celular, para no pelear con la pantalla.

- **CA1.** A 360, 390, 768, 1024 y 1440 px de ancho, ninguna página tiene desplazamiento horizontal ni contenido cortado o superpuesto.
- **CA2.** A 360 px, los textos de horario, título y sala se leen sin hacer zoom.
- **CA3.** Los elementos tocables (filtros, botones de agregar/quitar del itinerario, enlaces) tienen un área de toque cómoda (referencia: al menos 44 × 44 px) y no quedan tan juntos que se toque uno por otro.
- **CA4.** Las acciones principales de cada página se pueden hacer con una sola mano en un celular sin necesidad de gestos ocultos (arrastrar, pellizcar o mantener presionado no son la única forma de hacer nada).
- **CA5.** En escritorio el diseño aprovecha el espacio (no es solo la versión celular estirada).

#### E0-H5. Respeta a quien prefiere menos movimiento — **Must**
Como persona sensible al movimiento, quiero que el sitio no me anime cosas si así lo pedí en mi sistema, para poder usarlo sin marearme.

- **CA1.** Con la preferencia de reducir movimiento activada en el sistema, no hay animaciones de desplazamiento, parallax, transiciones de página con movimiento, animaciones en bucle ni efectos que se muevan solos.
- **CA2.** Con esa preferencia activada, toda la información y todas las funciones siguen disponibles, y la portada sigue viéndose trabajada (ver E2-H1), aunque sea estática.
- **CA3.** Con la preferencia desactivada, ninguna animación se repite sin fin sobre contenido que hay que leer, ni retrasa el acceso a la información más de lo necesario.
- **CA4.** Nada parpadea más de 3 veces por segundo.

#### E0-H6. Accesible para todas las personas — **Must**
Como persona que usa lector de pantalla, teclado o ve con poco contraste, quiero poder usar el programa y el itinerario, para ir al festival como cualquiera.

- **CA1.** Todo se puede usar solo con teclado (filtros, agregar/quitar funciones, compartir, copiar itinerario), con foco visible en todo momento.
- **CA2.** El contraste de texto cumple WCAG 2.2 AA (4,5:1 texto normal, 3:1 texto grande y elementos gráficos necesarios para entender).
- **CA3.** Ningún estado se comunica **solo** con color: agotada, al aire libre, en mi itinerario, tope, no alcanza y conversatorio tienen además texto o forma distinguible.
- **CA4.** Los botones de agregar/quitar tienen un nombre accesible que dice qué función (película, día y hora) y su estado actual (agregada o no).
- **CA5.** Los cambios importantes (se agregó una función, apareció un tope, se copió el link) se anuncian a lectores de pantalla.
- **CA6.** Las representaciones visuales de películas (E1-H2) no generan ruido para lectores de pantalla: o son decorativas, o tienen una descripción breve y útil.
- **CA7.** Los encabezados siguen una jerarquía lógica y cada página tiene un único encabezado principal.

#### E0-H7. Carga rápido con datos móviles — **Should**
Como persona que abre el programa en la calle con mala señal, quiero que cargue rápido, para no perder la función esperando.

- **CA1.** En una auditoría Lighthouse en modo móvil de la versión de producción, portada, programa, una ficha e itinerario obtienen Performance ≥ 90 y Accessibility ≥ 95.
- **CA2.** El contenido principal de programa y fichas es visible sin esperar a que termine una animación.
- **CA3.** Una vez cargado el sitio, marcar y desmarcar funciones y ver los avisos no depende de la conexión.

#### E0-H8. Página no encontrada con salida — **Should**
Como persona que llegó por un link roto o una película que no existe, quiero que me orienten, para no quedar en un callejón sin salida.

- **CA1.** Una dirección que no existe (incluida una ficha de película con un identificador inexistente) muestra una página en español, con la identidad del festival.
- **CA2.** Esa página tiene enlaces al programa y a la portada.

---

### E1. Identidad visual y representación de películas

El brief da libertad total en identidad, tipografía, color, animaciones y en cómo se representa cada película. Esta épica **no** define el diseño: define lo que el diseño tiene que lograr.

**Dirección (orientación, no receta):**
- Se tiene que sentir como **este** festival: un puerto chico de la costa chilena, niebla, mar, noche, faro, oficio, cine hecho con cariño y pocos recursos.
- Anti-referencia explícita: "la web de una empresa de seguros". Es decir, evitar lo genérico y corporativo: la estética de plantilla, las fotos de stock (además prohibidas), los íconos genéricos, el azul corporativo sin intención, los bloques intercambiables con cualquier otro sitio.
- "Con personalidad, de acá, bien hecho": el carácter no puede ir en contra de la legibilidad y el uso en celular.

#### E1-H1. Identidad visual propia y consistente — **Must**
Como organizadora, quiero que el sitio tenga una identidad reconocible, para que no parezca hecho con plantilla.

- **CA1.** Existe un sistema visual definido (paleta, tipografías, tratamiento de títulos, espaciado) que se aplica igual en portada, programa, ficha e itinerario.
- **CA2.** Se usa tipografía elegida para el festival (cargada con `next/font`); no se deja la tipografía que trae el proyecto base como identidad.
- **CA3.** Cada una de las 4 secciones tiene una identidad visual reconocible (por ejemplo un color, forma o tratamiento), que se usa de forma consistente en todas las páginas, y siempre acompañada del nombre de la sección (no solo color, ver E0-H6 CA3).
- **CA4.** El sitio no usa ninguna imagen de fotos ni archivos de imagen externos (R5).
- **CA5.** Una persona que no conoce el proyecto, al ver la portada y el programa, no puede señalar un tema o plantilla genérica de origen. (Verificación: comparación lado a lado con la plantilla por defecto del proyecto base y con plantillas de sitios de eventos comunes; no deben verse intercambiables.)

#### E1-H2. Cada película tiene su propia imagen hecha con código — **Must**
Como visitante, quiero reconocer cada película por algo visual aunque no haya afiche, para ubicarla rápido en el programa y en mi itinerario.

- **CA1.** Cada una de las 24 películas tiene una representación visual generada con código (sin fotos ni imágenes externas).
- **CA2.** La representación es **la misma** para una película en cada visita, cada dispositivo y cada página (programa, ficha, itinerario, vista compartida).
- **CA3.** Las 24 representaciones son distinguibles entre sí: no hay dos iguales. Las dos funciones de una misma película usan la misma representación.
- **CA4.** La representación tiene relación visible con algo de la película (su sección, su título, su país, su duración, su tono o su sinopsis) y no es un patrón al azar sin sentido; quien implemente documenta qué dato la determina.
- **CA5.** No imita un afiche real con textos falsos (no inventa taglines, créditos, logos de premios, laureles ni citas).
- **CA6.** Se ve bien a 360 px y en escritorio, en tamaño pequeño (listado) y grande (ficha).
- **CA7.** Si tiene movimiento, se detiene con `prefers-reduced-motion` (E0-H5).

#### E1-H3. Movimiento con intención — **Should**
Como visitante, quiero que las animaciones hagan que el sitio se sienta vivo sin estorbar, para disfrutar usarlo.

- **CA1.** Agregar o quitar una función del itinerario tiene una respuesta visual inmediata (menos de 100 ms) que confirma la acción.
- **CA2.** Las animaciones no bloquean la interacción: se puede tocar, filtrar o navegar mientras ocurren.
- **CA3.** Se usa como máximo una librería de animación (R4).
- **CA4.** Todo lo anterior respeta E0-H5.

---

### E2. Portada

"Tiene que presentar el festival: qué es, cuándo es, dónde es y qué secciones tiene. Quien entre tiene que tener ganas de ir. Desde aquí se llega al programa." Y: "Queremos que la portada nos sorprenda."

#### E2-H1. Entender el festival en un vistazo — **Must**
Como vecina del puerto que entra por primera vez, quiero saber qué es, cuándo y dónde es el festival sin tener que buscar, para decidir si voy.

- **CA1.** Sin desplazarse, en un celular de 360 × 640 px, se ve: el nombre "Festival de Cine Niebla", que es la 3ª edición, las fechas (jueves 15 al sábado 17 de octubre de 2026) y la ciudad (Puerto Bruma).
- **CA2.** Sin desplazarse, en ese mismo tamaño, hay una forma evidente de ir al programa.
- **CA3.** La portada explica en pocas frases qué es el festival (un festival de cine de Puerto Bruma, en la costa de Chile, hecho por un equipo chico y voluntarios), sin inventar datos (E0-H2).
- **CA4.** La portada muestra cuántas películas, funciones, salas y días tiene el festival, calculados desde los datos (24, 39, 4, 3).
- **CA5.** La portada tiene un elemento visual principal que sorprende y es propio del festival (no una foto, no un título centrado sobre un degradado genérico). Con reducción de movimiento sigue siendo atractivo.

#### E2-H2. Conocer las secciones — **Must**
Como visitante, quiero ver qué tipos de cine hay, para encontrar lo que me gusta.

- **CA1.** Se muestran las 4 secciones con su nombre y descripción, tal como están en los datos.
- **CA2.** Cada sección muestra su identidad visual (E1-H1 CA3) y cuántas películas tiene (8, 6, 5, 5).
- **CA3.** Desde cada sección se llega al programa ya filtrado por esa sección (E3-H3).

#### E2-H3. Dónde es: las salas — **Must**
Como visitante, quiero saber dónde están las salas, para organizarme para llegar.

- **CA1.** Se muestran las 4 salas con nombre y dirección, tal como están en los datos.
- **CA2.** La Terraza Faro se identifica como al aire libre y se muestra su nota sobre la lluvia.
- **CA3.** Se muestran los tiempos caminando entre salas o, al menos, se comunica que las salas están a una distancia caminable y cuánto (de 8 a 22 minutos), según los datos.
- **CA4.** Si hay una representación gráfica de ubicaciones, cumple D9 (no inventa ubicaciones reales).

#### E2-H4. Cómo conseguir entradas — **Must**
Como persona que trabaja y quiere planificar, quiero saber cuánto cuesta y cómo compro, para no llegar sin plata ni tarde a la boletería.

- **CA1.** Se muestra: entrada general $4.000; funciones al aire libre gratis; venta solo en la boletería de cada sala desde una hora antes de cada función; no hay venta en línea (RN11).
- **CA2.** No hay botones ni enlaces de compra o reserva (RN12).

#### E2-H5. Destacados del programa — **Should**
Como visitante, quiero ver algunos momentos especiales, para tener ganas de ir.

- **CA1.** Se destacan, con enlace a sus fichas, momentos que salen de los datos: la función inaugural (`f05`), la entrega de premios antes de `f36`, las funciones con conversatorio, las funciones gratis al aire libre y/o la cantidad de estrenos mundiales (9).
- **CA2.** El criterio de destacado nunca es calidad, popularidad ni puntaje (R11). No se presenta como "lo mejor" ni "imperdibles".
- **CA3.** Todo lo destacado es verificable contra los datos.

#### E2-H6. Contacto — **Should**
Como visitante con una duda, quiero saber cómo contactar al festival, para preguntar.

- **CA1.** Se muestran el correo `hola@festivalniebla.cl` y el Instagram `@festivalniebla`, desde los datos.
- **CA2.** El correo abre el cliente de correo al tocarlo; el Instagram lleva al perfil.

#### E2-H7. Acceso a Mi itinerario — **Must**
Como persona que ya armó su itinerario, quiero volver a él rápido, para consultarlo camino a la sala.

- **CA1.** Desde la portada (y desde cualquier página, ver E3-H8) se llega a Mi itinerario en un toque.
- **CA2.** Si hay funciones en el itinerario, el acceso muestra cuántas.

---

### E3. Programa

"Todas las funciones de los tres días. Se tiene que poder filtrar por día y por sección. Tiene que verse bien y usarse bien en un celular."

#### E3-H1. Ver todas las funciones — **Must**
Como persona que planifica, quiero ver todas las funciones del festival ordenadas, para saber qué hay.

- **CA1.** Sin filtros, se ven las 39 funciones, agrupadas por día (jueves, viernes, sábado) y en orden cronológico dentro de cada día (D7).
- **CA2.** Cada función muestra como mínimo: hora de inicio, hora de término, título de la película, sección, sala, y su representación visual o un rasgo de ella (E1-H2).
- **CA3.** Las funciones que cruzan la medianoche aparecen en el día en que empiezan (RN4) y muestran su término según RN5. Ej.: `f22` Marea roja aparece en el viernes, a las 23:30, y se entiende que termina a la 01:15 del sábado.
- **CA4.** Cada función muestra, cuando corresponde: **Agotada** (`f22`, `f31`), **Al aire libre · Gratis** (`f07`, `f17`, `f21`, `f33`, `f37`), **Conversatorio de N min** (`f03`, `f13`, `f25`, `f31`) y su **nota** (`f05`, `f36`).
- **CA5.** Las funciones agotadas siguen visibles y se pueden abrir y agregar al itinerario (D2), pero se distinguen claramente de las disponibles.
- **CA6.** Desde cada función se llega a la ficha de su película.
- **CA7.** No hay botones de compra (RN12).

#### E3-H2. Filtrar por día — **Must**
Como persona que llega corriendo el viernes después de la pega, quiero ver solo lo del viernes, para decidir rápido.

- **CA1.** Hay un filtro de día con las opciones: todos los días, jueves 15, viernes 16, sábado 17.
- **CA2.** Al elegir un día se muestran solo las funciones que **empiezan** ese día: jueves 10, viernes 12, sábado 17.
- **CA3.** `f09` y `f10` (terminan pasada la medianoche) aparecen en jueves y **no** en viernes; `f39` aparece en sábado.
- **CA4.** El filtro activo se ve claramente (no solo con color).

#### E3-H3. Filtrar por sección — **Must**
Como fan del terror, quiero ver solo Bruma Nocturna, para no revisar todo.

- **CA1.** Hay un filtro de sección con: todas las secciones y cada una de las 4 secciones por su nombre.
- **CA2.** Al elegir una sección se muestran solo sus funciones: Competencia 16, Panorama 9, Nocturna 8, Costa 6.
- **CA3.** El filtro activo se ve claramente (no solo con color).

#### E3-H4. Combinar filtros y ver resultados — **Must**
Como persona que quiere "Bruma Nocturna del sábado", quiero combinar día y sección, para ir al grano.

- **CA1.** Los filtros de día y sección se combinan. Ejemplos verificables (tabla de la sección 5): viernes + Nocturna = 3 funciones (`f19`, `f21`, `f22`); sábado + Competencia = 8; jueves + Nocturna = 1 (`f10`).
- **CA2.** Se muestra cuántas funciones cumplen los filtros actuales.
- **CA3.** Hay una forma de volver a "todo" en un toque.
- **CA4.** Si una combinación no tuviera resultados, se muestra un mensaje claro en español con una forma de quitar filtros (aunque con los datos actuales todas las combinaciones tienen resultados).
- **CA5.** Aplicar un filtro se refleja de inmediato, sin recargar toda la página ni perder lo que ya estaba marcado en el itinerario.

#### E3-H5. Agregar y quitar funciones del itinerario desde el programa — **Must**
Como persona armando mi recorrido, quiero marcar funciones mientras miro el programa, para no tener que ir a otra pantalla.

- **CA1.** Cada función del programa tiene una acción para agregarla o quitarla de Mi itinerario, usable con un toque.
- **CA2.** El estado (en mi itinerario / no) se ve en cada función sin abrir nada, con texto o forma además del color.
- **CA3.** Al agregar o quitar, el cambio se refleja de inmediato en el contador de acceso a Mi itinerario (E2-H7 CA2).
- **CA4.** Agregar una función que se topa, no alcanza o está agotada está permitido (RN17).

#### E3-H6. Los filtros se recuerdan en la dirección — **Should**
Como persona que le manda a una amiga "mira lo del sábado", quiero que el link del programa conserve los filtros, para que vea lo mismo que yo.

- **CA1.** Al aplicar filtros, la dirección de la página cambia de modo que al recargar se conservan los filtros.
- **CA2.** Al abrir esa dirección en otro navegador se ve el programa con los mismos filtros.
- **CA3.** El botón "atrás" del navegador lleva a la página anterior de forma predecible (no obliga a retroceder filtro por filtro para salir del programa, o si lo hace, vuelve a estados de filtro coherentes).
- **CA4.** Valores de filtro inválidos en la dirección se ignoran y se muestra el programa sin ese filtro.

#### E3-H7. Anticipar topes antes de agregar — **Should**
Como persona que ya tiene funciones elegidas, quiero ver en el programa qué funciones chocarían con mi itinerario, para elegir sin prueba y error.

- **CA1.** Si el itinerario tiene funciones, cada función del programa **no** elegida que se topa (RN13) con alguna elegida lo indica, nombrando con cuál.
- **CA2.** Ídem para las que no alcanzaría a llegar caminando (RN14), desde o hacia una elegida.
- **CA3.** La indicación es discreta y no oculta ni deshabilita la función (RN17).
- **CA4.** Verificación: con `f05` en el itinerario, en el jueves se indica tope en `f04`, `f06`, `f07` y `f08`; y "no alcanzas" en `f03` (termina 19:24 en Galpón 7, `f05` empieza 19:30 en el Teatro, 8 min caminando).

#### E3-H8. Navegación entre las partes del sitio — **Must**
Como visitante, quiero moverme entre portada, programa y mi itinerario desde cualquier lugar, para no perderme.

- **CA1.** Desde todas las páginas se llega en un toque a portada, programa y Mi itinerario.
- **CA2.** En la navegación se distingue en qué parte estoy.
- **CA3.** A 360 px la navegación no tapa contenido de forma permanente ni impide leer el programa.

#### E3-H9. Destacar lo que viene durante el festival — **Could**
Como persona que está en pleno festival, quiero ver rápido qué empieza ahora, para decidir en el momento.

- **CA1.** Durante los días del festival (según la hora de Chile, RN2), el programa abre en el día actual o permite ir a "ahora" en un toque.
- **CA2.** Las funciones que ya terminaron se distinguen (atenuadas o separadas) sin desaparecer.
- **CA3.** Fuera de los días del festival, el programa se comporta como en E3-H1.
- **CA4.** Verificable simulando la fecha y hora del dispositivo, y confirmando que con el dispositivo en otra zona horaria se usa igualmente la hora de Chile.

---

### E4. Ficha de película

"Muestra los datos de la película y todas sus funciones."

#### E4-H1. Ver todos los datos de la película — **Must**
Como visitante indeciso, quiero saber de qué se trata una película y sus datos, para decidir si la veo.

- **CA1.** La ficha muestra: título; título original (solo si existe en los datos); dirección; país (o países); año; duración en minutos; sección (con enlace o forma de ver el programa de esa sección); clasificación en lenguaje claro (4.6); tipo de estreno en lenguaje claro (4.6); sinopsis.
- **CA2.** La representación visual de la película (E1-H2) se muestra en tamaño destacado.
- **CA3.** No se muestran datos que no estén en el archivo (sin tráiler, reparto, fotos, puntajes, premios ganados, etc.).
- **CA4.** Verificación con *Transbordador de invierno*: título original *Vinterferja*, Signe Holm, Noruega, 2025, 101 min, Panorama Internacional, Todo espectador, Estreno latinoamericano.
- **CA5.** Verificación con *La hora azul del puerto*: sin título original, Valentina Rojas Ulloa, Chile, 2026, 98 min, Competencia Latinoamericana, Mayores de 14, Estreno mundial.

#### E4-H2. Ver todas sus funciones — **Must**
Como persona que quiere ver una película, quiero ver todas sus funciones, para elegir la que me acomoda.

- **CA1.** La ficha lista **todas** las funciones de la película, en orden cronológico: 2 para las 15 películas con dos funciones y 1 para las 9 con una sola (sección 5).
- **CA2.** Cada función muestra: día, hora de inicio, hora de término (RN3, RN5), sala y dirección de la sala.
- **CA3.** Cada función muestra, cuando corresponde: agotada, al aire libre y gratis con nota de lluvia, conversatorio con su duración, nota de la función, y el precio que corresponde ($4.000 o gratis).
- **CA4.** Cada función tiene la acción de agregar/quitar de Mi itinerario, con el mismo comportamiento y estado que en el programa (E3-H5).
- **CA5.** Verificación con *La hora azul del puerto*: `f05` jueves 15, 19:30–21:08, Teatro Municipal, con nota de función inaugural; `f31` sábado 17, 17:30–19:08, Teatro Municipal, agotada, conversatorio de 30 min.
- **CA6.** Verificación con *Las cintas del faro*: `f21` viernes 16, 23:00, Terraza Faro, termina 00:22 del sábado, al aire libre y gratis con nota de lluvia; `f39` sábado 17, 23:45, Galpón 7, termina 01:07 del domingo.

#### E4-H3. Cada ficha tiene su propia dirección — **Must**
Como persona que le recomienda una película a alguien, quiero mandarle el link de la ficha, para que la vea directo.

- **CA1.** Cada película tiene una dirección propia, estable y legible, que abre directamente su ficha (también en una pestaña nueva o en otro navegador).
- **CA2.** Al compartir ese link en un chat, la vista previa muestra el título de la película y el nombre del festival.
- **CA3.** Una dirección de película inexistente lleva a E0-H8.
- **CA4.** Desde la ficha se puede volver al programa; si se llegó desde el programa filtrado, se vuelve con los mismos filtros (Should).

#### E4-H4. Descubrir otras películas de la sección — **Could**
Como visitante, quiero ver otras películas de la misma sección desde la ficha, para seguir explorando.

- **CA1.** La ficha muestra las demás películas de su sección, con enlace a sus fichas.
- **CA2.** El orden no implica calidad (por ejemplo, alfabético o por primera función).

---

### E5. Mi itinerario: armar y guardar

"Cada persona arma su propio recorrido marcando las funciones a las que quiere ir." "Se guarda en el navegador, sin cuentas ni registro." "Que armar el itinerario se sienta bien, no como llenar un formulario."

#### E5-H1. Ver mi itinerario — **Must**
Como persona que armó su recorrido, quiero ver mis funciones en orden, para saber adónde tengo que ir y cuándo.

- **CA1.** Mi itinerario muestra las funciones elegidas agrupadas por día (RN4) y en orden cronológico.
- **CA2.** Cada función muestra: hora de inicio y término (RN5 si cruza medianoche), título (con enlace a la ficha), sala y dirección, y sus marcas (agotada, al aire libre con nota de lluvia, conversatorio, nota).
- **CA3.** Entre dos funciones seguidas del mismo día se muestra el tiempo disponible entre el término de una y el inicio de la otra, y los minutos caminando entre sus salas (o "misma sala").
- **CA4.** Días sin funciones elegidas no se muestran o se muestran como vacíos de forma discreta.
- **CA5.** Se muestra un resumen: cantidad de funciones elegidas y cantidad de problemas (topes + no alcanza; los avisos de conversatorio no suman, RN15).
- **CA6.** El itinerario se entiende y se usa bien a 360 px mientras se camina (E0-H4): lo más importante (hora, sala, avisos) se lee sin abrir nada.
- **CA7.** La experiencia no parece un formulario: no hay campos de texto, casillas en tabla ni botón "guardar" (se guarda solo, ver E5-H3).

#### E5-H2. Estado vacío que invita — **Must**
Como persona que entra a Mi itinerario sin haber marcado nada, quiero entender qué es y cómo empezar, para no quedar perdida.

- **CA1.** Si no hay funciones elegidas, se explica en una o dos frases qué es Mi itinerario (marcas funciones y te avisa si se topan o no alcanzas a llegar) y que se guarda en este dispositivo sin crear cuenta.
- **CA2.** Hay un enlace evidente al programa.

#### E5-H3. Se guarda solo en mi navegador — **Must**
Como persona sin ganas de crear cuentas, quiero que mi itinerario quede guardado en el teléfono, para encontrarlo cuando vuelva.

- **CA1.** Al agregar o quitar funciones (desde programa, ficha o itinerario), el cambio queda guardado sin ninguna acción adicional.
- **CA2.** Al recargar la página, cerrar y volver a abrir el navegador, el itinerario sigue igual.
- **CA3.** No se pide nombre, correo, cuenta, contraseña ni registro de ningún tipo; no se envía el itinerario a ningún servidor (R6).
- **CA4.** Se comunica, de forma breve, que el itinerario vive en este navegador/dispositivo y que para llevarlo a otro se usa el link para compartir (E7).
- **CA5.** Si el navegador no permite guardar (por ejemplo, ciertos modos privados), el itinerario funciona durante la visita y se avisa que no quedará guardado; el sitio no se rompe.
- **CA6.** Si lo guardado contiene funciones que ya no existen en los datos, se ignoran sin romper la página.
- **CA7.** Las funciones elegidas se ven marcadas igual en programa, ficha e itinerario (una sola fuente de verdad).

#### E5-H4. Quitar funciones y deshacer — **Must** (quitar) / **Should** (deshacer)
Como persona que cambió de planes, quiero sacar funciones de mi itinerario sin miedo a equivocarme, para ajustarlo rápido.

- **CA1. (Must)** Desde Mi itinerario se puede quitar cada función con un toque.
- **CA2. (Must)** Al quitar una función, los avisos se recalculan de inmediato.
- **CA3. (Should)** Tras quitar una función aparece, por unos segundos, la opción de deshacer, que la devuelve.
- **CA4. (Should)** Hay una opción para vaciar el itinerario completo que pide confirmación antes de borrar.

#### E5-H5. Sincronía entre pestañas — **Could**
Como persona que tiene el programa abierto en una pestaña y el itinerario en otra, quiero que ambas muestren lo mismo, para no confundirme.

- **CA1.** Al agregar una función en una pestaña, la otra pestaña del mismo navegador la muestra como agregada sin tener que recargar (o, como mínimo, al volver a ella).

#### E5-H6. Costo estimado del itinerario — **Could**
Como persona que cuida su plata, quiero saber cuánto voy a gastar en entradas, para llevar lo justo a la boletería.

- **CA1.** Mi itinerario muestra el total estimado: $4.000 por cada función en sala y $0 por cada función al aire libre, con formato chileno.
- **CA2.** Recuerda que se paga en la boletería de cada sala, desde una hora antes (RN11).
- **CA3.** Verificación: con `f05`, `f07` y `f13` el total es $8.000.

#### E5-H7. Lo que viene durante el festival — **Could**
Como persona en pleno sábado de festival, quiero ver cuál es mi próxima función y cuánto falta, para no llegar tarde.

- **CA1.** Durante el festival (hora de Chile, RN2), Mi itinerario destaca la próxima función elegida: sala, dirección, hora y cuánto falta para que empiece.
- **CA2.** Las funciones elegidas que ya terminaron se distinguen sin desaparecer.
- **CA3.** Verificable simulando fecha y hora, igual que E3-H9 CA4.

---

### E6. Mi itinerario: avisos de topes, traslados y conversatorios

Esta épica implementa las reglas RN13 a RN18. Los casos concretos para verificar están en la **sección 8**; **todos** deben dar el resultado indicado.

#### E6-H1. Aviso de funciones que se topan — **Must**
Como persona armando mi itinerario, quiero que el sitio me avise si dos funciones se topan, para no darme cuenta cuando ya estoy sentada.

- **CA1.** Cuando dos funciones elegidas se topan (RN13), ambas muestran un aviso de **tope** que nombra la otra función (película, sala y hora).
- **CA2.** Se detectan topes entre **cualquier** par de funciones elegidas, no solo seguidas (caso T5 de la sección 8).
- **CA3.** Se detectan topes que cruzan la medianoche (casos T3 y T4).
- **CA4.** Si una función termina exactamente cuando empieza otra en la misma sala, **no** hay tope (caso OK1).
- **CA5.** Un minuto de superposición **sí** es tope (caso T2).
- **CA6.** El aviso de tope se distingue visualmente y con texto de los avisos informativos (E0-H6 CA3).
- **CA7.** Al quitar una de las funciones, el aviso desaparece de inmediato.

#### E6-H2. Aviso de que no alcanzas a llegar caminando — **Must**
Como persona que va de una sala a otra, quiero saber si me da el tiempo para llegar caminando, para no perderme el comienzo.

- **CA1.** Cuando dos funciones elegidas seguidas no se topan pero el tiempo entre ellas es menor que el traslado entre sus salas (RN14), se muestra un aviso de **no alcanzas a llegar** entre ambas.
- **CA2.** El aviso dice: a qué hora termina la primera y dónde, a qué hora empieza la segunda y dónde, cuántos minutos hay y cuántos se necesitan caminando. Ejemplo de contenido esperado (la redacción es libre): "Terminas a las 19:24 en Galpón 7 y la siguiente empieza a las 19:30 en el Teatro Municipal: tienes 6 minutos y caminando son 8."
- **CA3.** Si el tiempo disponible es igual al traslado, **no** hay aviso (el caso límite alcanza, RN14).
- **CA4.** Los traslados se leen de los datos, nunca de valores escritos a mano.
- **CA5.** Casos N1 a N5 y OK2 a OK4 de la sección 8 dan el resultado indicado.

#### E6-H3. Aviso de que te perderías el conversatorio — **Must**
Como persona que quiere quedarse a la conversación con el equipo de la película, quiero saber si irme a la siguiente función me hace perderla, para elegir con qué me quedo.

- **CA1.** Cuando una función elegida tiene conversatorio y la siguiente función elegida hace que no se pueda quedar al conversatorio completo y llegar a tiempo (RN15), se muestra un aviso de **te perderías el conversatorio**.
- **CA2.** El aviso indica la duración del conversatorio y la hora máxima a la que tendría que salir para llegar a la siguiente función.
- **CA3.** El aviso **no** es un choque: se ve como aviso informativo (distinto de tope y no alcanza), no suma al contador de problemas (E5-H1 CA5) y no se muestra como tope en el programa (E3-H7).
- **CA4.** Si hay tope o no alcanza en ese mismo par, se muestra solo el aviso más grave (RN16).
- **CA5.** Si da el tiempo para el conversatorio completo más el traslado, no hay aviso.
- **CA6.** Casos C1 a C3, N1, N4 y OK5 a OK6 de la sección 8 dan el resultado indicado.
- **CA7.** En la ficha y en el programa, las funciones con conversatorio indican la duración del conversatorio, para que la persona lo tenga en cuenta antes de elegir (E3-H1 CA4, E4-H2 CA3).

#### E6-H4. Avisos informativos: agotada, aire libre y película repetida — **Should**
Como persona que arma su itinerario, quiero enterarme de detalles que pueden cambiar mis planes, para no llevarme sorpresas.

- **CA1.** Una función agotada en el itinerario muestra que está agotada (`f22`, `f31`).
- **CA2.** Una función de la Terraza Faro en el itinerario muestra que es al aire libre, gratis y la nota de traslado al Galpón 7 si llueve.
- **CA3.** Si se eligen dos funciones de la misma película (ej.: `f01` y `f25`, *El canto de las redes*), se avisa que ya tienes otra función de esa película.
- **CA4.** Estos avisos no cuentan como problemas (E5-H1 CA5) y se ven distintos a tope y no alcanza.

#### E6-H5. Resumen de problemas que lleva a cada uno — **Should**
Como persona con un itinerario largo, quiero ver de un vistazo si tengo problemas y dónde, para resolverlos rápido.

- **CA1.** Arriba del itinerario se indica si no hay problemas o cuántos hay (E5-H1 CA5).
- **CA2.** Desde el resumen se puede ir a cada problema.
- **CA3.** Cuando no hay problemas, se comunica de forma positiva y clara.

#### E6-H6. Plan de lluvia en los traslados — **Could**
Como persona que eligió una función en la Terraza Faro, quiero saber si, en caso de lluvia, igual alcanzo a llegar a la siguiente, para tener un plan B.

- **CA1.** Para funciones de la Terraza Faro en el itinerario, se indica, como información adicional (no como problema), si el traslado cambiaría a "no alcanzas" o a "alcanzas" en caso de que se haga en el Galpón 7.
- **CA2.** Verificación: con `f14` (Muelle, termina 20:05) y `f17` (Terraza, 20:15), en condiciones normales alcanza (10 min, 9 caminando); si llueve y `f17` pasa al Galpón 7, serían 15 caminando: se informa que no alcanzaría.
- **CA3.** No cambia la sala mostrada ni presenta la lluvia como un hecho (D10).

---

### E7. Compartir itinerario

"Se puede compartir con un link: quien abre el link ve ese itinerario y puede copiarlo al suyo."

#### E7-H1. Compartir mi itinerario con un link — **Must**
Como persona que arma el plan del grupo, quiero mandar mi itinerario por chat, para que mis amigos vean a qué voy.

- **CA1.** Desde Mi itinerario (con al menos una función), hay una acción para compartir que entrega un link.
- **CA2.** El link contiene todo lo necesario para mostrar el itinerario: funciona abierto en otro navegador, en otro dispositivo o en modo incógnito, sin servidor ni cuenta (R6).
- **CA3.** En celulares que lo permiten, se ofrece el menú nativo de compartir del teléfono; en todos los casos se puede copiar el link, con confirmación visible de que se copió.
- **CA4.** El link funciona pegado y abierto desde WhatsApp (incluido su navegador interno) y desde otras apps de chat comunes.
- **CA5.** El link es corto razonablemente: con las 39 funciones elegidas no supera los 300 caracteres.
- **CA6.** Con el itinerario vacío, la acción de compartir no está disponible o explica que primero hay que elegir funciones.
- **CA7.** Al compartir en un chat, la vista previa del link muestra el nombre del festival y que es un itinerario.

#### E7-H2. Ver un itinerario compartido — **Must**
Como amiga que recibe el link, quiero ver el itinerario de la otra persona, para saber a qué va a ir.

- **CA1.** Al abrir el link se ve el itinerario compartido, con las mismas funciones, agrupación por día, datos y avisos (topes, no alcanza, conversatorios) que vería quien lo compartió.
- **CA2.** Se indica claramente que es **un itinerario compartido** y no el propio.
- **CA3.** Abrir el link **no** modifica el itinerario propio de quien lo abre (D5).
- **CA4.** El itinerario compartido refleja el momento en que se compartió (D6).
- **CA5.** Desde las funciones del itinerario compartido se puede ir a las fichas.
- **CA6.** La vista compartida funciona igual de bien a 360 px y cumple E0-H4 a E0-H6.

#### E7-H3. Copiar un itinerario compartido al mío — **Must**
Como amiga que quiere ir a lo mismo, quiero copiar el itinerario compartido al mío, para no marcar todo de nuevo.

- **CA1.** En la vista de itinerario compartido hay una acción para copiarlo al itinerario propio.
- **CA2.** Si el itinerario propio está vacío, se copia directamente.
- **CA3.** Si el itinerario propio tiene funciones, se ofrece: **agregar** (unir ambos, sin duplicar funciones) o **reemplazar** (el propio queda igual al compartido), y reemplazar pide confirmación antes de borrar el propio.
- **CA4.** Tras copiar, se confirma la acción y se puede ir al itinerario propio, que ya muestra las funciones copiadas y sus avisos recalculados, y queda guardado (E5-H3).
- **CA5.** Si el itinerario propio ya contiene todas las funciones del compartido, se indica que ya las tienes en lugar de ofrecer copiar.
- **CA6.** Verificación: propio = {`f05`}; compartido = {`f05`, `f09`}; al "agregar", el propio queda {`f05`, `f09`} (sin duplicar `f05`); al "reemplazar", queda {`f05`, `f09`}. Con propio = {`f01`} y compartido = {`f25`}: "agregar" deja {`f01`, `f25`} y aparece el aviso de película repetida (E6-H4 CA3); "reemplazar" deja {`f25`}.

#### E7-H4. Links compartidos dañados o viejos — **Must**
Como persona que recibe un link cortado o mal copiado, quiero entender qué pasó, para no quedar con una página rota.

- **CA1.** Si el link contiene algunas funciones que no existen en los datos, se muestran las válidas y se avisa que algunas no se pudieron cargar.
- **CA2.** Si el link no contiene ninguna función válida o está mal formado, se muestra un mensaje en español que lo explica, con enlaces al programa y a Mi itinerario. No se muestra una pantalla de error técnico.
- **CA3.** Funciones repetidas en el link se muestran una sola vez.
- **CA4.** En ningún caso un link dañado modifica el itinerario propio.

#### E7-H5. Ponerle nombre al itinerario compartido — **Could**
Como persona que comparte con varios grupos, quiero que el link diga de quién es el itinerario, para que se entienda al abrirlo.

- **CA1.** Al compartir se puede, opcionalmente, escribir un nombre corto (ej.: "El plan de Carla").
- **CA2.** Quien abre el link ve ese nombre en la vista compartida.
- **CA3.** El nombre no es obligatorio, no se guarda en ningún servidor y se muestra como texto plano (sin interpretar código ni formato).

---

### E8. Extras (solo si sobra tiempo)

#### E8-H1. Antes y después del festival — **Could**
Como visitante que entra semanas antes o después, quiero que el sitio tenga sentido en ese momento, para saber si todavía estoy a tiempo.

- **CA1.** Antes del jueves 15 de octubre de 2026 (hora de Chile), la portada indica cuántos días faltan.
- **CA2.** Después de que termina la última función (`f39`, domingo 18 a la 01:07, hora de Chile), la portada indica que la 3ª edición terminó, sin ocultar el programa.
- **CA3.** Verificable simulando la fecha del dispositivo.

---

## 8. Casos de prueba del itinerario con datos reales

Todos calculados con RN3 y RN13 a RN16. Para cada caso: se deja en el itinerario **solo** las funciones indicadas y se verifica el resultado.

### 8.1 Referencia de horarios (inicio – término, sala)

| Id | Día | Inicio | Término | Sala | Película | Marcas |
|---|---|---|---|---|---|---|
| f01 | jue 15 | 16:00 | 17:23 | Muelle | El canto de las redes | |
| f02 | jue 15 | 17:00 | 18:16 | Teatro | Caleta Sur | |
| f03 | jue 15 | 18:00 | 19:24 | Galpón 7 | El último astillero | Conversatorio 20 min (hasta 19:44) |
| f04 | jue 15 | 18:15 | 19:51 | Muelle | Doce noches claras | |
| f05 | jue 15 | 19:30 | 21:08 | Teatro | La hora azul del puerto | Nota: función inaugural |
| f06 | jue 15 | 20:00 | 22:01 | Galpón 7 | Vidrio | |
| f07 | jue 15 | 20:15 | 21:56 | Terraza | Transbordador de invierno | Aire libre |
| f08 | jue 15 | 21:00 | 22:27 | Muelle | Los que cuidan el faro | |
| f09 | jue 15 | 22:15 | 00:13 (vie) | Teatro | Mar negro | Cruza medianoche |
| f10 | jue 15 | 22:30 | 00:04 (vie) | Galpón 7 | La niebla tiene dientes | Cruza medianoche |
| f11 | vie 16 | 16:30 | 17:42 | Muelle | Cortos I: Oficios del mar | |
| f12 | vie 16 | 17:30 | 18:49 | Galpón 7 | Cordillera de papel | |
| f13 | vie 16 | 18:00 | 19:52 | Teatro | Sal de roca | Conversatorio 25 min (hasta 20:17) |
| f14 | vie 16 | 18:30 | 20:05 | Muelle | Madrugada en Paysandú | |
| f15 | vie 16 | 19:00 | 20:28 | Galpón 7 | Ostrava Blues | |
| f16 | vie 16 | 20:05 | 21:13 | Muelle | Cortos II: Noches de puerto | |
| f17 | vie 16 | 20:15 | 21:42 | Terraza | Los que cuidan el faro | Aire libre |
| f18 | vie 16 | 20:30 | 22:19 | Teatro | Línea de sal | |
| f19 | vie 16 | 21:30 | 22:59 | Galpón 7 | Casa de pescadores | |
| f20 | vie 16 | 22:00 | 23:32 | Muelle | Horas muertas | |
| f21 | vie 16 | 23:00 | 00:22 (sáb) | Terraza | Las cintas del faro | Aire libre, cruza medianoche |
| f22 | vie 16 | 23:30 | 01:15 (sáb) | Galpón 7 | Marea roja | Agotada, cruza medianoche |
| f23 | sáb 17 | 12:00 | 13:19 | Muelle | Cordillera de papel | |
| f24 | sáb 17 | 12:30 | 13:33 | Galpón 7 | Bruma, 1987 | |
| f25 | sáb 17 | 13:00 | 14:23 | Teatro | El canto de las redes | Conversatorio 30 min (hasta 14:53) |
| f26 | sáb 17 | 14:00 | 15:16 | Muelle | Caleta Sur | |
| f27 | sáb 17 | 14:30 | 16:14 | Galpón 7 | Temporada seca | |
| f28 | sáb 17 | 15:00 | 17:01 | Teatro | Vidrio | |
| f29 | sáb 17 | 16:00 | 17:36 | Muelle | Doce noches claras | |
| f30 | sáb 17 | 16:30 | 18:05 | Galpón 7 | Madrugada en Paysandú | |
| f31 | sáb 17 | 17:30 | 19:08 | Teatro | La hora azul del puerto | Agotada, conversatorio 30 min (hasta 19:38) |
| f32 | sáb 17 | 18:00 | 19:52 | Muelle | Sal de roca | |
| f33 | sáb 17 | 19:00 | 20:44 | Terraza | Temporada seca | Aire libre |
| f34 | sáb 17 | 19:30 | 21:09 | Galpón 7 | Ahogados | |
| f35 | sáb 17 | 20:00 | 21:49 | Muelle | Línea de sal | |
| f36 | sáb 17 | 21:00 | 22:41 | Teatro | Transbordador de invierno | Nota: entrega de premios antes |
| f37 | sáb 17 | 21:15 | 22:44 | Terraza | Casa de pescadores | Aire libre |
| f38 | sáb 17 | 22:00 | 23:34 | Galpón 7 | La niebla tiene dientes | |
| f39 | sáb 17 | 23:45 | 01:07 (dom) | Galpón 7 | Las cintas del faro | Cruza medianoche |

Traslados (minutos caminando, simétricos): Teatro–Muelle 12 · Teatro–Galpón 7 8 · Teatro–Terraza 20 · Muelle–Galpón 7 15 · Muelle–Terraza 9 · Galpón 7–Terraza 22 · misma sala 0.

### 8.2 Topes

| Caso | Itinerario | Resultado esperado | Por qué |
|---|---|---|---|
| T1 | f05 + f06 | **Tope** | f06 empieza 20:00, f05 termina 21:08 |
| T2 | f02 + f04 | **Tope** (por 1 minuto) | f02 termina 18:16, f04 empieza 18:15 |
| T3 | f09 + f10 | **Tope** | f09 termina 00:13 del viernes; f10 empieza 22:30 del jueves. Comparar solo las horas ("00:13" < "22:30") daría un falso "sin tope" |
| T4 | f21 + f22 | **Tope** | f21 termina 00:22 del sábado; f22 empieza 23:30 del viernes |
| T5 | f05 + f06 + f08 | **Tres topes**: f05–f06, f05–f08 y f06–f08 | f05–f08 no son seguidas por hora de inicio, pero igual se topan (termina 21:08, empieza 21:00) |
| T6 | f20 + f22 | **Tope** (por 2 minutos) | f20 termina 23:32, f22 empieza 23:30 |

### 8.3 No alcanza a llegar caminando

| Caso | Itinerario | Resultado esperado | Detalle |
|---|---|---|---|
| N1 | f03 + f05 | **No alcanza** (y no se muestra aviso de conversatorio aparte, RN16) | Termina 19:24 Galpón 7 → 19:30 Teatro: 6 min, se necesitan 8 |
| N2 | f07 + f09 | **No alcanza** (por 1 minuto) | Termina 21:56 Terraza → 22:15 Teatro: 19 min, se necesitan 20 |
| N3 | f19 + f21 | **No alcanza** | Termina 22:59 Galpón 7 → 23:00 Terraza: 1 min, se necesitan 22 |
| N4 | f25 + f27 | **No alcanza** (por 1 minuto; tiene conversatorio, pero se muestra solo este aviso) | Termina 14:23 Teatro → 14:30 Galpón 7: 7 min, se necesitan 8 |
| N5 | f35 + f38 | **No alcanza** | Termina 21:49 Muelle → 22:00 Galpón 7: 11 min, se necesitan 15 |

### 8.4 Conversatorio

| Caso | Itinerario | Resultado esperado | Detalle |
|---|---|---|---|
| C1 | f13 + f16 | **Te perderías el conversatorio** (no es tope ni problema de traslado) | Sal de roca termina 19:52 (conversatorio 25 min, hasta 20:17). Para llegar a las 20:05 al Muelle (12 min) hay que salir a más tardar 19:53 |
| C2 | f13 + f17 | **Te perderías el conversatorio** | Hay que salir a más tardar 19:55 para llegar a la Terraza a las 20:15 (20 min) |
| C3 | f31 + f34 | **Te perderías el conversatorio** (y f31 muestra además que está agotada) | La hora azul termina 19:08 (conversatorio hasta 19:38). Para llegar a las 19:30 al Galpón 7 (8 min) hay que salir a más tardar 19:22 |

En C1, C2 y C3 el contador de problemas del itinerario debe ser **0**.

### 8.5 Casos sin aviso (deben quedar limpios)

| Caso | Itinerario | Resultado esperado | Detalle |
|---|---|---|---|
| OK1 | f14 + f16 | **Sin aviso** | Misma sala (Muelle): f14 termina 20:05 y f16 empieza 20:05. Termina justo cuando empieza: no es tope |
| OK2 | f14 + f17 | **Sin aviso** | Termina 20:05 Muelle → 20:15 Terraza: 10 min, se necesitan 9 |
| OK3 | f16 + f19 | **Sin aviso** | Termina 21:13 Muelle → 21:30 Galpón 7: 17 min, se necesitan 15 |
| OK4 | f38 + f39 | **Sin aviso** | Misma sala (Galpón 7): termina 23:34, empieza 23:45 |
| OK5 | f03 + f06 | **Sin aviso** | Conversatorio de f03 termina 19:44, misma sala, f06 empieza 20:00 |
| OK6 | f25 + f28 | **Sin aviso** | Conversatorio de f25 termina 14:53, misma sala, f28 empieza 15:00 |
| OK7 | f10 + f11 | **Sin aviso** | f10 termina 00:04 del viernes; f11 es el viernes 16:30 |
| OK8 | f22 + f23 | **Sin aviso de tope ni traslado** (sí aviso de agotada en f22) | f22 termina 01:15 del sábado; f23 es el sábado 12:00 |

### 8.6 Itinerario combinado (sábado largo)

Itinerario: f23, f25, f28, f31, f34, f38, f39.

Resultado esperado:
- f23 (Muelle, 12:00–13:19) → f25 (Teatro, 13:00): **tope**.
- f25 → f28: sin aviso (conversatorio hasta 14:53, misma sala, f28 a las 15:00).
- f28 (Teatro, termina 17:01) → f31 (Teatro, 17:30): sin aviso.
- f31 → f34: **te perderías el conversatorio** (salir a más tardar 19:22).
- f34 (Galpón 7, termina 21:09) → f38 (Galpón 7, 22:00): sin aviso.
- f38 → f39: sin aviso.
- f31 marcada como **agotada**. f39 muestra término 01:07 del domingo y aparece en el sábado.
- Contador de problemas: **1** (el tope f23–f25).
- Costo estimado (si se implementa E5-H6): 7 × $4.000 = $28.000.

---

## 9. Definición de terminado

Una historia está terminada cuando:

1. Cumple **todos** sus criterios de aceptación.
2. No rompe ninguna restricción de la sección 3 ni criterio de E0 (idioma, sin emojis, sin puntajes, datos fieles, 360 px a escritorio, movimiento reducido, accesibilidad).
3. `npm run build` pasa sin errores ni advertencias de tipos.
4. Se probó en un celular real o emulado a 360 px y en escritorio, en al menos un navegador basado en Chromium y en Safari (iOS) o Firefox.
5. Si toca el itinerario, los casos de la sección 8 relacionados dan el resultado esperado.
6. `data/programa.json` sigue sin cambios.

---

## 10. Fuera de alcance

Para no gastar esfuerzo en esto (salvo que el brief cambie):

- Venta, reserva o pago de entradas; integración con boleterías.
- Cuentas, registro, inicio de sesión, sincronización entre dispositivos (fuera del link compartido).
- Backend, base de datos, APIs, analítica o servicios de terceros.
- Puntajes, votación del público, reseñas, comentarios, rankings.
- Tráileres, fotos, afiches reales o cualquier contenido que no esté en los datos.
- Mapas con ubicación real de las salas (no hay coordenadas en los datos; ver D9).
- Notificaciones o recordatorios push.
- Exportar a calendario.
- Versiones en otros idiomas.
- Panel para que la organización edite el programa.
- Recalcular el programa por lluvia (D10).

---

## 11. Observaciones sobre los datos para el equipo organizador

No bloquean el desarrollo. El sitio muestra los datos tal cual. Quedan anotadas por si la organización quiere revisarlas.

1. **Plan de lluvia de la Terraza Faro.** La nota dice que, si llueve, la función se hace en el Galpón 7 a la misma hora. Pero las 5 funciones de la Terraza se superponen con funciones que ya están programadas en el Galpón 7: `f07` con `f06`; `f17` con `f15` y `f19`; `f21` con `f22`; `f33` con `f34`; `f37` con `f38`. Además, el Galpón 7 tiene capacidad para 90 personas y la Terraza para 200.
2. **Funciones agotadas y venta en boletería.** Los datos dicen que la venta es solo en boletería desde una hora antes de cada función, pero `f22` y `f31` ya figuran agotadas. Puede ser correcto (por ejemplo, entradas reservadas para invitados), pero conviene confirmar el mensaje que verá el público.
3. **Última función.** `f39` termina el domingo 18 a la 01:07, aunque la fecha de término del festival es el sábado 17. El sitio la muestra como función del sábado.

---

## 12. Orden sugerido de entrega

1. **E0** (base) + **E1-H1** (identidad mínima): todo lo demás se construye encima.
2. **E3-H1 a E3-H5, E3-H8** (programa completo con filtros y marcar funciones).
3. **E4-H1 a E4-H3** (ficha).
4. **E5-H1 a E5-H4** (itinerario y guardado).
5. **E6-H1 a E6-H3** (avisos): validar contra la sección 8 completa.
6. **E7-H1 a E7-H4** (compartir y copiar).
7. **E2-H1 a E2-H4, E2-H7** (portada): se puede avanzar en paralelo desde el paso 2, pero su pulido final va al final para aprovechar la identidad ya consolidada.
8. **E1-H2** (representación de películas) se integra apenas exista el programa y se pule en paralelo.
9. Todos los **Should** (E0-H7, E0-H8, E1-H3, E2-H5, E2-H6, E3-H6, E3-H7, E5-H4 deshacer/vaciar, E6-H4, E6-H5).
10. Los **Could**, si sobra tiempo.
