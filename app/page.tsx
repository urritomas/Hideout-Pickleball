"use client";

import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import { FadeIn, Stagger } from "@/components/shared/motion";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

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
    a: "Hideout does not offer refunds. Contact support before your booking starts to request a reschedule, subject to venue approval and availability.",
  },
  {
    q: "How many courts does Hideout have?",
    a: "Hideout Pickleball Club has exactly two outdoor courts: Court 1 and Court 2.",
  },
];

const openPlayImages = [
  { src: "/hideoutbanner.jpg", alt: "Hideout Pickleball Court open play banner" },
  { src: "/openplay1.png", alt: "Hideout open play group on court" },
  { src: "/openplay2.JPG", alt: "Pickleball community group with Hideout banner" },
  { src: "/openplay4.JPG", alt: "Open play group gathered at the net" },
  { src: "/openplay5.png", alt: "Hideout players celebrating on court" },
];

export default function HomePage() {
  const [activeOpenPlayImage, setActiveOpenPlayImage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveOpenPlayImage((current) => (current + 1) % openPlayImages.length);
    }, 5000);

    return () => window.clearInterval(interval);
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
        <section className="relative overflow-hidden bg-[#171812] text-[#f1eee3]">
          <div className="brand-grid absolute inset-0 opacity-70" />
          <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
            <div className="relative z-10 max-w-2xl">
              <p className="mb-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[#c9d92d]"><span className="h-2 w-2 rounded-full bg-[#c9d92d]" /> Davao City / Philippines</p>
              <h1 className="max-w-xl font-display text-5xl font-semibold leading-[0.96] tracking-[-0.04em] sm:text-6xl lg:text-7xl">Your home court, <span className="text-[#c9d92d]">ready when you are.</span></h1>
              <p className="mt-7 max-w-lg text-base leading-7 text-[#d5d2c5] sm:text-lg">Two outdoor courts. Clear pricing. A better way to get your next rally on the calendar.</p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/booking" className="inline-flex min-h-[50px] items-center justify-center rounded-lg bg-[#c9d92d] px-6 text-sm font-bold text-[#171812] transition hover:bg-[#d8e94b]">Reserve a court <span className="ml-3 text-lg">&#8594;</span></Link>
                <a href="#pricing" className="text-sm font-semibold text-[#f1eee3] underline decoration-[#68783b] underline-offset-8 transition hover:text-[#c9d92d]">See rates</a>
              </div>
              <div className="mt-14 grid max-w-md grid-cols-3 gap-5 border-t border-white/15 pt-5">
                <div><p className="font-display text-2xl font-semibold">02</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#a6a398]">Courts</p></div>
                <div><p className="font-display text-2xl font-semibold">08-24</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#a6a398]">Open daily</p></div>
                <div><p className="font-display text-2xl font-semibold">P200</p><p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#a6a398]">From / hour</p></div>
              </div>
            </div>
            <div className="relative h-[420px] overflow-hidden bg-transparent sm:h-[500px]">
              <Image
                src="/hideout.png"
                alt="Hideout Pickleball Court logo"
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-contain object-center p-5 sm:p-8"
              />
            </div>
          </div>
        </section>

        {/* Reclub Section */}
        <section className="w-full py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
          <FadeIn>
            <div className="theme-panel border border-[#171812]/15 p-6 shadow-sm sm:p-8">
              <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                <div className="flex-1 text-center lg:text-left">
                  <Image
                    src="/reclublogo.png"
                    alt="Reclub Logo"
                    width={180}
                    height={64}
                    className="h-16 w-auto mb-4 mx-auto lg:mx-0"
                  />
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#171812] mb-3">Join our Reclub</h2>
                  <p className="text-sm sm:text-base text-slate-600 mb-4">
                    Become part of our exclusive pickleball community. Get priority booking, special discounts, and exclusive event invitations.
                  </p>
                  <Link
                    href="https://reclub.co/clubs/@hideout"
                    className="rounded-lg bg-[#68783b] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#4d5c2b] shadow-lg shadow-[#68783b]/20 min-h-[44px] flex items-center justify-center"
                  >
                    Join our reclub
                  </Link>
                </div>
                <div className="flex-1 flex justify-center">
                  <Image
                    src="/reclubqr.jpg"
                    alt="Reclub QR Code"
                    width={224}
                    height={224}
                    className="h-48 w-48 sm:h-56 sm:w-56 rounded-2xl object-cover shadow-xl border-4 border-blue-100"
                  />
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        <section className="w-full px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <FadeIn>
              <div className="mb-7 flex flex-col justify-between gap-4 sm:mb-9 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68783b]">Good people. Great dinks.</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-[#171812] sm:text-4xl">Open play at Hideout</h2>
                </div>
                <p className="max-w-md text-sm leading-6 text-slate-600">Come for the rally, stay for the community. A look at the players and open-play energy that fill our courts.</p>
              </div>
            </FadeIn>

            <div className="relative overflow-hidden border border-[#171812]/15 bg-[#171812]">
              <FadeIn>
                <div className="relative aspect-[4/3] min-h-[320px] sm:aspect-[16/8] sm:min-h-[420px] lg:aspect-[16/7]">
                  <AnimatePresence mode="sync" initial={false}>
                    <motion.div
                      key={openPlayImages[activeOpenPlayImage].src}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={openPlayImages[activeOpenPlayImage].src}
                        alt={openPlayImages[activeOpenPlayImage].alt}
                        fill
                        sizes="100vw"
                        className={activeOpenPlayImage === 0 ? "object-contain object-center" : "object-cover object-center"}
                      />
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171812]/85 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 px-5 pb-5 pt-20 text-[#f1eee3] sm:px-7 sm:pb-7">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c9d92d]">The Hideout community</p>
                      <p className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Play. Connect. Compete. Relax.</p>
                    </div>
                    <div className="flex shrink-0 gap-1.5" aria-label="Open play gallery progress">
                      {openPlayImages.map((image, index) => (
                        <button
                          key={image.src}
                          type="button"
                          onClick={() => setActiveOpenPlayImage(index)}
                          aria-label={`Show open play image ${index + 1}`}
                          className={`h-1.5 transition-all ${index === activeOpenPlayImage ? "w-7 bg-[#c9d92d]" : "w-1.5 bg-white/60"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>

        <section className="w-full py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto" id="pricing">
          <Stagger className="grid gap-4 sm:grid-cols-2">
            {pricing.map((item) => (
              <FadeIn key={item.label}>
                <article className="theme-elevated border border-[#171812]/15 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#68783b]">{item.label}</p>
                  <h3 className="mt-2 sm:mt-3 font-display text-2xl sm:text-3xl font-semibold text-[#171812]">{item.price}</h3>
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
              <div className="theme-elevated border border-[#171812]/15 p-6 shadow-sm sm:p-8 md:p-10">
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

      <SiteFooter />
    </>
  );
}