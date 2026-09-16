import { Metadata } from 'next';
import SelectorDia from '@/components/programa/SelectorDia';
import SelectorSeccion from '@/components/programa/SelectorSeccion';
import ListaPrograma from '@/components/programa/ListaPrograma';
import { getDiasFestival } from '@/lib/datos';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  return getDiasFestival().map(dia => ({ dia: dia.slug }));
}

export const dynamicParams = false;

interface Props {
  params: Promise<{ dia: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dia: diaSlug } = await params;
  const dias = getDiasFestival();
  const dia = dias.find(d => d.slug === diaSlug);

  return {
    title: `Programa - ${dia?.etiqueta || 'Día'}`,
  };
}

export default async function ProgramaDiaPage({ params }: Props) {
  const { dia: diaSlug } = await params;
  const dias = getDiasFestival();
  const dia = dias.find(d => d.slug === diaSlug);

  if (!dia) notFound();

  return (
    <>
      <h1>Programa</h1>
      <SelectorDia diaSlugActual={dia.slug} />
      <SelectorSeccion diaSlug={dia.slug} />
      <ListaPrograma diaIndice={dia.indice} />
    </>
  );
}
