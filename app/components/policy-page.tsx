import Link from "next/link";
import { SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";

type PolicySection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type PolicyPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  sections: PolicySection[];
  reviewNote?: string;
};

export function PolicyPage({ eyebrow, title, intro, sections, reviewNote }: PolicyPageProps) {
  return (
    <>
      <SiteHeader navItems={[{ href: "/booking", label: "Book a Court", primary: true, key: "book" }]} />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <Link href="/" className="text-sm font-semibold text-[#68783b] transition hover:text-[#4d5c2b]">&#8592; Back to Hideout</Link>
          <header className="theme-border mt-8 border-b pb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#68783b]">{eyebrow}</p>
            <h1 className="theme-text-primary mt-3 max-w-3xl font-display text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{title}</h1>
            <p className="theme-text-secondary mt-5 max-w-3xl text-base leading-7">{intro}</p>
          </header>

          {reviewNote && (
            <aside className="theme-panel mt-8 border-l-4 border-[#c9d92d] px-5 py-4 text-sm leading-6">
              <strong>Owner review needed:</strong> {reviewNote}
            </aside>
          )}

          <div className="mt-10 space-y-10">
            {sections.map((section) => (
              <section key={section.title} className="theme-border border-b pb-8 last:border-b-0">
                <h2 className="theme-text-primary font-display text-2xl font-semibold">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="theme-text-secondary mt-4 text-sm leading-7">{paragraph}</p>
                ))}
                {section.items && (
                  <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-700">
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <div className="theme-border mt-10 flex flex-wrap gap-3 border-t pt-8">
            <Link href="/booking" className="rounded-lg bg-[#68783b] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#4d5c2b]">Book a court</Link>
            <Link href="/contact" className="theme-text-primary theme-border rounded-lg border px-5 py-3 text-sm font-semibold transition hover:bg-[var(--surface-muted)]">Contact support</Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
