import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { business } from "@/lib/business";
import { canIndex } from "@/lib/seo";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const body = Manrope({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Lecalir Pastanesi — Güzelce, Büyükçekmece",
    template: "%s | Lecalir Pastanesi",
  },
  description:
    "Güzelce, Büyükçekmece’de tatlı bir mola. Lecalir Pastanesi’nin pastalarını, tatlılarını ve baklavalarını keşfedin; sepetinizi WhatsApp’tan iletin.",
  ...(business.siteUrl ? { metadataBase: new URL(business.siteUrl) } : {}),
  robots: { index: canIndex(), follow: true },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F7F1E7",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">
          İçeriğe geç
        </a>
        {children}
      </body>
    </html>
  );
}
