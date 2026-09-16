'use client';

import { codificar } from '@/lib/compartir';
import { useState } from 'react';

interface Props {
  ids: string[];
}

export default function BotonCompartir({ ids }: Props) {
  const [copiado, setCopiado] = useState(false);

  const handleCompartir = async () => {
    const url = codificar(ids);

    if (navigator.share) {
      navigator.share({ url });
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      } catch {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      }
    }
  };

  return (
    <button onClick={handleCompartir}>
      {copiado ? 'Copiado' : 'Compartir'}
    </button>
  );
}
