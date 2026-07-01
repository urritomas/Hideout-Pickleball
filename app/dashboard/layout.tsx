import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";

const links = [
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
  return (
    <main className="section-shell">
      <SiteHeader
        navItems={links.map((item) => ({ ...item, key: item.href }))}
      />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr] py-8 sm:py-10">
        <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Admin</p>
          <nav className="space-y-1">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
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
