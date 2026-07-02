"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import React from "react";

type ScheduleSlot = {
  court_id: number;
  date: string;
  start_hour: number;
  end_hour: number;
  status: string;
  reason?: string;
  type?: "booking" | "blocked";
};

type BookingApiItem = {
  court_id: number;
  start_at: string;
  end_at: string;
  status: string;
  player_name?: string;
};

type BlockedApiItem = {
  court_id: number;
  start_at: string;
  end_at: string;
  reason?: string;
};

type CalendarApiResponse = {
  bookings: BookingApiItem[];
  blockedSchedules: BlockedApiItem[];
};

const OPENING_HOUR = 8;
const CLOSING_HOUR = 24;
const STATUS_OPTIONS = [
  { value: "available", label: "Available", abbr: "Avail", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { value: "booked", label: "Booked", abbr: "Booked", className: "bg-indigo-600 text-white border-indigo-700" },
  { value: "unavailable", label: "Unavailable", abbr: "Unavail", className: "bg-rose-600 text-white border-rose-700" },
  { value: "open play", label: "Open Play", abbr: "Open", className: "bg-emerald-600 text-white border-emerald-700" },
  { value: "cancelled", label: "Cancelled", abbr: "Cancel", className: "bg-slate-100 text-slate-700 border-slate-200" },
];

const COURTS = [
  { id: 1, name: "Hide Court" },
  { id: 2, name: "Out Court" },
];

function getStatusLabel(status: string): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label || status;
}

function getStatusAbbr(status: string): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.abbr || status;
}

function getStatusClass(status: string): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.className || "bg-slate-100 text-slate-700 border-slate-200";
}

