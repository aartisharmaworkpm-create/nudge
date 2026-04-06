import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cream text-gray-900 font-sans">
      <Nav />
      <Hero />
      <SocialProof />
      <Pain />
      <HowItWorks />
      <Stats />
      <Features />
      <FounderQuote />
      <TeaserStrip />
      <FinalCTA />
      <Footer />
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────

function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-cream/95 backdrop-blur-sm border-b border-cream-dark">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <span className="text-xl font-black text-gray-900 tracking-tight">Nudge.</span>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-semibold bg-teal-800 text-white px-5 py-2.5 rounded-lg hover:bg-teal-900 transition-colors"
          >
            Join the waitlist
          </Link>
        </div>
      </div>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
      <div className="inline-flex items-center gap-2 border border-teal-700 text-teal-800 text-xs font-bold px-4 py-1.5 rounded-full mb-10 tracking-widest uppercase">
        Receivables Automation
      </div>

      <h1 className="text-6xl sm:text-7xl font-black tracking-tight text-gray-900 leading-[1.05] mb-4">
        Stop chasing invoices.
      </h1>
      <h1 className="text-6xl sm:text-7xl font-black tracking-tight italic text-teal-500 leading-[1.05] mb-8">
        Start collecting them.
      </h1>

      <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
        Nudge automates your invoice follow-ups via email and WhatsApp — so
        you collect what you&apos;re owed without the manual chasing or
        uncomfortable client calls.
      </p>

      <Link
        href="/signup"
        className="inline-flex items-center justify-center gap-2 bg-teal-800 text-white px-8 py-4 rounded-xl text-base font-bold hover:bg-teal-900 transition-colors shadow-lg shadow-teal-900/20 mb-6"
      >
        Get Early Access
      </Link>

      <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-gray-500">
        {["No credit card required", "Free to join", "Early members shape what we build"].map((t) => (
          <span key={t} className="flex items-center gap-1.5 justify-center">
            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t}
          </span>
        ))}
      </div>
    </section>
  );
}

// ── Social proof ──────────────────────────────────────────────────────────────

function SocialProof() {
  return (
    <section className="bg-white border-y border-cream-dark py-6">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <p className="text-sm text-gray-600 leading-relaxed">
          Beta result: one business reduced average collection time from{" "}
          <span className="font-bold text-teal-700">90 days → 30–45 days</span>{" "}
          after switching to Nudge — without a single uncomfortable conversation.
        </p>
      </div>
    </section>
  );
}

// ── Pain ──────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    icon: (
      <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Hours lost to manual chasing",
    body: "You send the invoice. Then you wait. Then you follow up. Then again. Every week, manually — time you should be spending on the business.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Awkward client conversations",
    body: "Asking for money feels uncomfortable. So you soften the message, wait a little longer — and watch your cash flow suffer for it.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    ),
    title: "No visibility into what's at risk",
    body: "You don't know which invoices are about to go 60, 90 days overdue until it's already too late. By then, the window for smooth recovery has closed.",
  },
  {
    icon: (
      <svg className="w-6 h-6 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
    title: "Failed payments that disappear quietly",
    body: "A card expires. A payment fails. Your system sends one generic email and gives up. You find out 30 days later when nobody was watching.",
  },
];

