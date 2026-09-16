import { Metadata } from 'next';
import { getPeliculas, getPelicula, getFuncionesDePelicula } from '@/lib/datos';
import { formatearDuracion } from '@/lib/tiempo';
import { notFound } from 'next/navigation';
import SelloPelicula from '@/components/pelicula/SelloPelicula';
import InsigniaSeccion from '@/components/ui/InsigniaSeccion';
import FichaFuncion from '@/components/pelicula/FichaFuncion';
import BotonVolver from '@/components/pelicula/BotonVolver';
import styles from './page.module.css';

export async function generateStaticParams() {
  return getPeliculas().map(p => ({ id: p.id }));
}

export const dynamicParams = false;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const pelicula = getPelicula(id);

  if (!pelicula) return { title: 'Película no encontrada' };

  return {
    title: `${pelicula.titulo} — ${pelicula.direccion}`,
    description: pelicula.sinopsis,
  };
}

const CLASIFICACIONES: Record<string, string> = {
  'TE': 'Todo espectador',
  '+14': 'Mayores de 14 años',
  '+18': 'Mayores de 18 años',
};

const ESTRENOS: Record<string, string> = {
  'mundial': 'Estreno mundial',
  'nacional': 'Estreno nacional',
  'latinoamericano': 'Estreno latinoamericano',
};

export default async function PeliculaPage({ params }: Props) {
  const { id } = await params;
  const pelicula = getPelicula(id);

  if (!pelicula) notFound();

  const funciones = getFuncionesDePelicula(id);

  return (
    <div className={styles.contenedor}>
      <SelloPelicula
        id={pelicula.id}
        seccion={pelicula.seccion}
        duracionMin={pelicula.duracionMin}
        anio={pelicula.anio}
        tamano="grande"
      />

      <h1>{pelicula.titulo}</h1>

      {pelicula.tituloOriginal && (
        <p className={styles.original}>{pelicula.tituloOriginal}</p>
      )}

      <div className={styles.ficha}>
        <p><strong>Dirección:</strong> {pelicula.direccion}</p>
        <p><strong>País:</strong> {pelicula.pais}</p>
        <p><strong>Año:</strong> {pelicula.anio}</p>
        <p><strong>Duración:</strong> {formatearDuracion(pelicula.duracionMin)}</p>
        <p>
          <strong>Sección:</strong>{' '}
          <InsigniaSeccion id={pelicula.seccion} />
        </p>
        <p><strong>Clasificación:</strong> {CLASIFICACIONES[pelicula.clasificacion]}</p>
        <p><strong>Tipo de estreno:</strong> {ESTRENOS[pelicula.estreno]}</p>
      </div>

      <h2>Sinopsis</h2>
      <p>{pelicula.sinopsis}</p>

      <h2>Funciones</h2>
      <ul className={styles.funciones}>
        {funciones.map(f => (
          <li key={f.id}>
            <FichaFuncion funcion={f} />
          </li>
        ))}
      </ul>

      <BotonVolver />
    </div>
  );
}
