'use client';

import { useItinerario } from '@/components/itinerario/useItinerario';
import { getFuncion } from '@/lib/datos';
import styles from './BotonItinerario.module.css';

interface Props {
  funcionId: string;
}

export default function BotonItinerario({ funcionId }: Props) {
  const { tieneFuncion, agregar, quitar, cargado } = useItinerario();
  const funcion = getFuncion(funcionId);

  if (!funcion || !cargado) return null;

  const enItinerario = tieneFuncion(funcionId);

  const manejarClick = () => {
    if (enItinerario) {
      quitar(funcionId);
    } else {
      agregar(funcionId);
    }
  };

  return (
    <button
      onClick={manejarClick}
      className={`${styles.boton} ${enItinerario ? styles.agregada : ''}`}
      aria-pressed={enItinerario}
      aria-label={enItinerario ? `Quitar ${funcion.pelicula.titulo} de mi itinerario` : `Agregar ${funcion.pelicula.titulo} a mi itinerario`}
    >
      {enItinerario ? 'Quitar' : 'Agregar'}
    </button>
  );
}
