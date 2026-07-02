export default function DashboardCourtsPage() {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h1 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">Courts</h1>
      <p className="mt-1 text-xs sm:text-sm text-slate-600">Block schedules, update operating hours, and monitor occupancy.</p>
      <div className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
        <article className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="font-semibold text-slate-900">Court 1</h2>
          <p className="mt-2 text-sm text-slate-600">Status: Available</p>
        </article>
        <article className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <h2 className="font-semibold text-slate-900">Court 2</h2>
          <p className="mt-2 text-sm text-slate-600">Status: Available</p>
        </article>
      </div>
    </div>
  );
}
