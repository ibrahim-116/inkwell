import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
  weight: ["300", "400", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Inkwell",
    default: "Inkwell — Read and write to your interests",
  },
  description:
    "Inkwell is a personalised long-form writing and content discovery platform. Find articles on your interests and share your own ideas with the world.",
  keywords: ["writing", "reading", "articles", "blog", "content", "discovery"],
  openGraph: {
    type: "website",
    siteName: "Inkwell",
    title: "Inkwell — Read and write to your interests",
    description:
      "A personalised long-form writing and content discovery platform.",
    images: ["/og-default.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Inkwell — Read and write to your interests",
    description:
      "A personalised long-form writing and content discovery platform.",
  },
};

import { Providers } from "@/components/providers/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
