import type { Metadata } from "next";
import { PolicyPage } from "@/app/components/policy-page";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Hideout Pickleball handles booking and payment information." };

export default function PrivacyPage() {
  return <PolicyPage
    eyebrow="Privacy"
    title="Privacy Policy"
    intro="This draft explains the personal information Hideout Pickleball may collect when you browse, make a booking, contact support, or submit payment evidence. It is written for a business operating in the Philippines and requires owner and legal review before publication."
    reviewNote="Replace the bracketed controller and privacy-contact details below with the verified registered business name, business address, and privacy contact channel. Confirm the final notice with the business privacy officer or counsel under the Data Privacy Act of 2012 and its implementing rules."
    sections={[
      { title: "Who controls your information", paragraphs: ["The data controller is Hideout Pickleball, operating Hideout Court and Cafe in Davao City, Philippines. Privacy requests should be sent to urrijehan1@gmail.com. The currently displayed venue support number is 0917-105-8580; the owner must confirm that it is appropriate for privacy requests."] },
      { title: "Information we collect", items: ["Name, email address, and optional phone number supplied during a booking.", "Court, date, time, duration, price, booking status, and booking reference details.", "Payment reference or receipt image submitted through the current GCash receipt workflow. The website does not collect card numbers.", "Technical information necessary to operate the website, including essential session cookies used for administration."] },
      { title: "Why we use it", paragraphs: ["We use booking information to show availability, create and manage reservations, contact customers about a reservation, review submitted payment evidence, provide support, and protect the venue from duplicate or abusive bookings. We do not claim that a receipt upload is payment verification until staff reviews it."] },
      { title: "Service providers and sharing", paragraphs: ["The application uses Supabase for database, authentication/session, and file storage services. Reclub is linked as an external community service when a customer chooses to visit it. Payment is instructed through GCash, but the current application does not integrate with a GCash verification API. Information may be disclosed to service providers only as needed to operate the service, to venue staff, or when required by law. The owner must confirm the complete provider and cross-border processing list before publication."] },
      { title: "Retention and security", paragraphs: ["3 months. The application should retain booking and payment records only as long as needed for operations, accounting, dispute handling, and legal obligations. Access should be limited to authorized staff, storage should not be publicly readable, and administrative credentials and secrets must be kept outside source code. No website notice replaces a complete security program."] },
      { title: "Your privacy requests", paragraphs: ["Subject to applicable Philippine law, you may ask to access, correct, update, or otherwise exercise rights over personal information held about you. Contact 09171058580 with enough booking detail for the venue to locate the record. The owner should publish the applicable response process and escalation contact after legal review."] },
    ]}
  />;
}