function Pain() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24">
      <div className="text-center mb-14">
        <p className="text-xs font-bold tracking-widest uppercase text-teal-700 mb-4">Sound Familiar?</p>
        <h2 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight max-w-3xl mx-auto">
          You built the business. You shouldn&apos;t be chasing payments.
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PAIN_POINTS.map(({ icon, title, body }) => (
          <div key={title} className="bg-white rounded-2xl p-6 border border-cream-dark">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-5">
              {icon}
            </div>
            <h3 className="font-bold text-gray-900 mb-2 leading-snug">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── How it works ──────────────────────────────────────────────────────────────

function HowItWorks() {
  return (
    <section className="bg-white border-y border-cream-dark py-24">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-xs font-bold tracking-widest uppercase text-teal-700 mb-4">How It Works</p>
          <h2 className="text-4xl sm:text-5xl font-black text-gray-900">
            Set it up once. Get paid on repeat.
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-10 mb-16">
          <div className="hidden sm:block absolute top-5 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-cream-dark" />
          {[
            { n: "1", title: "Add your invoice", body: "Enter the client name, amount, and due date. Takes 60 seconds. No integrations required to get started." },
            { n: "2", title: "Nudge sends escalating reminders", body: "Nudge sends a polite sequence of reminders via email and WhatsApp on your behalf — automatically, at the right time." },
            { n: "3", title: "You get paid", body: "Payment links are embedded in every message. Clients pay directly. You don't chase." },
          ].map(({ n, title, body }) => (
            <div key={n} className="text-center flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-teal-800 text-white text-sm font-bold flex items-center justify-center mb-6 relative z-10">
                {n}
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

        {/* Message preview mockup */}
        <div className="bg-cream rounded-2xl p-2 border border-cream-dark">
          <p className="text-xs font-bold text-center text-gray-400 py-3 tracking-wide uppercase">
            This is what your clients receive.{" "}
            <span className="text-gray-400 font-normal italic normal-case">Professional. On-brand. One click to pay.</span>
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp bubble */}
            <div className="bg-[#1B4F47] rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">MS</div>
                <div>
                  <p className="text-white text-sm font-semibold">Meridian Studio</p>
                  <p className="text-teal-300 text-xs">Business account</p>
                </div>
              </div>
              <div className="bg-white rounded-xl rounded-tl-sm p-4">
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  Hi Sarah 👋 Just a quick note — invoice #1042 for{" "}
                  <strong>£3,200</strong> from Meridian Studio is due in 3 days, on 2 April.
                  <br /><br />
                  You can pay directly here. Let us know if you have any questions.
                  <br /><br />
                  <em>— The Meridian Studio Team</em>
                </p>
                <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-lg px-4 py-2.5">
                  <span className="text-teal-800 text-sm font-semibold">Pay £3,200.00</span>
                  <svg className="w-4 h-4 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <p className="text-gray-400 text-xs text-right mt-2">10:42 AM ✓✓</p>
              </div>
            </div>

            {/* Email preview */}
            <div className="bg-white rounded-xl p-5 border border-cream-dark">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Invoice Reminder</p>
                <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">1 Day Overdue</span>
              </div>
              <h4 className="text-lg font-black text-gray-900 mb-1">Invoice #1042 — payment not yet received</h4>
              <p className="text-xs text-gray-400 mb-4">From: The Meridian Studio Team · To: sarah@clientco.com</p>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                Hi Sarah,<br /><br />
                Invoice #1042 for £3,200 was due yesterday and we haven&apos;t received payment yet.
                We know things get busy — if this slipped off the radar, no problem. You can pay directly below.
              </p>
              <div className="border border-cream-dark rounded-lg divide-y divide-cream-dark mb-4 text-sm">
                {[["Invoice", "#1042"], ["Amount", "£3,200.00"], ["Due date", "2 April 2026"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5">
                    <span className="text-gray-400">{k}</span>
                    <span className="font-semibold text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-teal-800 text-white text-center py-3 rounded-lg text-sm font-bold tracking-wide">
                PAY NOW →
              </div>
              <p className="text-center text-xs text-gray-400 mt-3">Sent via Nudge on behalf of Meridian Studio</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────

function Stats() {
  return (
    <section className="bg-teal-950 py-24">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <p className="text-xs font-bold tracking-widest uppercase text-teal-400 mb-6">Early Beta Results</p>
        <div className="mb-3">
          <span className="text-[7rem] sm:text-[10rem] font-black text-white leading-none">30</span>
          <span className="text-[7rem] sm:text-[10rem] font-black text-teal-500 leading-none">—45 days</span>
        </div>
        <p className="text-teal-300 text-lg mb-16">Average collection time for Nudge users — down from 90+ days.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: "Automated Sequences", body: "Tailored email and WhatsApp follow-ups go out on time, every time — without you lifting a finger." },
            { title: "Payment Link in Every Message", body: "One-click payment links embedded in every WhatsApp and email nudge. Clients pay instantly — no login, no friction.", featured: true },
            { title: "Live in 60 Seconds", body: "No technical setup. No integrations required to get started. Add your first invoice and go." },
          ].map(({ title, body, featured }) => (
            <div
              key={title}
              className={`rounded-2xl p-6 text-left border ${featured ? "bg-teal-800 border-teal-700" : "bg-teal-900 border-teal-800"}`}
            >
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-teal-300 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Features ──────────────────────────────────────────────────────────────────

function Features() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-24">
      <div className="text-center mb-14">
        <p className="text-xs font-bold tracking-widest uppercase text-teal-700 mb-4">Built for B2B</p>
        <h2 className="text-4xl sm:text-5xl font-black text-gray-900">
          Everything you need to get paid
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { title: "Email + WhatsApp reminders", body: "Reminders go out on both channels. Messages appear to come directly from your business — not from Nudge." },
          { title: "Human approval gate", body: "Nothing sends without your review. See exactly what your client will receive before activating any sequence." },
          { title: "Auto-pause on reply", body: "If your client responds to a reminder, the sequence pauses immediately. You're notified and choose the next step." },
          { title: "Three tone levels", body: "Friendly, firm, or final. Nudge suggests the right tone based on days overdue. You can change it at any point." },
          { title: "Payment link in every message", body: "Add your Stripe, PayPal, or bank transfer link once. It's embedded in every reminder automatically." },
          { title: "Pause, resume, override", body: "Pause a sequence mid-chase. Resume where you left off. Send the next message now instead of waiting." },
        ].map(({ title, body }) => (
          <div key={title} className="bg-white rounded-2xl p-6 border border-cream-dark hover:border-teal-200 transition-colors">
            <div className="w-2 h-2 rounded-full bg-teal-500 mb-4" />
            <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Founder quote ─────────────────────────────────────────────────────────────

function FounderQuote() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <p className="text-5xl text-teal-200 font-serif leading-none mb-6">&ldquo;&rdquo;</p>
        <blockquote className="text-xl sm:text-2xl italic font-semibold text-gray-800 leading-relaxed mb-8">
          I built Nudge because I spent two years chasing invoices manually in a supply chain role — and
          watched my family business do the same thing every single month. The tools that existed were
          built for enterprise finance teams. We built Nudge for the businesses actually doing the chasing.
        </blockquote>
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-teal-800 text-white text-sm font-bold flex items-center justify-center">
            A
          </div>
          <p className="font-semibold text-gray-900 text-sm">Ani</p>
          <p className="text-gray-400 text-xs">Founder, Nudge</p>
        </div>
      </div>
    </section>
  );
}

// ── Teaser strip ──────────────────────────────────────────────────────────────

function TeaserStrip() {
  return (
    <div className="bg-cream-dark border-y border-cream-dark py-2.5 text-center">
      <p className="text-xs text-gray-500">
        <span className="font-bold text-teal-800">Coming Q3 2026:</span>{" "}
        SaaS payment recovery — automated failed payment rescue for subscription businesses.
      </p>
    </div>
  );
}

// ── Final CTA ─────────────────────────────────────────────────────────────────

function FinalCTA() {
  return (
    <section
      className="py-28"
      style={{ background: "linear-gradient(135deg, #0D3B36 0%, #1A5551 50%, #206B65 100%)" }}
    >
      <div className="max-w-2xl mx-auto px-6 text-center">
        <h2 className="text-5xl sm:text-6xl font-black text-white leading-tight mb-2">
          Stop chasing.
        </h2>
        <h2 className="text-5xl sm:text-6xl font-black italic text-teal-400 leading-tight mb-8">
          Start collecting.
        </h2>
        <p className="text-teal-200 text-lg mb-10 leading-relaxed max-w-md mx-auto">
          Join the waitlist and be among the first businesses to use Nudge — plus get early input into what we build next.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-white text-teal-900 px-8 py-4 rounded-xl text-base font-bold hover:bg-teal-50 transition-colors shadow-xl shadow-black/30 mb-5"
        >
          Join the Waitlist
        </Link>
        <p className="text-teal-400 text-xs font-bold tracking-widest uppercase">
          Early access open now — limited spots for Q3 2025 launch
        </p>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-gray-950 py-14">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-8 mb-10">
          <div className="max-w-xs">
            <span className="text-lg font-black text-white tracking-tight">Nudge.</span>
            <p className="text-gray-400 text-sm mt-1.5 leading-relaxed">
              Automated invoice follow-ups that get you paid without the awkward conversations.
            </p>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="mailto:hello@nudge.so" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Nudge. All rights reserved.</p>
          <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Careers</a>
        </div>
      </div>
    </footer>
  );
}
