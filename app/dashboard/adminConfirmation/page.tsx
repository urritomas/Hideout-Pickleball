"use client";

import { SiteHeader } from "@/app/components/site-header";
import { useCallback, useEffect, useMemo, useState } from "react";

type BookingRecord = {
  id: string;
  court_id: number;
  player_name: string;
  player_email: string;
  player_phone?: string;
  start_at: string;
  end_at: string;
  total_price: number;
  status: string;
  payment_receipt_url?: string;
  notes?: string;
  created_at: string;
};

type Court = {
  id: number;
  name: string;
};

function formatHour(hour24: number): string {
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const value = hour24 % 12 || 12;
  return `${value}:00 ${suffix}`;
}

function formatPrice(value: number): string {
  return `P${value.toFixed(2)}`;
}

export default function AdminConfirmationPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPendingBookings = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch("/api/admin/pending-bookings");
        const payload = (await response.json()) as { data?: { bookings: BookingRecord[]; courts: Court[] }; message?: string };

        if (!response.ok || !payload.data) {
          throw new Error(payload.message || "Failed to load pending bookings.");
        }

        if (!cancelled) {
          setBookings(payload.data.bookings || []);
          setCourts(payload.data.courts || []);
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchPendingBookings();
    return () => {
      cancelled = true;
    };
  }, []);

  const courtName = useCallback(
    (courtId: number) => courts.find((court) => court.id === courtId)?.name ?? `Court ${courtId}`,
    [courts],
  );

  const confirmBooking = async (bookingId: string) => {
    setProcessingId(bookingId);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bookingId,
          status: "confirmed",
        }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Failed to confirm booking.");
      }

      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setProcessingId(null);
    }
  };

  const pending = useMemo(() => bookings.filter((b) => b.status === "pending"), [bookings]);

  return (
    <>
      <SiteHeader
        navItems={[
          { href: "/dashboard", label: "Overview", key: "overview" },
          { href: "/dashboard/bookings", label: "Today's Bookings", key: "bookings" },
          { href: "/dashboard/courts", label: "Courts", key: "courts" },
          { href: "/dashboard/users", label: "Users", key: "users" },
          { href: "/dashboard/revenue", label: "Revenue", key: "revenue" },
          { href: "/dashboard/payments", label: "Payments", key: "payments" },
          { href: "/dashboard/adminConfirmation", label: "Confirm Bookings", key: "confirm" },
          { href: "/dashboard/calendar", label: "Calendar", key: "calendar" },
          { href: "/dashboard/settings", label: "Settings", key: "settings" },
        ]}
      />
      <div className="space-y-6">
        <header className="overflow-hidden rounded-3xl border border-blue-100 bg-slate-900 p-6 text-white shadow-sm">
          <h1 className="font-display text-3xl font-semibold text-slate-900">Admin Confirmation</h1>
          <p className="mt-1 text-sm text-slate-300">
            Review pending bookings, verify payment receipts, and confirm reservations.
          </p>
        </header>

      {errorMessage && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      )}

      {isLoading ? (
        <p className="text-center text-sm text-slate-500">Loading pending bookings...</p>
      ) : pending.length === 0 ? (
        <p className="text-center text-sm text-slate-500">No pending bookings awaiting confirmation.</p>
      ) : (
        <div className="grid gap-4">
          {pending.map((booking) => {
            const startDate = new Date(booking.start_at);
            const startHour = startDate.getHours();
            const endDate = new Date(booking.end_at);
            const endHour = endDate.getHours();
            const dateLabel = new Intl.DateTimeFormat("en-PH", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            }).format(startDate);

            return (
              <article key={booking.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      {courtName(booking.court_id)}
                    </h3>
                    <p className="text-sm text-slate-600">{dateLabel}</p>
                    <p className="text-sm text-slate-600">
                      {formatHour(startHour)} - {formatHour(endHour)}
                    </p>
                    <p className="text-sm text-slate-600">Player: {booking.player_name}</p>
                    <p className="text-sm text-slate-600">Email: {booking.player_email}</p>
                    {booking.player_phone && (
                      <p className="text-sm text-slate-600">Phone: {booking.player_phone}</p>
                    )}
                    <p className="text-sm font-semibold text-blue-700">Total: {formatPrice(booking.total_price)}</p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                      Pending
                    </span>
                    {booking.payment_receipt_url && (
                      <a
                        href={booking.payment_receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-blue-600 transition hover:text-blue-500"
                      >
                        View Receipt
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => confirmBooking(booking.id)}
                      disabled={processingId === booking.id}
                      className="rounded-xl bg-lime-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-lime-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {processingId === booking.id ? "Confirming..." : "Confirm Payment"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
    </>
  );
}
