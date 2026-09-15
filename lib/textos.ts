// Microcopia centralizada del sitio. Todo el texto de interfaz vive acá (o se
// arma acá con datos) para revisar en un solo lugar ortografía y ausencia de
// emojis (docs/DETALLE.md sección 13).

import { plural } from './formato.ts'

export const nav = {
  inicio: 'Inicio',
  programa: 'Programa',
  itinerario: 'Mi itinerario',
}

export const general = {
  saltar: 'Saltar al contenido',
  quieroIr: 'Quiero ir',
  voy: 'Voy',
  verPrograma: 'Ver el programa',
  irAlInicio: 'Ir al inicio',
  quitarFiltros: 'Quitar filtros',
}

export const filtros = {
  dia: 'Día',
  seccion: 'Sección',
  todos: 'Todos',
  todas: 'Todas',
  mostrando: (n: number) => `Mostrando ${plural(n, 'función', 'funciones')}`,
  sinResultados: 'No hay funciones con estos filtros.',
}

export const marcas = {
  agotada: 'Agotada',
  aireLibre: 'Al aire libre · Gratis',
  conversatorio: (n: number) => `Conversatorio de ${n} min`,
}

export const volver = 'Volver al programa'

export const portada = {
  queEs:
    'Un festival de cine chico, hecho en Puerto Bruma, en la costa de Chile. Lo organizamos entre cuatro personas, con fondos concursables y mucha ayuda de voluntarios. Esta es nuestra tercera edición: tres días de películas en cuatro salas del puerto.',
  diaFuerte: 'El día fuerte',
  todoQuedaCerca: (min: number, max: number) => `Todo queda cerca: entre ${min} y ${max} minutos a pie`,
  paraAnotar: 'Para anotar',
  bajar: 'Bajar',
}

export const itinerarioTextos = {
  vacioTitulo: 'Tu recorrido está en blanco',
  vacioTexto:
    'Marca en el programa las funciones a las que quieres ir. Te avisamos si se topan, si no alcanzas a llegar caminando o si te perderías un conversatorio. Se guarda en este navegador, sin cuentas.',
  guardado: 'Se guarda solo en este navegador. Para verlo en otro teléfono, compártelo con un link.',
  sinGuardado:
    'Este navegador no deja guardar datos (quizás estás en modo privado). Tu itinerario se perderá al cerrar la pestaña: compártelo con un link para no perderlo.',
  resumenOk: (n: number) => `Todo calza: ${plural(n, 'función', 'funciones')} sin topes y con tiempo para caminar.`,
  resumenProblemas: (n: number) => `${plural(n, 'problema', 'problemas')} en tu recorrido`,
  avisoConversatorioExtra: (n: number) => `+ ${plural(n, 'aviso de conversatorio', 'avisos de conversatorio')}`,
  quitado: (titulo: string) => `Quitaste ${titulo}`,
  deshacer: 'Deshacer',
  vaciarPregunta: (n: number) => `¿Vaciar tu itinerario? Se quitarán las ${plural(n, 'función', 'funciones')}.`,
  vaciar: 'Vaciar itinerario',
  vaciarConfirmar: 'Vaciar',
  cancelar: 'Cancelar',
  compartir: 'Compartir mi itinerario',
  compartirDeshabilitado: 'Agrega funciones para poder compartir',
  copiarLink: 'Copiar link',
  linkCopiado: 'Link copiado',
  agregado: (titulo: string, dia: string, hora: string) => `Agregaste ${titulo}, ${dia} ${hora}, a tu itinerario`,
  iraAAccion: (titulo: string, dia: string, hora: string) => `Ir a ${titulo}, ${dia} a las ${hora}`,
  itinerarioCompartidoTitulo: 'Itinerario compartido',
  itinerarioDeTitulo: (nombre: string) => `El itinerario de ${nombre}`,
  itinerarioCompartidoTexto:
    'Alguien te compartió las funciones a las que va. No cambia tu itinerario a menos que lo copies.',
  yaTienesTodas: 'Ya tienes todas estas funciones en tu itinerario.',
  verMiItinerario: 'Ver mi itinerario',
  copiarAMio: 'Copiar a mi itinerario',
  copiado: 'Copiado. Ya está en tu itinerario.',
  ver: 'Ver',
  agregarAlMio: 'Agregar a mi itinerario',
  reemplazarMio: 'Reemplazar mi itinerario',
  reemplazarPregunta: (propias: number, nuevas: number) =>
    `¿Reemplazar tu itinerario? Tus ${plural(propias, 'función', 'funciones')} se cambiarán por las ${nuevas} de este link.`,
  reemplazar: 'Reemplazar',
  nuevasNoEstan: (n: number) => `${plural(n, 'función no está', 'funciones no están')} en tu itinerario.`,
  linkRotoTitulo: 'Este link no trae un itinerario',
  linkRotoTexto: 'Puede que se haya cortado al copiarlo. Pide que te lo manden de nuevo.',
  algunasInvalidas: (n: number) => `Algunas funciones del link no se pudieron cargar (${n}).`,
  entradasTotal: (texto: string) => `Entradas: ${texto} · se pagan en la boletería de cada sala, desde una hora antes.`,
  entradasGratis: 'Entradas: gratis',
  tuNombre: 'Tu nombre (opcional)',
  tuNombreEjemplo: 'Ej.: Carla',
}

