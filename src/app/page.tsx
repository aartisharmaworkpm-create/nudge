"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// ── Scroll-reveal hook ─────────────────────────────────────────────────────────
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top >= window.innerHeight) el.classList.add("anim");
    });
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0 }
    );
    document.querySelectorAll(".reveal.anim").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useScrollReveal();
  return (
    <div className="min-h-screen bg-warm-cream text-ink font-sans">
      <Nav />
      <Hero />
      <PainSection />
      <PivotSection />
      <HowItWorks />
      <ProofSection />
      <ResultsSection />
      <CloserCTA />
      <Footer />
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between px-6 sm:px-12 h-16 transition-all duration-300 ${
        scrolled
          ? "bg-warm-cream/95 backdrop-blur-xl border-b border-brand/10"
          : "bg-warm-cream border-b border-transparent"
      }`}
    >
      <Link href="/" className="font-serif text-[22px] text-ink tracking-[-0.5px] no-underline">
        Nudge<span className="text-brand">.</span>
      </Link>
      <Link
        href="/signup"
        className="inline-flex items-center gap-2 bg-brand text-white text-sm font-semibold px-[22px] py-[11px] rounded-lg hover:bg-brand-light transition-all duration-200 hover:-translate-y-px"
      >
        Join the waitlist
      </Link>
    </header>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="hero-glow min-h-screen flex flex-col items-center justify-center px-6 pt-[120px] pb-20 text-center">
      <div className="relative z-10">
        <div className="inline-block text-[11px] font-semibold tracking-[0.14em] uppercase text-brand bg-[oklch(92%_0.04_168_/_0.5)] border border-[oklch(85%_0.06_168_/_0.6)] px-[14px] py-[5px] rounded-full mb-9">
          Receivables Automation
        </div>

        <h1 className="reveal font-serif text-[clamp(42px,6vw,80px)] leading-[1.1] tracking-[-0.02em] text-ink max-w-[820px] mx-auto mb-7">
          Your work is done.<br />
          <em className="text-brand">Your money shouldn&apos;t still be</em>{" "}
          <span className="pain-word">waiting.</span>
        </h1>

        <p className="reveal delay-1 text-[17px] leading-[1.65] text-ink-soft font-light max-w-[520px] mx-auto mb-11">
          Nudge automatically follows up on every invoice — via email and WhatsApp — so you get paid without the chase, the awkwardness, or the waiting.
        </p>

        <div className="reveal delay-2 flex flex-col items-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-brand text-white text-base font-semibold px-9 py-4 rounded-[10px] hover:bg-brand-light transition-all duration-200 hover:-translate-y-px"
          >
            Get Early Access
          </Link>
          <div className="flex flex-wrap gap-6 items-center justify-center text-[13px] text-ink-muted">
            {["No credit card required", "Free to join", "Early members shape what we build"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <svg className="text-brand flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Pain Section ─────────────────────────────────────────────────────────────
const PAIN_CARDS = [
  {
    day: "Day 7",
    headline: "You send the invoice. And wait.",
    body: "You delivered great work. The invoice went out. Now you check your bank every morning, wondering when it'll clear. The uncertainty creeps in.",
    quote: "\"I know they're happy with the work — so why haven't they paid?\"",
    delay: "",
  },
  {
    day: "Day 21",
    headline: "The awkward follow-up message.",
    body: "You draft it five times. Too pushy? Too soft? You don't want to damage the relationship. So you soften it. Delete it. Start again. Eventually send something that feels wrong.",
    quote: "\"I hate feeling like I'm begging for money I'm already owed.\"",
    delay: "delay-1",
  },
  {
    day: "Day 45+",
    headline: "The mental load is exhausting.",
    body: "Three invoices outstanding. Two clients you're afraid to annoy. One overdue from a client you actually like. You're spending more time chasing money than making it.",
    quote: "\"This shouldn't be this hard.\"",
    delay: "delay-2",
  },
];

function PainSection() {
  return (
    <section className="bg-off-white py-24 px-6">
      <div className="max-w-[1100px] mx-auto">
        <p className="reveal text-[11px] font-semibold tracking-[0.14em] uppercase text-ink-muted text-center mb-5">
          The part nobody talks about
        </p>
        <h2 className="reveal font-serif text-[clamp(32px,4vw,52px)] leading-[1.15] tracking-[-0.02em] text-center max-w-[700px] mx-auto mb-16 text-ink">
          Running a business is hard enough.<br />
          <em className="text-brand">Waiting to be paid makes it worse.</em>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {PAIN_CARDS.map(({ day, headline, body, quote, delay }) => (
            <div
              key={day}
              className={`reveal ${delay} pain-card-amber bg-warm-cream border border-warm-cream-dark rounded-2xl p-8 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(30,92,88,0.08)]`}
            >
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-3" style={{ color: "var(--amber)" }}>
                {day}
              </div>
              <h3 className="font-serif text-[22px] leading-[1.25] text-ink mb-3">{headline}</h3>
              <p className="text-sm leading-[1.65] text-ink-soft font-light">{body}</p>
              <p className="italic text-[13px] text-ink-muted mt-4 pt-4 border-t border-warm-cream-dark">
                {quote}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pivot / Shift ─────────────────────────────────────────────────────────────
function PivotSection() {
  return (
    <section className="pivot-glow bg-brand py-24 px-6 text-center">
      <div className="relative z-10 max-w-[800px] mx-auto">
        <p className="reveal text-[11px] font-semibold tracking-[0.16em] uppercase mb-6" style={{ color: "oklch(85% 0.09 168)" }}>
          A better way
        </p>
        <h2 className="reveal font-serif text-[clamp(36px,5vw,66px)] leading-[1.1] tracking-[-0.02em] text-white max-w-[780px] mx-auto mb-6">
          What if money just… <em style={{ color: "oklch(82% 0.12 168)" }}>arrived</em>?<br />
          Without you having to ask.
        </h2>
        <p className="reveal delay-1 text-[17px] leading-[1.6] font-light max-w-[500px] mx-auto" style={{ color: "oklch(85% 0.04 168)" }}>
          Nudge sends the follow-ups for you. Professional, timely, on-brand — so you stay focused on work, not admin.
        </p>
      </div>
    </section>
  );
}

// ── How It Works ─────────────────────────────────────────────────────────────
const STEPS = [
  {
    n: "1",
    feeling: "You feel: in control",
    feelingColor: "text-ink-muted",
    numBg: "bg-ink",
    title: "Add your invoice",
    body: (<>Enter the client name, amount, and due date. <strong className="font-medium text-ink">60 seconds.</strong> No accounting software needed, no integrations to configure.</>),
    delay: "",
  },
  {
    n: "2",
    feeling: "You feel: relieved",
    feelingColor: "text-brand",
    numBg: "bg-brand",
    title: "Nudge handles the follow-ups",
    body: (<>A polite, escalating sequence of reminders goes out automatically — via <strong className="font-medium text-ink">email and WhatsApp</strong> — at exactly the right time. No awkwardness. No manual effort.</>),
    delay: "delay-1",
  },
  {
    n: "3",
    feeling: "You feel: free",
    feelingColor: "text-brand-light",
    numBg: "bg-brand-light",
    title: "You get paid",
    body: (<>Payment links are embedded in every message. Clients pay <strong className="font-medium text-ink">directly, instantly</strong> — one click. You don&apos;t lift a finger.</>),
    delay: "delay-2",
  },
];

function HowItWorks() {
  return (
    <section className="bg-warm-cream py-24 px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-18">
          <p className="reveal text-[11px] font-semibold tracking-[0.14em] uppercase text-ink-muted mb-5">
            How it works
          </p>
          <h2 className="reveal font-serif text-[clamp(32px,4vw,52px)] leading-[1.15] tracking-[-0.02em] text-ink mb-4">
            Set it up once. <em className="text-brand">Get paid on repeat.</em>
          </h2>
          <p className="reveal delay-1 text-base text-ink-soft font-light max-w-[460px] mx-auto">
            Takes 60 seconds. No integrations required. No chasing — ever again.
          </p>
        </div>

        <div className="steps-grid grid grid-cols-1 sm:grid-cols-3 gap-0 mt-18">
          {STEPS.map(({ n, feeling, feelingColor, numBg, title, body, delay }) => (
            <div key={n} className={`reveal ${delay} px-8 pb-10 sm:pb-0`}>
              <div className={`w-12 h-12 rounded-full ${numBg} text-white flex items-center justify-center font-serif text-xl mb-7 relative z-10`}>
                {n}
              </div>
              <div className={`text-[11px] font-semibold tracking-[0.1em] uppercase mb-2.5 ${feelingColor}`}>
                {feeling}
              </div>
              <h3 className="font-serif text-[22px] leading-[1.25] text-ink mb-3">{title}</h3>
              <p className="text-sm leading-[1.7] text-ink-soft font-light">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Proof / Message mockups ───────────────────────────────────────────────────
function ProofSection() {
  return (
    <section className="bg-off-white py-24 px-6">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-center mb-15">
          <p className="reveal text-[11px] font-semibold tracking-[0.14em] uppercase text-ink-muted mb-5">
            What your clients actually receive
          </p>
          <h2 className="reveal font-serif text-[clamp(28px,3.5vw,44px)] leading-[1.15] text-ink mb-3">
            Professional. On-brand.<br /><em className="text-brand">One click to pay.</em>
          </h2>
          <p className="reveal delay-1 text-base text-ink-soft font-light">
            Your clients get a polished reminder — not a generic chase. It feels like you wrote it yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7 items-start">
          {/* WhatsApp mockup */}
          <div className="reveal rounded-[20px] overflow-hidden shadow-[0_4px_40px_rgba(30,92,88,0.12),0_1px_6px_rgba(0,0,0,0.06)]">
            <div className="bg-brand px-5 py-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-serif text-sm text-white font-semibold">MS</div>
              <div>
                <div className="text-[15px] font-semibold text-white">Meridian Studio</div>
                <div className="text-xs text-white/70">Business account</div>
              </div>
            </div>
            <div className="bg-[#e8ebe0] p-5">
              <div className="bg-white rounded-xl rounded-tl-sm p-4 max-w-[85%] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                <p className="text-sm leading-[1.6] text-ink mb-3">
                  Hi Sarah 👋 Just a quick note — invoice #1042 for <strong className="font-medium">£3,200</strong> from Meridian Studio is due in 3 days, on 2 April.<br /><br />
                  You can pay directly here. Let us know if you have any questions.
                </p>
                <p className="text-xs text-ink-muted italic mb-3">— The Meridian Studio Team</p>
                <div className="flex items-center justify-between text-brand font-semibold text-sm border-t border-[#f0f0f0] pt-2.5">
                  <span>Pay £3,200.00</span>
                  <span>→</span>
                </div>
                <div className="text-[11px] text-ink-muted text-right mt-2">10:42 AM ✓✓</div>
              </div>
            </div>
          </div>

          {/* Email mockup */}
          <div className="reveal delay-1 bg-white rounded-[20px] overflow-hidden shadow-[0_4px_40px_rgba(30,92,88,0.12),0_1px_6px_rgba(0,0,0,0.06)]">
            <div className="flex gap-[7px] items-center px-[18px] py-[14px] bg-[#f4f4f4] border-b border-[#e8e8e8]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <div className="p-7">
              <div className="flex items-start justify-between mb-2">
                <p className="text-[10px] tracking-[0.12em] uppercase text-ink-muted">Invoice Reminder</p>
                <span className="text-[11px] font-bold tracking-[0.06em] uppercase px-2.5 py-1 rounded bg-[oklch(95%_0.05_65)] text-[oklch(50%_0.12_55)]">
                  1 day overdue
                </span>
              </div>
              <h3 className="font-serif text-[22px] text-ink mb-1.5">Invoice #1042 — payment not yet received</h3>
              <p className="text-xs text-ink-muted mb-5">From: The Meridian Studio Team · To: sarah@clientco.com</p>
              <p className="text-sm leading-[1.65] text-ink-soft py-4 border-t border-[#f0f0f0] mb-5">
                Hi Sarah,<br /><br />
                Invoice #1042 for £3,200 was due yesterday and we haven&apos;t received payment yet.
                We know things get busy — if this slipped off the radar, no problem. You can pay directly below.
              </p>
              <div className="border border-[#f0f0f0] rounded-lg overflow-hidden mb-5">
                {[["Invoice", "#1042"], ["Amount", "£3,200.00"], ["Due date", "2 April 2026"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-[14px] py-[10px] text-[13px] text-ink-soft border-b border-[#f0f0f0] last:border-0">
                    <span>{k}</span>
                    <strong className="font-medium text-ink">{v}</strong>
                  </div>
                ))}
              </div>
              <div className="block w-full bg-brand text-white text-center py-[14px] rounded-lg font-semibold text-sm tracking-[0.04em] mb-3.5">
                PAY NOW →
              </div>
              <p className="text-center text-[11px] text-ink-muted">Sent via Nudge on behalf of Meridian Studio</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Results ───────────────────────────────────────────────────────────────────
const RESULT_CARDS = [
  {
    title: "Automated Sequences",
    body: "Tailored email and WhatsApp follow-ups go out on time, every time — without you lifting a finger.",
    delay: "",
  },
  {
    title: "Payment Link in Every Message",
    body: "One-click payment links in every WhatsApp and email nudge. Clients pay instantly — no login, no friction.",
    delay: "delay-1",
  },
  {
    title: "Live in 60 Seconds",
    body: "No technical setup. No integrations required to get started. Add your first invoice and go.",
    delay: "delay-2",
  },
];

function ResultsSection() {
  return (
    <section className="results-glow bg-brand-dim py-24 px-6">
      <div className="max-w-[1100px] mx-auto relative z-10">
        <p className="reveal text-[11px] font-semibold tracking-[0.14em] uppercase text-center mb-5" style={{ color: "oklch(75% 0.1 168)" }}>
          Early beta results
        </p>
        <div className="reveal font-serif text-[clamp(60px,9vw,120px)] leading-none tracking-[-0.03em] text-center text-white mb-3">
          30–<em style={{ color: "oklch(75% 0.14 168)" }}>45 days</em>
        </div>
        <p className="reveal text-base leading-[1.6] font-light text-center max-w-[480px] mx-auto mb-16" style={{ color: "oklch(75% 0.05 168)" }}>
          Average collection time for Nudge users — down from 90+ days. That&apos;s months of cash flow, reclaimed.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {RESULT_CARDS.map(({ title, body, delay }) => (
            <div
              key={title}
              className={`reveal ${delay} rounded-[14px] p-7 border border-white/10 bg-white/[0.06] hover:bg-white/[0.09] transition-colors`}
            >
              <div className="text-[15px] font-semibold text-white mb-2.5">{title}</div>
              <div className="text-[13px] leading-[1.65] font-light" style={{ color: "oklch(75% 0.04 168)" }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Closer / CTA ─────────────────────────────────────────────────────────────
function CloserCTA() {
  return (
    <section className="bg-warm-cream py-24 px-6 text-center" id="waitlist">
      <p className="reveal text-[11px] font-semibold tracking-[0.14em] uppercase text-ink-muted mb-5">
        You&apos;ve earned this
      </p>
      <h2 className="reveal font-serif text-[clamp(36px,5vw,64px)] leading-[1.12] tracking-[-0.02em] text-ink max-w-[720px] mx-auto mb-6">
        Stop letting unpaid invoices<br />
        <em className="text-brand">live rent-free in your head.</em>
      </h2>
      <p className="reveal delay-1 text-[17px] leading-[1.65] text-ink-soft font-light max-w-[480px] mx-auto mb-11">
        Join the waitlist. It&apos;s free, takes 30 seconds, and means you&apos;ll never write an awkward payment chase again.
      </p>
      <div className="reveal delay-2">
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 bg-brand text-white text-base font-semibold px-9 py-4 rounded-[10px] hover:bg-brand-light transition-all duration-200 hover:-translate-y-px"
        >
          Get Early Access
        </Link>
        <div className="mt-5 flex gap-7 items-center justify-center text-[13px] text-ink-muted">
          <span>No credit card required</span>
          <span>·</span>
          <span>Free to join</span>
          <span>·</span>
          <span>Early members shape what we build</span>
        </div>
      </div>
    </section>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-ink px-6 sm:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="font-serif text-[18px] text-white">
        Nudge<span style={{ color: "oklch(75% 0.1 168)" }}>.</span>
      </div>
      <div className="text-[13px] text-white/40">© 2026 Nudge. All rights reserved.</div>
    </footer>
  );
}
