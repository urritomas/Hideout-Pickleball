import type { Metadata } from "next";
import { BookingShell } from "./components/booking-shell";
import { SiteHeader } from "@/app/components/site-header";

export const metadata: Metadata = {
  title: "Book a Court",
  description: "Reserve Court 1 or Court 2 at Hideout Pickleball Club.",
};

export default function BookingPage() {
  return (
    <>
      <SiteHeader
        navItems={[
          { href: "/", label: "Home", key: "home" },
          { href: "/booking", label: "Book a Court", primary: true, key: "book" },
        ]}
      />
      <BookingShell />
    </>
  );
}
