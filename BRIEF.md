# Festival de Cine Niebla: sitio web de la 3ª edición

## Quiénes somos

Somos un festival de cine chico de Puerto Bruma, un puerto de la costa de Chile. Lo organizamos entre cuatro personas, con fondos concursables y mucha ayuda de voluntarios. Esta es nuestra tercera edición: **jueves 15, viernes 16 y sábado 17 de octubre de 2026**, con 24 películas en 4 salas.

Nuestro público es gente del puerto y de la región. La mayoría trabaja, así que el jueves y el viernes llegan corriendo después de la pega. El sábado es el día fuerte. Casi todos revisan el programa desde el celular, muchas veces caminando de una sala a otra.

Hasta ahora teníamos un PDF con la programación y una página hecha con una plantilla. Nos dijeron que parecía "la web de una empresa de seguros". No queremos eso. Queremos que el sitio se sienta como el festival: con personalidad, de acá, bien hecho.

## Qué necesitamos

Un sitio web con estas partes:

1. **Portada.** Tiene que presentar el festival: qué es, cuándo es, dónde es y qué secciones tiene. Quien entre tiene que tener ganas de ir. Desde aquí se llega al programa.
2. **Programa.** Todas las funciones de los tres días. Se tiene que poder filtrar por día y por sección. Tiene que verse bien y usarse bien en un celular.
3. **Ficha de cada película.** Muestra los datos de la película y todas sus funciones.
4. **Mi itinerario.** Cada persona arma su propio recorrido marcando las funciones a las que quiere ir. El itinerario:
   - avisa cuando dos funciones elegidas **se topan**, y también cuando **no alcanza a llegar caminando** de una sala a otra (los minutos de traslado están en los datos);
   - si una función tiene conversatorio después de la película, **avisa si se lo perdería** por ir a la siguiente función (el conversatorio no cuenta como choque);
   - se guarda en el navegador, sin cuentas ni registro;
   - **se puede compartir con un link**: quien abre el link ve ese itinerario y puede copiarlo al suyo.

## Datos

Toda la información está en `data/programa.json`: festival, salas, traslados, secciones, películas y funciones. **Úsalo tal cual y no lo modifiques.** No inventes películas, funciones, horarios ni datos que no estén ahí.

- Las horas están en hora local de Chile (`America/Santiago`).
- Una función termina a la hora de inicio más la duración de la película.
- Algunas funciones terminan después de medianoche.
- Hay funciones agotadas y funciones al aire libre.

## Restricciones

- **Next.js** (App Router) con **TypeScript**. `npm run build` tiene que pasar sin errores.
- Para estilos puedes usar Tailwind CSS o CSS Modules. **No uses librerías de componentes** (shadcn/ui, MUI, Chakra, Mantine, DaisyUI ni similares). Puedes usar como máximo **una** librería de animación.
- **No uses imágenes externas ni fotos.** No tenemos afiches de las películas, así que la parte visual de cada película la tienes que resolver con código (CSS, SVG, canvas o lo que se te ocurra). Puedes usar fuentes con `next/font`.
- Sin backend, base de datos ni servicios externos. El sitio tiene que funcionar entero en el navegador.
- Todos los textos de la interfaz van en español.
- **No uses emojis** en la interfaz.
- **No muestres puntajes, estrellas ni rankings** de las películas. El festival no califica películas.
- Tiene que respetar `prefers-reduced-motion`.
- Tiene que funcionar bien desde 360 px de ancho hasta pantallas de escritorio.
- Trabaja solo dentro de esta carpeta.

## Dónde tienes libertad

La identidad visual, la tipografía, el color, cómo se representa cada película sin afiches, las animaciones y cómo se ve el programa en el celular. Queremos que la portada nos sorprenda y que armar el itinerario se sienta bien, no como llenar un formulario.
