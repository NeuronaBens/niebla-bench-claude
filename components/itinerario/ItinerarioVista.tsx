'use client';

import { useRouter } from 'next/navigation';
import { useItinerario } from './useItinerario';
import { getFuncion, getFunciones, getDiasFestival } from '@/lib/datos';
import { calcularChoques, calcularAvisosTraslado, obtenerResumen } from '@/lib/itinerario-reglas';
import { formatearHora } from '@/lib/tiempo';
import Link from 'next/link';
import SelloPelicula from '@/components/pelicula/SelloPelicula';
import AvisoInline from '@/components/ui/AvisoInline';
import EstadoVacio from '@/components/ui/EstadoVacio';
import BotonCompartir from './BotonCompartir';
import styles from './ItinerarioVista.module.css';

interface Props {
  modo?: 'propio' | 'compartido';
  idsCompartidos?: string[];
}

export default function ItinerarioVista({ modo = 'propio', idsCompartidos }: Props) {
  const router = useRouter();
  const { funcionesElegidas, disponible, cargado, vaciar, agregar, quitar, tieneFuncion } = useItinerario();
  const ids = modo === 'compartido' && idsCompartidos ? idsCompartidos : funcionesElegidas;

  if (!cargado) return null;

  const funcionesTemp = ids
    .map(id => getFuncion(id))
    .filter(f => f !== undefined)
    .sort((a, b) => a!.inicioMin - b!.inicioMin);
  const funciones = funcionesTemp as ReturnType<typeof getFunciones>;

  if (funciones.length === 0) {
    if (modo === 'compartido') {
      return (
        <EstadoVacio
          titulo="Este link no tiene funciones válidas"
          descripcion="Las funciones no están disponibles o el link está vacío."
          accion={<Link href="/programa">Ver programa</Link>}
        />
      );
    }
    return (
      <EstadoVacio
        titulo="Tu itinerario está vacío"
        descripcion="Aún no has agregado ninguna función. Explora el programa y marca las que quieras ver."
        accion={<Link href="/programa">Ver programa</Link>}
      />
    );
  }

  const avisos = calcularChoques(funciones);
  const avisosTraslado = calcularAvisosTraslado(funciones);
  const resumen = obtenerResumen(funciones);

  // Agrupar por día
  const porDia = new Map<number, typeof funciones>();
  funciones.forEach(f => {
    if (!porDia.has(f.diaIndice)) porDia.set(f.diaIndice, []);
    porDia.get(f.diaIndice)!.push(f);
  });

  const dias = getDiasFestival();

  const handleCompartir = () => {
    const idsNoEnPropio = idsCompartidos?.filter(id => !tieneFuncion(id)) || [];
    idsNoEnPropio.forEach(id => agregar(id));
    router.push('/itinerario');
  };

  return (
    <div className={styles.contenedor}>
      {!disponible && (
        <div className={styles.aviso} style={{ backgroundColor: 'rgba(255, 138, 128, 0.15)', border: '1px solid #ff8a80' }}>
          <strong>Nota:</strong> No pudimos guardar tu itinerario en este navegador. Se perderá al cerrar la pestaña.
        </div>
      )}

      <div className={styles.resumen}>
        <span>
          {funciones.length} {funciones.length === 1 ? 'función' : 'funciones'}
          {resumen.choques > 0 && ` • ${resumen.choques} choque${resumen.choques !== 1 ? 's' : ''}`}
          {resumen.trasladosImpossibles > 0 && ` • ${resumen.trasladosImpossibles} traslado${resumen.trasladosImpossibles !== 1 ? 's imposibles' : ' imposible'}`}
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {modo === 'compartido' && (
            <button onClick={handleCompartir} disabled={(idsCompartidos?.filter(id => !tieneFuncion(id)) || []).length === 0}>
              Sumar {(idsCompartidos?.filter(id => !tieneFuncion(id)) || []).length} función{(idsCompartidos?.filter(id => !tieneFuncion(id)) || []).length !== 1 ? 'es' : ''} a mi itinerario
            </button>
          )}
          {modo === 'propio' && <BotonCompartir ids={ids} />}
        </div>
      </div>

      <div className={styles.itinerario}>
        {Array.from(porDia.entries()).map(([diaIndice, funcionesDelDia]) => (
          <div key={diaIndice} className={styles.dia}>
            <h3>{dias[diaIndice]?.etiqueta || `Día ${diaIndice}`}</h3>
            <ul className={styles.lista}>
              {funcionesDelDia.map(f => (
                <li key={f.id} className={styles.funcion}>
                  <div className={styles.sello}>
                    <SelloPelicula
                      id={f.pelicula.id}
                      seccion={f.pelicula.seccion}
                      duracionMin={f.pelicula.duracionMin}
                      anio={f.pelicula.anio}
                      tamano="chico"
                    />
                  </div>
                  <div className={styles.datos}>
                    <h4>
                      <Link href={`/pelicula/${f.pelicula.id}`}>{f.pelicula.titulo}</Link>
                    </h4>
                    <p className={styles.detalles}>{f.sala.nombre}</p>
                    <p className={styles.detalles}>{formatearHora(f.inicioMin)}–{formatearHora(f.finMin)}</p>
                    {f.conversatorioMin && <p className={styles.detalles}>Conversatorio: {f.conversatorioMin} min</p>}
                    {avisos.get(f.id)?.map((aviso, i) => (
                      <AvisoInline key={`aviso-choque-${i}`} aviso={aviso} />
                    ))}
                    {avisosTraslado.get(f.id) && (
                      <AvisoInline aviso={avisosTraslado.get(f.id)!} />
                    )}
                  </div>
                  {modo === 'propio' && (
                    <button className={styles.quitar} onClick={() => quitar(f.id)}>Quitar</button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {modo === 'propio' && (
        <button onClick={() => {
          if (confirm('¿Vaciar itinerario?')) {
            vaciar();
          }
        }} style={{ marginTop: 'var(--espacio-4)' }}>
          Vaciar itinerario
        </button>
      )}

      {modo === 'compartido' && (
        <div style={{ marginTop: 'var(--espacio-4)', textAlign: 'center' }}>
          <Link href="/programa">Ver programa</Link>
        </div>
      )}
    </div>
  );
}
