import { Metadata } from 'next';
import { Suspense } from 'react';
import ItinerarioVista from '@/components/itinerario/ItinerarioVista';

export const metadata: Metadata = {
  title: 'Mi itinerario',
  description: 'Tu itinerario del Festival de Cine Niebla',
};

export default function ItinerarioPage() {
  return (
    <>
      <h1>Mi itinerario</h1>
      <Suspense fallback={<div>Cargando...</div>}>
        <ItinerarioVista modo="propio" />
      </Suspense>
    </>
  );
}
