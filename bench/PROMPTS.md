# Prompts enviados a cada chat

Todas las arquitecturas parten del commit `base` (tag), que contiene `BRIEF.md`, `data/programa.json` y un proyecto Next.js vacío con `node_modules` ya instalado.
Los mensajes se envían tal cual. `.handoff/` está en `.gitignore` y solo sirve para que el orquestador detecte el fin de cada turno.

## Texto común de cierre (SOLO)

> Trabaja de principio a fin sin pedirme confirmaciones: las decisiones las tomas tú. No hagas commits. Como último paso, cuando ya no te quede nada por hacer, escribe `ENTREGA.md` (qué construiste, cómo correrlo, decisiones importantes y qué quedó pendiente) y después crea el archivo vacío `.handoff/fin.done`.

---

## Arquitectura 1 — Opus solo (`festival-1`)

> Lee `BRIEF.md` y construye el sitio que se pide en esta carpeta.
>
> + texto común de cierre

## Arquitectura 3 — Opus con subagentes libre (`festival-3`) · Arquitectura 6 — Fable con subagentes libre (`festival-6`)

> Lee `BRIEF.md` y construye el sitio que se pide en esta carpeta. Hazlo con subagentes, como tú quieras: tienes total libertad para decidir cuántos, cuáles y cómo repartir el trabajo.
>
> + texto común de cierre

## Arquitectura 5 — Fable solo (`festival-5`)

Igual que la arquitectura 1.

---

## Arquitecturas 2 (`festival-2`) y 4 (`festival-4`) — varios roles, cada uno en su chat

Roles:
- **Arq. 2:** Opus = definidor (backlog + semi-detalle) y revisor · Sonnet = code writer.
- **Arq. 4:** Fable = backlog · Opus = semi-detalle y revisor · Sonnet = code writer.

Una ronda de revisión.

### Paso B — Backlog (Arq. 2: Opus · Arq. 4: Fable)

> Eres quien define el producto en un equipo. Lee `BRIEF.md` y `data/programa.json`. Escribe `docs/BACKLOG.md`: épicas e historias de usuario priorizadas, cada una con criterios de aceptación verificables. Nada de decisiones de implementación: eso viene después. No escribas código. Otras personas, en otros chats, harán el detalle técnico y la implementación a partir de tu documento, sin poder preguntarte nada, así que todo lo importante del brief (incluido lo que no está dicho explícitamente) tiene que quedar ahí.
>
> Trabaja sin pedirme confirmaciones. Cuando termines, crea el archivo vacío `.handoff/backlog.done`.

### Paso D — Semi-detalle (Arq. 2: Opus, mismo chat · Arq. 4: Opus)

Arq. 2 (mismo chat, segundo mensaje):
> Ahora escribe `docs/DETALLE.md` a partir de tu backlog: por cada historia, qué archivos y rutas crear, qué componentes, tipos e interfaces, qué lógica (con los casos límite), la dirección visual y de animación concreta (tipografía, color, movimiento, cómo se representa cada película) y cómo verificarla. No escribas código de la aplicación: lo implementará otra persona en otro chat que solo tendrá `BRIEF.md`, `docs/BACKLOG.md`, `docs/DETALLE.md` y los datos.
>
> Trabaja sin pedirme confirmaciones. Cuando termines, crea el archivo vacío `.handoff/detalle.done`.

Arq. 4 (chat nuevo de Opus):
> Eres quien hace el diseño técnico en un equipo. Lee `BRIEF.md`, `data/programa.json` y `docs/BACKLOG.md` (lo escribió otra persona). Escribe `docs/DETALLE.md`: por cada historia, qué archivos y rutas crear, qué componentes, tipos e interfaces, qué lógica (con los casos límite), la dirección visual y de animación concreta (tipografía, color, movimiento, cómo se representa cada película) y cómo verificarla. No escribas código de la aplicación: lo implementará otra persona en otro chat que solo tendrá `BRIEF.md`, `docs/BACKLOG.md`, `docs/DETALLE.md` y los datos.
>
> Trabaja sin pedirme confirmaciones. Cuando termines, crea el archivo vacío `.handoff/detalle.done`.

