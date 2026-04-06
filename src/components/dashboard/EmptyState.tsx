import Link from "next/link";

export default function EmptyState({ businessName }: { businessName: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-8 py-14 text-center">
      {/* Illustration */}
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-2">No invoices yet</h2>
      <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed mb-6">
        Add an overdue invoice and Nudge will send polite, escalating reminders to your client
        automatically — so you don&apos;t have to.
      </p>

      <Link
        href="/invoices/new"
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add your first invoice
      </Link>

      {/* How it works */}
      <div className="mt-10 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto">
        {[
          { n: "1", title: "Add invoice", desc: "5 fields. Client name, contact, amount, due date, payment link." },
          { n: "2", title: "Preview & approve", desc: "See exactly what your client will receive. Edit anything." },
          { n: "3", title: "Nudge handles it", desc: "Automated reminders go out. You get notified when delivered." },
        ].map(({ n, title, desc }) => (
          <div key={n} className="bg-gray-50 rounded-xl p-4">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mb-2">
              {n}
            </div>
            <p className="text-sm font-semibold text-gray-800 mb-1">{title}</p>
            <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