export default function DashboardCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  });
  const [selectedCourtFilter, setSelectedCourtFilter] = useState<number | "all">("all");
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingSlot, setUpdatingSlot] = useState<string | null>(null);

  const hours = useMemo(() => {
    const list: number[] = [];
    for (let hour = OPENING_HOUR; hour < CLOSING_HOUR; hour += 1) {
      list.push(hour);
    }
    return list;
  }, []);

  const slotKey = useCallback((courtId: number, date: string, hour: number) => `${courtId}-${date}-${hour}`, []);

  const getSlotForHour = useCallback(
    (courtId: number, hour: number): ScheduleSlot | undefined => {
      return slots.find(
        (slot) => slot.court_id === courtId && slot.start_hour <= hour && slot.end_hour > hour && slot.status !== "available",
      );
    },
    [slots],
  );

  const fetchSchedule = useCallback(async () => {
    if (!selectedDate) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const currentYear = new Date(selectedDate).getFullYear();
      const currentMonth = new Date(selectedDate).getMonth() + 1;

      const params = new URLSearchParams();
      params.set("year", String(currentYear));
      params.set("month", String(currentMonth));

      const response = await fetch(`/api/dashboard/calendar?${params.toString()}`);
      const payload = (await response.json()) as { data?: CalendarApiResponse; message?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message || "Failed to load schedule data.");
      }

      const normalizedBookings = (payload.data.bookings || []).map((b) => ({
        court_id: b.court_id,
        date: b.start_at.split("T")[0],
        start_hour: new Date(b.start_at).getHours(),
        end_hour: new Date(b.end_at).getHours(),
        status: b.status === "confirmed" ? "booked" : b.status,
        type: "booking" as const,
      }));

      const normalizedBlocked = (payload.data.blockedSchedules || []).map((b) => {
        const reason = (b.reason || "").toLowerCase();
        let status = "unavailable";
        if (reason === "open play") status = "open play";
        else if (reason === "cancelled") status = "cancelled";

        return {
          court_id: b.court_id,
          date: b.start_at.split("T")[0],
          start_hour: new Date(b.start_at).getHours(),
          end_hour: new Date(b.end_at).getHours(),
          status,
          reason: b.reason,
          type: "blocked" as const,
        };
      });

      setSlots([...normalizedBookings, ...normalizedBlocked]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSchedule();
  }, [fetchSchedule]);

  const updateSlot = async (courtId: number, hour: number, status: string) => {
    const key = slotKey(courtId, selectedDate, hour);
    setUpdatingSlot(key);
    setErrorMessage(null);

    try {
      const existingSlot = getSlotForHour(courtId, hour);

      if (status === "available") {
        if (existingSlot) {
          const deleteResponse = await fetch("/api/dashboard/calendar", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              courtId,
              date: selectedDate,
              startHour: hour,
              endHour: hour + 1,
              type: existingSlot.type,
            }),
          });

          if (!deleteResponse.ok) {
            const errorResult = await deleteResponse.json();
            throw new Error(errorResult.message || "Failed to update schedule.");
          }
        }

        setSlots((prev) => prev.filter((slot) => !(slot.court_id === courtId && slot.start_hour <= hour && slot.end_hour > hour)));
        await fetchSchedule();
        window.dispatchEvent(new CustomEvent("court-schedule-changed", { detail: { selectedDate } }));
        return;
      }

      if (existingSlot) {
        const deletePayload = {
          courtId,
          date: selectedDate,
          startHour: hour,
          endHour: hour + 1,
          type: existingSlot.type,
        };
        const deleteResponse = await fetch("/api/dashboard/calendar", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(deletePayload),
        });

        if (!deleteResponse.ok) {
          const errorResult = await deleteResponse.json();
          throw new Error(errorResult.message || "Failed to delete existing slot.");
        }
      }

      const response = await fetch("/api/dashboard/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId,
          date: selectedDate,
          startHour: hour,
          endHour: hour + 1,
          status,
          reason: status,
        }),
      });

      const result = (await response.json()) as { data?: { court_id: number; start_at: string; end_at: string; reason?: string; status?: string; type?: string } & Record<string, unknown>; message?: string; details?: string };
      if (!response.ok) {
        throw new Error(result.details || result.message || "Failed to update schedule.");
      }

      if (result.data) {
        const normalizedData: ScheduleSlot = {
          court_id: result.data.court_id,
          date: result.data.start_at.split("T")[0],
          start_hour: new Date(result.data.start_at).getHours(),
          end_hour: new Date(result.data.end_at).getHours(),
          status: result.data.status || "unavailable",
          reason: result.data.reason,
          type: (result.data.type || "blocked") as "booking" | "blocked",
        };

        setSlots((prev) => {
          const filtered = prev.filter((slot) => !(slot.court_id === courtId && slot.start_hour <= hour && slot.end_hour > hour));
          return [...filtered, normalizedData];
        });
      }

      await fetchSchedule();
      window.dispatchEvent(new CustomEvent("court-schedule-changed", { detail: { selectedDate } }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
      await fetchSchedule();
    } finally {
      setUpdatingSlot(null);
    }
  };

  const handleCellClick = (courtId: number, hour: number) => {
    const current = getSlotForHour(courtId, hour);
    const currentStatus = current?.status || "available";
    const currentIndex = STATUS_OPTIONS.findIndex((option) => option.value === currentStatus);
    const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
    const nextStatus = STATUS_OPTIONS[nextIndex].value;
    updateSlot(courtId, hour, nextStatus);
  };

  const getCellStatus = (courtId: number, hour: number): { status: string; label: string; className: string } => {
    const slot = getSlotForHour(courtId, hour);
    if (!slot) {
      return { status: "available", label: "Available", className: "bg-white text-slate-700 hover:bg-blue-50" };
    }
    return {
      status: slot.status,
      label: slot.reason || getStatusAbbr(slot.status),
      className: getStatusClass(slot.status),
    };
  };

  const visibleCourts = selectedCourtFilter === "all" ? COURTS : COURTS.filter((court) => court.id === selectedCourtFilter);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-10 text-center text-slate-500">
        <p className="text-sm font-medium">Loading schedule...</p>
        <button onClick={fetchSchedule} className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">Court Schedule</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">Manage court availability and statuses.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Date:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-200 focus:ring-2 min-h-[44px]"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Court:</label>
            <select
              value={selectedCourtFilter}
              onChange={(e) => setSelectedCourtFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-200 focus:ring-2 min-h-[44px]"
            >
              <option value="all">All Courts</option>
              {COURTS.map((court) => (
                <option key={court.id} value={court.id}>{court.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {errorMessage && (
        <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${option.className.split(" ")[0]}`}></span>
            <span className="text-xs text-slate-600">{option.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center overflow-x-auto">
        <div className="inline-grid gap-px rounded-2xl border border-slate-200 bg-slate-200" style={{ gridTemplateColumns: `80px repeat(${visibleCourts.length}, minmax(120px, 1fr))` }}>
          <div className="sticky left-0 top-0 z-20 bg-slate-900 px-2 py-3 text-xs font-semibold text-white uppercase tracking-wide">
            Time
          </div>
          {visibleCourts.map((court) => (
            <div key={`${court.id}-${selectedDate}`} className="sticky top-0 z-20 bg-slate-900 px-2 py-3 text-center text-xs font-semibold text-white uppercase tracking-wide">
              {court.name}
            </div>
          ))}

          {hours.map((hour) => {
            const timeLabel = `${hour <= 12 ? hour : hour - 12}${hour < 12 ? " AM" : " PM"}`;

            return (
              <React.Fragment key={hour}>
                <div className="sticky left-0 z-10 flex items-center bg-slate-50 px-2 py-2 text-xs font-semibold text-slate-700">
                  {timeLabel}
                </div>
                {visibleCourts.map((court) => {
                   const cell = getCellStatus(court.id, hour);
                   const key = slotKey(court.id, selectedDate, hour);
                   const isUpdating = updatingSlot === key;

                    return (
                      <select
                        key={`${court.id}-${hour}-${selectedDate}`}
                        value={cell.status}
                        onChange={(e) => updateSlot(court.id, hour, e.target.value)}
                        disabled={isUpdating}
                        title={`${court.name} - ${hour}:00 - ${cell.label}`}
                        className={`h-full w-full appearance-none rounded-none bg-black/[0.04] px-2 py-2 pr-6 text-xs font-semibold transition text-center disabled:cursor-wait disabled:opacity-60 ${cell.className}`}
                      >
                       <option value="available">Available</option>
                       {STATUS_OPTIONS.filter((option) => option.value !== "available").map((option) => (
                         <option key={option.value} value={option.value}>{option.label}</option>
                       ))}
                     </select>
                   );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
