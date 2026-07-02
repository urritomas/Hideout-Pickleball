"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type DailyRevenue = {
  date: string;
  revenue: number;
  bookings_count: number;
};

type PaymentMethodBreakdown = {
  method: string;
  count: number;
  total_amount: number;
};

type RevenueData = {
  dailyRevenue: DailyRevenue[];
  totalRevenue: number;
  totalBookings: number;
  averageBookingValue: number;
  paymentMethodBreakdown: PaymentMethodBreakdown[];
};

function formatCurrency(value: number): string {
  return `P${value.toFixed(2)}`;
}

export default function DashboardRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  });

  const fetchRevenue = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = new URLSearchParams();
      params.set("startDate", startDate);
      params.set("endDate", endDate);

      const response = await fetch(`/api/dashboard/revenue?${params.toString()}`);
      const payload = (await response.json()) as { data?: RevenueData; message?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message || "Failed to load revenue data.");
      }

      setData(payload.data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRevenue();
  }, [fetchRevenue]);

  const maxRevenue = data?.dailyRevenue.length
    ? Math.max(...data.dailyRevenue.map((d) => d.revenue))
    : 0;

  if (isLoading) {
    return <p className="text-center text-sm text-slate-500">Loading revenue data...</p>;
  }

  if (errorMessage) {
    return <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>;
  }

  if (!data) {
    return <p className="text-center text-sm text-slate-500">No revenue data available.</p>;
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h1 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">Revenue</h1>
      <p className="mt-1 text-xs sm:text-sm text-slate-600">Track hourly earnings and compare date ranges.</p>

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        <div>
          <label className="text-xs font-medium text-slate-500">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-200 focus:ring-2 min-h-[44px]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-200 focus:ring-2 min-h-[44px]"
          />
        </div>
        <button
          onClick={fetchRevenue}
          className="self-end rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 min-h-[44px]"
        >
          Apply
        </button>
      </div>

      <div className="mt-4 sm:mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Total Revenue</p>
          <p className="mt-1 font-display text-xl font-semibold text-slate-900">{formatCurrency(data.totalRevenue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Total Bookings</p>
          <p className="mt-1 font-display text-xl font-semibold text-slate-900">{data.totalBookings}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Average Booking</p>
          <p className="mt-1 font-display text-xl font-semibold text-slate-900">{formatCurrency(data.averageBookingValue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs text-slate-500">Payment Methods</p>
          <p className="mt-1 font-display text-xl font-semibold text-slate-900">{data.paymentMethodBreakdown.length}</p>
        </div>
      </div>

      <div className="mt-4 sm:mt-6 grid gap-4 grid-cols-1 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-display text-base sm:text-lg font-semibold text-slate-900">Daily Revenue</h3>
          {data.dailyRevenue.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No revenue data for this period.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {data.dailyRevenue.map((day) => {
                const heightPercentage = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={day.date} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-900">
                        {new Date(day.date).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                      </span>
                      <span className="font-semibold text-slate-900">{formatCurrency(day.revenue)}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-200">
                      <div
                        className="h-3 rounded-full bg-blue-600 transition-all"
                        style={{ width: `${heightPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500">{day.bookings_count} booking(s)</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="font-display text-base sm:text-lg font-semibold text-slate-900">Payment Methods</h3>
          {data.paymentMethodBreakdown.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No payment data for this period.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {data.paymentMethodBreakdown.map((method) => (
                <li key={method.method} className="flex items-center justify-between rounded-xl bg-white p-3">
                  <span className="text-sm font-medium text-slate-900 capitalize">{method.method}</span>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">{formatCurrency(method.total_amount)}</p>
                    <p className="text-xs text-slate-500">{method.count} transaction(s)</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
