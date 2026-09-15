# Entrega: sitio del Festival de Cine Niebla

## Qué se construyó

El sitio completo pedido en `BRIEF.md`, siguiendo `docs/BACKLOG.md` y `docs/DETALLE.md`:

- **Portada** (`/`): escena del faro con haz de luz animado (CSS puro, `@property --angulo`) que ilumina "NIEBLA" al pasar, qué es el festival con sus cifras, las 4 secciones, los 3 días, las 4 salas con tabla de distancias a pie, entradas y "para anotar" (destacados sin criterio de calidad).
- **Programa** (`/programa`): las 39 funciones agrupadas por día, filtro por día y por sección combinables y reflejados en la URL (`?dia=&seccion=`), previsualización de topes/no-alcanza antes de agregar una función.
- **Ficha de película** (`/pelicula/[id]`): las 24 páginas prerenderizadas en build, con todos los datos, sus funciones y "más de esta sección".
- **Mi itinerario** (`/itinerario`): armar el recorrido, avisos de tope / no alcanzas a llegar / te perderías el conversatorio / agotada / película repetida, resumen con costo estimado, deshacer al quitar, vaciar con confirmación, compartir con link.
- **Itinerario compartido** (`/itinerario/compartido`): ver el itinerario de otra persona (nunca modifica el propio) y copiarlo (agregar, reemplazar o "ya las tienes"), con manejo de links dañados o con funciones inválidas.
- **404** propia para rutas y fichas inexistentes.
- **Identidad visual**: sistema "Luces en la niebla" (tokens de color, tipografía con `next/font`, una luz por sección) y un "cartel de niebla" SVG generado por código para cada una de las 24 películas (24 motivos distintos, deterministas por el id de la película, sin fotos).

## Cómo correrlo

```bash
npm install     # si hace falta
npm run dev     # desarrollo, http://localhost:3000
npm run build   # build de producción (Turbopack)
npm start       # sirve el build (después de npm run build)
npm test        # 114 tests de la lógica pura en lib/ (node --test)
npm run lint    # ESLint
```

`data/programa.json` no se modifica: es el único dato del festival y `lib/programa.ts` es el único módulo que lo importa.

## Estado de la ronda de correcciones (`docs/REVIEW.md`)

Se corrigieron el bloqueante, los 7 hallazgos importantes y los 12 menores:

- **B1** (contraste ilegible en la vista compartida): `CopiarItinerario` salió de la zona `data-zona="noche"`, con color explícito propio; el toast de "Copiado" ahora vive en `ItinerarioCompartido` (una sola vez) y se ve tras copiar.
- **I1** (haz del faro): faro y haz comparten un contenedor con `--angulo` animado en un ancestro común, así el haz nace en la linterna y la máscara de "NIEBLA" lee el mismo ángulo; se corrigió la regla de altura que achicaba la escena en pantallas altas; el faro ya no queda tapado en el celular.
- **I2**: el encabezado de día usa `top: var(--alto-cabecera)`, ya no queda tapado por la cabecera al hacer scroll en el celular.
- **I3**: los filtros de sección muestran el nombre corto (`nombreCortoSeccion`, con el nombre completo en `aria-label`); la intro se oculta bajo 600 px; en el sidebar de escritorio se ajustó el padding para que "Jue 15" no corte en dos líneas.
- **I4**: la nota de lluvia de la Terraza Faro (tal como está en el JSON) ahora se muestra en programa, ficha e itinerario a través de `MarcasFuncion`.
- **I5**: el aviso de conversatorio dice explícitamente "así que te perderías casi todo (alcanzas a quedarte N min)" incluso cuando alcanza algunos minutos.
- **I6**: solo el cartel `grande` (ficha) anima la niebla; en `/programa` las animaciones en reposo bajaron de 117 a 0.
- **I7**: en Mi itinerario, "Compartir" quedó como botón compacto que despliega el panel (con el nombre opcional) solo al tocarlo; "Vaciar" y la nota de guardado se movieron al pie. En el celular ya se ve el resumen y la primera función sin desplazarse.
- **Menores M1–M12**: contador del ícono en la barra inferior reposicionado en absoluto; grilla e íconos de `ItemItinerario` prolijos (cartel y botón "Quitar" en la misma columna); un tope entre funciones consecutivas ya no se repite en la tarjeta (solo en el tramo) y el conversatorio entre funciones no consecutivas (caso `f13→f17`) ahora sí aparece; el listener de `storage` se agrega una sola vez y se quita cuando ya no hay suscriptores; `persistente` pasa a `false` si falla una escritura posterior a la inicial; los destacados de portada marcan "Agotada" cuando corresponde; las notas de "Tres días" enlazan a la película; se quitó la línea de venta en línea duplicada en Entradas; el encabezado de día del programa dice "12 funciones" sin "Mostrando"; el botón de itinerario usa un nombre accesible fijo con `aria-pressed` (sin contradicción con lectores de pantalla); "Mi itinerario" ya no corta en dos líneas en la portada a 1440 px; `.claude/` (configuración local, no parte del sitio) se agregó a `.gitignore`.
- **Opcional (E6-H6, Could)**: se conectó el aviso de lluvia también en Mi itinerario y en la vista compartida (ya estaba probado en `lib/reglas-itinerario.ts`, solo faltaba la interfaz).

Se agregó un test nuevo a `lib/itinerario-store.test.ts` para el caso de `persistente` pasando a `false` tras una escritura fallida. `npm test` (114), `npm run lint` y `npm run build` terminan sin errores; `git diff --exit-code -- data/programa.json` sigue limpio.

## Decisiones importantes

- **Sin nueva animación de "el haz sigue al puntero" (A4 de `DETALLE.md`)**: la revisión pidió resolver I1 antes que A4; se priorizó dejar el barrido automático correcto y sincronizado, y no se agregó el seguimiento del puntero por tiempo. El efecto principal (el haz nace en el faro e ilumina el título) ya funciona en automático, con y sin `prefers-reduced-motion`.
- **Filtros de sección en el celular**: quedan en 3 filas (no 2) a 360–375 px porque "Todas" es un quinto botón impar; se priorizó que la primera función del programa ya se vea sin desplazarse (el objetivo de fondo del hallazgo I3) antes que forzar exactamente 2 filas.
- **`CompartirItinerario` reutilizado**: en vez de duplicar la lógica de compartir/copiar, se mantuvo un solo componente y se resolvió el bloqueante moviendo el toast a un nivel más arriba (`ItinerarioCompartido`), ya que se monta dos veces en esa página (cabecera y pie).

## Qué quedó pendiente

Ninguno de los hallazgos de `docs/REVIEW.md` (bloqueante, importantes o menores) quedó pendiente. Lo que sigue sin implementar son los mismos Could que ya estaban fuera de esta ronda:

- E3-H9 y E5-H7 ("lo que viene" / "próxima función" durante el festival en vivo).
- E8-H1 (cuenta regresiva antes/después del festival).
- DETALLE 8.3 A4 (el haz del faro siguiendo al puntero en escritorio).
- Lighthouse no se corrió en este entorno (sin acceso a esa herramienta); con 0 animaciones en reposo en `/programa` y los carteles chicos sin niebla animada, el rendimiento debería mejorar de forma importante respecto de la revisión anterior, pero queda como verificación pendiente para quien despliegue el sitio.
