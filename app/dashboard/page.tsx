"use client";

import { useCallback, useEffect, useState } from "react";

type OverviewData = {
  totalBookingsToday: number;
  activeUsers: number;
  todaysRevenue: number;
  courtUtilization: number;
  recentBookings: Array<{
    id: string;
    court_name: string;
    player_name: string;
    start_at: string;
    end_at: string;
    total_price: number;
    status: string;
  }>;
  paymentStatusCounts: {
    paid: number;
    pending: number;
    failed: number;
  };
};

function formatCurrency(value: number): string {
  return `P${value.toFixed(2)}`;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export default function DashboardOverviewPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/dashboard/overview");
      const payload = (await response.json()) as { data?: OverviewData; message?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message || "Failed to load overview.");
      }

      setData(payload.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOverview();
  }, [fetchOverview]);

  if (isLoading) {
    return <p className="text-center text-sm text-slate-500">Loading overview...</p>;
  }

  if (errorMessage) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>;
  }

  if (!data) {
    return <p className="text-center text-sm text-slate-500">No data available.</p>;
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-2xl sm:rounded-3xl border border-blue-100 bg-slate-900 p-5 sm:p-6 text-white shadow-sm">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-white">Overview</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300">Operational snapshot for Hideout Pickleball Club.</p>
      </header>

      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-xs sm:text-sm text-slate-500">Today&apos;s Bookings</p>
          <p className="mt-1 sm:mt-2 font-display text-xl sm:text-2xl font-semibold text-slate-900">{data.totalBookingsToday}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-xs sm:text-sm text-slate-500">Active Users</p>
          <p className="mt-1 sm:mt-2 font-display text-xl sm:text-2xl font-semibold text-slate-900">{data.activeUsers}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-xs sm:text-sm text-slate-500">Today&apos;s Revenue</p>
          <p className="mt-1 sm:mt-2 font-display text-xl sm:text-2xl font-semibold text-slate-900">{formatCurrency(data.todaysRevenue)}</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
          <p className="text-xs sm:text-sm text-slate-500">Court Utilization</p>
          <p className="mt-1 sm:mt-2 font-display text-xl sm:text-2xl font-semibold text-slate-900">{data.courtUtilization.toFixed(1)}%</p>
        </article>
      </section>

      <section className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <article className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-slate-900">Recent Reservations</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            {data.recentBookings.length === 0 ? (
              <p className="rounded-xl bg-slate-50 px-3 py-2">No recent bookings.</p>
            ) : (
              data.recentBookings.map((booking) => (
                <p key={booking.id} className="rounded-xl bg-slate-50 px-3 py-2">
                  {booking.court_name} - {formatTime(booking.start_at)} - {booking.player_name} - {booking.status}
                </p>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="font-display text-lg sm:text-xl font-semibold text-slate-900">Payment Status</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">Paid: {data.paymentStatusCounts.paid} transactions</p>
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-amber-700">Pending: {data.paymentStatusCounts.pending} transactions</p>
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-rose-700">Failed: {data.paymentStatusCounts.failed} transactions</p>
          </div>
        </article>
      </section>
    </div>
  );
}
