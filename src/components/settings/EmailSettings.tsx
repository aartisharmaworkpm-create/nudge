"use client";

import type { BusinessData } from "./SettingsClient";

export default function EmailSettings({
  business,
}: {
  business: BusinessData;
  onSaved: (b: BusinessData) => void;
}) {
  return (
    <div className="space-y-4">
      {/* How it works */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-1">Email sending</h2>
        <p className="text-sm text-gray-500 mb-5">
          Nudge sends invoice reminders via Gmail SMTP. Emails go out from the Gmail account
          configured by your Nudge admin — no setup needed on your end.
        </p>

        {/* From address preview */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-5">
          <p className="text-xs text-gray-400 mb-0.5">Your clients will receive emails as</p>
          <p className="text-sm font-medium text-gray-800">
            {business.name} &lt;your-nudge-gmail@gmail.com&gt;
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Your business name appears as the sender — clients see <strong>{business.name}</strong>, not a generic address.
          </p>
        </div>

        {/* How reminders look */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">What your clients receive</p>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
              </div>
              <span className="text-xs text-gray-400">Email preview</span>
            </div>
            <div className="p-4 space-y-1 text-xs text-gray-500">
              <p><span className="text-gray-400">From:</span> <span className="font-medium text-gray-700">{business.name} &lt;...@gmail.com&gt;</span></p>
              <p><span className="text-gray-400">Subject:</span> <span className="text-gray-700">Friendly reminder — Invoice #1042 is due</span></p>
              <p className="pt-2 text-gray-600 leading-relaxed">
                Hi [Client name], just a quick note — Invoice #1042 for ₹45,000 was due on April 10th.
                If you&apos;ve already paid, please ignore this…
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Tips for better deliverability</h3>
        <ul className="space-y-2.5">
          {[
            "Make sure your business name in Settings is accurate — it shows as the sender name.",
            "Ask clients to add the Nudge Gmail address to their contacts to avoid spam filters.",
            "Reminder messages are written in a conversational, human tone to improve open rates.",
            "Emails include a reply-to address — clients can reply directly and you'll receive it.",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2.5 text-sm text-gray-600">
              <svg className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
