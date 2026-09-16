# Festival de Cine Niebla

Tercera edición del Festival de Cine de Puerto Bruma. Una plataforma web para explorar películas, gestionar salas y armar itinerarios personalizados para los tres días de festival.

## Características

- **Programa interactivo**: Navega por películas, funciones y salas
- **Itinerario personal**: Arma tu recorrido por el festival con detección de conflictos de horario
- **Detección de traslados**: Sabe si alcanzas a caminar entre salas
- **Compartir itinerarios**: Comparte tu itinerario con otros asistentes
- **Responsive**: Optimizado para celulares, tablets y desktop
- **Sin dependencias innecesarias**: Velocidad y eficiencia

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd festival-8

# Instalar dependencias
npm install

# Ejecutar el servidor de desarrollo
npm run dev
```

El sitio estará disponible en `http://localhost:3000`.

## Compilación

```bash
# Build de producción
npm run build

# Iniciar servidor de producción
npm start
```

## Estructura del Proyecto

```
app/
  page.tsx              # Portada principal
  layout.tsx            # Diseño raíz
  globals.css           # Variables y estilos globales
  itinerario/           # Página de itinerario
  pelicula/             # Página de detalle de película
  programa/             # Vista del programa

components/
  Afiche.tsx            # Portada visual de película (SVG determinista)
  BotonItinerario.tsx   # Botón agregar/quitar del itinerario
  Itinerario.tsx        # Gestor de itinerario compartido y personal
  Programa.tsx          # Grilla horaria de funciones
  TarjetaFuncion.tsx    # Tarjeta de función con avisos

lib/
  programa.ts           # Datos del festival y helper functions
  tiempo.ts             # Utilidades de tiempo en minutos
  tipos.ts              # Interfaces TypeScript
  itinerario.ts         # Lógica de análisis de itinerarios
  useItinerario.ts      # Hook personalizado con localStorage
```

## Tipografía y Diseño

- **Títulos**: [Fraunces](https://github.com/underfitted/fraunces) (serif)
- **Texto**: Inter (sans-serif)
- **Paleta**: Tonos de niebla azul con acentos dorados y marinos

## Compilación y Verificación

```bash
# Verificar tipos TypeScript
npx tsc --noEmit

# Linting
npm run lint

# Build
npm run build
```

## Convenciones del Código

- **Tiempo**: Todo se trabaja en minutos desde las 00:00 de 2026-10-15
- **Estado**: localStorage con sincronización entre pestañas
- **Módulos CSS**: Escopados a componentes con suffix `.module.css`
- **Sin date objects**: Se evita Date para prevenir problemas de zona horaria

## Funciones Destacadas

### Itinerario Personal
- Agrega y quita funciones
- Detecta choques de horario
- Avisa si no alcanzas a caminar entre salas
- Muestra tiempo de conversatorio disponible

### Compartir
- Genera un URL con tu itinerario codificado
- Soporta Web Share API con fallback a clipboard
- Opción de copiar manualmente el link

### Avisos
- Conflictos de horario (choques)
- Tiempos insuficientes para trasladarse (traslados)
- Pérdida de conversatorio por viajes

## Desarrollo

Para agregar una nueva película o función, edita `/lib/programa.ts`.

El SVG de cada portada de película es determinista: se genera desde el `id` de la película usando un hash, así que siempre ve el mismo visual.

## Responsive

Verificado en:
- 375px (móvil)
- 768px (tablet)
- 1120px+ (desktop)

Sin scroll horizontal en ningún punto de quiebre.

## Créditos

Tercera edición, 15–17 de octubre de 2026 · Puerto Bruma
