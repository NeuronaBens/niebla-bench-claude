# Revisión de la implementación: Festival de Cine Niebla

> Revisión contra `BRIEF.md`, `docs/BACKLOG.md` y `docs/DETALLE.md`. Habrá **una sola ronda de correcciones**: arreglar primero el bloqueante, después los importantes en el orden en que aparecen. Los menores solo si queda tiempo.
>
> Referencias `archivo:línea` sobre el estado revisado del árbol de trabajo (sin commit).

---

## 0. Resumen

**Veredicto:** la base es sólida y está cerca de publicable. Las reglas del itinerario, los datos, las horas, los filtros y el link compartido funcionan bien y están bien testeados. Los problemas están casi todos en la **capa visual móvil** y en la **portada**, más un fallo de contraste que deja ilegible parte de la vista compartida.

**Lo que se verificó y está bien (no tocar):**
- `npm test`: **113 tests, 0 fallos**. Cubren todos los casos de la sección 8 del backlog (T1–T6, N1–N5, C1–C3, OK1–OK8, 8.6) y los de DETALLE 14.1 (P1–P6, S1, S2, lluvia, contenido).
- `npm run lint` sin errores. `npm run build` sin errores. Rutas estáticas (`○`) y 24 fichas prerenderizadas (`●`), ninguna dinámica.
- `data/programa.json` sin cambios (`git diff --exit-code` limpio). Sin dependencias nuevas. Restos de la plantilla eliminados; `<html lang="es">`; favicon propio.
- Horas: todo el cálculo usa minutos UTC "de pared" (`lib/tiempo.ts`), sin `Date` local ni `toLocale*`. Los cruces de medianoche se muestran bien ("→ 01:15 del sábado").
- Programa en el navegador: 39 tarjetas; `?dia=viernes&seccion=nocturna` → f19, f21, f22; agregar f19 marca "No alcanzas a llegar desde Casa de pescadores" en f21 antes de agregarla; el anuncio para lectores de pantalla funciona.
- Itinerario (probado con 12 funciones): 4 problemas bien contados, tramos con minutos correctos, costo $40.000, avisos de película repetida, enlaces del resumen.
- Link compartido: `?f=05-09-13-99-xx-05&n=<b>Carla</b>` → 3 funciones, "2 no se pudieron cargar", el nombre se muestra como texto literal, el itinerario propio no cambia al abrir. Copiar a un itinerario vacío y el diálogo de reemplazo funcionan.
- 404 real en `/pelicula/no-existe` y en rutas inexistentes.
- Ficha: datos completos, título original, clasificación y estreno en lenguaje claro, funciones con precio.
- Sin desborde horizontal a 360 y 375 px en las rutas probadas.

**Cantidad de hallazgos:** 1 bloqueante, 7 importantes, 12 menores.

---

## 1. Bloqueante

### B1. Vista de itinerario compartido: texto y botones invisibles (contraste ~1,2:1)

- **Dónde:**
  - `components/itinerario/ItinerarioCompartido.tsx:42` envuelve la cabecera, **incluido `<CopiarItinerario>`**, en `data-zona="noche"`.
  - `components/itinerario/CopiarItinerario.module.css:1-7`: `.envoltura` tiene fondo `--papel-2` (claro).
  - `components/ui/Boton.module.css:36-39`: `[data-zona='noche'] .secundario` pone texto y borde `--blanco-niebla`.
- **Qué pasa (reproducido a 375 px):**
  - Dentro de la caja clara de "Copiar", el texto hereda el color claro de la zona noche. Medido: texto `rgb(246,244,238)` sobre fondo `rgb(226,221,209)`, unos 1,2:1. Así quedan casi invisibles:
    - la frase "2 funciones no están en tu itinerario.";
    - el botón **"Reemplazar mi itinerario"**;
    - tras copiar, "Ya tienes todas estas funciones en tu itinerario." y el botón "Ver mi itinerario".
  - El `<dialog>` de reemplazo también está dentro de la zona noche: su botón **"Cancelar"** (que recibe el foco inicial) es blanco sobre blanco.
  - Afecta el flujo principal de E7-H3 (Must) y E0-H6 CA2 (contraste AA).