### Paso C — Código (Sonnet)

> Eres quien implementa en un equipo. Lee `BRIEF.md`, `docs/BACKLOG.md` y `docs/DETALLE.md` e implementa el sitio completo en esta carpeta siguiendo esos documentos. Verifica que `npm run build` pase.
>
> Trabaja de principio a fin sin pedirme confirmaciones. No hagas commits. Cuando termines, crea el archivo vacío `.handoff/codigo.done`.

### Paso R — Revisión (Arq. 2: Opus, mismo chat · Arq. 4: Opus, mismo chat del detalle)

> La implementación está lista. Revísala contra `BRIEF.md`, `docs/BACKLOG.md` y `docs/DETALLE.md`: corre el build, prueba el sitio y lee el código. Escribe `docs/REVIEW.md` con los hallazgos priorizados (bloqueantes, importantes, menores), cada uno con dónde está y qué se espera. No corrijas el código tú: lo corregirá quien lo implementó. Habrá una sola ronda de correcciones, así que prioriza.
>
> Trabaja sin pedirme confirmaciones. Cuando termines, crea el archivo vacío `.handoff/review.done`.

### Paso F — Correcciones (Sonnet, mismo chat)

> La revisión está en `docs/REVIEW.md`. Corrige los hallazgos, empezando por los bloqueantes. Verifica que `npm run build` pase.
>
> Trabaja sin pedirme confirmaciones. No hagas commits. Como último paso, escribe `ENTREGA.md` (qué construiste, cómo correrlo, decisiones importantes y qué quedó pendiente) y después crea el archivo vacío `.handoff/fin.done`.

---

# Segunda ronda (BORRADOR, pendiente de revisión de Gabriel)

Arquitecturas 4, 6, 7, 8 y 9. El orquestador solo le manda el primer mensaje al chat a cargo. De ahí en adelante, las autocoordinadas (4, 7, 8 y 9) se pasan el trabajo solas. Los `<ID_...>` se reemplazan por los `session_id` reales al lanzar.

## Bloque común de coordinación (va dentro del prompt de las arquitecturas 4, 7, 8 y 9)

> **Cómo coordinar.** Los otros chats trabajan en esta misma carpeta, pero no ven esta conversación. Para pasarle trabajo a uno, usa la herramienta `mcp__ccd_session_mgmt__send_message` con su `session_id` (si no la tienes cargada, búscala con ToolSearch). Cada mensaje tiene que incluir todo lo que ese chat necesita saber: qué hacer, qué leer, qué entregar y cómo avisar que terminó (crear un archivo vacío `.handoff/<paso>.done`). Si quieres que se pasen el trabajo entre ellos sin pasar por ti, díselo con los `session_id` que correspondan.
>
> **Cómo esperar sin gastar tokens.** Cuando le pases trabajo a otro chat, lanza en segundo plano (`run_in_background`) el comando `until [ -f .handoff/<paso>.done ]; do sleep 20; done` y termina tu turno. Cuando aparezca el archivo, el comando termina y te despierta. No revises a mano ni en bucle.
>
> **Reglas.** Nadie pide confirmaciones, nadie hace commits y nadie usa subagentes. Hay una sola ronda por cada revisión. El trabajo termina cuando existe `ENTREGA.md` (qué se construyó, cómo correrlo, decisiones importantes y qué quedó pendiente) y tú creas el archivo vacío `.handoff/fin.done` como último paso.

## Arquitectura 4 — Fable → Opus → Sonnet, autocoordinado (`festival-4`). A cargo: Fable

