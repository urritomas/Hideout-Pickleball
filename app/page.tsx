"use client";

import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";
import { FadeIn, Stagger } from "@/components/shared/motion";
import { useState, useEffect } from "react";

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
  const [currentImage, setCurrentImage] = useState(0);
  const images = ["/hideoutbanner.jpg", "/hideoutLogo.png"];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <SiteHeader
        logoSrc="/hideoutLogo.png"
        navItems={[
          { href: "/booking", label: "Book a Court", primary: true, key: "book" },
        ]}
      />

      <main className="flex-1">
        <section className="relative w-full overflow-hidden">
          <div className="relative h-screen min-h-[400px] max-h-[95vh] sm:min-h-[450px] lg:min-h-[500px]">
            {images.map((img, index) => (
              <div
                key={img}
                className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                  index === currentImage ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  backgroundImage: `url('${img}')`,
                }}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/80 to-blue-900/60" />
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 md:px-8 lg:px-12">
              <p className="inline-flex rounded-full border border-blue-200/40 bg-blue-600/30 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-blue-100 mb-3 sm:mb-4">
                Your Home for Pickleball.
              </p>
              <h1 className="font-display text-2xl font-semibold text-white leading-tight sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl max-w-3xl mx-auto">
                Outdoor pickleball booking reimagined for speed and clarity.
              </h1>
              <p className="mt-3 sm:mt-4 text-sm text-blue-200/90 sm:text-base md:text-lg max-w-2xl mx-auto">
                Reserve one of two outdoor courts in seconds with live availability, transparent pricing, and instant confirmation.
              </p>
              <div className="mt-5 sm:mt-6 flex flex-wrap gap-3 justify-center">
                <Link
                  href="/booking"
                  className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-500 shadow-lg shadow-blue-600/30 min-h-[44px] flex items-center justify-center"
                >
                  Book a Court
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Reclub Section */}
        <section className="w-full py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
          <FadeIn>
            <div className="rounded-2xl sm:rounded-3xl border border-blue-100 bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <img
                    src="/reclublogo.png"
                    alt="Reclub Logo"
                    className="h-16 w-auto mb-4 mx-auto lg:mx-0"
                  />
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 mb-3">Join our reclub</h2>
                  <p className="text-sm sm:text-base text-slate-600 mb-4">
                    Become part of our exclusive pickleball community. Get priority booking, special discounts, and exclusive event invitations.
                  </p>
                  <Link
                    href="https://reclub.co/clubs/@hideout"
                    className="inline-block rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 shadow-lg shadow-blue-600/30 min-h-[44px] flex items-center justify-center"
                  >
                    Join our reclub
                  </Link>
                </div>
                <div className="flex-1 flex justify-center">
                  <img
                    src="/reclubqr.jpg"
                    alt="Reclub QR Code"
                    className="h-48 w-48 sm:h-56 sm:w-56 rounded-2xl object-cover shadow-xl border-4 border-blue-100"
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        <section className="w-full py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto" id="pricing">
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {pricing.map((item) => (
              <FadeIn key={item.label}>
                <article className="rounded-2xl sm:rounded-3xl border border-blue-100 bg-white p-5 sm:p-6 shadow-sm transition hover:shadow-md">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">{item.label}</p>
                  <h3 className="mt-2 sm:mt-3 font-display text-2xl sm:text-3xl font-semibold text-slate-900">{item.price}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.range}</p>
                </article>
              </FadeIn>
            ))}
          </Stagger>
        </section>

        <section className="w-full pb-16 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto" id="faq">
          <Stagger>
            <div className="mb-6 sm:mb-8">
              <h2 className="font-display text-2xl sm:text-3xl font-semibold">FAQ</h2>
              <p className="mt-1 sm:mt-2 text-sm text-slate-600">Everything you need to know before your first booking.</p>
            </div>
            <FadeIn>
              <div className="rounded-2xl sm:rounded-3xl bg-white p-6 sm:p-8 md:p-10 shadow-sm ring-1 ring-slate-200">
                <div className="divide-y divide-slate-200">
                  {faqs.map((item) => (
                    <details key={item.q} className="group py-4 sm:py-5">
                      <summary className="cursor-pointer list-none font-medium text-slate-800 text-sm sm:text-base">{item.q}</summary>
                      <p className="mt-2 sm:mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            </FadeIn>
          </Stagger>
        </section>
      </main>

      <footer className="w-full border-t border-slate-200 bg-white/80">
        <div className="flex flex-col gap-2 py-6 sm:py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 max-w-7xl mx-auto">
          <p>Hideout Court and Cafe</p>
          <p>Contact: 0917-105-8580</p>
        </div>
      </footer>
    </>
  );
}