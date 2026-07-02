"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import Image from "next/image";
import { SiteHeader } from "@/app/components/site-header";

type SlotStatus = "available" | "unavailable" | "selected" | "open play" | "pending" | "booked" | "cancelled";

type Court = {
  id: number;
  name: string;
};

type BookingRecord = {
  id: string;
  court_id: number;
  start_at: string;
  end_at: string;
  status: "pending" | "confirmed" | "booked" | "cancelled";
  player_name?: string;
  total_price?: number;
};

type BlockedRecord = {
  id: string;
  court_id: number;
  start_at: string;
  end_at: string;
  reason: string | null;
  status?: string;
};

type AvailabilityPayload = {
  courts: Court[];
  bookings: BookingRecord[];
  blockedSchedules: BlockedRecord[];
};

const OPENING_HOUR = 8;
const CLOSING_HOUR = 24;
const MAX_CONSECUTIVE_HOURS = 4;
const RULES_KEY = "hideout.booking.rules.v1";

const amenities = ["Air-conditioned indoor venue", "Locker shelves", "Shower room", "Drinking water station"];

const clubDetails = {
  name: "Hideout Court and Cafe",
  location: "Davao City, Philippines",
  tagline: "Your Home for Pickleball.",
};

function formatHour(hour24: number): string {
  const suffix = hour24 >= 12 ? "PM" : "AM";
  const value = hour24 % 12 || 12;
  return `${value}:00 ${suffix}`;
}

function toDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function fromDateInput(raw: string): Date {
  return new Date(`${raw}T00:00:00`);
}

function shiftDate(raw: string, days: number): string {
  const date = fromDateInput(raw);
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}

function isContiguous(hours: number[]): boolean {
  if (hours.length <= 1) {
    return true;
  }
  const sorted = [...hours].sort((a, b) => a - b);
  return sorted.every((hour, index) => index === 0 || hour - sorted[index - 1] === 1);
}

function getRateForHour(hour24: number): number {
  return hour24 < 17 ? 200 : 300;
}

function statusStyles(status: SlotStatus): string {
  if (status === "available") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100";
  }
  if (status === "selected") {
    return "border-blue-500 bg-blue-600 text-white";
  }
  if (status === "unavailable") {
    return "cursor-not-allowed border-rose-600 bg-rose-100 text-rose-700";
  }
  if (status === "open play") {
    return "cursor-not-allowed border-emerald-600 bg-emerald-100 text-emerald-700";
  }
  if (status === "pending") {
    return "cursor-not-allowed border-amber-200 bg-amber-50 text-amber-700";
  }
  if (status === "booked") {
    return "cursor-not-allowed border-indigo-600 bg-indigo-100 text-indigo-700";
  }
  if (status === "cancelled") {
    return "cursor-not-allowed border-slate-300 bg-slate-100 text-slate-600 line-through";
  }
  return "cursor-not-allowed border-slate-200 bg-slate-200 text-slate-600";
}

function overlaps(hour: number, startAt: string, endAt: string): boolean {
  const startHour = new Date(startAt).getHours();
  const endHour = new Date(endAt).getHours();
  return hour >= startHour && hour < endHour;
}

