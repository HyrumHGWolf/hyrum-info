import type { Metadata } from "next";
import { Playfair_Display, Cormorant_Garamond } from "next/font/google";
import {
  PRIMARY_NAME,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_TITLE,
  SITE_URL,
  personJsonLd,
} from "@/lib/seo";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  variable: "--font-body",
  display: "swap",
});

const STAR_FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cpath d='M16 2 L18.5 13.5 L30 16 L18.5 18.5 L16 30 L13.5 18.5 L2 16 L13.5 13.5 Z' fill='%2388b4ff'/%3E%3C/svg%3E";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s · ${PRIMARY_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [...SITE_KEYWORDS],
  authors: [
    { name: PRIMARY_NAME, url: SITE_URL },
    { name: "Hyrum Wolf", url: SITE_URL },
    { name: "Hyrum Graver", url: SITE_URL },
  ],
  creator: PRIMARY_NAME,
  publisher: PRIMARY_NAME,
  alternates: {
    canonical: "/",
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
  openGraph: {
    type: "profile",
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: PRIMARY_NAME,
    locale: "en_US",
    firstName: "Hyrum",
    lastName: "Wolf",
    username: "hyrumwolf",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    creator: "@hyrumwolf",
  },
  icons: { icon: STAR_FAVICON },
  category: "personal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = personJsonLd();
  return (
    <html lang="en" className={`${playfair.variable} ${cormorant.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
