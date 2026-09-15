import { precio, type Funcion } from "@/lib/programa";
import s from "./Etiquetas.module.css";

export default function Etiquetas({ f, conNota = true }: { f: Funcion; conNota?: boolean }) {
  const hay = f.agotada || f.sala.aireLibre || !!f.conversatorioMin || (conNota && !!f.nota);
  if (!hay) return null;
  return (
    <ul className={s.lista}>
      {f.agotada && <li className={`${s.etiqueta} ${s.agotada}`}>Agotada</li>}
      {f.sala.aireLibre && (
        <li className={`${s.etiqueta} ${s.aire}`} title={f.sala.nota}>
          Aire libre · {precio(f)}
        </li>
      )}
      {!!f.conversatorioMin && (
        <li className={`${s.etiqueta} ${s.conversa}`}>+ {f.conversatorioMin} min de conversatorio</li>
      )}
      {conNota && f.nota && <li className={`${s.etiqueta} ${s.nota}`}>{f.nota}</li>}
    </ul>
  );
}
