import type { Metadata } from "next";
import { PolicyPage } from "@/app/components/policy-page";

export const metadata: Metadata = { title: "Contact and Support", description: "Contact Hideout Pickleball about bookings, payments, and support." };

export default function ContactPage() {
  return <PolicyPage
    eyebrow="Support"
    title="Contact and support"
    intro="Use the current venue support number for booking questions, pending payment evidence, reschedule requests, and operational concerns. Include your booking reference and the email used for the reservation."
    reviewNote="The owner must verify the phone number, venue address, support hours, and a privacy-specific contact channel before launch."
    sections={[
      { title: "Current support channel", paragraphs: ["Phone: 0917-105-8580", "Location: Toril, Davao City, Philippines. https://maps.app.goo.gl/qSobvnjQhiBc7avC7", "Operating hours shown by the booking flow: 8:00 AM to 12:00 AM daily, subject to venue operations."] },
      { title: "What to include", items: ["Booking reference or the date and court selected.", "Name and email used for the booking.", "A short description of the booking, payment, upload, or reschedule issue.", "Do not send passwords, card numbers, or unrelated personal information."] },
      { title: "Response expectations", paragraphs: ["The website does not currently promise a response-time SLA or provide a ticketing system. Staff availability and operating conditions may affect response time. The owner should add a verified email or support form and publish its support hours before launch."] },
      { title: "Privacy requests", paragraphs: ["For a privacy request, use 09171058580. The public support phone number may be used only if the owner confirms it is an appropriate privacy channel."] },
    ]}
  />;
}
