import type { Metadata } from "next";
import { playfair, manrope, jetbrainsMono } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agenda Peluquería",
  description: "Sistema de turnos online",
  manifest: "/manifest.json",
  themeColor: "#131313",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Turnos",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${playfair.variable} ${manrope.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen font-[family-name:var(--font-manrope)] antialiased">
        {children}
      </body>
    </html>
  );
}
