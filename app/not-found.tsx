import Link from "next/link";

export default function NoEncontrada() {
  return (
    <div
      className="contenedor"
      style={{ paddingBlock: "96px 40px", display: "grid", gap: 18, justifyItems: "start" }}
    >
      <p style={{ fontFamily: "var(--f-mono)", fontSize: 12, letterSpacing: "0.1em", color: "var(--sodio)" }}>
        ERROR 404
      </p>
      <h1
        style={{
          fontFamily: "var(--f-display)",
          fontSize: "clamp(56px, 14vw, 120px)",
          fontWeight: 900,
          lineHeight: 0.86,
          textTransform: "uppercase",
          color: "var(--papel)",
        }}
      >
        Aquí hay pura niebla
      </h1>
      <p style={{ fontFamily: "var(--f-serif)", fontSize: 26, color: "var(--bruma)", maxWidth: "30ch" }}>
        No encontramos esta página. Puede que el link esté mal escrito.
      </p>
      <Link
        href="/programa"
        style={{
          marginTop: 8,
          padding: "14px 22px",
          borderRadius: 999,
          background: "var(--sodio)",
          color: "var(--tinta)",
          fontWeight: 700,
        }}
      >
        Volver al programa
      </Link>
    </div>
  );
}
