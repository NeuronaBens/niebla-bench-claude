import Link from 'next/link';
import { FuncionEnriquecida } from '@/types/festival';
import { formatearHora } from '@/lib/tiempo';
import SelloPelicula from './SelloPelicula';
import InsigniaSeccion from '@/components/ui/InsigniaSeccion';
import BotonItinerario from './BotonItinerario';
import styles from './FichaFuncion.module.css';

interface Props {
  funcion: FuncionEnriquecida;
}

export default function FichaFuncion({ funcion }: Props) {
  const horaFin = funcion.cruzaMedianoche
    ? `${formatearHora(funcion.finMin)} (${funcion.diaIndice === 0 ? 'viernes' : 'sábado'})`
    : formatearHora(funcion.finMin);

  return (
    <div className={styles.ficha}>
      <div className={styles.contenido}>
        <div className={styles.fila1}>
          <span className={styles.hora}>
            {formatearHora(funcion.inicioMin)}–{horaFin}
          </span>
          <span className={styles.sala}>{funcion.sala.nombre}</span>
        </div>

        <div className={styles.fila2}>
          <div className={styles.sello}>
            <SelloPelicula
              id={funcion.pelicula.id}
              seccion={funcion.pelicula.seccion}
              duracionMin={funcion.pelicula.duracionMin}
              anio={funcion.pelicula.anio}
              tamano="chico"
            />
          </div>
          <div className={styles.titulo}>
            <Link href={`/pelicula/${funcion.pelicula.id}`}>
              {funcion.pelicula.titulo}
            </Link>
          </div>
          <div className={styles.insignia}>
            <InsigniaSeccion id={funcion.pelicula.seccion} />
          </div>
        </div>

        <div className={styles.fila3}>
          {funcion.agotada && <span className={styles.marca}>Agotada</span>}
          {funcion.sala.aireLibre && <span className={styles.marca}>Aire libre</span>}
          {funcion.conversatorioMin && (
            <span className={styles.marca}>Conversatorio ({funcion.conversatorioMin} min)</span>
          )}
          {funcion.nota && <span className={styles.marca}>Con nota</span>}
          <BotonItinerario funcionId={funcion.id} />
        </div>
      </div>
    </div>
  );
}