export const avisos = {
  tope: (tituloB: string, horaB: string, tituloA: string, finA: string, solape: number) =>
    `${tituloB} empieza a las ${horaB}, antes de que termine ${tituloA} (${finA}). Se pisan ${solape} min.`,
  topeTarjeta: (titulo: string, hora: string, sala: string) => `Se topa con ${titulo} (${hora}, ${sala})`,
  conversatorioTarjeta: (titulo: string) => `Te perderías el conversatorio si vas a ${titulo}`,
  noAlcanza: (finA: string, salaA: string, horaB: string, salaB: string, margen: number, traslado: number) =>
    `Terminas ${finA} en ${salaA}. La siguiente empieza ${horaB} en ${salaB}. Tienes ${margen} min y a pie son ${traslado}.`,
  noAlcanzaDesde: (titulo: string) => `No alcanzas a llegar desde ${titulo}`,
  noAlcanzaHasta: (titulo: string) => `No alcanzas a llegar hasta ${titulo}`,
  conversatorio: (tituloA: string, conv: number, salida: string) =>
    `Después de ${tituloA} hay conversatorio de ${conv} min. Para llegar a tiempo tienes que salir a las ${salida}, así que te lo perderías.`,
  conversatorioConMargen: (tituloA: string, conv: number, salida: string, minutos: number) =>
    `Después de ${tituloA} hay conversatorio de ${conv} min. Para llegar a tiempo tienes que salir a las ${salida}, así que te perderías casi todo (alcanzas a quedarte ${minutos} min).`,
  agotada: 'Agotada: no quedan entradas para esta función.',
  repetida: (dia: string, hora: string) => `Ya tienes otra función de esta película (${dia} ${hora}).`,
  lluviaNoAlcanzarias: (n: number) => `Si llueve y se hace en el Galpón 7: a pie serían ${n} min, no alcanzarías.`,
  lluviaIgualAlcanzas: (n: number) => `Si llueve y se hace en el Galpón 7: a pie serían ${n} min, igual alcanzas.`,
  sinAvisoOtraSala: (traslado: number, margen: number) => `A pie ${traslado} min · tienes ${margen} min`,
  sinAvisoMismaSala: (margen: number) => `Misma sala · tienes ${margen} min`,
  seTopan: 'Se topan',
  noAlcanzasEtiqueta: 'No alcanzas',
  conversatorioEtiqueta: 'Conversatorio',
}
