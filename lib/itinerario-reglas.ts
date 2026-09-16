import { FuncionEnriquecida } from '@/types/festival';
import { getTrasladoMinutos } from './datos';

export interface Choque {
  tipo: 'choque';
  con: FuncionEnriquecida;
  titulo: string;
  horario: string;
}

export interface NoAlcanza {
  tipo: 'no-alcanza';
  hacia: FuncionEnriquecida;
  faltanMin: number;
  finPelicula: string;
  traslado: number;
}

export interface ConversatorioPerdido {
  tipo: 'conversatorio';
  desde: FuncionEnriquecida;
  hacia: FuncionEnriquecida;
  minutosQueVeria: number;
  conversatorioMin: number;
  traslado: number;
}

export type Aviso = Choque | NoAlcanza | ConversatorioPerdido;

export function calcularChoques(funciones: FuncionEnriquecida[]): Map<string, Aviso[]> {
  const resultado = new Map<string, Aviso[]>();

  for (let i = 0; i < funciones.length; i++) {
    for (let j = i + 1; j < funciones.length; j++) {
      const a = funciones[i];
      const b = funciones[j];

      if (a.diaIndice !== b.diaIndice) continue;

      // Choque si se solapan: B.inicio < A.fin && A.inicio < B.fin (ambas estrictas)
      if (b.inicioMin < a.finMin && a.inicioMin < b.finMin) {
        const avisoA: Choque = {
          tipo: 'choque',
          con: b,
          titulo: b.pelicula.titulo,
          horario: `${String(Math.floor(b.inicioMin / 60) % 24).padStart(2, '0')}:${String(b.inicioMin % 60).padStart(2, '0')}–${String(Math.floor(b.finMin / 60) % 24).padStart(2, '0')}:${String(b.finMin % 60).padStart(2, '0')}`,
        };
        const avisoB: Choque = {
          tipo: 'choque',
          con: a,
          titulo: a.pelicula.titulo,
          horario: `${String(Math.floor(a.inicioMin / 60) % 24).padStart(2, '0')}:${String(a.inicioMin % 60).padStart(2, '0')}–${String(Math.floor(a.finMin / 60) % 24).padStart(2, '0')}:${String(a.finMin % 60).padStart(2, '0')}`,
        };

        if (!resultado.has(a.id)) resultado.set(a.id, []);
        if (!resultado.has(b.id)) resultado.set(b.id, []);
        resultado.get(a.id)!.push(avisoA);
        resultado.get(b.id)!.push(avisoB);
      }
    }
  }

  return resultado;
}

export function calcularAvisosTraslado(funciones: FuncionEnriquecida[]): Map<string, NoAlcanza | ConversatorioPerdido> {
  const resultado = new Map<string, NoAlcanza | ConversatorioPerdido>();

  for (const funcionId of funciones.map(f => f.id)) {
    const avisoPorId = buscarAvisoTraslado(funcionId, funciones);
    if (avisoPorId) {
      resultado.set(funcionId, avisoPorId);
    }
  }

  return resultado;
}

function buscarAvisoTraslado(funcionId: string, funciones: FuncionEnriquecida[]): NoAlcanza | ConversatorioPerdido | null {
  const a = funciones.find(f => f.id === funcionId);
  if (!a) return null;

  const funcionesMismoDia = funciones
    .filter(f => f.diaIndice === a.diaIndice)
    .sort((x, y) => x.inicioMin - y.inicioMin);

  const indiceA = funcionesMismoDia.findIndex(f => f.id === a.id);

  // Buscar primera función B que no se solapa con A (B.inicio >= A.fin)
  let b: FuncionEnriquecida | null = null;
  for (let j = indiceA + 1; j < funcionesMismoDia.length; j++) {
    if (funcionesMismoDia[j].inicioMin >= a.finMin) {
      b = funcionesMismoDia[j];
      break;
    }
  }

  if (!b) return null;

  const traslado = getTrasladoMinutos(a.sala.id, b.sala.id);
  const llegada = a.finMin + traslado;

  // Aviso de traslado imposible
  if (llegada > b.inicioMin) {
    const finHoras = Math.floor(a.finMin / 60) % 24;
    const finMinutos = a.finMin % 60;
    return {
      tipo: 'no-alcanza',
      hacia: b,
      faltanMin: llegada - b.inicioMin,
      finPelicula: `${String(finHoras).padStart(2, '0')}:${String(finMinutos).padStart(2, '0')}`,
      traslado,
    };
  }

  // Aviso de conversatorio
  if (a.conversatorioMin) {
    const llegadaConConversatorio = a.finConConversatorioMin + traslado;
    if (llegadaConConversatorio > b.inicioMin) {
      const minutosQueVeria = Math.max(0, b.inicioMin - traslado - a.finMin);
      return {
        tipo: 'conversatorio',
        desde: a,
        hacia: b,
        minutosQueVeria,
        conversatorioMin: a.conversatorioMin,
        traslado,
      };
    }
  }

  return null;
}

export function obtenerResumen(funciones: FuncionEnriquecida[]): { choques: number; trasladosImpossibles: number } {
  const choques = calcularChoques(funciones);
  const trasladosMap = calcularAvisosTraslado(funciones);

  // Contar choques únicos (parejas)
  let choquesUnicos = 0;
  const yaCont = new Set<string>();
  for (const [idDueño, avisos] of choques.entries()) {
    for (const aviso of avisos) {
      if (aviso.tipo === 'choque') {
        const key = [idDueño, aviso.con.id].sort().join('|');
        if (!yaCont.has(key)) {
          choquesUnicos++;
          yaCont.add(key);
        }
      }
    }
  }

  let trasladosImpossibles = 0;
  for (const aviso of trasladosMap.values()) {
    if (aviso.tipo === 'no-alcanza') {
      trasladosImpossibles++;
    }
  }

  return { choques: choquesUnicos, trasladosImpossibles };
}
