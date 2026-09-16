import { Metadata } from 'next';
import Link from 'next/link';
import EstadoVacio from '@/components/ui/EstadoVacio';

export const metadata: Metadata = {
  title: 'Página no encontrada',
};

export default function NotFound() {
  return (
    <EstadoVacio
      titulo="Página no encontrada"
      descripcion="Lo sentimos, la página que buscas no existe."
      accion={
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/">Ir a portada</Link>
          <Link href="/programa">Ver programa</Link>
        </div>
      }
    />
  );
}
