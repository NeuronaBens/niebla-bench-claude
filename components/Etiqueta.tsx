import styles from "./Etiqueta.module.css";

type TipoEtiqueta = "agotada" | "aireLibre" | "conversatorio" | "estreno" | "clasificacion";

interface EtiquetaProps {
  tipo: TipoEtiqueta;
  texto: string;
  detalles?: string;
}

export default function Etiqueta({ tipo, texto, detalles }: EtiquetaProps) {
  const textoCompleto = detalles ? `${texto} ${detalles}` : texto;

  return (
    <span className={`${styles.etiqueta} ${styles[tipo]}`} title={textoCompleto}>
      {texto}
    </span>
  );
}
