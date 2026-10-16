import type { Metadata } from "next";
import { PolicyPage } from "@/app/components/policy-page";

export const metadata: Metadata = { title: "Terms and Conditions", description: "Terms for using Hideout Pickleball online booking." };

export default function TermsPage() {
  return <PolicyPage
    eyebrow="Legal"
    title="Terms and Conditions"
    intro="These terms govern use of the Hideout Pickleball website and online court reservations. They are a working draft and should be reviewed for the venue's final legal and operating requirements."
    reviewNote="The owner must confirm the registered business identity, venue address, governing-law language, staff cancellation authority, and final dispute process with Philippine counsel."
    sections={[
      { title: "Using the service", paragraphs: ["You must provide accurate contact information and use the website for a genuine court reservation. Do not impersonate another person, submit false payment evidence, interfere with availability, or attempt to access staff systems or another customer's information."] },
      { title: "Eligibility and customer responsibilities", paragraphs: ["The person making a reservation is responsible for the accuracy of the booking, payment evidence, contact details, and conduct of the players in the reservation. Minors should book and play only with the consent and supervision required by the venue and applicable law."] },
      { title: "Prices and confirmation", paragraphs: ["The current application displays PHP 200 per hour from 8:00 AM to before 5:00 PM and PHP 300 per hour from 5:00 PM to midnight, plus a PHP 20 service fee per booking created by the current server calculation. A booking starts as pending. Uploading a receipt does not itself confirm payment; staff must review and confirm it through the supported workflow."] },
      { title: "Cancellations, rescheduling, and no refunds", paragraphs: ["The current business instruction is no refunds. Court bookings may be requested for rescheduling only, before the scheduled start time, and require venue approval. The current application does not yet provide a customer reschedule portal; contact support with the booking reference. No-shows and late arrivals do not create a refund entitlement. The owner must confirm any staff-initiated closure procedure."] },
      { title: "Venue operations", paragraphs: ["The venue may block a court, adjust operating conditions, or temporarily interrupt service for safety, maintenance, or operational reasons. Customers should follow the venue's instructions. Any replacement booking or reschedule outcome must be agreed with venue staff; this draft does not promise a refund."] },
      { title: "Sports activity and liability", paragraphs: ["Pickleball involves physical activity and ordinary risks including falls, collisions, and equipment-related injury. Follow the court rules, use appropriate footwear, warm up, and stop play when unsafe. This section is not a waiver and does not remove rights that cannot legally be excluded. The owner should obtain legal review of any separate waiver or release used at the venue."] },
    ]}
  />;
}
