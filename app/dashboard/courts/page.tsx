"use client";

import { useCallback, useEffect, useState } from "react";

type Court = {
  id: number;
  name: string;
  is_active: boolean;
  status: string;
};

type BlockedSchedule = {
  id: string;
  court_id: number;
  start_at: string;
  end_at: string;
  reason?: string;
};

const COURT_STATUS_OPTIONS = [
  { value: "available", label: "Available", className: "bg-emerald-100 text-emerald-700" },
  { value: "booked", label: "Booked", className: "bg-indigo-600 text-white" },
  { value: "unavailable", label: "Unavailable", className: "bg-rose-600 text-white" },
  { value: "open play", label: "Open Play", className: "bg-emerald-600 text-white" },
];

export default function DashboardCourtsPage() {
  const [courts, setCourts] = useState<Court[]>([]);
  const [blockedSchedules, setBlockedSchedules] = useState<BlockedSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchCourts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/dashboard/courts");
      const payload = (await response.json()) as { data?: { courts: Court[]; blockedSchedules: BlockedSchedule[] }; message?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message || "Failed to load courts.");
      }

      setCourts(payload.data.courts || []);
      setBlockedSchedules(payload.data.blockedSchedules || []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCourts();
  }, [fetchCourts]);

  const updateCourt = async (courtId: number, updates: { is_active?: boolean; status?: string }) => {
    setUpdatingId(courtId);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/dashboard/courts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: courtId, ...updates }),
      });

      const payload = (await response.json()) as { message?: string };
      if (!response.ok) {
        throw new Error(payload.message || "Failed to update court.");
      }

      setCourts((prev) =>
        prev.map((court) => (court.id === courtId ? { ...court, ...updates } : court)),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getCourtBlockedSchedules = (courtId: number) => {
    return blockedSchedules.filter((b) => b.court_id === courtId);
  };

  if (isLoading) {
    return <p className="text-center text-sm text-slate-500">Loading courts...</p>;
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h1 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">Courts</h1>
      <p className="mt-1 text-xs sm:text-sm text-slate-600">Manage court statuses, schedules, and activation.</p>

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      )}

      <div className="mt-4 sm:mt-6 grid gap-4 sm:grid-cols-2">
        {courts.map((court) => {
          const blocked = getCourtBlockedSchedules(court.id);
          const statusOption = COURT_STATUS_OPTIONS.find((option) => option.value === court.status);

          return (
            <article key={court.id} className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <h2 className="font-semibold text-slate-900 text-base sm:text-lg">{court.name}</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${court.is_active ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                      {court.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusOption?.className || "bg-slate-100 text-slate-700"}`}>
                      {statusOption?.label || court.status}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:items-end">
                  <select
                    value={court.status}
                    onChange={(e) => updateCourt(court.id, { status: e.target.value })}
                    disabled={updatingId === court.id || !court.is_active}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-200 focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 min-h-[44px]"
                  >
                    {COURT_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => updateCourt(court.id, { is_active: !court.is_active })}
                    disabled={updatingId === court.id}
                    className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${
                      court.is_active
                        ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        : "bg-lime-700 text-white hover:bg-lime-600"
                    }`}
                  >
                    {court.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>

              {blocked.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Blocked Schedules</p>
                  <ul className="mt-2 space-y-2">
                    {blocked.map((schedule) => (
                      <li key={schedule.id} className="rounded-xl bg-white p-3 text-sm text-slate-700 border border-slate-200">
                        <p className="font-medium">{schedule.reason || "Blocked"}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(schedule.start_at).toLocaleString()} - {new Date(schedule.end_at).toLocaleTimeString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
