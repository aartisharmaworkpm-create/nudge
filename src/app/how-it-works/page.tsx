import Link from "next/link";
import { auth } from "@/lib/auth";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "How it works — Nudge",
  description: "See how Nudge automates your invoice follow-ups via email and WhatsApp so you get paid faster.",
};

export default async function HowItWorksPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-cream text-gray-900 font-sans">
      <PublicHeader activePage="how-it-works" isLoggedIn={isLoggedIn} />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-14 text-center">
        <p className="text-xs font-bold tracking-widest uppercase text-teal-700 mb-4">How it works</p>
        <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-5">
          From invoice sent to<br />
          <span className="italic text-teal-700">payment received.</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
          Nudge handles every follow-up automatically — polite, professional, and persistent — so you never have to chase a client again.
        </p>
      </section>

      {/* Step-by-step */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl px-8 py-7 flex gap-6 items-start"
            >
              {/* Number */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-black text-sm">
                {i + 1}
              </div>
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{step.emoji}</span>
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Message preview mockup */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">What your clients actually receive</h2>
            <p className="text-gray-500 text-sm">
              Nudge sends professional, personalised reminders that feel human — not automated spam.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Email preview */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs text-gray-400 ml-2">Email reminder</span>
              </div>
              <div className="p-5">
                <p className="text-xs text-gray-400 mb-1">From: Acme Studio &lt;invoices@acme.io&gt;</p>
                <p className="text-xs text-gray-400 mb-4">Subject: Friendly reminder — Invoice #1042 is due</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Hi Rahul,<br /><br />
                  Just a quick note — Invoice <span className="font-semibold">#1042</span> for <span className="font-semibold">₹45,000</span> was due on <span className="font-semibold">April 10th</span>.<br /><br />
                  If you&apos;ve already paid, please ignore this. Otherwise, you can settle it here:
                </p>
                <div className="mt-4 inline-block bg-teal-800 text-white text-xs font-semibold px-4 py-2 rounded-lg">
                  Pay now →
                </div>
                <p className="text-xs text-gray-400 mt-4">
                  Thanks,<br />Acme Studio
                </p>
              </div>
            </div>

            {/* WhatsApp preview */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <div className="bg-[#075e54] px-5 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">R</div>
                <div>
                  <p className="text-white text-sm font-semibold">Rahul Sharma</p>
                  <p className="text-green-200 text-xs">WhatsApp reminder</p>
                </div>
              </div>
              <div className="bg-[#e5ddd5] p-4 space-y-3 min-h-[200px]">
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-2.5 max-w-[85%] shadow-sm">
                  <p className="text-sm text-gray-800 leading-relaxed">
                    Hi Rahul 👋 This is a friendly reminder from <span className="font-semibold">Acme Studio</span>.<br /><br />
                    Invoice <span className="font-semibold">#1042</span> for <span className="font-semibold">₹45,000</span> is overdue.<br /><br />
                    Please clear it at your earliest convenience. Need any help? Just reply here.
                  </p>
                  <p className="text-right text-xs text-gray-400 mt-1">10:32 AM ✓✓</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline / schedule */}
      <section className="max-w-2xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-gray-900 mb-3">The follow-up schedule</h2>
          <p className="text-gray-500 text-sm">Nudge automatically spaces reminders so they&apos;re firm without being annoying.</p>
        </div>
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />
          <div className="space-y-6">
            {timeline.map((item, i) => (
              <div key={i} className="flex gap-5 pl-2">
                <div className={`relative z-10 flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 ${item.color}`}>
                  {item.icon}
                </div>
                <div className="pt-1">
                  <p className="text-sm font-semibold text-gray-900">{item.when}</p>
                  <p className="text-sm text-gray-500">{item.what}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">Common questions</h2>
          <div className="space-y-4">
            {faq.map(({ q, a }) => (
              <div key={q} className="border border-gray-200 rounded-2xl px-6 py-4">
                <p className="font-semibold text-gray-900 mb-1">{q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h2 className="text-4xl font-black text-gray-900 mb-4">Ready to stop chasing?</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Join hundreds of freelancers and small businesses who use Nudge to get paid on time — without the stress.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-teal-800 text-white px-8 py-4 rounded-xl text-base font-bold hover:bg-teal-900 transition-colors shadow-lg shadow-teal-900/20"
        >
          Start your free trial →
        </Link>
        <p className="text-xs text-gray-400 mt-4">14 days free · No credit card required</p>
      </section>

      <Footer />
    </div>
  );
}

const steps = [
  {
    emoji: "📄",
    title: "Add your invoice",
    description:
      "Enter your client's details, invoice amount, and due date. Takes under 60 seconds. You can also import from Zoho, Freshbooks, or paste a PDF later.",
  },
  {
    emoji: "⚙️",
    title: "Nudge sets up your follow-up schedule",
    description:
      "Based on the due date and your plan, Nudge automatically schedules a sequence of reminders — before the due date, on the day, and escalating messages if unpaid.",
  },
  {
    emoji: "✉️",
    title: "Reminders go out automatically",
    description:
      "Nudge sends personalised email and WhatsApp messages to your client on your behalf — using your business name. Clients see a professional, friendly reminder, not an automated blast.",
  },
  {
    emoji: "🔔",
    title: "You get notified of client activity",
    description:
      "When a client opens a reminder, clicks the payment link, or replies — you'll know instantly. No more wondering if they even saw the invoice.",
  },
  {
    emoji: "✅",
    title: "Invoice marked paid — automatically",
    description:
      "Once payment is confirmed, Nudge stops all reminders for that invoice. If you use a payment link, this happens automatically. Or mark it paid yourself in one click.",
  },
];

const timeline = [
  {
    when: "3 days before due date",
    what: "Gentle heads-up email",
    icon: "📬",
    color: "border-teal-300 bg-teal-50 text-teal-700",
  },
  {
    when: "Due date",
    what: "Email + WhatsApp reminder",
    icon: "📅",
    color: "border-amber-300 bg-amber-50 text-amber-700",
  },
  {
    when: "3 days overdue",
    what: "Polite follow-up: \"Just checking in\"",
    icon: "⏰",
    color: "border-orange-300 bg-orange-50 text-orange-700",
  },
  {
    when: "7 days overdue",
    what: "Firm reminder with payment link",
    icon: "🔔",
    color: "border-red-300 bg-red-50 text-red-700",
  },
  {
    when: "14+ days overdue",
    what: "Final notice — you decide next steps",
    icon: "🚨",
    color: "border-red-400 bg-red-100 text-red-800",
  },
];

const faq = [
  {
    q: "Will my clients know it's automated?",
    a: "No. Messages go out under your business name and email. They look and feel like you personally wrote them — because the tone is human and personalised per invoice.",
  },
  {
    q: "What if my client has already paid?",
    a: "Mark the invoice as paid in Nudge and all reminders stop immediately. If you use a payment link, Nudge can detect this automatically.",
  },
  {
    q: "Can I customise the message tone?",
    a: "Yes — you can choose from friendly, neutral, or firm tones. Pro and Business plans let you fully customise the message templates.",
  },
  {
    q: "Does Nudge support WhatsApp?",
    a: "Yes. WhatsApp reminders are included from the Starter plan onwards. Messages are sent via WhatsApp Business API.",
  },
];
