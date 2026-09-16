import { Metadata } from 'next';
import SelectorDia from '@/components/programa/SelectorDia';
import SelectorSeccion from '@/components/programa/SelectorSeccion';
import ListaPrograma from '@/components/programa/ListaPrograma';
import RedirigirHoy from '@/components/programa/RedirigirHoy';
import { getDiasFestival } from '@/lib/datos';

export const metadata: Metadata = {
  title: 'Programa',
  description: 'Programa completo del Festival de Cine Niebla',
};

export default function ProgramaPage() {
  const dias = getDiasFestival();
  const diaDefecto = dias[0];

  return (
    <>
      <h1>Programa</h1>
      <RedirigirHoy />
      <SelectorDia diaSlugActual={diaDefecto.slug} />
      <SelectorSeccion diaSlug={diaDefecto.slug} />
      <ListaPrograma diaIndice={0} />
    </>
  );
}
