"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/bookings", label: "Today's Bookings" },
  { href: "/dashboard/courts", label: "Courts" },
  { href: "/dashboard/users", label: "Users" },
  { href: "/dashboard/revenue", label: "Revenue" },
  { href: "/dashboard/payments", label: "Payments" },
  { href: "/dashboard/adminConfirmation", label: "Confirm Bookings" },
  { href: "/dashboard/calendar", label: "Calendar" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="section-shell">
      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
          aria-label="Toggle sidebar menu"
          aria-expanded={sidebarOpen}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
            {sidebarOpen ? (
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
        <span className="font-display text-lg font-semibold text-slate-900">Admin Panel</span>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div className="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-semibold text-slate-900">Admin Panel</span>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close sidebar menu"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <nav className="mt-4 space-y-1">
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 min-h-[44px] flex items-center"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] py-6 sm:py-8 md:py-10">
        <aside className="hidden lg:block h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Admin</p>
          <nav className="space-y-1">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700 min-h-[44px] flex items-center"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <section>{children}</section>
      </div>
    </main>
  );
}