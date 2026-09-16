const CLAVE = 'festivalniebla:itinerario:v1';

export function leerItinerario(): { ids: string[]; disponible: boolean } {
  if (typeof window === 'undefined') {
    return { ids: [], disponible: false };
  }

  try {
    const json = window.localStorage.getItem(CLAVE);
    if (!json) return { ids: [], disponible: true };
    const ids = JSON.parse(json);
    return { ids: Array.isArray(ids) ? ids : [], disponible: true };
  } catch {
    return { ids: [], disponible: false };
  }
}

export function escribirItinerario(ids: string[]): boolean {
  if (typeof window === 'undefined') return false;

  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(ids));
    return true;
  } catch {
    return false;
  }
}

export function limpiarItinerario(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(CLAVE);
  } catch {
    // Ignorar
  }
}
