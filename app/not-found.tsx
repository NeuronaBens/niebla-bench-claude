import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="pagina contenedor" style={{ minHeight: "60vh" }}>
      <p className="sobreimpreso">Error 404</p>
      <h1 className="seccion-titulo">Esta página se perdió en la niebla</h1>
      <p className="seccion-sub">No encontramos lo que buscabas. Puede que el enlace esté mal escrito.</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
        <Link href="/" className="boton">
          Ir a la portada
        </Link>
        <Link href="/programa" className="boton boton--secundario">
          Ver el programa
        </Link>
      </div>
    </div>
  );
}
