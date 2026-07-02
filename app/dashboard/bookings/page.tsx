"use client";

import { useCallback, useEffect, useState } from "react";

type Booking = {
  id: string;
  court_name: string;
  player_name: string;
  player_email: string;
  player_phone?: string;
  start_at: string;
  end_at: string;
  total_price: number;
  status: string;
  payment_receipt_url?: string;
};

function formatHour(hour24: number): string {
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const value = hour24 % 12 || 12;
  return `${value}:00 ${suffix}`;
}

function formatCurrency(value: number): string {
  return `P${value.toFixed(2)}`;
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  booked: "bg-indigo-100 text-indigo-700",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function DashboardBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      params.set("date", selectedDate);
      if (statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/dashboard/bookings?${params.toString()}`);
      const payload = (await response.json()) as { data?: Booking[]; message?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message || "Failed to load bookings.");
      }

      setBookings(payload.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, statusFilter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const response = await fetch("/api/dashboard/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Failed to update booking.");
      }

      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  const getTimeRange = (startAt: string, endAt: string): string => {
    const start = new Date(startAt);
    const end = new Date(endAt);
    return `${formatHour(start.getHours())} - ${formatHour(end.getHours())}`;
  };

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h1 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">Today&apos;s Bookings</h1>
      <p className="mt-1 text-xs sm:text-sm text-slate-600">Manage active reservations, add walk-ins, and cancel conflicts.</p>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-200 focus:ring-2 min-h-[44px]"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-200 focus:ring-2 min-h-[44px]"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="booked">Booked</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      )}

      <div className="mt-6">
        {isLoading ? (
          <p className="text-center text-sm text-slate-500">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <p className="text-center text-sm text-slate-500">No bookings found for this date.</p>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="py-2">Time</th>
                    <th className="py-2">Court</th>
                    <th className="py-2">Player</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Total</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="py-3">{getTimeRange(booking.start_at, booking.end_at)}</td>
                      <td className="py-3">{booking.court_name}</td>
                      <td className="py-3">
                        <div>
                          <p>{booking.player_name}</p>
                          <p className="text-xs text-slate-500">{booking.player_email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLORS[booking.status] || "bg-slate-100 text-slate-700"}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="py-3">{formatCurrency(booking.total_price)}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-2">
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => updateStatus(booking.id, "confirmed")}
                                className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-500 min-h-[44px]"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => updateStatus(booking.id, "cancelled")}
                                className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-500 min-h-[44px]"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() => updateStatus(booking.id, "cancelled")}
                              className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-500 min-h-[44px]"
                            >
                              Cancel
                            </button>
                          )}
                          {booking.status === "cancelled" && (
                            <button
                              onClick={() => updateStatus(booking.id, "confirmed")}
                              className="rounded-lg bg-slate-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-slate-500 min-h-[44px]"
                            >
                              Undo Cancel
                            </button>
                          )}
                          {booking.payment_receipt_url && (
                            <a
                              href={booking.payment_receipt_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded-lg border border-blue-200 bg-white px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-50 min-h-[44px] flex items-center"
                            >
                              Receipt
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="md:hidden space-y-3">
              {bookings.map((booking) => (
                <div key={booking.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{getTimeRange(booking.start_at, booking.end_at)}</p>
                      <p className="text-sm text-slate-600">{booking.court_name} · {booking.player_name}</p>
                      <p className="text-sm font-medium text-slate-900">{formatCurrency(booking.total_price)}</p>
                    </div>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${STATUS_COLORS[booking.status] || "bg-slate-100 text-slate-700"}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => updateStatus(booking.id, "confirmed")}
                          className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 min-h-[44px]"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateStatus(booking.id, "cancelled")}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 min-h-[44px]"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => updateStatus(booking.id, "cancelled")}
                        className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-500 min-h-[44px]"
                      >
                        Cancel
                      </button>
                    )}
                    {booking.status === "cancelled" && (
                      <button
                        onClick={() => updateStatus(booking.id, "confirmed")}
                        className="rounded-lg bg-slate-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-500 min-h-[44px]"
                      >
                        Undo Cancel
                      </button>
                    )}
                    {booking.payment_receipt_url && (
                      <a
                        href={booking.payment_receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-medium text-blue-700 transition hover:bg-blue-50 min-h-[44px] flex items-center"
                      >
                        Receipt
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}