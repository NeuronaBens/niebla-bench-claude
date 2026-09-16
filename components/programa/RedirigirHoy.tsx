'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerHoyEnChile, obtenerDiasFestival } from '@/lib/tiempo';

export default function RedirigirHoy() {
  const router = useRouter();

  useEffect(() => {
    const hoyStr = obtenerHoyEnChile();
    const dias = obtenerDiasFestival('2026-10-15', '2026-10-17');

    const diaHoy = dias.find(d => d.fecha === hoyStr);
    if (diaHoy && diaHoy.indice !== 0) {
      router.replace(`/programa/${diaHoy.slug}`);
    }
  }, [router]);

  return null;
}
