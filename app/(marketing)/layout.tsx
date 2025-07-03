import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import Navigation from "../../src/components/Navigation";
import Footer from "./components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Scanen - Landing Page",
  description: "A modern landing page built with Next.js and Builder.io",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/scanenicon.svg" type="image/svg+xml" />
      </head>
      <body className={inter.className}>
        <Navigation />
        {children}
        <Footer />
      </body>
    </html>
  );
}
