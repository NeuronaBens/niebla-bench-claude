import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        maxWidth: "1120px",
        margin: "0 auto",
        padding: "var(--espacio-2xl) var(--espacio-lg)",
        textAlign: "center",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "var(--espacio-2xl)",
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "var(--fuente-titulo)",
            fontSize: "clamp(2rem, 10vw, 3.5rem)",
            fontWeight: 700,
            marginBottom: "var(--espacio-lg)",
            color: "var(--niebla)",
          }}
        >
          Esta página se perdió en la niebla
        </h1>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--niebla-2)",
            marginBottom: "var(--espacio-lg)",
          }}
        >
          No encontramos lo que buscabas, pero el festival sigue en pie.
        </p>
      </div>

      <Link
        href="/"
        style={{
          display: "inline-block",
          padding: "var(--espacio-md) var(--espacio-lg)",
          background: "var(--faro)",
          color: "var(--fondo)",
          fontWeight: 600,
          borderRadius: "var(--radio-lg)",
          textDecoration: "none",
          fontSize: "1rem",
        }}
      >
        Volver a la portada
      </Link>
    </div>
  );
}
