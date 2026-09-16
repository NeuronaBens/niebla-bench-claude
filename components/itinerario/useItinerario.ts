'use client';

import { useContext } from 'react';
import { ItinerarioContext } from './ItinerarioProvider';

export function useItinerario() {
  const ctx = useContext(ItinerarioContext);
  if (!ctx) throw new Error('useItinerario must be used within ItinerarioProvider');
  return ctx;
}
