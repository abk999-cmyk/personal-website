import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { SmoothScroll } from "@/components/providers/smooth-scroll";
import { SiteNav } from "@/components/nav/site-nav";
import { CommandPalette } from "@/components/nav/command-palette";
import { Footer } from "@/components/layout/footer";
import { profile } from "@/content/profile";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });

const description =
  "AI engineer in Boston. Agents, optimisation and evolutionary systems: a Battleship engine that beats the 2011 record, a MILP scheduler for a cardiovascular service line, long-term memory for a commercial agent.";

export const metadata: Metadata = {
  metadataBase: new URL(profile.links.site),
  title: { default: `${profile.name} — AI Engineer`, template: `%s — ${profile.name}` },
  description,
  openGraph: {
    type: "website",
    url: profile.links.site,
    siteName: profile.name,
    title: `${profile.name} — AI Engineer`,
    description,
  },
  twitter: { card: "summary_large_image", title: `${profile.name} — AI Engineer`, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${syne.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="bg-ink text-text antialiased">
        <SmoothScroll />
        <SiteNav />
        <CommandPalette />
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