export function BookingShell() {
  const [selectedDate, setSelectedDate] = useState(() => toDateInput(new Date()));
  const [courts, setCourts] = useState<Court[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [blockedSchedules, setBlockedSchedules] = useState<BlockedRecord[]>([]);

  const [selectedSlots, setSelectedSlots] = useState<Array<{ courtId: number; hours: number[] }>>([]);
  const [playerName, setPlayerName] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [playerPhone, setPlayerPhone] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<{ bookingIds: string[] } | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{
    courts: Array<{ name: string; startHour: number; endHour: number; subtotal: number; hours: number[] }>;
    duration: number;
    subtotal: number;
    serviceFee: number;
    total: number;
    dateLabel: string;
  } | null>(null);
  const [paymentTimer, setPaymentTimer] = useState(15 * 60);
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null);
  const [paymentPreview, setPaymentPreview] = useState<string | null>(null);
  const [paymentUploading, setPaymentUploading] = useState(false);
  const paymentStartRef = useRef<number>(0);

  useEffect(() => {
    if (!paymentStep) return;
    paymentStartRef.current = Date.now();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPaymentTimer(15 * 60);
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - paymentStartRef.current) / 1000);
      const remaining = Math.max(0, 15 * 60 - elapsed);
      setPaymentTimer(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentStep]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasAcceptedRules, setHasAcceptedRules] = useState(() => {
    if (typeof window === "undefined") {
      return true;
    }
    return window.localStorage.getItem(RULES_KEY) === "accepted";
  });

  const today = useMemo(() => toDateInput(new Date()), []);
  const MAX_SELECTABLE_COURTS = 2;

  const selectedDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("en-PH", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(fromDateInput(selectedDate)),
    [selectedDate],
  );

  const liveAvailabilityText = new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date());

  const fetchAvailability = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/bookings?date=${selectedDate}`, { cache: "no-store" });
      const payload = (await response.json()) as { data?: AvailabilityPayload; message?: string };

      if (!response.ok || !payload.data) {
        throw new Error(payload.message || "Failed to load availability.");
      }

      setCourts(payload.data.courts || []);
      setBookings(payload.data.bookings || []);
      setBlockedSchedules(payload.data.blockedSchedules || []);

      const activeCourtIds = new Set((payload.data.courts || []).map((court) => court.id));
      setSelectedSlots((current) =>
        current.filter((slot) => activeCourtIds.has(slot.courtId)),
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Something went wrong while loading slots.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAvailability();
  }, [fetchAvailability]);

  useEffect(() => {
    const handleScheduleChange = () => {
      fetchAvailability();
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchAvailability();
      }
    };

    window.addEventListener("court-schedule-changed", handleScheduleChange);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("court-schedule-changed", handleScheduleChange);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [fetchAvailability]);

  const timeRows = useMemo(
    () => Array.from({ length: CLOSING_HOUR - OPENING_HOUR }, (_, index) => OPENING_HOUR + index),
    [],
  );

  const selectedCourtNames = useMemo(
    () =>
      selectedSlots
        .map((slot) => courts.find((court) => court.id === slot.courtId)?.name)
        .filter(Boolean) as string[],
    [courts, selectedSlots],
  );

  const getSlotStatus = useCallback(
    (courtId: number, hour: number): SlotStatus => {
      const now = new Date();
      const rowDate = fromDateInput(selectedDate);
      const isToday = selectedDate === today;
      const isPast =
        isToday && (hour < now.getHours() || (hour === now.getHours() && now.getMinutes() > 0));

      if (isPast) {
        return "unavailable";
      }

      const blocked = blockedSchedules.find(
        (row) => row.court_id === courtId && overlaps(hour, row.start_at, row.end_at),
      );
      if (blocked) {
        const reason = (blocked.reason || "").toLowerCase();
        if (reason === "open play") {
          return "open play";
        }
        if (reason === "cancelled") {
          return "cancelled";
        }
        return "unavailable";
      }

      const booking = bookings.find(
        (row) =>
          row.court_id === courtId &&
          row.status !== "cancelled" &&
          overlaps(hour, row.start_at, row.end_at),
      );

      if (!booking) {
        return "available";
      }

      return booking.status === "pending" ? "pending" : "booked";
    },
    [blockedSchedules, bookings, selectedDate, today],
  );

  const summary = useMemo(() => {
    if (selectedSlots.length === 0) {
    return {
      selectedTimeText: "No slot selected",
      courts: [],
      duration: 0,
      subtotal: 0,
      serviceFee: 0,
      total: 0,
      rateLabel: "-",
    };
    }
    
    let totalSubtotal = 0;
    let totalDuration = 0;
    let totalServiceFee = 0;
    const breakdown: Array<{ name: string; startHour: number; endHour: number; subtotal: number; hours: number[] }> = [];

    for (const slot of selectedSlots) {
      const ordered = [...slot.hours].sort((a, b) => a - b);
      const start = ordered[0];
      const end = ordered[ordered.length - 1] + 1;
      const subtotal = ordered.reduce((total, hour) => total + getRateForHour(hour), 0);
      const name = courts.find((court) => court.id === slot.courtId)?.name ?? "-";
      const serviceFee = ordered.length * 20;
      totalServiceFee += serviceFee;
      breakdown.push({ name, startHour: start, endHour: end, subtotal, hours: ordered });
      totalSubtotal += subtotal;
      totalDuration += ordered.length;
    }

    const dayHours = selectedSlots.reduce((total, slot) => total + slot.hours.filter((hour) => hour < 17).length, 0);
    const eveningHours = selectedSlots.reduce((total, slot) => total + slot.hours.filter((hour) => hour >= 17).length, 0);
    const rateLabel = [
      dayHours ? `P200 x ${dayHours}` : "",
      eveningHours ? `P300 x ${eveningHours}` : "",
    ]
      .filter(Boolean)
      .join(" + ");

    return {
      selectedTimeText: breakdown.map((c) => `${c.name} ${formatHour(c.startHour)}-${formatHour(c.endHour)}`).join(", "),
      courts: breakdown,
      duration: totalDuration,
      subtotal: totalSubtotal,
      serviceFee: totalServiceFee,
      total: totalSubtotal + totalServiceFee,
      rateLabel,
    };
  }, [courts, selectedSlots]);

  const canBook = selectedSlots.length > 0 && Boolean(playerName) && Boolean(playerEmail);

  const clearSelection = () => {
    setSelectedSlots([]);
  };

  const acceptRules = () => {
    window.localStorage.setItem(RULES_KEY, "accepted");
    setHasAcceptedRules(true);
  };

  const handleSlotClick = (courtId: number, hour: number, status: SlotStatus) => {
    if (status !== "available" && status !== "selected") {
      return;
    }

    const existingIndex = selectedSlots.findIndex((slot) => slot.courtId === courtId);

    if (existingIndex >= 0) {
      const existing = selectedSlots[existingIndex];

      if (existing.hours.includes(hour)) {
        const nextHours = existing.hours.filter((entry) => entry !== hour);
        if (nextHours.length === 0) {
          setSelectedSlots((prev) => prev.filter((_, idx) => idx !== existingIndex));
        } else {
          setSelectedSlots((prev) =>
            prev.map((slot, idx) => (idx === existingIndex ? { ...slot, hours: nextHours } : slot)),
          );
        }
        setErrorMessage(null);
        return;
      }

      if (existing.hours.length >= MAX_CONSECUTIVE_HOURS) {
        setErrorMessage(`Maximum ${MAX_CONSECUTIVE_HOURS} consecutive hours per court.`);
        return;
      }

      const nextHours = [...existing.hours, hour];
      if (!isContiguous(nextHours)) {
        setErrorMessage("Select only consecutive hours for one reservation.");
        return;
      }

      setErrorMessage(null);
      setSelectedSlots((prev) =>
        prev.map((slot, idx) => (idx === existingIndex ? { ...slot, hours: nextHours.sort((a, b) => a - b) } : slot)),
      );
      return;
    }

    if (selectedSlots.length >= MAX_SELECTABLE_COURTS) {
      setErrorMessage(`You can only reserve up to ${MAX_SELECTABLE_COURTS} courts at once.`);
      return;
    }

    setErrorMessage(null);
    setSelectedSlots((prev) => [...prev, { courtId, hours: [hour] }]);
  };

  const bookingAction = async (): Promise<string[]> => {
    const bookingIds: string[] = [];

    if (selectedSlots.length === 0) {
      return bookingIds;
    }

    const currentSummary = summary;

    for (const slot of selectedSlots) {
      const ordered = [...slot.hours].sort((a, b) => a - b);
      const startHour = ordered[0];
      const durationHours = ordered.length;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courtId: slot.courtId,
          date: selectedDate,
          startHour,
          durationHours,
          playerName,
          playerEmail,
          playerPhone,
        }),
      });

      const payload = (await response.json()) as { data?: { id: string }; message?: string };
      if (!response.ok) {
        setErrorMessage(payload.message || `Failed to create booking for Court ${slot.courtId}.`);
        return [];
      }

      if (payload.data?.id) {
        bookingIds.push(payload.data.id);
      }
    }

    setErrorMessage(null);
    setPaymentDetails({
      courts: currentSummary.courts,
      duration: currentSummary.duration,
      subtotal: currentSummary.subtotal,
      serviceFee: currentSummary.serviceFee,
      total: currentSummary.total,
      dateLabel: selectedDateLabel,
    });
    clearSelection();
    await fetchAvailability();
    return bookingIds;
  };

  return (
    <div className="min-h-screen">
      

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 grid-cols-1 xl:grid-cols-[0.7fr_1.3fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-5"
        >
          <article className="glass card-shadow overflow-hidden rounded-3xl border border-blue-100">
<div
               className="h-64 bg-cover bg-center"
               style={{
                 backgroundImage:
                   "url('/hideout.png')",
               }}
             />
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl font-semibold text-slate-900">{clubDetails.name}</h1>
                  <p className="text-sm text-slate-600">{clubDetails.location}</p>
                </div>
                <div className="rounded-2xl bg-blue-50 px-4 py-2 text-right">
                  <p className="font-semibold text-blue-800">{clubDetails.tagline}</p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-slate-700">
                Reserve indoor sessions in a premium environment designed for focused rallies, coaching, and competitive
                games. Choose Court 1 or Court 2 and lock your slots instantly.
              </p>
            </div>
          </article>

          <article className="glass card-shadow rounded-3xl border border-blue-100 p-6">
            <h2 className="font-display text-xl font-semibold text-slate-900">Club Info</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li className="flex justify-between gap-3 border-b border-slate-200 pb-2">
                <span className="text-slate-500">Operating Hours</span>
                <span className="font-medium">8:00 AM - 12:00 AM</span>
              </li>
              <li className="flex justify-between gap-3 border-b border-slate-200 pb-2">
                <span className="text-slate-500">Morning Rate</span>
                <span className="font-medium">P200 / hour</span>
              </li>
              <li className="flex justify-between gap-3 border-b border-slate-200 pb-2">
                <span className="text-slate-500">Evening Rate</span>
                <span className="font-medium">P300 / hour</span>
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-slate-500">Indoor Courts</span>
                <span className="font-medium">2 Total</span>
              </li>
            </ul>
          </article>

          <article className="glass card-shadow rounded-3xl border border-blue-100 p-6">
            <h2 className="font-display text-xl font-semibold text-slate-900">Court Rules</h2>
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
              <li>First come, first served.</li>
              <li>No double booking and no overlapping time selections.</li>
              <li>Maximum of 4 consecutive hours per reservation.</li>
              <li>Bookings cannot exceed operating hours.</li>
            </ul>
          </article>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.08 }}
          className="space-y-5"
        >
          <article className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl font-semibold text-slate-900">Book a Court</h2>
                <p className="text-sm text-slate-500">Live availability updated at {liveAvailabilityText}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate((current) => (current > today ? shiftDate(current, -1) : current));
                    clearSelection();
                  }}
                  disabled={selectedDate <= today}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 min-h-[44px]"
                >
                  Previous
                </button>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    clearSelection();
                  }}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none ring-blue-200 focus:ring-2 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDate((current) => shiftDate(current, 1));
                    clearSelection();
                  }}
                  disabled={selectedDate >= shiftDate(today, 30)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 min-h-[44px]"
                >
                  Next
                </button>
              </div>
            </div>

<div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 sm:grid-cols-3 lg:grid-cols-7">
                <span className="inline-flex items-center gap-2 rounded-lg bg-white px-2 py-1 font-medium">
                  <i className="h-2 w-2 rounded-full bg-emerald-500" /> Available
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-white px-2 py-1 font-medium">
                  <i className="h-2 w-2 rounded-full bg-rose-600" /> Unavailable
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-white px-2 py-1 font-medium">
                  <i className="h-2 w-2 rounded-full bg-indigo-500" /> Booked
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-white px-2 py-1 font-medium">
                  <i className="h-2 w-2 rounded-full bg-blue-600" /> Selected
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-white px-2 py-1 font-medium">
                  <i className="h-2 w-2 rounded-full bg-emerald-600" /> Open Play
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-white px-2 py-1 font-medium">
                  <i className="h-2 w-2 rounded-full bg-amber-500" /> Pending
                </span>
              </div>

            {errorMessage && (
              <p className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{errorMessage}</p>
            )}

             <div className="mt-4 grid gap-4 grid-cols-1 xl:grid-cols-[1fr_300px]">
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <div className="max-h-[65vh] overflow-y-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-100 text-left text-slate-700">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Time</th>
                        {courts.map((court) => (
                          <th key={court.id} className="px-3 py-2 text-center font-semibold">
                            {court.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr>
                          <td colSpan={Math.max(2, courts.length + 1)} className="px-4 py-6 text-center text-slate-500">
                            Loading schedule...
                          </td>
                        </tr>
                      ) : (
                        timeRows.map((hour) => (
                          <tr key={hour} className="border-t border-slate-200 bg-white even:bg-slate-50/70">
                            <td className="px-3 py-2 font-medium text-slate-700">{formatHour(hour)}</td>
                            {courts.map((court) => {
                              const slotForCourt = selectedSlots.find((slot) => slot.courtId === court.id);
                              const selected = slotForCourt ? slotForCourt.hours.includes(hour) : false;
                              const effectiveStatus = selected ? "selected" : getSlotStatus(court.id, hour);
                              const clickable = effectiveStatus === "available" || effectiveStatus === "selected";

                              return (
                                <td key={`${court.id}-${hour}`} className="px-3 py-2">
                                   <button
                                     type="button"
                                     disabled={!clickable}
                                     onClick={() => handleSlotClick(court.id, hour, effectiveStatus)}
                                     className={`w-full min-h-[44px] rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${statusStyles(effectiveStatus)}`}
                                   >
                                     {effectiveStatus}
                                   </button>
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <aside className="sticky top-24 h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="font-display text-lg font-semibold text-slate-900">Booking Summary</h3>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Selected Date</span>
                    <span className="font-medium">{selectedDateLabel}</span>
                  </p>
                  {summary.selectedTimeText === "No slot selected" ? (
                    <>
                      <p className="flex justify-between gap-3">
                        <span className="text-slate-500">Selected Court</span>
                        <span className="font-medium">-</span>
                      </p>
                      <p className="flex justify-between gap-3">
                        <span className="text-slate-500">Selected Time</span>
                        <span className="font-medium">{summary.selectedTimeText}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Selected Courts</p>
                        {summary.courts.map((court, index) => (
                          <div key={index} className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-slate-900">{court.name}</span>
                              <span className="font-semibold text-blue-700">
                                {formatHour(court.startHour)} - {formatHour(court.endHour)}
                              </span>
                            </div>
                            <div className="mt-1 flex items-center justify-between gap-3 text-xs text-slate-600">
                              <span>{court.hours.length} hour(s)</span>
                              <span>P{court.subtotal}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="flex justify-between gap-3">
                        <span className="text-slate-500">Duration</span>
                        <span className="font-medium">{summary.duration} hour(s)</span>
                      </p>
                    </>
                  )}
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Rate</span>
                    <span className="font-medium">{summary.rateLabel}</span>
                  </p>
                  <p className="flex justify-between gap-3 border-t border-slate-200 pt-2">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-medium">P{summary.subtotal}</span>
                  </p>
                  <p className="flex justify-between gap-3">
                    <span className="text-slate-500">Service Fee</span>
                    <span className="font-medium">P{summary.serviceFee}</span>
                  </p>
                  <p className="flex justify-between gap-3 text-base font-semibold text-slate-900">
                    <span>Total</span>
                    <span>P{summary.total}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedSlots.length > 0 && selectedSlots.length < MAX_SELECTABLE_COURTS
                      ? `You can add ${MAX_SELECTABLE_COURTS - selectedSlots.length} more court(s).`
                      : selectedSlots.length === MAX_SELECTABLE_COURTS
                        ? `Maximum ${MAX_SELECTABLE_COURTS} courts selected.`
                        : ""}
                  </p>
                </div>

                <div className="mt-4 space-y-2">
                  <input
                    value={playerName}
                    onChange={(event) => setPlayerName(event.target.value)}
                    placeholder="Full name"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                  />
                  <input
                    type="email"
                    value={playerEmail}
                    onChange={(event) => setPlayerEmail(event.target.value)}
                    placeholder="Email"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                  />
                  <input
                    value={playerPhone}
                    onChange={(event) => setPlayerPhone(event.target.value)}
                    placeholder="Phone (optional)"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none ring-blue-200 focus:ring-2"
                  />
                  <button
                    type="button"
                    onClick={() => canBook && setShowReviewModal(true)}
                    disabled={!canBook}
                    className="w-full min-h-[44px] rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Review & Confirm
                  </button>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="w-full min-h-[44px] rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    Clear Selection
                  </button>
                </div>
              </aside>
            </div>
          </article>
        </motion.section>
      </div>
      </div>

      <AnimatePresence>
        {!hasAcceptedRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4"
          >
            <motion.div
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white"
            >
              <header className="rounded-t-3xl bg-slate-950 px-6 py-5 text-white sm:px-8">
                <p className="inline-flex rounded-full bg-lime-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-900">
                  Important Notice
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold">Please Review Before Booking</h2>
                <p className="mt-2 text-sm text-slate-300">
                  Court rates and reservation policies apply to every Hideout booking transaction.
                </p>
              </header>

              <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
                <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <h3 className="font-semibold text-emerald-800">Court Rates</h3>
                  <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700">8:00 AM - 4:59 PM: P200/hour</p>
                  <p className="mt-2 rounded-xl bg-white p-3 text-sm text-slate-700">5:00 PM - 12:00 AM: P300/hour</p>
                </article>

                <article className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <h3 className="font-semibold text-blue-800">Equipment Rental</h3>
                  <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700">Paddle: Coming Soon</p>
                  <p className="mt-2 rounded-xl bg-white p-3 text-sm text-slate-700">Ball: Coming Soon</p>
                </article>

                <article className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
                  <h3 className="font-semibold text-orange-800">Booking Policies</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>First come, first served.</li>
                    <li>Full payment confirms reservation.</li>
                    <li>No double booking.</li>
                    <li>Maximum 4 consecutive hours.</li>
                    <li>Arrive on time.</li>
                    <li>Bookings cannot exceed operating hours.</li>
                  </ul>
                </article>

                <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:col-span-3">
                  <h3 className="font-semibold text-rose-800">Cancellation and Rescheduling</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>Admin approval required.</li>
                    <li>No refunds after reservation starts.</li>
                    <li>Reschedule only before the booking time.</li>
                    <li>No-shows are non-refundable.</li>
                  </ul>
                </article>

                <button
                  type="button"
                  onClick={acceptRules}
                  className="sm:col-span-3 rounded-xl bg-lime-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-lime-600"
                >
                  I Understand and Continue
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-3xl bg-white">
            <header className="rounded-t-3xl bg-slate-950 px-6 py-5 text-white sm:px-8">
              <p className="inline-flex rounded-full bg-lime-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-900">
                Review Before Booking
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold">Confirm Your Reservation</h2>
              <p className="mt-2 text-sm text-slate-300">
                Please review your selected courts, rates, and policies before confirming.
              </p>
            </header>

            <div className="space-y-4 p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <h3 className="font-semibold text-emerald-800">Court Rates</h3>
                  <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700">8:00 AM - 4:59 PM: P200/hour</p>
                  <p className="mt-2 rounded-xl bg-white p-3 text-sm text-slate-700">5:00 PM - 12:00 AM: P300/hour</p>
                </article>

                <article className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <h3 className="font-semibold text-blue-800">Service Fee</h3>
                  <p className="mt-3 rounded-xl bg-white p-3 text-sm text-slate-700">P20 per transaction</p>
                </article>

                <article className="rounded-2xl border border-orange-200 bg-orange-50 p-4 sm:col-span-2">
                  <h3 className="font-semibold text-orange-800">Booking Policies</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>First come, first served.</li>
                    <li>No double booking and no overlapping time selections.</li>
                    <li>Maximum of 4 consecutive hours per reservation.</li>
                    <li>Bookings cannot exceed operating hours.</li>
                    <li>Select up to 2 courts at once for simultaneous reservations.</li>
                  </ul>
                </article>

                <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4 sm:col-span-2">
                  <h3 className="font-semibold text-rose-800">Cancellation and Rescheduling</h3>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>Admin approval required.</li>
                    <li>No refunds after reservation starts.</li>
                    <li>Reschedule only before the booking time.</li>
                    <li>No-shows are non-refundable.</li>
                  </ul>
                </article>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="space-y-2 text-sm text-slate-700">
                  {summary.courts.map((court, index) => (
                    <div key={index} className="flex items-center justify-between gap-3">
                      <span className="font-medium text-slate-900">{court.name} ({court.hours.length} hour(s))</span>
                      <span className="font-semibold text-blue-700">P{court.subtotal}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-2">
                    <span className="font-medium text-slate-900">Subtotal</span>
                    <span className="font-medium">P{summary.subtotal}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium text-slate-900">Service Fee</span>
                    <span className="font-medium">P{summary.serviceFee}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 text-base font-semibold text-slate-900">
                    <span>Total</span>
                    <span>P{summary.total}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setShowReviewModal(false);
                    const ids = await bookingAction();
                    if (ids.length > 0) {
                      setPaymentStep({ bookingIds: ids });
                    }
                  }}
                  className="rounded-xl bg-lime-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-lime-600"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {paymentStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/65 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white">
            <header className="rounded-t-3xl bg-slate-950 px-6 py-5 text-white sm:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="inline-flex rounded-full bg-lime-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-900">
                    Payment Required
                  </p>
                  <h2 className="mt-3 font-display text-3xl font-semibold">Complete Your Reservation</h2>
                  <p className="mt-2 text-sm text-slate-300">
                    Upload your GCash payment receipt to confirm your booking.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Time remaining</p>
                  <p className="font-display text-2xl font-semibold text-lime-300">
                    {Math.floor(paymentTimer / 60)}:{(paymentTimer % 60).toString().padStart(2, "0")}
                  </p>
                </div>
              </div>
            </header>

            <div className="grid gap-4 p-4 sm:p-6 md:grid-cols-2">
              <div className="space-y-4">
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-display text-lg font-semibold text-slate-900">Reservation Summary</h3>
                  <div className="mt-3 space-y-2 text-sm text-slate-700">
                    {paymentDetails?.courts.map((court, index) => (
                      <div key={index} className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                        <span className="font-medium">{court.name}</span>
                        <span>{formatHour(court.startHour)} - {formatHour(court.endHour)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between gap-3 border-b border-slate-200 pt-2">
                      <span className="text-slate-500">Date</span>
                      <span className="font-medium">{paymentDetails?.dateLabel}</span>
                    </div>
                    <div className="flex justify-between gap-3 border-b border-slate-200 pt-2">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-medium">{paymentDetails?.duration} hour(s)</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-medium">P{paymentDetails?.subtotal}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-slate-500">System Usage Fee</span>
                      <span className="font-medium">P{paymentDetails?.serviceFee}</span>
                    </div>
                    <div className="flex justify-between gap-3 text-base font-semibold text-slate-900">
                      <span>Total to Pay</span>
                      <span>P{paymentDetails?.total}</span>
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <h3 className="font-semibold text-blue-800">GCash Payment Instructions</h3>
                  <div className="mt-3 space-y-3 text-sm text-slate-700">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</p>
                      <p className="mt-1 font-display text-xl font-bold text-blue-700">P{paymentDetails?.total}</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">GCash Number</p>
                      <p className="mt-1 font-mono text-lg font-bold text-slate-900">0917-105-8580</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Account Name</p>
                      <p className="mt-1 font-medium text-slate-900">Hideout Court and Cafe</p>
                    </div>
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step-by-Step Guide</p>
                      <ol className="mt-2 list-inside list-decimal space-y-1">
                        <li>Open your GCash app.</li>
                        <li>Tap Send Money and enter 0917-105-8580.</li>
                        <li>Enter the exact amount: P{paymentDetails?.total}.</li>
                        <li>Add a note: Booking - {playerName}.</li>
                        <li>Confirm and complete the payment.</li>
                        <li>Take a screenshot of the success screen.</li>
                        <li>Upload the screenshot below.</li>
                      </ol>
                    </div>
                  </div>
                </article>
              </div>

              <div className="space-y-4">
                <article className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
                  <h3 className="font-display text-lg font-semibold text-slate-900">Scan QR Code</h3>
                  <p className="mt-1 text-xs text-slate-500">Or use the QR code to pay instantly.</p>
                  <div className="mt-4 flex justify-center">
                    <QRCodeCanvas
                      value={`GCASH:09171234567:${paymentDetails?.total}:Booking-${playerName}`}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#1e40af"
                      level="M"
                    />
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-4">
                  <h3 className="font-display text-lg font-semibold text-slate-900">Upload Receipt</h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Accepted formats: JPEG, PNG, WebP (max 5MB).
                  </p>
                  <div className="mt-3">
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 transition hover:border-blue-400 hover:bg-blue-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-8 w-8 text-slate-400"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span className="text-sm font-medium text-slate-700">
                        {paymentReceipt ? paymentReceipt.name : "Click to upload screenshot"}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          if (!file) return;
                          if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
                            setErrorMessage("Invalid file type. Only JPEG, PNG, and WebP are allowed.");
                            return;
                          }
                          if (file.size > 5 * 1024 * 1024) {
                            setErrorMessage("File size exceeds 5MB.");
                            return;
                          }
                          setPaymentReceipt(file);
                          setPaymentPreview(URL.createObjectURL(file));
                          setErrorMessage(null);
                        }}
                      />
                    </label>
                    {paymentPreview && (
                      <div className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={paymentPreview}
                        alt="Receipt preview"
                        className="w-full rounded-xl border border-slate-200 object-contain"
                      />
                      </div>
                    )}
                  </div>
                </article>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={!paymentReceipt || paymentUploading}
                    onClick={async () => {
                      if (!paymentReceipt || !paymentStep) return;
                      setPaymentUploading(true);
                      setErrorMessage(null);

                      try {
                        const formData = new FormData();
                        formData.set("file", paymentReceipt);

                        const uploadResponse = await fetch("/api/upload/receipt", {
                          method: "POST",
                          body: formData,
                        });

                         const uploadPayload = (await uploadResponse.json()) as { url?: string; message?: string };
                         if (!uploadResponse.ok) {
                           throw new Error(uploadPayload.message || "Failed to upload receipt.");
                         }

                         for (const bookingId of paymentStep.bookingIds) {
                           const patchResponse = await fetch("/api/bookings", {
                             method: "PATCH",
                             headers: {
                               "Content-Type": "application/json",
                             },
                              body: JSON.stringify({
                                id: bookingId,
                                status: "pending",
                                payment_receipt_url: uploadPayload.url,
                              }),
                           });

                           const patchPayload = (await patchResponse.json()) as { message?: string; details?: string };
                           if (!patchResponse.ok) {
                             const details = patchPayload.details || patchPayload.message || "Failed to confirm booking.";
                             throw new Error(details);
                           }
                         }

                         setPaymentStep(null);
                        setPaymentReceipt(null);
                        setPaymentPreview(null);
                        await fetchAvailability();
                      } catch (error) {
                        setErrorMessage(error instanceof Error ? error.message : "Something went wrong.");
                      } finally {
                        setPaymentUploading(false);
                      }
                    }}
                    className="w-full rounded-xl bg-lime-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-lime-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {paymentUploading ? "Uploading..." : "Upload Receipt"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentStep(null);
                      setPaymentReceipt(null);
                      setPaymentPreview(null);
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
