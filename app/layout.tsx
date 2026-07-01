import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
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
  description: "Your Home for Pickleball. Reserve one of our two indoor courts in seconds.",
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
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="relative flex min-h-screen flex-col overflow-x-hidden bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_38%,#ffffff_100%)]">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(37,99,235,0.08),rgba(96,165,250,0.08),transparent)]" />
          {children}
        </div>
      </body>
    </html>
  );
}
