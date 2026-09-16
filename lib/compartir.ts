import { getFuncion } from './datos';

export function codificar(ids: string[]): string {
  const origen = typeof window !== 'undefined' ? window.location.origin : '';
  const query = ids.join(',');
  return `${origen}/itinerario/compartido?i=${query}`;
}

export function decodificar(query: string | null): string[] {
  if (!query || query.trim() === '') return [];

  const ids = query.split(',')
    .map(id => id.trim())
    .filter(id => id.length > 0)
    .filter(id => getFuncion(id) !== undefined);

  return ids;
}
