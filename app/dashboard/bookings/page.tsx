export default function DashboardBookingsPage() {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h1 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">Today&apos;s Bookings</h1>
      <p className="mt-1 text-xs sm:text-sm text-slate-600">Manage active reservations, add walk-ins, and cancel conflicts.</p>
      <div className="mt-6">
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="py-2">Time</th>
                <th className="py-2">Court</th>
                <th className="py-2">Player</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              <tr>
                <td className="py-3">10:00 AM</td>
                <td className="py-3">Court 1</td>
                <td className="py-3">Rhea Cruz</td>
                <td className="py-3">Confirmed</td>
              </tr>
              <tr>
                <td className="py-3">7:00 PM</td>
                <td className="py-3">Court 2</td>
                <td className="py-3">Liam Santos</td>
                <td className="py-3">Confirmed</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="md:hidden space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">10:00 AM</p>
            <p className="text-sm text-slate-600">Court 1 · Rhea Cruz</p>
            <p className="text-sm font-medium text-emerald-700">Confirmed</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">7:00 PM</p>
            <p className="text-sm text-slate-600">Court 2 · Liam Santos</p>
            <p className="text-sm font-medium text-emerald-700">Confirmed</p>
          </div>
        </div>
      </div>
    </div>
  );
}
