import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import Providers from "../components/Providers";
import NextTopLoader from 'nextjs-toploader';

// Configure Next.js font loading per guide specifications
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Abita — On-Chain AI Escrow & Dispute Resolution",
  description: "Trustless freelance escrow platform powered by decentralized AI agents on Somnia Network.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#0F172A]">
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
           <NextTopLoader  color="#2563EB" height={4} showSpinner={false} shadow="none"/>
      </body>
    </html>
  );
}
