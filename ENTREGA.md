# Entrega · Sitio del Festival de Cine Niebla, 3ª edición

## Qué se construyó

Un sitio en Next.js 16.3 (App Router) con TypeScript y CSS Modules. Todas las páginas se generan estáticas (31 en total) y funciona entero en el navegador: no hay backend, cuentas ni servicios externos. Todo lo factual sale de `data/programa.json`, que no se modificó.

**Identidad.** Noche de puerto con niebla. El fondo es tinta de mar nocturno, el texto color niebla, y los acentos son la luz de sodio de los faroles del puerto y el amarillo del faro. Cada sección tiene su color. Tipografías con `next/font`: Big Shoulders (display condensada, industrial), Instrument Sans (texto) e IBM Plex Mono (horas, estilo tablero de horarios o boleto). Tema oscuro único. Sin emojis, sin fotos ni imágenes externas, sin puntajes.

| Ruta | Qué hay |
|---|---|
| `/` **Portada** | Hero con una escena de puerto hecha en SVG (cerros con casas, grúas, contenedores, faroles, faro cuyo haz barre la bahía) y niebla animada en canvas. El título NIEBLA emerge de la bruma. Tablero tipo split-flap con cuenta regresiva a la función inaugural (durante el festival muestra lo que viene). Marquesina con los 24 títulos. Cifras calculadas desde los datos. Las 4 secciones con sus afiches. "Tres días" con el carácter de cada jornada y su mini-grilla. Funciones especiales (inaugural, premiación, conversatorios, aire libre, trasnoche). Salas con tabla de minutos caminando. Llamado al itinerario. |
| `/programa` | Las 39 funciones con filtros por día (o los tres) y por sección (selección múltiple), sincronizados con la URL. En celular es una lista tipo boleto con barra de filtros sticky y botones de 44 px. Desde 1024 px se agrega una grilla horaria por sala. Marca agotadas, aire libre, conversatorio, notas y funciones que terminan pasada la medianoche ("hasta 01:15 (sáb)"). Avisa si una función se topa con algo que ya elegiste. |
| `/pelicula/[id]` | Ficha de cada una de las 24 películas: afiche generativo grande, datos, sinopsis, todas sus funciones como boletos (precio, sala y dirección, agotada, conversatorio, nota de lluvia en Terraza Faro) con botón para el itinerario, info de entradas y otras películas de la sección. |
| `/itinerario` | Línea de tiempo por día. Entre funciones consecutivas se muestra el tramo: minutos caminando y cuánto sobra, "llegas justo", "no alcanzas: faltan N min", "se topan" o "te pierdes el conversatorio". Arriba, un resumen de problemas con salto a cada uno. Se puede quitar una función con "Deshacer", vaciar con confirmación en línea, compartir, y tiene un estado vacío con salida al programa. |
| `/itinerario/compartido?f=f03.f13&n=Camila` | Muestra ese itinerario en solo lectura y permite copiarlo al propio, sumándolo o reemplazándolo. Avisa cuántas funciones son nuevas y si generan choques. Tolera links malformados. |
| 404 | "Se nos perdió en la niebla". |

