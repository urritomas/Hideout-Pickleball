export default function DashboardSettingsPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-600">Manage pricing bands and operating hours.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Day Rate (8:00 AM - 4:59 PM)
          <input defaultValue="200" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-1" />
        </label>
        <label className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          Evening Rate (5:00 PM - 12:00 AM)
          <input defaultValue="300" className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-2 py-1" />
        </label>
      </div>
    </div>
  );
}
