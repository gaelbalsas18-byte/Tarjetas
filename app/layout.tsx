
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tarjetas Digitales",
  description:
    "Tarjetas digitales de contacto de nuestros vendedores.",
  applicationName: "Balsas Dental",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Tarjetas",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/Balsas.png", sizes: "192x192", type: "image/png" },
      { url: "/Balsas.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/Balsas.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#142b45",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
