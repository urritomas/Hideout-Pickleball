import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";

export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <>
      <SiteHeader
        brandLabel={
          <>
            <span className="rounded-lg bg-blue-600 px-2 py-1 text-white">H</span> Hideout Pickleball
          </>
        }
        navItems={[
          { href: "/booking", label: "View Schedule" },
          { href: "/booking", label: "Book a Court", primary: true },
        ]}
      />
      <main className="section-shell flex flex-1 items-center justify-center py-16">
      <section className="glass card-shadow w-full max-w-md rounded-3xl p-8">
        <h1 className="font-display text-2xl font-semibold text-slate-900">Welcome Back</h1>
        <p className="mt-1 text-sm text-slate-600">Log in to manage your reservations.</p>

        <form className="mt-6 space-y-3">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-blue-200 focus:ring-2"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-blue-200 focus:ring-2"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white shadow-md shadow-blue-200"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Need an account?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </section>
    </main>
    </>
  );
}
