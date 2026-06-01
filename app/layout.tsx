import type { Metadata } from "next";
import { Literata, Outfit } from "next/font/google";
import "./globals.css";
import { AnalyticsListener } from "@/components/AnalyticsListener";
import { AnalyticsScripts } from "@/components/AnalyticsScripts";
import { BreadcrumbBar } from "@/components/BreadcrumbBar";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { GOOGLE_SITE_VERIFICATION, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/constants";
import { getLocaleFromCookie } from "@/lib/i18n-server";
import { DEFAULT_SITE_KEYWORDS } from "@/lib/seo";

const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  preload: true,
});

const literata = Literata({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-serif",
  weight: ["400", "600", "700"],
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | San Antonio de Benagéber, Valencia`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [...DEFAULT_SITE_KEYWORDS],
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
  ...(GOOGLE_SITE_VERIFICATION
    ? { verification: { google: GOOGLE_SITE_VERIFICATION } }
    : {}),
  openGraph: {
    title: `${SITE_NAME} | Noticias e información de San Antonio de Benagéber`,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "es_ES",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | San Antonio de Benagéber`,
    description: SITE_DESCRIPTION,
  },
  category: "news",
  formatDetection: {
    telephone: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = getLocaleFromCookie();

  return (
    <html lang={locale === "val" ? "ca" : "es"} className={`${outfit.variable} ${literata.variable}`}>
      <body className={`min-h-screen font-sans ${outfit.className}`}>
        <AnalyticsScripts />
        <AnalyticsListener />
        <div className="flex min-h-screen flex-col">
          <Header />
          <BreadcrumbBar locale={locale} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
