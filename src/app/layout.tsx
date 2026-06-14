import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { getSiteUrl } from "@/lib/seo";
import { SITE } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const siteUrl = getSiteUrl();
const siteTitle = `${SITE.professionalName} · Psicología`;
const siteDescription = `${SITE.professionalName}, ${SITE.professionalTitle}. Atención psicológica para adultos y adolescentes en ${SITE.city}, presencial y online. Reserva tu hora.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s · ${SITE.professionalName}`,
  },
  description: siteDescription,
  applicationName: siteTitle,
  authors: [{ name: SITE.professionalName }],
  creator: SITE.professionalName,
  publisher: SITE.professionalName,
  keywords: [
    "psicóloga",
    "psicología",
    "psicoterapia",
    "terapia psicológica",
    "atención psicológica",
    "psicóloga adultos",
    "psicóloga adolescentes",
    "psicóloga Santiago",
    "terapia online Chile",
    "salud mental Chile",
    "Natalia Anton Klickmann",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "es_CL",
    url: "/",
    siteName: siteTitle,
    title: siteTitle,
    description: siteDescription,
  },
  twitter: {
    card: "summary",
    title: siteTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
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
