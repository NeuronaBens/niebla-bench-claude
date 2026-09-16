import type { Metadata } from "next";
import { Fraunces, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";
import NavPrincipal from "@/components/layout/NavPrincipal";
import Pie from "@/components/layout/Pie";
import SaltarAlContenido from "@/components/layout/SaltarAlContenido";
import ItinerarioProvider from "@/components/itinerario/ItinerarioProvider";

const fraunces = Fraunces({
  variable: "--fuente-titulos",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--fuente-texto",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Festival de Cine Niebla",
    template: "%s · Festival de Cine Niebla",
  },
  description: "Festival de cine de Puerto Bruma, Chile. 15-17 de octubre de 2026.",
  openGraph: {
    title: "Festival de Cine Niebla",
    description: "Festival de cine de Puerto Bruma, Chile. 15-17 de octubre de 2026.",
  },
};

interface LayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="es" className={`${fraunces.variable} ${atkinson.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body>
        <ItinerarioProvider>
          <SaltarAlContenido />
          <NavPrincipal />
          <main>{children}</main>
          <Pie />
          <div aria-live="polite" className="solo-lectura-pantalla" id="anuncios-itinerario"></div>
        </ItinerarioProvider>
      </body>
    </html>
  );
}
