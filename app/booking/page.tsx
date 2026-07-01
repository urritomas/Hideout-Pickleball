import type { Metadata } from "next";
import { BookingShell } from "./components/booking-shell";

export const metadata: Metadata = {
  title: "Book a Court",
  description: "Reserve Court 1 or Court 2 at Hideout Pickleball Club.",
};

export default function BookingPage() {
  return (
    <main className="section-shell py-10 sm:py-14">
      <BookingShell />
    </main>
  );
}
