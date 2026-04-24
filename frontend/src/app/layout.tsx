import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import ThemeRegistry from "@/components/ThemeRegistry";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Someday | Your Romantic Keepsake",
  description: "A private vault for your most cherished memories and future promises.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeRegistry>
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
