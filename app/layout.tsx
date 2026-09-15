import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { ItinerarioProvider } from "@/lib/almacen";
import Cabecera from "@/components/Cabecera";
import Niebla from "@/components/Niebla";
import Pie from "@/components/Pie";

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Festival de Cine Niebla · 3ª edición",
    template: "%s · Festival de Cine Niebla",
  },
  description:
    "Tres días de cine en Puerto Bruma: 15, 16 y 17 de octubre de 2026. 24 películas en 4 salas. Arma tu recorrido y compártelo.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body>
        <ItinerarioProvider>
          <Cabecera />
          <Niebla />
          <main>{children}</main>
          <Pie />
        </ItinerarioProvider>
      </body>
    </html>
  );
}