> Lideras un equipo de tres chats de Claude Code para construir el sitio que pide `BRIEF.md` en esta carpeta.
> - **Tú (Fable):** escribes `docs/BACKLOG.md`, con épicas e historias de usuario priorizadas, criterios de aceptación verificables y todo lo importante del brief, incluido lo que no está dicho explícitamente. No incluye decisiones de implementación.
> - **Opus** (`session_id` `<ID_OPUS>`): escribe `docs/DETALLE.md` (por historia: archivos y rutas, componentes, tipos e interfaces, lógica con casos límite, dirección visual y de animación concreta y cómo verificar; sin código). Después revisa la implementación y escribe `docs/REVIEW.md` con hallazgos priorizados, sin corregir.
> - **Sonnet** (`session_id` `<ID_SONNET>`): implementa el sitio siguiendo `BRIEF.md` y `docs/`, verifica que `npm run build` pase y después corrige lo de `docs/REVIEW.md`.
>
> Orden: backlog → detalle → código → revisión → correcciones y `ENTREGA.md`.
>
> + bloque común de coordinación

## Arquitectura 6 — Fable con subagentes, libre (`festival-6`)

Mismo prompt que la arquitectura 3 (sección "Opus con subagentes libre"), enviado al chat de Fable.

## Arquitectura 7 — Fable → Sonnet → Haiku, autocoordinado (`festival-7`). A cargo: Fable

> Lideras un equipo de tres chats de Claude Code para construir el sitio que pide `BRIEF.md` en esta carpeta.
> - **Tú (Fable):** escribes `docs/BACKLOG.md` (épicas, historias priorizadas, criterios de aceptación verificables, todo lo importante del brief incluido lo implícito, sin decisiones de implementación). Después revisas el detalle técnico de Sonnet y escribes `docs/REVIEW-DETALLE.md`, con hallazgos priorizados.
> - **Sonnet** (`session_id` `<ID_SONNET>`): escribe `docs/DETALLE.md` (por historia: archivos y rutas, componentes, tipos e interfaces, lógica con casos límite, dirección visual y de animación concreta y cómo verificar; sin código) y lo corrige según tu revisión. Después revisa la implementación y escribe `docs/REVIEW.md`, sin corregir.
> - **Haiku** (`session_id` `<ID_HAIKU>`): implementa el sitio siguiendo `BRIEF.md` y `docs/`, verifica que `npm run build` pase y después corrige lo de `docs/REVIEW.md`.
>
> Orden: backlog → detalle → revisión del detalle → detalle corregido → código → revisión del código → correcciones y `ENTREGA.md`.
>
> + bloque común de coordinación

## Arquitectura 8 — Fable + un Haiku, autocoordinado (`festival-8`). A cargo: Fable

> Construye el sitio que pide `BRIEF.md` en esta carpeta. Tienes a tu cargo un chat de Claude Code con Haiku (`session_id` `<ID_HAIKU>`) que trabaja en esta misma carpeta. Regla de reparto: el trabajo grueso lo hace Haiku (escribir las páginas, los componentes, la lógica y los estilos). Tú planificas, le pasas el trabajo, revisas lo que entrega y puedes retocar o corregir lo que hizo, pero no construir tú partes grandes del sitio. Tú decides en qué orden y en cuántas entregas le pasas el trabajo. La única ayuda que puedes usar es ese chat.
>
> + bloque común de coordinación

## Arquitectura 9 — Opus + Sonnet, autocoordinado (`festival-9`). A cargo: Opus

> Lideras un equipo de dos chats de Claude Code para construir el sitio que pide `BRIEF.md` en esta carpeta.
> - **Tú (Opus):** escribes `docs/BACKLOG.md` (épicas, historias priorizadas, criterios de aceptación verificables, todo lo importante del brief incluido lo implícito, sin decisiones de implementación) y `docs/DETALLE.md` (por historia: archivos y rutas, componentes, tipos e interfaces, lógica con casos límite, dirección visual y de animación concreta y cómo verificar; sin código). Después revisas la implementación y escribes `docs/REVIEW.md`, con hallazgos priorizados y sin corregir.
> - **Sonnet** (`session_id` `<ID_SONNET>`): implementa el sitio siguiendo `BRIEF.md` y `docs/`, verifica que `npm run build` pase y después corrige lo de `docs/REVIEW.md`.
>
> Orden: backlog y detalle → código → revisión → correcciones y `ENTREGA.md`.
>
> + bloque común de coordinación
