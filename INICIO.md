# ClaudeModelFusions — archivo de inicio

> Para el agente que tome este proyecto: lee todo este archivo. **No implementes nada todavía.**
> Primero hazle a Gabriel las preguntas de la sección 4 y cuaja el alcance con él.

## 1. Lo que pidió el usuario (sus palabras, casi textuales)

"Hacer un benchmark y probarlo en worktrees. La idea es evaluar lo bien que cierta combinación de agentes logró realizar una tarea: su costo, uso de tokens, tiempo de demora, creatividad, alineamiento, etc. Lo que quiero probar es qué tan bien funcionan las siguientes arquitecturas agénticas:"

1. **Opus solo.**
2. **Opus definidor** (escala grande (backlog), semi-detalle y revisión) **+ Sonnet como code writer** (cada uno su propio chat).
3. **Opus** con prompt "hazlo con subagentes como tú quieras, libre".
4. **Fable** (escala grande (backlog)) → **Opus** (semi-detalle, revisión de código) → **Sonnet** (escribir código). La revisión semi-detalle la hace Opus.
5. **Fable solo.**
6. **Fable** con prompt "hazlo con subagentes, libre".

## 2. Decisiones ya tomadas por el usuario

- Este directorio es el repo git del benchmark (`git init` ya hecho, sin commits todavía).
- **Una sola corrida** por arquitectura; no le interesan las repeticiones.
- Hoy usa cuenta Max, así que el costo no se paga por token. Aun así quiere **extrapolar el costo a API**: tokens consumidos × precio de cada token.

## 3. Recomendaciones del agente de proyectos (Claude) — NO son decisiones del usuario

Son sugerencias para discutir con Gabriel, no requisitos.

1. **Ejecución:** cada arquitectura trabaja en su propio `git worktree` de este repo, partiendo del mismo commit base. Cada rol se lanza con `claude -p --model <modelo> --output-format json` (o `stream-json`), que devuelve `duration_ms`, `num_turns`, `total_cost_usd` y tokens por modelo. En las arquitecturas de varios chats, los roles se pasan el trabajo por archivos (p. ej. `BACKLOG.md` → código → `REVIEW.md`).
2. **Costo API:** guardar los tokens crudos por modelo y por tipo (input, output, escritura de caché, lectura de caché) y calcular el costo con una tabla de precios versionada, fácil de actualizar. Precios de referencia vistos el 2026-09-14: Fable 5.1 $10/$50 y Opus 5 $5/$25 por millón de tokens (input/output). **Verificar** estos y los de Sonnet antes de usarlos.
3. **Creatividad y alineamiento:** no salen de métricas automáticas. Hace falta una rúbrica y una evaluación a ciegas de los resultados (etiquetas A–F), hecha por un modelo juez, por Gabriel o por ambos.

## 4. Preguntas que el agente debe hacerle a Gabriel antes de empezar

1. ¿Qué tarea (o tareas) van a resolver las arquitecturas? ¿La define él o se propone una?
2. ¿Qué entiende exactamente por "escala grande (backlog)" y por "semi-detalle"? ¿Qué entrega cada rol?
3. En las arquitecturas de varios roles, ¿cuántas rondas de revisión/corrección como máximo?
4. "Cada uno su propio chat": ¿sesiones visibles en la app de Claude o ejecuciones headless por script?
5. ¿Qué significan para él "creatividad" y "alineamiento"? ¿Quién juzga: un modelo, él o ambos?
6. ¿Las 6 arquitecturas corren en paralelo o una tras otra? (Tener en cuenta los límites de uso de la cuenta Max.)
7. ¿Qué nivel de esfuerzo/razonamiento usa cada modelo?
8. ¿Qué otras métricas cubre el "etc."?
9. ¿Cómo quiere ver el resultado final (tabla, reporte, página)?
