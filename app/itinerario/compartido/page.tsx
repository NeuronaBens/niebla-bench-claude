import { Metadata } from 'next';
import { Suspense } from 'react';
import ItinerarioCompartidoShell from './shell';

export const metadata: Metadata = {
  title: 'Itinerario compartido',
};

export default function ItinerarioCompartidoPage() {
  return (
    <>
      <h1>Itinerario compartido</h1>
      <Suspense fallback={<div>Cargando...</div>}>
        <ItinerarioCompartidoShell />
      </Suspense>
    </>
  );
}
