export default function DashboardUsersPage() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Users</h1>
      <p className="mt-1 text-sm text-slate-600">Review user profiles, activity, and account status.</p>
      <ul className="mt-6 space-y-3 text-sm text-slate-700">
        <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Rhea Cruz - Active</li>
        <li className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">Liam Santos - Active</li>
      </ul>
    </div>
  );
}
