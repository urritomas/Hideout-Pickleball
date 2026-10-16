import Link from "next/link";

const footerLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/booking-policy", label: "Booking policy" },
  { href: "/court-rules", label: "Court rules" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/cookies", label: "Cookies" },
];

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-white/10 bg-[#171812] text-[#f1eee3]">
      <div className="section-shell grid gap-8 py-10 sm:py-12 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="font-display text-lg font-semibold">Hideout Court and Cafe</p>
          <p className="mt-2 max-w-md text-sm leading-6 text-[#a6a398]">
            Davao City, Philippines. Open daily from 8:00 AM to 12:00 AM, subject to venue operations.
          </p>
          <p className="mt-3 text-sm text-[#a6a398]">Support: 0917-105-8580</p>
        </div>
        <nav aria-label="Footer" className="flex max-w-xl flex-wrap gap-x-5 gap-y-3 text-sm text-[#d5d2c5]">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-[#c9d92d]">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-[#807f76]">
        Privacy and policy information is provided for review and should be confirmed by the business and legal counsel before launch.
      </div>
    </footer>
  );
}
