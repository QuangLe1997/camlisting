import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "CamListing - Find the Perfect Camp for Your Child",
    template: "%s | CamListing",
  },
  description:
    "Discover and compare the best summer camps, language camps, and educational programs worldwide. Find the perfect camp experience for children of all ages.",
  keywords: [
    "summer camps",
    "language camps",
    "overnight camps",
    "day camps",
    "educational camps",
    "kids camps",
    "teen camps",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`}>
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
