export default function DashboardCalendarPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Calendar</h1>
      <p className="mt-1 text-sm text-slate-600">Click a date to inspect Court 1 and Court 2 bookings.</p>
      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
        Monthly calendar placeholder. Court-specific booking details appear per selected date.
      </div>
    </div>
  );
}
