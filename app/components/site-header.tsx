"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

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

const defaultBrandLabel = "Hideout Court and Cafe";

export function SiteHeader({ brandHref = "/", brandLabel = defaultBrandLabel, logoSrc = "/hideoutLogo.png", navItems = [] }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <nav className="section-shell flex h-16 items-center justify-between">
        <Link href={brandHref} className="flex items-center gap-2 font-display text-lg font-semibold text-slate-900">
          <Image src={logoSrc} alt="Hideout Pickleball" width={36} height={36} className="h-9 w-auto rounded-lg" />
          {brandLabel}
        </Link>
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={
                item.primary
                  ? "rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-300/40 transition hover:bg-blue-500 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  : "rounded-full border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle navigation menu"
          aria-expanded={mobileOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            {mobileOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
      </nav>
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="section-shell flex flex-col gap-2 py-3">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={
                  item.primary
                    ? "rounded-full bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-300/40 transition hover:bg-blue-500 min-h-[44px] flex items-center justify-center"
                    : "rounded-full border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-blue-700 transition hover:bg-blue-50 min-h-[44px] flex items-center justify-center"
                }
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
