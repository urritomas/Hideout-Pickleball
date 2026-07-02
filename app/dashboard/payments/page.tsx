export default function DashboardPaymentsPage() {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
      <h1 className="font-display text-xl sm:text-2xl font-semibold text-slate-900">Payments</h1>
      <p className="mt-1 text-xs sm:text-sm text-slate-600">Audit payment status and recent transaction records.</p>
      <div className="mt-4 sm:mt-6 space-y-3 text-sm text-slate-700">
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">BK-1001 - Paid - PHP 600</div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">BK-1002 - Pending - PHP 400</div>
      </div>
    </div>
  );
}
