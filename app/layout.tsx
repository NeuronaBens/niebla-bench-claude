import type { Metadata, Viewport } from "next";
import { Big_Shoulders, IBM_Plex_Mono, Instrument_Sans } from "next/font/google";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { rangoFechas } from "@/components/portada/derivados";
import { dias, festival, peliculas, salas } from "@/lib/programa";
import "./globals.css";

const display = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  adjustFontFallback: false,
});

const texto = Instrument_Sans({
  variable: "--font-texto",
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const primerDia = dias[0];
const ultimoDia = dias[dias.length - 1];
const anio = festival.fechaInicio.slice(0, 4);

export const metadata: Metadata = {
  title: {
    default: `${festival.nombre} · ${festival.ciudad} · ${primerDia.numero} al ${ultimoDia.numero} de ${ultimoDia.mes} ${anio}`,
    template: `%s · ${festival.nombre}`,
  },
  description: `${festival.edicion}ª edición del ${festival.nombre} en ${festival.ciudad}: ${peliculas.length} películas en ${salas.length} salas, del ${rangoFechas}. Programa completo y tu propio itinerario.`,
};

export const viewport: Viewport = {
  themeColor: "#0c141c",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-CL" className={`${display.variable} ${texto.variable} ${mono.variable}`}>
      <body>
        <SiteHeader />
        <main id="contenido">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