- **Qué se espera:** todo el texto y los botones de `CopiarItinerario`, y su diálogo, cumplen 4,5:1. Cualquiera de estas opciones sirve:
  - sacar `CopiarItinerario` de la zona `data-zona="noche"`;
  - dar a `.envoltura` y a `.dialogo` `color: var(--tinta)` y anular la regla de noche para `.secundario` dentro de ellos (por ejemplo, poniendo `data-zona` solo en el título y el texto de la cabecera);
  - o darle a la caja fondo `--noche-2` con texto claro.

  Verificar la instancia de arriba y la de abajo, los tres estados (propio vacío, propio con funciones, ya las tienes todas) y el diálogo.
- **Relacionado, arreglar en la misma pasada:** al copiar, el `Toast` "Copiado. Ya está en tu itinerario." con "Ver" **nunca se ve**. Tras copiar, `todasIncluidas` pasa a `true` y el componente sale por el `return` temprano de `CopiarItinerario.tsx:194-203`, antes de renderizar el toast. El toast (o el estado `copiado`) tiene que sobrevivir a ese cambio de rama. Además, `CopiarItinerario` está montado dos veces (`ItinerarioCompartido.tsx:51` y `:58`), así que conviene que el toast viva en `ItinerarioCompartido` y no se duplique.

---

## 2. Importantes

### I1. Portada: el haz del faro no sale del faro y no ilumina "NIEBLA"

La portada es donde el brief pide que "nos sorprenda". Hoy el efecto principal no funciona.

- **Dónde:** `components/portada/EscenaFaro.module.css` y `components/portada/EscenaFaro.tsx`.
- **Qué pasa (medido en el navegador a 1440×900 y a 360×640):**
  1. **El haz está fuera de pantalla.** `.haz` (`EscenaFaro.module.css:32-49`) usa `top: 8%; right: 11%` más `transform: translate(-50%, -50%)` sobre un bloque de 120vmax. El centro del degradado cónico quedó en **x = −460 px, y = 119 px**, mientras la linterna del faro está en x ≈ 1240, y ≈ 356. El barrido no nace del faro y casi no se ve.
  2. **"NIEBLA" nunca se ilumina con el barrido.** La animación `barrer` corre sobre `.haz`, pero `.tituloIluminado` (líneas 112-119) lee `--angulo` de su propio ancestro, no de `.haz` (son hermanos). Medido: en `.haz` cambia (277° → 244°) y en `.tituloIluminado` queda fijo en 200°. El título muestra siempre el mismo pedazo iluminado (solo la "A").
  3. **La escena no ocupa la pantalla.** `.escena` define `min-height: min(100svh, 900px)`, pero el bloque `@media (min-height: 700px) { .escena { min-height: 640px } }` (líneas 11-15) lo **reemplaza** justo en pantallas altas. A 1440×900 mide 640 px y se asoma el bloque siguiente.
  4. **En móvil el faro queda tapado.** A 360×640 el faro (38 % de alto, abajo a la derecha) queda detrás del botón "Ver el programa" y de la niebla: solo se ve la punta.
- **Qué se espera (DETALLE 8.3 A2/A3 y 10.1):**
  - El origen del cónico coincide con la linterna, calculado con la misma referencia de posición que el SVG del faro (por ejemplo, poniendo el haz y el faro en un contenedor común posicionado en la esquina).
  - `--angulo` se anima en un **ancestro común** de `.haz` y `.tituloIluminado` (la propia `.escena`), para que ambos lean el mismo valor; el punto `at X Y` de la máscara corresponde a la posición de la linterna relativa al título.
  - La escena mide al menos la altura de la pantalla hasta 900 px (quitar o invertir la regla de `min-height: 640px`).
  - En móvil, el faro y su luz se ven arriba o al costado del bloque de texto, sin quedar bajo el botón.
  - Con `prefers-reduced-motion: reduce` sigue quieto y con parte del título iluminado.
- **Cómo verificar:** en consola, `getComputedStyle` de `.haz` y de `.tituloIluminado` deben dar el mismo `--angulo` a lo largo del tiempo, y la iluminación debe verse moverse sobre las letras.

### I2. Programa en móvil: el encabezado de día queda escondido bajo la cabecera

- **Dónde:** `components/programa/ListaProgramaDias.module.css` (`.encabezado { position: sticky; top: 0; z-index: 10 }`) y `components/layout/Cabecera.module.css` (`.cabecera { position: sticky; top: 0; z-index: 40 }`, alto ~55 px).
- **Qué pasa:** bajo 1024 px ambos se pegan en `top: 0` y la cabecera (z-index 40) tapa el encabezado del día. Medido a 375 px mientras se recorren las funciones del viernes: el `h2` "16 viernes" está en 0–48 px y la cabecera en 0–55 px. Al bajar, la persona pierde de vista en qué día está, que es justo lo que el encabezado pegajoso debía resolver (DETALLE E3-H1).
- **Qué se espera:** en móvil, `top` del encabezado de día = alto de la cabecera (definirlo como variable, por ejemplo `--alto-cabecera`, y usarla también en el `top: 73px` de escritorio, hoy fijo a mano). Verificar a 360 y 375 px que "16 viernes" queda visible bajo la cabecera al recorrer el viernes.

