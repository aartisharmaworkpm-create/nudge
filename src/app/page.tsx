import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Nav />
      <Hero />
      <SocialProof />
      <Pain />
      <HowItWorks />
      <Features />
      <FinalCTA />
      <Footer />
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-bold text-blue-600 tracking-tight">Nudge</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get started free
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-blue-100">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Now in beta — free for early users
      </div>

      <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] mb-6">
        Stop chasing invoices.
        <br />
        <span className="text-blue-600">Start collecting them.</span>
      </h1>

      <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
        Nudge sends polite, escalating payment reminders to your clients via email and WhatsApp —
        automatically. You approve every message before it sends. You stay in control.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/signup"
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
        >
          Get started free
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-600 px-7 py-3.5 rounded-xl text-base font-medium hover:bg-gray-50 transition-colors"
        >
          Sign in
        </Link>
      </div>

      <p className="text-sm text-gray-400 mt-4">No credit card. No setup. Under 5 minutes to your first reminder.</p>
    </section>
  );
}

// ── Social proof ──────────────────────────────────────────────────────────────

function SocialProof() {
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          {[
            { stat: "90 → 30 days", label: "Average collection time in beta" },
            { stat: "0 awkward calls", label: "Nudge handles the follow-ups" },
            { stat: "< 5 minutes", label: "From signup to first reminder sent" },
          ].map(({ stat, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pain ──────────────────────────────────────────────────────────────────────

function Pain() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Sound familiar?</h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Payment chasing is one of the most draining parts of running a business.
          It&apos;s awkward, time-consuming, and it never ends.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            quote: "I sent the invoice three weeks ago. I've followed up twice. Now I don't know if I'm being ignored or if they just forgot.",
            who: "Freelance designer, London",
          },
          {
            quote: "Every time I chase a client I worry I'm damaging the relationship. So sometimes I just... don't. And then I wonder why my cashflow is awful.",
            who: "Agency founder, Manchester",
          },
          {
            quote: "I have invoices from six months ago that I'm still mentally tracking. It's a part-time job just remembering who owes me what.",
            who: "Consultant, Dublin",
          },
          {
            quote: "I finally got paid after four follow-ups. The client said they'd never seen the invoice. I don't know if I believe them, but I couldn't say that.",
            who: "Studio owner, New York",
          },
        ].map(({ quote, who }) => (
          <div key={who} className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <p className="text-gray-700 text-sm leading-relaxed mb-3">&ldquo;{quote}&rdquo;</p>
            <p className="text-xs text-gray-400 font-medium">{who}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 bg-blue-600 rounded-2xl px-8 py-6 text-center">
        <p className="text-white text-lg font-semibold">
          Nudge takes this off your plate entirely.
        </p>
        <p className="text-blue-100 text-sm mt-1">
          You set it up once. It handles the follow-ups. You get paid faster — without a single awkward conversation.
        </p>
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-20">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-500">From invoice to reminder in under 5 minutes.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            {
              step: "1",
              title: "Add an invoice",
              body: "Enter 5 fields: client name, contact, amount, due date, and your payment link. That's it.",
              detail: "Nudge suggests the right tone based on how overdue the invoice is.",
            },
            {
              step: "2",
              title: "Preview and approve",
              body: "See exactly what your client will receive — rendered as a WhatsApp message or email. Edit anything.",
              detail: "Nothing sends without your explicit approval. Every time.",
            },
            {
              step: "3",
              title: "Nudge handles the rest",
              body: "Reminders go out automatically at the right intervals. You see delivery confirmed on your dashboard.",
              detail: "If your client replies, the sequence pauses automatically and you're notified.",
            },
          ].map(({ step, title, body, detail }) => (
            <div key={step} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white text-sm font-bold flex items-center justify-center mb-4">
                {step}
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{body}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>

        {/* Timeline illustration */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">Example sequence</p>
          <div className="space-y-3">
            {[
              { day: "Day 1",  tone: "Friendly", msg: "Hi Sarah, just a quick note — invoice #1042 for £3,200 is now due. Pay here: [link]. — Meridian Studio", channel: "WhatsApp", color: "bg-green-100 text-green-700" },
              { day: "Day 7",  tone: "Firm",     msg: "Sarah, invoice #1042 for £3,200 remains unpaid. Please arrange payment here: [link]. — Meridian Studio",   channel: "Email",    color: "bg-amber-100 text-amber-700" },
              { day: "Day 14", tone: "Final",    msg: "This is a final reminder for invoice #1042 — £3,200 now 14 days overdue. Pay via [link] or reply to discuss. — Meridian Studio", channel: "Both", color: "bg-red-100 text-red-700" },
            ].map(({ day, tone, msg, channel, color }) => (
              <div key={day} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 text-right">
                  <span className="text-xs font-semibold text-gray-400">{day}</span>
                </div>
                <div className="flex-shrink-0 w-px bg-gray-200 self-stretch mx-1" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${color}`}>{tone}</span>
                    <span className="text-xs text-gray-400">via {channel}</span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{msg}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
            You preview and approve every message before the sequence activates. You can edit any step, change the tone, or adjust timing.
          </p>
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need to get paid</h2>
        <p className="text-gray-500 max-w-xl mx-auto">
          Built for founders and ops leads at small B2B businesses. Not enterprise finance teams.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          {
            icon: "💬",
            title: "Email + WhatsApp reminders",
            body: "Reminders go out on both channels. Messages appear to come directly from your business — not from Nudge.",
          },
          {
            icon: "✋",
            title: "Human approval gate",
            body: "Nothing sends without your review. See exactly what your client will receive before activating any sequence.",
          },
          {
            icon: "⏸",
            title: "Auto-pause on reply",
            body: "If your client responds to a reminder, the sequence pauses immediately. You're notified and choose the next step.",
          },
          {
            icon: "🎚",
            title: "Three tone levels",
            body: "Friendly, firm, or final. Nudge suggests the right tone based on days overdue. You can change it at any point.",
          },
          {
            icon: "🔗",
            title: "Payment link in every message",
            body: "Add your Stripe, PayPal, or bank transfer link once. It's embedded in every reminder automatically.",
          },
          {
            icon: "📊",
            title: "Simple dashboard",
            body: "Outstanding, overdue, resolved. See what's active, what's been sent, and how much you've recovered this month.",
          },
          {
            icon: "⚡",
            title: "Pause, resume, override",
            body: "Pause a sequence mid-chase. Resume where you left off. Send the next message now instead of waiting. Full control.",
          },
          {
            icon: "🧠",
            title: "Client memory",
            body: "Nudge remembers your clients. Second invoice? Contact details are pre-filled and tone is suggested from their history.",
          },
        ].map(({ icon, title, body }) => (
          <div key={title} className="flex gap-4 p-5 rounded-2xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 transition-colors">
            <span className="text-2xl flex-shrink-0">{icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section className="bg-blue-600 py-20">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          You have invoices that need chasing.
        </h2>
        <p className="text-blue-100 text-lg mb-8 leading-relaxed">
          Add your first one now. Nudge will have a sequence ready in 2 minutes
          and your first reminder out in under 5.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-4 rounded-xl text-base font-bold hover:bg-blue-50 transition-colors shadow-lg shadow-blue-800/20"
        >
          Get started free — no card needed
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <p className="text-blue-200 text-sm mt-4">
          Free during beta. No credit card. Cancel whenever.
        </p>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-lg font-bold text-blue-600 tracking-tight">Nudge</span>
          <p className="text-xs text-gray-400 mt-0.5">Stop chasing invoices. Start collecting them.</p>
        </div>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/login" className="hover:text-gray-600 transition-colors">Sign in</Link>
          <Link href="/signup" className="hover:text-gray-600 transition-colors">Get started</Link>
          <a href="mailto:hello@nudge.so" className="hover:text-gray-600 transition-colors">hello@nudge.so</a>
        </div>
        <p className="text-xs text-gray-300">© {new Date().getFullYear()} Nudge. All rights reserved.</p>
      </div>
    </footer>
  );
}
