import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Cabecera } from "@/components/Cabecera";
import { Pie } from "@/components/Pie";
import { festival } from "@/lib/datos";
import { rangoFechas } from "@/lib/tiempo";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${festival.nombre} · ${festival.edicion}ª edición`,
    template: `%s · ${festival.nombre}`,
  },
  description: `${festival.edicion}ª edición del ${festival.nombre} en ${festival.ciudad}: ${rangoFechas()}. Programa, fichas y tu propio itinerario.`,
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${instrument.variable} ${plexMono.variable}`}>
      <body>
        <Cabecera />
        <main id="contenido">{children}</main>
        <Pie />
      </body>
    </html>
  );
}
