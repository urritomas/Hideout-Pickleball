import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const siteUrl = "https://hideout-pickleball.local";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hideout Pickleball Club",
    template: "%s | Hideout Pickleball Club",
  },
  description: "Your Home for Pickleball. Reserve one of our two outdoor courts in seconds.",
  icons: {
    icon: "/hideoutLogo.png",
  },
  openGraph: {
    title: "Hideout Pickleball Club",
    description: "Your Home for Pickleball.",
    type: "website",
    url: siteUrl,
    siteName: "Hideout Pickleball Club",
    images: [
      {
        url: "/images/og-hideout.jpg",
        width: 1200,
        height: 630,
        alt: "Hideout Pickleball Club",
      },
    ],
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
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable}`}>
      <Script id="hideout-theme-init" strategy="beforeInteractive">
        {`(() => { try { const stored = localStorage.getItem("hideout.theme"); const theme = stored === "dark" || stored === "light" ? stored : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); document.documentElement.dataset.theme = theme; } catch {} })();`}
      </Script>
      <body className="min-h-screen bg-[var(--background)] text-[var(--foreground)] antialiased">
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[var(--background)]">
          {children}
        </div>
      </body>
    </html>
  );
}
