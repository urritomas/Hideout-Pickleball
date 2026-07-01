"use client";

import Link from "next/link";

type NavItem = {
  href: string;
  label: string;
  primary?: boolean;
};

type SiteHeaderProps = {
  brandHref?: string;
  brandLabel?: React.ReactNode;
  navItems?: NavItem[];
};

const defaultBrandLabel = (
  <>
    <span className="rounded-lg bg-blue-600 px-2 py-1 text-white">H</span> Hideout Pickleball
  </>
);

export function SiteHeader({ brandHref = "/", brandLabel = defaultBrandLabel, navItems = [] }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <nav className="section-shell flex h-16 items-center justify-between">
        <Link href={brandHref} className="font-display text-lg font-semibold text-slate-900">
          {brandLabel}
        </Link>
        {navItems.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
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
