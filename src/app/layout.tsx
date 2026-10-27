import type { Metadata } from "next";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/libre-caslon-display/400.css";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/shared";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: { default: "EDEN Competitive Intelligence | Intelligence Creates Advantage", template: "%s | EDEN Competitive Intelligence" },
  description: "Independent competitive intelligence, market research, and strategic advisory. Understand your competition, anticipate change, and make informed decisions.",
  openGraph: { type: "website", siteName: "EDEN Competitive Intelligence", locale: "en_US" },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content">{children}</main><Footer /></body></html>;
}
