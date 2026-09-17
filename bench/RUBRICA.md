# Rúbrica — Festival de Cine Niebla

Escrita el 2026-09-15, **antes de ver cualquier resultado**. La evaluación de calidad se hace a ciegas: cada solución se presenta como una letra (A–F) asignada al azar, sin decir ni arquitectura ni modelo. El mapeo queda en `bench/runs/ciego.json` y solo se abre al final.

Juzgan **un modelo juez** (con capturas en 360 px y 1440 px y acceso al sitio corriendo) y **Gabriel**. Se reportan las dos notas por separado y el promedio.

## 1. Métricas automáticas (no se juzgan)

| Métrica | Fuente |
|---|---|
| Costo API extrapolado (USD), por modelo | transcripts + `bench/precios.json` |
| Tokens por tipo y modelo (input, output, thinking, escritura y lectura de caché) | transcripts |
| Tiempo de muro (primer prompt → último mensaje) y tiempo activo (suma de turnos) | transcripts |
| Llamadas a la API, herramientas usadas, subagentes lanzados | transcripts |
| Intervenciones manuales (mensajes que no fueron del orquestador) | transcripts |
| `npm run build` pasa / `npm run lint`: errores y warnings | `bench/calidad.sh` |
| Líneas de código (TS/TSX/CSS), número de archivos, dependencias añadidas | `bench/calidad.sh` |
| Restricciones verificables (ver 2.1) | `bench/calidad.sh` + revisión |

## 2. Alineamiento (0–10)

"Que no se aleje del prompt, que respete las restricciones y que entienda el subtono."

### 2.1 Restricciones explícitas (checklist, cada falla resta)

- [ ] Next.js App Router + TypeScript; `npm run build` pasa.
- [ ] Sin librerías de componentes; como máximo una librería de animación.
- [ ] Sin imágenes externas ni fotos.
- [ ] Sin backend ni servicios externos (fuentes vía `next/font` permitidas).
- [ ] `data/programa.json` sin modificar y sin datos inventados (películas, funciones, horarios, premios, precios).
- [ ] Toda la interfaz en español.
- [ ] Sin emojis.
- [ ] Sin puntajes, estrellas ni rankings.
- [ ] Respeta `prefers-reduced-motion` (verificado emulándolo).
- [ ] Funciona de 360 px a escritorio, sin scroll horizontal.
- [ ] No tocó nada fuera de su carpeta.

### 2.2 Requisitos funcionales (checklist)

- [ ] Portada: qué, cuándo, dónde, secciones, enlace al programa.
- [ ] Programa: las 39 funciones, filtro por día y por sección.
- [ ] Ficha de película con todas sus funciones.
- [ ] Itinerario: marcar y desmarcar funciones.
- [ ] Choque por solapamiento. Caso de prueba: f02 + f04 (jueves).
- [ ] Choque por traslado. Casos: f03 → f05 (6 min, necesita 8); f15 → f18 (2 min, necesita 8).
- [ ] **No** marca choque cuando alcanza justo: f14 → f16 (misma sala, 0 min); f14 → f17 (10 min, necesita 9).
- [ ] Aviso de conversatorio perdido **sin choque**: f13 (termina 19:52, conversatorio hasta 20:17) → f16 (muelle 20:05, traslado 12: alcanza); f13 → f17 (terraza 20:15, traslado 20: alcanza). Deben avisar del conversatorio pero **no** marcar choque.
- [ ] Funciones después de medianoche bien calculadas y asignadas al día del festival que corresponde (f09, f10, f21, f22, f39).
- [ ] Persistencia en el navegador (recargar mantiene el itinerario).
- [ ] Compartir con link: abrir el link en otra ventana muestra ese itinerario y permite copiarlo al propio.
- [ ] Muestra funciones agotadas (f22, f31) y aire libre con su nota de lluvia (terraza).

### 2.3 Subtono (juicio, 0–10)

- ¿Se siente un festival **chico, de puerto, hecho a pulso**, o una plantilla corporativa / "empresa de seguros" / SaaS?
- ¿Pensó en el público que **llega corriendo después de la pega** y en el **celular caminando entre salas**? (p. ej. qué funciones alcanza, hora de término, cuánto camina, ver "lo que viene ahora").
- ¿Tomó en cuenta que la venta es **solo en boletería** (no inventa "comprar entradas" en línea)?

## 3. Creatividad (0–10)

"Que, dentro de lo que se le da espacio, sorprenda." Solo se juzga lo que el brief dejó libre:

- **Identidad visual** (tipografía, color, composición): ¿tiene una idea propia y coherente o es genérica?
- **Representación de las películas sin afiches**: ¿hay un sistema visual con intención, distinto por película y coherente entre todas?
- **Portada**: ¿sorprende? ¿La animación tiene sentido o es decoración?
- **Programa en el celular**: ¿resolvió bien la grilla de 4 salas × horas en 360 px?
- **Armar el itinerario**: ¿se siente bien o como un formulario? ¿Hay ideas que no se pidieron y que aportan (p. ej. sugerir la otra función de la misma película cuando hay choque)?

## 4. Calidad de ejecución (0–10)

- **Gusto**: jerarquía, espaciado, ritmo, contraste, detalles. Penaliza el "moderno basura": gradientes genéricos, glassmorphism sin motivo, animación excesiva.
- **Pulido y bugs**: estados vacíos, bordes, foco de teclado, accesibilidad básica, errores en consola.
- **Código**: estructura razonable, lógica de choques separada y correcta, sin código muerto evidente.

## 5. Nota final

`Nota = 0.35 × Alineamiento + 0.35 × Creatividad + 0.30 × Ejecución` (sobre 10), junto al costo y el tiempo, sin combinarlos en un único número: la comparación de valor (nota por dólar, nota por minuto) se muestra aparte.
