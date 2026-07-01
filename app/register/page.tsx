import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <main className="section-shell flex flex-1 items-center justify-center py-16">
      <section className="glass card-shadow w-full max-w-md rounded-3xl p-8">
        <h1 className="font-display text-2xl font-semibold text-slate-900">Create Account</h1>
        <p className="mt-1 text-sm text-slate-600">Start booking your indoor sessions at Hideout.</p>

        <form className="mt-6 space-y-3">
          <input
            type="text"
            placeholder="Full name"
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 outline-none ring-blue-200 focus:ring-2"
          />
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
            Register
          </button>
        </form>

        <p className="mt-4 text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}
