import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MobileBar } from "@/components/MobileBar";
import { PwaRegister } from "@/components/PwaRegister";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

// Barlow Condensed are glifele precompuse Ș/ș și Ț/ț cu virgulă dedesubt,
// spre deosebire de Bebas Neue sau Oswald, care le compun și le desenează greșit.
const displayFont = Barlow_Condensed({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-display-face",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://retrobarbershop.ro";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Retro Barbershop — Frizerie premium în București",
    template: "%s · Retro Barbershop",
  },
  description:
    "Tuns clasic, skin fade și îngrijirea bărbii cu prosop cald. 4 locații în București, rezervare online în două clicuri. Perfecțiune. Pasiune. Tradiție.",
  applicationName: "Retro Barbershop",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Retro Barbershop",
    statusBarStyle: "black-translucent",
  },
  keywords: [
    "frizerie bucuresti", "barbershop bucuresti", "tuns barbat", "skin fade",
    "tuns barba", "frizerie Pallady", "frizerie Iancului", "frizerie Titan", "frizerie Dristor",
  ],
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: siteUrl,
    siteName: "Retro Barbershop",
    title: "Retro Barbershop — Frizerie premium în București",
    description:
      "Rezervă în două clicuri la una dintre cele 4 locații din București. Aplicația ține minte frizerul și ora ta preferată.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  name: "Retro Barbershop",
  description: "Frizerie premium în București, înființată în 2018.",
  url: siteUrl,
  email: "retrobsh@gmail.com",
  priceRange: "55–130 RON",
  openingHours: "Mo-Sa 10:00-21:00",
  areaServed: "București",
  sameAs: [
    "https://www.instagram.com/retro_barbershop_inc/",
    "https://www.tiktok.com/@retro_barbershop_inc",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" className={`${inter.variable} ${displayFont.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-brass focus:px-4 focus:py-2 focus:text-ink"
        >
          Sari la conținut
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <MobileBar />
        <PwaRegister />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
