import type { Metadata } from "next";
import { PolicyPage } from "@/app/components/policy-page";

export const metadata: Metadata = { title: "Booking, Cancellation and Rescheduling Policy", description: "Hideout Pickleball booking and no-refund rescheduling policy." };

export default function BookingPolicyPage() {
  return <PolicyPage
    eyebrow="Bookings"
    title="Booking, cancellation and rescheduling policy"
    intro="Hideout Pickleball currently operates a no-refund policy. A customer may request a court reschedule before the booking start time, subject to venue approval and availability."
    reviewNote="The owner must confirm whether a specific notice period, reschedule fee, or weather procedure applies. The current system supports neither automatic refunds nor a customer self-service reschedule flow."
    sections={[
      { title: "When a booking is confirmed", paragraphs: ["A reservation is created as pending after the booking details are submitted. Payment is currently made by GCash and evidenced by an uploaded receipt. The booking is not confirmed until authorized venue staff review the receipt and update the booking through the admin workflow. Keep the booking reference and payment evidence until staff confirms the status."] },
      { title: "Rescheduling", items: ["Request a reschedule before the scheduled start time by contacting Hideout support with your booking reference.", "A reschedule is subject to court availability and venue approval.", "The original payment stays associated with the reservation; the current policy does not provide a cash refund.", "The current application does not yet expose a self-service reschedule button or automated approval workflow, so support must handle the request."] },
      { title: "No refunds and no-shows", paragraphs: ["No refunds are offered for customer cancellations, late arrivals, no-shows, or unused time under the current business instruction. This policy does not prevent the owner from voluntarily approving a different operational resolution where required by law or a venue closure."] },
      { title: "Weather and venue closures", paragraphs: ["The courts are outdoor, and the application has no automatic weather cancellation workflow. If Hideout changes operations because of weather, safety, maintenance, or another closure, contact support for an approved reschedule. No automatic refund is promised by the current system."] },
      { title: "Payment issues", paragraphs: ["If a receipt upload fails, appears incorrect, or the booking remains pending, contact support. Do not upload payment evidence for another booking. Staff confirmation is required; the receipt URL alone must not be treated as verified payment."] },
    ]}
  />;
}
