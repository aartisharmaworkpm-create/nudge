"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { PLANS, isTrialActive } from "@/lib/plans";

function PlanCard({ plan, trialEndsAt }: { plan: string; trialEndsAt: Date | string | null }) {
  const isTrial    = plan === "TRIAL";
  const isCanceled = plan === "CANCELED";
  const planConfig = PLANS[plan as keyof typeof PLANS];
  const label      = planConfig?.label ?? plan;

  const trialActive   = isTrial ? isTrialActive(trialEndsAt ? new Date(trialEndsAt) : null) : false;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86400000))
    : 0;

  const bg     = isCanceled ? "bg-gray-100 border-gray-200"
               : isTrial    ? "bg-amber-50 border-amber-200"
               :               "bg-teal-50 border-teal-200";
  const dot    = isCanceled ? "bg-gray-400"
               : isTrial    ? "bg-amber-400"
               :               "bg-teal-500";
  const text   = isCanceled ? "text-gray-500"
               : isTrial    ? "text-amber-800"
               :               "text-teal-900";
  const sub    = isCanceled ? "Subscription ended"
               : isTrial && trialActive  ? `${trialDaysLeft} day${trialDaysLeft !== 1 ? "s" : ""} left in trial`
               : isTrial && !trialActive ? "Trial ended"
               :                           "Active subscription";

  return (
    <Link
      href="/settings?tab=billing"
      className={`block rounded-xl border px-3 py-2.5 transition-colors hover:brightness-95 ${bg}`}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
        <span className={`text-xs font-bold ${text}`}>{label} plan</span>
      </div>
      <p className={`text-xs pl-4 ${isCanceled || (isTrial && !trialActive) ? "text-red-500 font-medium" : "text-gray-500"}`}>
        {sub}
      </p>
    </Link>
  );
}

const NAV = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/invoices/new",
    label: "Add invoice",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: "/transactions",
    label: "Transactions",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Settings",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export default function Sidebar({
  businessName,
  userEmail,
  plan,
  trialEndsAt,
}: {
  businessName: string;
  userEmail: string;
  plan: string;
  trialEndsAt: Date | string | null;
}) {
  const pathname = usePathname();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <Link href="/" className="text-xl font-black text-gray-900 tracking-tight hover:opacity-75 transition-opacity">Nudge.</Link>
          <p className="text-xs text-gray-400 mt-0.5 truncate">{businessName}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-teal-50 text-teal-900"
                    : "text-gray-600 hover:bg-cream hover:text-gray-900"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Plan card */}
        <div className="px-3 pb-3">
          <PlanCard plan={plan} trialEndsAt={trialEndsAt} />
        </div>

        {/* User */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-cream hover:text-gray-700 w-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Sign out confirmation modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Sign out</h2>
            <p className="text-sm text-gray-500 mb-6">
              Sad to see you go. Are you sure you want to sign out?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex-1 bg-teal-800 text-white rounded-lg py-2 text-sm font-medium hover:bg-teal-900 transition-colors"
              >
                Yes, sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
