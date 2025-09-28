import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";

import { PageTransitionProvider } from "@/components/layout/page-transition-provider";
import { VoiceflowWidget } from "@/components/integrations/voiceflow-widget";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "Abhinav Karthik · AI Engineer",
  description: "An elegant, extensible digital home for Abhinav's experiments in AI engineering and design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
      >
        <VoiceflowWidget />
        <div className="app-shell">
          <PageTransitionProvider>{children}</PageTransitionProvider>
        </div>
      </body>
    </html>
  );
}
