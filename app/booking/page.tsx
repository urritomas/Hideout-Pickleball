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
        brandLabel={
          <>
            <span className="rounded-lg bg-blue-600 px-2 py-1 text-white">H</span> Hideout Pickleball
          </>
        }
        navItems={[
          { href: "/", label: "Home" },
          { href: "/booking", label: "View Schedule" },
          { href: "/booking", label: "Book a Court", primary: true },
        ]}
      />
      <BookingShell />
    </>
  );
}
