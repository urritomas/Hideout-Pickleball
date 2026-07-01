import type { Metadata } from "next";
import { SiteHeader } from "@/app/components/site-header";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <>
      <SiteHeader
        navItems={[
          { href: "/booking", label: "View Schedule", key: "schedule" },
          { href: "/booking", label: "Book a Court", primary: true, key: "book" },
        ]}
      />
      <main className="section-shell py-10 sm:py-14">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-3xl font-semibold text-slate-900">Profile</h1>
        <p className="mt-1 text-sm text-slate-600">Update your details and review booking history.</p>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-display text-lg font-semibold text-slate-900">Account Details</h2>
            <div className="mt-4 grid gap-3">
              <input
                defaultValue="Player Name"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-blue-200 focus:ring-2"
              />
              <input
                defaultValue="player@email.com"
                className="rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-blue-200 focus:ring-2"
              />
              <button className="w-fit rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white">Save Changes</button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="font-display text-lg font-semibold text-slate-900">Booking History</h2>
            <p className="mt-2 text-sm text-slate-600">No completed bookings yet.</p>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}
