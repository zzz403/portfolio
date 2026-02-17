import type { Metadata } from "next";
import { Geist, Geist_Mono, EB_Garamond, Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "August Zheng — AI Infrastructure Engineer",
    template: "%s — August",
  },
  description:
    "Engineering the infrastructure for reliable intelligence. Focusing on performance, scalability, and system integrity.",
  keywords: [
    "August Zheng",
    "AI Infrastructure",
    "Software Engineer",
    "LLM Systems",
    "University of Toronto",
    "Portfolio",
  ],
  authors: [{ name: "August Zheng" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "August Zheng — AI Infrastructure Engineer",
    description:
      "Engineering the infrastructure for reliable intelligence. Focusing on performance, scalability, and system integrity.",
    siteName: "August Zheng",
  },
  twitter: {
    card: "summary",
    title: "August Zheng — AI Infrastructure Engineer",
    description:
      "Engineering the infrastructure for reliable intelligence. Focusing on performance, scalability, and system integrity.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${ebGaramond.variable} antialiased`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
