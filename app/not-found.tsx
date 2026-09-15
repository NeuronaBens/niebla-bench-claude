import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Página no encontrada",
};

export default function NoEncontrada() {
  return (
    <div className="contenedor" style={{ paddingBlock: "var(--esp-8)", maxWidth: "40rem" }}>
      <p className="etiqueta" style={{ color: "var(--faro)" }}>
        Error 404
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--paso4)",
          fontVariationSettings: '"opsz" 144',
          lineHeight: 1.05,
          margin: "var(--esp-3) 0 var(--esp-4)",
        }}
      >
        Esta página se perdió en la niebla
      </h1>
      <p style={{ color: "var(--niebla-200)", marginBottom: "var(--esp-6)" }}>
        No encontramos lo que buscabas. Puede que el link esté mal escrito o que la película ya no esté en el
        programa.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--esp-3)" }}>
        <Link href="/programa" className="boton boton--primario">
          Ver el programa
        </Link>
        <Link href="/" className="boton boton--fantasma">
          Ir a la portada
        </Link>
      </div>
    </div>
  );
}