### I3. Programa en móvil: los filtros de sección llenan la primera pantalla

- **Dónde:** `components/programa/FiltrosPrograma.tsx:247` (se muestra `{seccion.nombre}` completo) y su CSS.
- **Qué pasa:** a 360×640 cada botón de sección ocupa una línea entera ("Competencia Latinoamericana", "Panorama Internacional"…). Entre título, intro y 6 filas de filtros, **no se ve ninguna función en la primera pantalla**. Esto va contra el caso de uso principal ("llega corriendo después de la pega… decidir rápido") y contra E3-H1/E3-H2, que piden que el programa se use bien en celular.
- **Qué se espera (DETALLE E3-H2):**
  - Texto visible con `nombreCortoSeccion()` ("Competencia", "Panorama", "Nocturna", "Costa") y el nombre completo en `aria-label` (ya está).
  - Los 5 botones envuelven en 2 filas como máximo a 360 px.
  - Acortar o quitar la intro en móvil.
  - Meta: a 360×640, bajo los filtros asoma al menos el encabezado del primer día y parte de la primera tarjeta.
  - En escritorio (barra lateral de 280 px), los botones de día hoy cortan "Jue 15" en dos líneas: revisar el ancho o el tamaño de letra.

### I4. Falta la nota de lluvia de la Terraza Faro en programa, ficha e itinerario

- **Dónde:** `components/funcion/MarcasFuncion.tsx:32-36` muestra solo "Al aire libre · Gratis"; nadie usa `funcion.sala.nota` fuera de `components/portada/Salas.tsx:24`.
- **Qué pasa:** en la ficha de *Las cintas del faro* (`f21`), en el programa y en el itinerario, las funciones de la Terraza Faro no dicen que si llueve se trasladan al Galpón 7. Es un dato de cambio de sala que la persona necesita justo cuando arma su recorrido.
- **Qué se espera:** backlog RN9 ("se muestra siempre que aparezca una función de la Terraza Faro en programa, ficha e itinerario"), E4-H2 CA3 y E6-H4 CA2.
  - En ficha e itinerario: la nota completa del JSON, con ícono `lluvia`.
  - En la tarjeta del programa, por espacio, basta una línea corta ("Si llueve: Galpón 7"), con la nota completa en la ficha.
- **Opcional en la misma pasada (E6-H6, Could):** `evaluarItinerario(..., { lluvia: true })` ya existe y está testeado, y los textos `lluviaNoAlcanzarias`/`lluviaIgualAlcanzas` están en `lib/textos.ts:109-110`, pero no se usan en la interfaz. Conectarlo en `Tramo`/`ItemItinerario` es poco trabajo.

### I5. El aviso de conversatorio nunca dice "te perderías el conversatorio"

- **Dónde:** `lib/textos.ts:105-106` (`conversatorioConMargen`) y `components/itinerario/Tramo.tsx:219-221`.
- **Qué pasa:** cuando `minutosDeConversatorio > 0` se usa el texto "Para llegar a tiempo tienes que salir a las 19:53: alcanzas a quedarte 1 min.". Con los datos reales **todos** los casos tienen minutos > 0 (C1: 1 min, C2: 3 min, C3: 14 min), así que la frase "te perderías el conversatorio" no aparece nunca. "Alcanzas a quedarte 1 min" de un conversatorio de 25 se lee casi como algo positivo.
- **Qué se espera:** E6-H3 CA1 y CA2 (aviso explícito de que se lo perdería, con duración y hora máxima de salida). Por ejemplo: "Después de Sal de roca hay conversatorio de 25 min. Para llegar a tiempo tienes que salir a las 19:53, así que te perderías casi todo (alcanzas a quedarte 1 min)." Mantener la distinción visual de aviso informativo, que ya está bien.

### I6. Todos los carteles tienen niebla animada en bucle (117 animaciones infinitas en /programa)

