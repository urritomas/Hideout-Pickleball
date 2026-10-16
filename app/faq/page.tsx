import type { Metadata } from "next";
import { PolicyPage } from "@/app/components/policy-page";

export const metadata: Metadata = { title: "Frequently Asked Questions", description: "Answers about Hideout Pickleball court bookings and support." };

export default function FaqPage() {
  return <PolicyPage
    eyebrow="Help"
    title="Frequently asked questions"
    intro="These answers describe the current booking implementation and the current no-refund, reschedule-only business instruction."
    sections={[
      { title: "How do I book a court?", paragraphs: ["Open Book a Court, choose a date, select consecutive available hours on Court 1 or Court 2, enter your name and email, and review the reservation before submitting it."] },
      { title: "How do I know whether a slot is available?", paragraphs: ["The booking grid loads current court bookings and blocked schedules. The server also checks for an overlap when a booking is submitted. A slot can change between viewing and submission, so a conflict response should be treated as authoritative."] },
      { title: "How much does it cost?", paragraphs: ["The current application displays PHP 200 per hour before 5:00 PM, PHP 300 per hour from 5:00 PM, and a PHP 20 service fee per booking under the current server calculation. Confirm the displayed total before submitting."] },
      { title: "How do I pay and when is my booking confirmed?", paragraphs: ["The current flow instructs customers to pay by GCash and upload a receipt image. Uploading a receipt creates evidence for staff review; it is not automatic payment verification. Your booking remains pending until staff confirms it."] },
      { title: "Can I cancel or get a refund?", paragraphs: ["No refunds are offered under the current business instruction. Do not use the old cancellation/profile wording. Contact support before the booking start time to request a reschedule instead."] },
      { title: "How do I reschedule?", paragraphs: ["The current website does not yet provide a customer self-service reschedule control. Contact Hideout support with your booking reference before the scheduled start time. Approval depends on availability and venue review."] },
      { title: "What if my payment or receipt upload has a problem?", paragraphs: ["Keep the booking reference and contact support at 0917-105-8580. Do not submit duplicate bookings while staff is checking a pending payment."] },
    ]}
  />;
}