**Afiches sin imágenes.** Cada película tiene un afiche SVG generativo y determinista: la semilla sale del `id` y se ve igual en servidor y cliente. Cada sección tiene su lenguaje visual (Competencia: luces de sodio y cerros; Panorama: azul hielo y latitudes; Bruma Nocturna: rojo sobre negro con grano; Hecho en la Costa: verde agua, curvas de nivel y Súper 8). Además, cada película tiene un motivo dibujado a mano a partir de su sinopsis (grúa, salinas, faro, VHS, transbordador, etc.). Hay tres tamaños: mini, tarjeta y grande. El título se compone midiendo el ancho real de la fuente para que nunca se corte.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start
npm run lint
npm run verificar  # 16 casos de lógica contra los datos reales
```

Verificado al cierre:
- `npx tsc --noEmit`, `npm run lint` y `npm run build` sin errores.
- `npm run verificar`: 16 casos OK.
- Todas las rutas responden 200 y una película inexistente da 404.
- Revisión visual a 360 px y a escritorio. Revisión automática de que ninguna página (incluidas las 24 fichas) se desborde a lo ancho a 360 px.

## Decisiones importantes

- **Horas sin `Date`.** Las horas del JSON se convierten a "minutos absolutos desde las 00:00 del primer día" (`lib/programa.ts`). Así el cruce de medianoche es aritmética simple y no hay diferencias de zona horaria entre servidor, navegador y visitantes de fuera de Chile. La hora actual de Chile solo se usa en el cliente, después de hidratar, con `Intl` y `America/Santiago`.
- **Una función pertenece al día en que empieza.** Marea roja (viernes 23:30) sale el viernes y se indica "termina 01:15 del sábado".
- **Reglas del itinerario** (`lib/itinerario.ts`), revisadas entre todos los pares de funciones:
  - *Se topan:* la siguiente empieza antes de que termine la película.
  - *No alcanza:* empieza antes de fin + minutos caminando. Terminar a la misma hora en que empieza la siguiente en la misma sala es válido ("llegas justo").
  - *Pierde el conversatorio:* empieza antes de fin + conversatorio + traslado. No cuenta como choque y se informa cuántos minutos se perderían.
  - Se marca "justo" con menos de 5 min de margen.
- **Agotadas.** Se pueden agregar al itinerario, pero quedan marcadas y cuentan como aviso. En el programa se ven atenuadas y legibles. La venta es solo en boletería, así que no hay botón de compra.
- **Aire libre.** Se muestra "Entrada liberada" (precio 0 en los datos) y la nota de lluvia de la sala. Los traslados se calculan con la sala programada (Terraza Faro), no con el Galpón 7 de la alternativa por lluvia.
- **Persistencia.** `localStorage` (`niebla:itinerario:v1`) con `useSyncExternalStore`: sin errores de hidratación y sincronizado entre pestañas. Si el almacenamiento no está disponible, funciona en memoria.
- **Compartir.** Query `?f=<ids separados por punto>&n=<nombre opcional>`, ordenado por hora. La ruta es estática y lee los parámetros en el cliente dentro de `<Suspense>`; por eso el título con el nombre se pone con `document.title`. Se usa `navigator.share` si existe y, si no, se copia al portapapeles.
- **Filtros del programa en la URL.** `?dia=jueves|viernes|sabado|todos&seccion=a,b&vista=grilla`. Por defecto se ven los tres días. Durante el festival se preselecciona "hoy", y el día se corta a las 06:00 para que la trasnoche siga contando como el día anterior.
- **Movimiento.** Sin librería de animación: CSS, SVG y un canvas liviano para la niebla, que se pausa fuera de pantalla o con la pestaña oculta. Con `prefers-reduced-motion` se anulan animaciones, transiciones y delays en todo el sitio, el canvas dibuja un cuadro fijo y el scroll suave se desactiva.
- **Organización del trabajo.** Primero armé la base compartida: datos, lógica, tokens y stubs con API fija. Después trabajaron en paralelo 4 subagentes con archivos propios (portada e identidad, afiches y ficha, programa, itinerario). Al final un subagente auditó todo contra el brief, y yo hice la integración y la revisión visual.

### Correcciones de la integración final
- `/itinerario/compartido` se había vuelto dinámica (leía `searchParams` en `generateMetadata`). Se dejó estática.
- Las fichas se desbordaban a lo ancho en celular (hasta 952 px) porque los `span.sr-only` del carrusel escapaban del `overflow`. Se corrigió en `.sr-only` para todo el sitio.
- El respaldo en memoria del itinerario no persistía si `localStorage` fallaba.
- La auditoría reemplazó textos escritos a mano por datos derivados (metadata del sitio y nombre del festival), corrigió el rótulo del afiche de "Bruma, 1987" y anuló los delays de animación con movimiento reducido.
- Se subió levemente el contraste del texto terciario.

## Qué quedó pendiente o conviene saber

- **Aviso del build:** `Failed to find font override values for font Big Shoulders`. Next no tiene métricas de fallback para esa fuente. No afecta el build ni el funcionamiento; solo significa que no se genera la fuente de respaldo con métricas ajustadas, y puede haber un pequeño salto de layout mientras carga la tipografía.
- **Peso del programa:** está hecho con componentes cliente, así que el código de los afiches viaja también en el JS de `/programa`. Funciona bien, pero se podría optimizar renderizando los afiches en el servidor y pasándolos como props.
- **Pruebas en equipos reales:** no se probó en iPhone ni Android físicos, solo con emulación de viewport. Tampoco se probó la emulación real de `prefers-reduced-motion` en el navegador; se revisó por código (CSS global y comprobaciones en JS).
- **Parámetro de prueba:** en desarrollo, `/programa?ahora=2026-10-17T18:10` simula un momento del festival para ver los estados "En curso" y "En N min". En producción se ignora.
- **Sin despliegue ni commits**, como se pidió.
- **Posibles mejoras:**
  - Exportar el itinerario a calendario (.ics).
  - Modo sin conexión (PWA) para usar el programa entre salas con mala señal.
  - Mostrar en el itinerario el traslado alternativo cuando llueve y la función de Terraza Faro pasa al Galpón 7.