- **Dónde:** `components/cartel/cartel.module.css:33-40` aplica `.banda { animation: deriva … infinite }` a **todas** las variantes, y `components/cartel/Cartel.tsx:93-105` pone la clase en cada banda.
- **Qué pasa:**
  - En `/programa` hay 117 animaciones infinitas (`document.getAnimations()`), 120 SVG y ~2.250 nodos; en la portada, además, los mini de secciones y los destacados.
  - El navegador de revisión llegó a cortar capturas con "the page did not finish rendering in time" en la portada y el programa.
  - Contradice DETALLE 8.3 A6 y 9.5 (solo la variante `grande` se anima) y E0-H5 CA3 (nada en bucle sobre contenido que hay que leer: las tarjetas se mueven mientras se lee el programa).
  - Arriesga E0-H7 (rendimiento en celulares de gama baja).
- **Qué se espera:** la clase animada solo en `variante === 'grande'` (ficha). Verificar que `document.getAnimations().length` en `/programa` baja a lo que aporten los botones (0 en reposo).
- **Relacionado (menor):** el motivo se dibuja **debajo** de las bandas de niebla (`Cartel.tsx:90` antes de `:92`). En `tarjeta` y `mini`, varias figuras casi no se ven (la red de *El canto de las redes*, el VHS de *Las cintas del faro*). Considerar bajar la opacidad de las bandas en variantes chicas o dibujar parte del motivo por encima, para que E1-H2 CA3 (24 carteles distinguibles) se cumpla también en tamaño chico.

### I7. Mi itinerario en móvil: el formulario de compartir ocupa la primera pantalla

- **Dónde:** `components/itinerario/MiItinerario.tsx:367-378` y `components/itinerario/CompartirItinerario.tsx:76-97`.
- **Qué pasa:** a 375×812, la primera pantalla de Mi itinerario muestra el título, el campo "Tu nombre (opcional)", "Compartir mi itinerario", "Copiar link", "Vaciar itinerario", la nota de guardado y el resumen de problemas. **Ninguna función queda visible sin desplazarse.** Es la pantalla que se consulta caminando entre salas (E5-H1 CA6: "lo más importante —hora, sala, avisos— se lee sin abrir nada").
- **Qué se espera:**
  - Arriba, solo el título y el resumen (problemas y conteo); enseguida, el recorrido.
  - "Compartir" como un botón compacto en la cabecera. El campo de nombre (Could, E7-H5) solo aparece al tocar compartir, o va al final.
  - "Vaciar" y la nota de guardado, al final de la página.
  - Meta: a 375×812 se ve al menos el encabezado del primer día y la primera función.

---

## 3. Menores

