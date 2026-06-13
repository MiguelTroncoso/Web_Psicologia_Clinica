import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Natalia Anton Klickmann · Psicología",
  description:
    "Natalia Anton Klickmann, Licenciada en Psicología. Atención psicológica para adultos y adolescentes, presencial y online. Reserva tu hora.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Natalia Anton · Psicología",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-zinc-50 text-zinc-900">{children}</body>
    </html>
  );
}
