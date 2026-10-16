import type { Metadata } from "next";
import { PolicyPage } from "@/app/components/policy-page";

export const metadata: Metadata = { title: "Cookie Notice", description: "Cookie and local storage notice for Hideout Pickleball." };

export default function CookiesPage() {
  return <PolicyPage
    eyebrow="Cookies"
    title="Cookie notice"
    intro="Hideout currently uses limited technical storage to operate the website. This notice should be updated if analytics, advertising, embedded media, or additional tracking is added."
    reviewNote="The owner should confirm the production cookie inventory with the final hosting, Supabase, analytics, and payment configuration, then obtain legal advice on any consent required under applicable Philippine rules."
    sections={[
      { title: "Essential session cookies", paragraphs: ["The administrative area uses an authentication session cookie. Supabase may also use cookies needed to maintain sessions. These are used to provide requested functionality and are not described as advertising cookies."] },
      { title: "Browser storage", paragraphs: ["The booking flow stores a local acknowledgment that the customer has reviewed booking rules. This value is used to avoid repeatedly showing the same notice on that browser. It does not identify the customer by itself."] },
      { title: "Analytics and advertising", paragraphs: ["No analytics or advertising service is documented in the current application audit. If tracking is added, this notice and any consent controls must be updated before activation."] },
      { title: "Managing storage", paragraphs: ["You can clear cookies and local storage through your browser settings. Clearing essential session storage may sign an administrator out or show booking notices again."] },
    ]}
  />;
}
