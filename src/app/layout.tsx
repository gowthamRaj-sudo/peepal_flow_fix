import type { Metadata, Viewport } from "next";
import { BUSINESS, SITE_URL } from "@/config/business";
import { SplashLoader } from "@/components/site/splash-loader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS.name} | Plumber & Bathroom Experts in Chennai`,
    template: `%s | ${BUSINESS.name}`,
  },
  description:
    "Professional plumbing, electrical, bathroom fitting and renovation services across Chennai. 25+ years of hands-on experience. Call or request a service online.",
  applicationName: BUSINESS.name,
  icons: { icon: "/icon.png" },
  keywords: [
    "plumber chennai",
    "bathroom renovation chennai",
    "electrical services chennai",
    "water leakage repair chennai",
    "bathroom fitting OMR",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: BUSINESS.name,
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d76eb",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <SplashLoader />
        {children}
      </body>
    </html>
  );
}
