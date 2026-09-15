import { funcion } from "./datos";

export const PARAM_COMPARTIR = "f";

export function codificarIds(ids: string[]): string {
  return ids.map((id) => id.replace(/^f/, "")).join(".");
}

export function decodificarIds(valor: string | null): string[] {
  if (!valor) return [];
  const vistos = new Set<string>();
  const ids: string[] = [];
  for (const parte of valor.split(/[.,\s]+/)) {
    if (!parte) continue;
    const candidatos = /^\d+$/.test(parte) ? [`f${parte}`, `f${parte.padStart(2, "0")}`] : [parte];
    const id = candidatos.find((c) => funcion(c));
    if (id && !vistos.has(id)) {
      vistos.add(id);
      ids.push(id);
    }
  }
  return ids;
}

export function rutaCompartida(ids: string[]): string {
  return `/itinerario?${PARAM_COMPARTIR}=${codificarIds(ids)}`;
}
