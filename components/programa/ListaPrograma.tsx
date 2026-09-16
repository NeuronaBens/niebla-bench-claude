import { getFuncionesDeDia, getSalas, getDiasFestival } from '@/lib/datos';
import FichaFuncion from '@/components/pelicula/FichaFuncion';
import EstadoVacio from '@/components/ui/EstadoVacio';
import Link from 'next/link';
import styles from './ListaPrograma.module.css';

interface Props {
  diaIndice: number;
  seccionId?: string;
}

export default function ListaPrograma({ diaIndice, seccionId }: Props) {
  const dias = getDiasFestival();
  const dia = dias[diaIndice];

  let funciones = getFuncionesDeDia(diaIndice);
  if (seccionId) {
    funciones = funciones.filter(f => f.pelicula.seccion === seccionId);
  }

  if (funciones.length === 0) {
    return (
      <EstadoVacio
        titulo="Sin funciones"
        descripcion="No hay funciones en esta combinación de día y sección."
        accion={<Link href={`/programa/${dia.slug}`}>Ver todas las secciones</Link>}
      />
    );
  }

  // Vista móvil: lista simple
  const listaSimple = (
    <ul className={styles.lista}>
      {funciones.map(f => (
        <li key={f.id}>
          <FichaFuncion funcion={f} />
        </li>
      ))}
    </ul>
  );

  // Vista escritorio: grilla por salas
  const salas = getSalas();
  const funcionesPorSala = Object.fromEntries(salas.map(s => [s.id, [] as typeof funciones]));
  funciones.forEach(f => {
    if (f.sala.id in funcionesPorSala) {
      funcionesPorSala[f.sala.id].push(f);
    }
  });

  const grilla = (
    <div className={styles.grilla}>
      {salas.map(sala => (
        <div key={sala.id} className={styles.columna}>
          <h3>{sala.nombre}</h3>
          <ul className={styles.listaColumna}>
            {funcionesPorSala[sala.id].map(f => (
              <li key={f.id}>
                <FichaFuncion funcion={f} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div className={styles.desktopOnly}>{grilla}</div>
      <div className={styles.mobileOnly}>{listaSimple}</div>
    </>
  );
}
