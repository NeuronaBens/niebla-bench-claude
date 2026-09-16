import styles from './EstadoVacio.module.css';

interface Props {
  titulo: string;
  descripcion: string;
  accion?: React.ReactNode;
}

export default function EstadoVacio({ titulo, descripcion, accion }: Props) {
  return (
    <div className={styles.contenedor}>
      <h2>{titulo}</h2>
      <p>{descripcion}</p>
      {accion}
    </div>
  );
}
