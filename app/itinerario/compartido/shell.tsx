'use client';

import { useSearchParams } from 'next/navigation';
import { decodificar } from '@/lib/compartir';
import ItinerarioVista from '@/components/itinerario/ItinerarioVista';

export default function ItinerarioCompartidoShell() {
  const searchParams = useSearchParams();
  const query = searchParams?.get('i');
  const ids = decodificar(query);

  return <ItinerarioVista modo="compartido" idsCompartidos={ids} />;
}
