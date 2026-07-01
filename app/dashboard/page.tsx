const overviewCards = [
  { label: "Today's Bookings", value: "18", delta: "+12%" },
  { label: "Active Users", value: "124", delta: "+6%" },
  { label: "Today's Revenue", value: "PHP 5,200", delta: "+18%" },
  { label: "Court Utilization", value: "72%", delta: "+4%" },
];

export default function DashboardOverviewPage() {
  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-3xl border border-blue-100 bg-slate-900 p-6 text-white shadow-sm">
        <h1 className="font-display text-3xl font-semibold text-slate-900">Overview</h1>
        <p className="mt-1 text-sm text-slate-300">Operational snapshot for Hideout Pickleball Club.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => (
          <article key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 font-display text-2xl font-semibold text-slate-900">{card.value}</p>
            <p className="mt-2 text-xs font-medium text-emerald-600">{card.delta} this week</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-slate-900">Recent Reservations</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p className="rounded-xl bg-slate-50 px-3 py-2">Court 1 - 7:00 PM - Mika Cruz - Paid</p>
            <p className="rounded-xl bg-slate-50 px-3 py-2">Court 2 - 8:00 PM - Ari Santos - Pending</p>
            <p className="rounded-xl bg-slate-50 px-3 py-2">Court 1 - 9:00 PM - Ken Ramos - Paid</p>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-xl font-semibold text-slate-900">Payment Status</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p className="rounded-xl bg-emerald-50 px-3 py-2 text-emerald-700">Paid: 14 transactions</p>
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-amber-700">Pending: 3 transactions</p>
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-rose-700">Failed: 1 transaction</p>
          </div>
        </article>
      </section>
    </div>
  );
}
