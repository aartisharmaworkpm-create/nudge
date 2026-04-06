"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function WelcomeBanner({ businessName }: { businessName: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get("welcome") === "1") {
      setVisible(true);
      // Remove the query param cleanly without a page reload
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      router.replace(url.pathname, { scroll: false });
    }
  }, [searchParams, router]);

  if (!visible) return null;

  return (
    <div className="bg-blue-600 rounded-2xl px-6 py-5 mb-6 flex items-start justify-between gap-4">
      <div>
        <p className="text-white font-semibold text-base">
          Welcome to Nudge, {businessName} 🎉
        </p>
        <p className="text-blue-100 text-sm mt-1 leading-relaxed">
          You&apos;re set up. Add your first overdue invoice and we&apos;ll handle the chasing.
          Most users send their first automated reminder in under 5 minutes.
        </p>
        <Link
          href="/invoices/new"
          className="inline-flex items-center gap-1.5 mt-3 bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
        >
          Add your first invoice →
        </Link>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-blue-300 hover:text-white flex-shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