| # | Dónde | Qué pasa | Qué se espera |
|---|---|---|---|
| M1 | `components/layout/NavInferior.tsx:52-56` y `ContadorItinerario.module.css` | El contador es un hijo más de la columna ícono + texto: en "Mi itinerario" empuja el ícono hacia arriba, desalinea el ítem respecto de los otros dos y la barra mide ~69 px en vez de 64. | Contador posicionado en absoluto sobre la esquina del ícono, sin alterar el alto del ítem. |
| M2 | `components/itinerario/ItemItinerario.tsx:47-61` y su CSS | El botón "Quitar" va en una fila aparte de la grilla (deja un hueco grande); la hora queda pegada al título ("18:00Sal de roca") y el ícono de tope de los avisos previos se ve diminuto y desalineado. | Grilla de DETALLE E5-H1 (`4.25rem 1fr 3.5rem`): cartel y botón en la misma columna, separación entre hora y título, ícono de 16 px alineado con la primera línea del texto. |
| M3 | `ItemItinerario.tsx:23` + `Tramo.tsx` | Un tope entre funciones consecutivas se muestra dos veces (en la tarjeta como "Se topa con…" y en el tramo). En cambio, el conversatorio entre funciones **no** consecutivas (caso P1: `f13→f17`, salida 19:55) no se muestra en ninguna parte, aunque `evaluarItinerario` lo calcula. | DETALLE 5.5 paso 5 y E6-H1: los avisos de pares consecutivos van en el tramo; los de pares no consecutivos (tope, noAlcanza **y** conversatorio) van en la tarjeta de la función de origen. |
| M4 | `lib/itinerario-store.ts:98-108` | Cada `suscribir` agrega el mismo listener de `storage` (el navegador lo deduplica), pero cada desuscripción lo **quita**. Al desmontarse cualquier botón (por ejemplo, al salir del programa) se pierde la sincronía entre pestañas, aunque el contador del layout siga suscrito. | Agregar el listener con el primer suscriptor y quitarlo cuando `listeners.size === 0` (E5-H5, Could). |
| M5 | `lib/itinerario-store.ts:73-79` | Si `setItem` falla después de la prueba inicial (cuota llena), `persistente` sigue en `true` y no se avisa. | Pasar `persistente` a `false` en el `catch` de `guardar` y notificar a los suscriptores. |
| M6 | `components/portada/Destacados.tsx:10-15` | La tarjeta de `f31` (conversatorio) no indica que está **agotada** (DETALLE E2-H5: "f31 aparece como conversatorio y marcada agotada"). | Agregar "Agotada" al detalle o una `Etiqueta` en las tarjetas agotadas. |
| M7 | `components/portada/TresDias.tsx:31-32` | Las notas se muestran sin la película: "19:30 Función inaugural con la presencia del equipo de la película." y "21:00 Antes de la función se entregan los premios del festival." no dicen qué película. | "19:30 · La hora azul del puerto: función inaugural con la presencia del equipo de la película." (enlazada a la ficha). |
| M8 | `components/portada/Entradas.tsx:18` | "No hay venta en línea." aparece dos veces: ya viene dentro del texto `venta` del JSON. | Quitar la línea fija. |
| M9 | `components/programa/ListaProgramaDias.tsx:33` | El encabezado de día dice "16 viernes **Mostrando** 12 funciones". | Usar `plural(n, 'función', 'funciones')` sin "Mostrando" (queda "12 funciones"). |
| M10 | `components/funcion/BotonItinerario.tsx:63-65` | El botón combina `aria-pressed` con un `aria-label` que también cambia ("Agregar…" / "Quitar…"). Los lectores de pantalla leen "Quitar de mi itinerario… presionado", que es contradictorio. | O `aria-pressed` con un nombre fijo ("Voy a Marea roja, viernes 16 a las 23:30"), o nombre cambiante sin `aria-pressed`. Preferir la primera opción. |
| M11 | `components/portada/EscenaFaro.tsx:52-54` | A 1440 px el enlace "Mi itinerario" de la escena se corta en dos líneas ("Mi / itinerario") junto al botón. | `white-space: nowrap` o más ancho en `.acciones` (hoy `max-width: 360px`). |
| M12 | Raíz del repo | Quedó sin commitear `.claude/launch.json`, que no es parte del sitio. | Decidir si se commitea o se agrega a `.gitignore`. |

---

## 4. No implementado, pero opcional (Could): no pedir en esta ronda

Para dejar registro; ninguno bloquea:
- E3-H9 y E5-H7 ("lo que viene" y "próxima función" durante el festival): `ahoraEnChile()` existe y tiene tests, pero no se usa.
- E8-H1 (cuenta regresiva): no existe `CuentaRegresiva`.
- DETALLE 8.3 A4 (el haz sigue al puntero): no implementado. Arreglar antes I1.
- E6-H6 (plan de lluvia en el itinerario): la lógica está hecha, falta la interfaz (ver I4).

## 5. Observaciones de rendimiento (sin acción obligatoria)

- El HTML de `/programa` pesa 497 KB (70 KB comprimido) y la portada 258 KB (41 KB comprimido). Parte se debe a que las 39 funciones enriquecidas se serializan dos veces: en el `fallback` del `Suspense` y como props de `ProgramaCliente`, que además importa `programa` directamente. Tras corregir I6, correr Lighthouse móvil (E0-H7: Performance ≥ 90) y, si no llega, pasar a `ProgramaCliente` solo ids (reconstruyendo desde `programa`) en vez de los objetos completos.
- No se pudo correr Lighthouse en esta revisión. Queda como verificación pendiente de la ronda de correcciones.

## 6. Lista para cerrar la ronda de correcciones

- [ ] B1: vista compartida legible (texto, botones, diálogo) y toast de copiado visible.
- [ ] I1: el haz nace del faro, ilumina "NIEBLA" al pasar, la escena ocupa la pantalla y el faro se ve en móvil.
- [ ] I2: encabezado de día visible bajo la cabecera en móvil.
- [ ] I3: a 360×640 asoma la primera tarjeta bajo los filtros.
- [ ] I4: nota de lluvia en programa, ficha e itinerario.
- [ ] I5: el aviso dice "te perderías" el conversatorio.
- [ ] I6: solo el cartel `grande` se anima.
- [ ] I7: en Mi itinerario, a 375×812 se ve la primera función.
- [ ] Volver a correr `npm test`, `npm run lint` y `npm run build`, y confirmar `git diff --exit-code -- data/programa.json`.
