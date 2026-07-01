"use client";

import Link from "next/link";
import Image from "next/image";

type NavItem = {
  key: string;
  href: string;
  label: string;
  primary?: boolean;
};

type SiteHeaderProps = {
  brandHref?: string;
  brandLabel?: React.ReactNode;
  logoSrc?: string;
  navItems?: NavItem[];
};

const defaultBrandLabel = "Hideout Pickleball";

export function SiteHeader({ brandHref = "/", brandLabel = defaultBrandLabel, logoSrc = "/hideoutLogo.png", navItems = [] }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <nav className="section-shell flex h-16 items-center justify-between">
        <Link href={brandHref} className="flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
          <Image src={logoSrc} alt="Hideout Pickleball" width={36} height={36} className="h-9 w-auto rounded-lg" />
          {brandLabel}
        </Link>
        {navItems.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={
                  item.primary
                    ? "rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-300/40 transition hover:bg-blue-500"
                    : "rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50"
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
