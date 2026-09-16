import { Metadata } from 'next';
import SelectorDia from '@/components/programa/SelectorDia';
import SelectorSeccion from '@/components/programa/SelectorSeccion';
import ListaPrograma from '@/components/programa/ListaPrograma';
import { getDiasFestival, getSecciones } from '@/lib/datos';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  const dias = getDiasFestival();
  const secciones = getSecciones();

  return dias.flatMap(dia =>
    secciones.map(sec => ({ dia: dia.slug, seccion: sec.id }))
  );
}

export const dynamicParams = false;

interface Props {
  params: Promise<{ dia: string; seccion: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dia: diaSlug, seccion: seccionId } = await params;
  const dias = getDiasFestival();
  const secciones = getSecciones();
  const dia = dias.find(d => d.slug === diaSlug);
  const seccion = secciones.find(s => s.id === seccionId);

  return {
    title: `${seccion?.nombre || ''} - ${dia?.etiqueta || ''}`,
  };
}

export default async function ProgramaDiaSeccionPage({ params }: Props) {
  const { dia: diaSlug, seccion: seccionId } = await params;
  const dias = getDiasFestival();
  const secciones = getSecciones();
  const dia = dias.find(d => d.slug === diaSlug);
  const seccion = secciones.find(s => s.id === seccionId);

  if (!dia || !seccion) notFound();

  return (
    <>
      <h1>Programa</h1>
      <SelectorDia diaSlugActual={dia.slug} seccionActual={seccion.id} />
      <SelectorSeccion diaSlug={dia.slug} seccionActual={seccion.id} />
      <ListaPrograma diaIndice={dia.indice} seccionId={seccion.id} />
    </>
  );
}
