import type { Metadata, Viewport } from "next";
import { Big_Shoulders, IBM_Plex_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import Navegacion from "@/components/Navegacion";
import PieDePagina from "@/components/PieDePagina";
import "./globals.css";

const display = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "sans-serif"],
});

const texto = Instrument_Sans({
  variable: "--font-texto",
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin", "latin-ext"],
  weight: "400",
  style: ["normal", "italic"],
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Festival de Cine Niebla · 15, 16 y 17 de octubre · Puerto Bruma",
    template: "%s · Festival Niebla",
  },
  description:
    "Tercera edición del Festival de Cine Niebla en Puerto Bruma: 24 películas en 4 salas, del jueves 15 al sábado 17 de octubre de 2026.",
};

export const viewport: Viewport = {
  themeColor: "#0b131a",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-CL"
      className={`${display.variable} ${texto.variable} ${serif.variable} ${mono.variable}`}
    >
      <body>
        <a href="#contenido" className="saltar">
          Saltar al contenido
        </a>
        <Navegacion />
        <main id="contenido">{children}</main>
        <PieDePagina />
      </body>
    </html>
  );
}
