# Decisiones del benchmark

- **Tarea:** idea A, el sitio del Festival de Cine Niebla (`BRIEF.md` + `data/programa.json`).
- **Roles:** backlog = épicas, historias y criterios de aceptación. Semi-detalle = archivos, interfaces, lógica, dirección visual y cómo verificar, sin código. Code writer = implementa. Revisión = `docs/REVIEW.md`.
- **Revisión:** una sola ronda de revisión y corrección.
- **Chats:** visibles en la app de Claude (pestaña Code), uno por rol, cada arquitectura en su worktree `ClaudeModelFusions-wt/festival-N`.
- **Esfuerzo:** high para todos los modelos. Una sola corrida por arquitectura.
- **Tandas:** tanda 1 = arquitecturas 1, 2, 3 y 5. Tanda 2 = arquitecturas 4 y 6. **Avisar a Gabriel antes de lanzar la tanda 2.**
- **Coordinación en la tanda 1 (arquitectura 2):** el orquestador (este chat) pasa el trabajo de un chat a otro. No cuenta en las métricas.
- **Autocoordinación (actualizado el 2026-09-15):** se prueba **después**, como experimento aparte y con arquitecturas propias. No reemplaza a ninguna de las seis originales. En esas arquitecturas los chats se pasan el trabajo solos: el rol a cargo le escribe al siguiente chat con la herramienta de mensajes entre sesiones y espera con un vigilante en segundo plano (un archivo `.handoff/*.done`, revisado cada ~20 s), así que no gasta tokens mientras espera. Esa coordinación sí cuenta en sus métricas.
- **Cómo se reporta la coordinación:** cuando el orquestador pasa el trabajo de un chat a otro, equivale a una persona coordinando. En el reporte se distingue "con coordinación humana (orquestador)" de "autocoordinado".
- **Fable → Opus → Sonnet va autocoordinado** (decidido por Gabriel el 2026-09-15).
- **Cuando terminen Opus solo, Opus + Sonnet y Opus con subagentes, no se lanza nada más.** Se espera a que Gabriel dé la orden para seguir.

## Arquitecturas pendientes (acordado el 2026-09-15)

Ninguna se lanza sin orden de Gabriel.

- **4. Fable → Opus → Sonnet, autocoordinado.** Tres chats. Fable hace el backlog. Opus hace el semi-detalle y la revisión del código. Sonnet escribe el código. Los chats se pasan el trabajo solos.
- **6. Fable con subagentes, libre.**
- **7. Fable → Sonnet → Haiku, autocoordinado.** Tres chats separados.
  - Fable: backlog y revisión del semi-detalle.
  - Sonnet: semi-detalle y revisión del código.
  - Haiku 4.5: código.
  - Una ronda de revisión del detalle (Fable revisa a Sonnet) y una ronda de revisión del código (Sonnet revisa a Haiku).
- **8. Fable + un Haiku, en chats separados.** Fable solo puede delegar en Haiku. Hay un solo chat de Haiku, y Fable decide qué le pide y cómo le pasa el trabajo.
- **9. Opus + Sonnet autocoordinado.** Los mismos roles que la arquitectura 2, pero los chats se pasan el trabajo solos, sin el orquestador.
- **Descartada:** Opus con subagentes eligiendo el modelo de cada subagente. La lista queda cerrada en 4, 6, 7, 8 y 9.
- **Preparación (2026-09-15):**
  - Worktrees `festival-7`, `festival-8` y `festival-9` creados desde `base`. `festival-4` y `festival-6` ya existían.
  - Borrador de prompts en `bench/PROMPTS.md` (sección "Segunda ronda"), pendiente de revisión de Gabriel.
  - Chats necesarios: 11. Se abrirían con enlaces `claude://code/new`.
  - En las arquitecturas multichat nadie usa subagentes.
  - En la 8, Fable puede retocar lo que hizo Haiku, pero el trabajo grueso se le pasa a Haiku (lo confirmó Gabriel).
  - Gabriel da por buenos los prompts sin revisarlos. Las 5 arquitecturas se lanzan juntas.
- **Incidencias del lanzamiento de la segunda ronda (a reportar como limitación):**
  - Varios enlaces `claude://code/new` crearon chats "Sin carpeta". Se reubicaron con `change_directory` (9b, 7b, 7c).
  - Los chats abiertos por enlace nacen en modo **Manual**. Gabriel pasó los de Sonnet (y los demás) a **Auto**.
  - Haiku 4.5 no admite el modo Auto. Los chats de Haiku (7c, 8b) quedaron en **Aceptar ediciones**, así que los comandos (build, `touch .handoff/...`) siguen pidiendo aprobación. Sus arquitecturas (7 y 8) van a acumular más intervenciones manuales y esperas.
  - Incluso en Auto, los comandos compuestos `cd ... && <escritura>` piden aprobación manual.
  - El tiempo de espera por aprobaciones se descuenta o se reporta aparte en las métricas.
  - **Intervenciones humanas y del orquestador en la segunda ronda:**
    - Arquitectura 8: Gabriel le escribió dos veces al chat de Haiku ("inclusive comandos de git también debe hacerlo fable", "tú habla con fable"). Haiku se quedó sin contexto y la app compactó su conversación.
    - Arquitecturas 4 y 7 (2026-09-16): los chats a cargo (4a y 7a, Fable) despertaron al terminar la última etapa, pero su turno se cortó antes de cerrar. El trabajo estaba completo, con `ENTREGA.md` escrito. El orquestador les pidió retomar la verificación final y crear `fin.done`. Cuenta como 1 intervención en cada una.
- **Arquitectura 7 (Fable → Sonnet → Haiku) NO COMPLETADA (decisión de Gabriel, 2026-09-16).** Gabriel la detuvo antes de que Fable hiciera la verificación final y creara `fin.done`, por el mal desempeño de la cadena. Se guarda el estado en que quedó la rama `festival-7`, pero no entra en la comparación como arquitectura terminada.
- **Reportes:** una página HTML por tanda y otra con el total.
- **Entregables extra:** archivos `.bat` en `ver/` para abrir la solución de cada worktree o rama.
