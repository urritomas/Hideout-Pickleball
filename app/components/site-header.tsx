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
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#171812]/95 text-[#f1eee3] backdrop-blur-xl">
      <nav className="section-shell flex h-16 items-center justify-between">
        <Link href={brandHref} className="flex items-center gap-3 font-display text-base font-semibold tracking-tight text-[#f1eee3]">
          <Image src={logoSrc} alt="Hideout Pickleball" width={36} height={36} className="h-9 w-9 rounded-full object-cover" />
          <span>{brandLabel}</span>
        </Link>
        <div className="hidden md:flex items-center gap-2 sm:gap-3">
          {navItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={
                item.primary
                  ? "rounded-lg bg-[#c9d92d] px-4 py-2 text-sm font-bold text-[#171812] shadow-lg shadow-[#c9d92d]/20 transition hover:bg-[#d8e94b] min-h-[44px] min-w-[44px] flex items-center justify-center"
                  : "rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-medium text-[#f1eee3] transition hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
              }
            >
              {item.label}
            </Link>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="md:hidden rounded-lg border border-white/20 bg-transparent p-2 text-[#f1eee3] transition hover:bg-white/10 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
        <div className="md:hidden border-t border-white/10 bg-[#171812] backdrop-blur-xl">
          <div className="section-shell flex flex-col gap-2 py-3">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={
                  item.primary
                    ? "rounded-lg bg-[#c9d92d] px-4 py-3 text-sm font-bold text-[#171812] shadow-lg shadow-[#c9d92d]/20 transition hover:bg-[#d8e94b] min-h-[44px] flex items-center justify-center"
                    : "rounded-lg border border-white/20 bg-transparent px-4 py-3 text-sm font-medium text-[#f1eee3] transition hover:bg-white/10 min-h-[44px] flex items-center justify-center"
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
