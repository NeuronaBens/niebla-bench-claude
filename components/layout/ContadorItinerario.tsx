'use client';

import { useItinerario } from '@/components/itinerario/useItinerario';

export default function ContadorItinerario() {
  const { funcionesElegidas, cargado } = useItinerario();

  if (!cargado) return null;

  return (
    <span aria-label={`${funcionesElegidas.length} función${funcionesElegidas.length !== 1 ? 's' : ''} en tu itinerario`}>
      {funcionesElegidas.length > 0 && funcionesElegidas.length}
    </span>
  );
}
