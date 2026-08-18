import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "IBEMACASA · Control de fábrica",
    description: "Almacén, kardex, asistencia y rendición de compras de IBEMACASA.",
    icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
    openGraph: { title: "IBEMA HOME · Control de fábrica", description: "Almacén, kardex, asistencia y rendición de compras." },
    twitter: { card: "summary", title: "IBEMA HOME · Control de fábrica", description: "Almacén, kardex, asistencia y rendición de compras." },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>{children}</body>
    </html>
  );
}
