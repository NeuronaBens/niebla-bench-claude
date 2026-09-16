'use client';

import { useRouter } from 'next/navigation';

export default function BotonVolver() {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/programa');
    }
  };

  return (
    <button onClick={handleClick} style={{ marginTop: 'var(--espacio-4)' }}>
      ← Volver al programa
    </button>
  );
}
