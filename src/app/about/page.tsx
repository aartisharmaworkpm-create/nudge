import Link from "next/link";
import { auth } from "@/lib/auth";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "About — Nudge",
  description: "We built Nudge because we got tired of chasing payments. Here's our story.",
};

export default async function AboutPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-cream text-gray-900 font-sans">
      <PublicHeader activePage="about" isLoggedIn={isLoggedIn} />

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-xs font-bold tracking-widest uppercase text-teal-700 mb-4">About us</p>
        <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-5">
          We got tired of<br />
          <span className="italic text-teal-700">chasing payments.</span>
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed max-w-xl mx-auto">
          So we built the tool we always wished existed — one that handles the awkward part of running a business so you can focus on the work you love.
        </p>
      </section>

      {/* Story */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div className="max-w-2xl mx-auto px-6 prose prose-gray prose-lg max-w-none">
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              It started with a ₹80,000 invoice that sat unpaid for three months. The work was done, the client was happy — but every time we followed up, the reply was either silence or a vague <em>&quot;I&apos;ll check with finance.&quot;</em>
            </p>
            <p>
              We tried tracking spreadsheets. We set calendar reminders. We wrote email drafts and deleted them because they sounded either too aggressive or too apologetic. The back-and-forth was eating hours every week — and it was affecting client relationships.
            </p>
            <p>
              That&apos;s when we started building Nudge.
            </p>
            <p>
              The idea was simple: what if the follow-up just happened automatically, in a tone that felt human and professional — without you having to think about it? No more awkward &quot;just checking in&quot; messages. No more spreadsheet chaos. No more worrying whether the client even saw the invoice.
            </p>
            <p>
              We&apos;re a small team of builders, designers, and ex-freelancers based in India. We built Nudge for the people who do great work but hate the business side — consultants, agencies, designers, developers, coaches, and anyone else who sends invoices and waits.
            </p>
            <p className="font-semibold text-gray-900">
              Getting paid shouldn&apos;t be a full-time job.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-gray-900 text-center mb-12">What we believe</h2>
        <div className="grid sm:grid-cols-3 gap-6">
          {values.map((v) => (
            <div key={v.title} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="text-3xl mb-4">{v.emoji}</div>
              <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="bg-white border-y border-gray-100 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-black text-gray-900 text-center mb-12">Built by people who get it</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {team.map((member) => (
              <div key={member.name} className="flex gap-4 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 font-black text-lg">
                  {member.initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{member.name}</p>
                  <p className="text-sm text-teal-700 font-medium mb-1">{member.role}</p>
                  <p className="text-sm text-gray-500 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-black text-gray-900 mb-1">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-teal-900 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-white mb-4">Want to talk?</h2>
          <p className="text-teal-200 leading-relaxed mb-8">
            We love hearing from users — what&apos;s working, what&apos;s not, and what you wish we&apos;d build next. Reach out any time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:hello@nudge.so"
              className="inline-flex items-center justify-center gap-2 bg-white text-teal-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-teal-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              hello@nudge.so
            </a>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 border border-white/30 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
            >
              Start for free →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const values = [
  {
    emoji: "🤝",
    title: "Honesty over hype",
    description:
      "We tell you exactly what Nudge does and doesn't do. No inflated claims, no hidden fees, no dark patterns.",
  },
  {
    emoji: "⚡",
    title: "Simple by default",
    description:
      "Every feature we build has to earn its place. If it adds friction without adding value, it doesn't ship.",
  },
  {
    emoji: "💬",
    title: "Users shape the product",
    description:
      "Our roadmap is driven by the people who use Nudge every day. Your feedback isn't a ticket — it's a conversation.",
  },
];

const team = [
  {
    initials: "A",
    name: "Arjun Mehta",
    role: "Co-founder & CEO",
    bio: "Ex-freelance designer who spent way too many hours chasing invoices. Built Nudge to solve his own problem.",
  },
  {
    initials: "P",
    name: "Priya Nair",
    role: "Co-founder & CTO",
    bio: "Full-stack engineer with a background in fintech. Obsessed with making software that feels effortless.",
  },
];

const stats = [
  { value: "500+", label: "Businesses using Nudge" },
  { value: "₹2Cr+", label: "Invoices followed up" },
  { value: "87%", label: "On-time payment rate" },
  { value: "4.9★", label: "Average user rating" },
];
