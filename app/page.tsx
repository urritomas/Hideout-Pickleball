import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";
import { FadeIn, Stagger } from "@/components/shared/motion";
import Image from "next/image";

const whyChooseUs = [
  {
    title: "Tournament-grade outdoor courts",
    description: "Consistent bounce, premium surfaces, and climate-controlled comfort year-round.",
  },
  {
    title: "Live booking intelligence",
    description: "Instant slot visibility with transparent rates and clear status colors.",
  },
  {
    title: "Community-first environment",
    description: "Built for social rallies, coaching sessions, and competitive players alike.",
  },
];

const pricing = [
  {
    label: "Morning to Late Afternoon",
    range: "8:00 AM - 5:00 PM",
    price: "PHP 200",
  },
  {
    label: "Evening to Midnight",
    range: "5:00 PM - 12:00 AM",
    price: "PHP 300",
  },
];

const faqs = [
  {
    q: "How far ahead can I book?",
    a: "Bookings can be made up to 30 days in advance, subject to slot availability.",
  },
  {
    q: "Can I cancel my booking?",
    a: "Yes. You can cancel from your profile bookings page and policy settings will apply.",
  },
  {
    q: "How many courts does Hideout have?",
    a: "Hideout Pickleball Club has exactly two outdoor courts: Court 1 and Court 2.",
  },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader
        logoSrc="/hideoutLogo.png"
        navItems={[
          { href: "/booking", label: "View Schedule", key: "schedule" },
          { href: "/booking", label: "Book a Court", primary: true, key: "book" },
        ]}
      />

      <main className="flex-1">
        <section className="section-shell py-12 sm:py-16">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-slate-900 text-white card-shadow sm:p-14">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(96,165,250,0.32),transparent_38%)]" />
              <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div className="space-y-6">
                  <p className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100">
                    Your Home for Pickleball.
                  </p>
                  <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                    Outdoor pickleball booking reimagined for speed and clarity.
                  </h1>
                  <p className="max-w-2xl text-sm text-blue-100/90 sm:text-base">
                    Reserve one of two outdoor courts in seconds with live availability, transparent pricing, and instant confirmation.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/booking"
                      className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-400"
                    >
                      Book a Court
                    </Link>
                    <Link
                      href="/booking"
                      className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                    >
                      View Schedule
                    </Link>
                  </div>
                </div>
                <div className="hidden lg:flex items-center justify-center">
                  <Image
                    src="/hideout.png"
                    alt="Hideout Pickleball"
                    width={320}
                    height={320}
                    className="h-56 w-auto rounded-3xl border border-white/20 bg-white/10 p-4 shadow-xl backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        <section className="section-shell pb-16" id="about">
          <Stagger className="grid gap-4 md:grid-cols-3">
            {whyChooseUs.map((feature) => (
              <FadeIn key={feature.title}>
                <article className="glass card-shadow rounded-2xl p-6">
                  <h2 className="font-display text-xl font-semibold text-slate-900">{feature.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{feature.description}</p>
                </article>
              </FadeIn>
            ))}
          </Stagger>
        </section>

        <section className="section-shell pb-16" id="pricing">
          <div className="grid gap-4 md:grid-cols-2">
            {pricing.map((item) => (
              <article key={item.label} className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">{item.label}</p>
                <h3 className="mt-3 font-display text-3xl font-semibold text-slate-900">{item.price}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.range}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="section-shell pb-20" id="faq">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 sm:p-10">
            <div className="max-w-2xl">
              <h2 className="font-display text-3xl font-semibold">FAQ</h2>
              <p className="mt-2 text-sm text-slate-600">Everything you need to know before your first booking.</p>
            </div>
            <div className="mt-8 divide-y divide-slate-200">
              {faqs.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="cursor-pointer list-none font-medium text-slate-800">{item.q}</summary>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/80">
        <div className="section-shell flex flex-col gap-2 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>Hideout Pickleball Club</p>
          <p>Contact: hello@hideoutpickleball.club</p>
        </div>
      </footer>
    </>
  );
}
