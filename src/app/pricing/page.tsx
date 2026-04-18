import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getResolvedPlans } from "@/lib/razorpay-plans";
import { getINRRates, currencyFromCountry } from "@/lib/exchange-rates";
import PricingCards from "@/components/pricing/PricingCards";
import PublicHeader from "@/components/layout/PublicHeader";
import Footer from "@/components/layout/Footer";

export const revalidate = 3600;

export default async function PricingPage() {
  const [session, plans, rates, headersList] = await Promise.all([
    auth(),
    getResolvedPlans(),
    getINRRates(),
    headers(),
  ]);

  const isLoggedIn = !!session?.user;

  let userCurrency = "INR";

  if (isLoggedIn && session?.user?.id) {
    // Logged-in: use their saved business currency
    const business = await db.business.findUnique({
      where: { userId: session.user.id },
      select: { currency: true },
    });
    userCurrency = business?.currency ?? "INR";
  } else {
    // Guest: detect from Netlify geo header
    const country = headersList.get("x-nf-country") ?? headersList.get("x-country") ?? "";
    if (country) {
      userCurrency = currencyFromCountry(country);
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <PublicHeader activePage="pricing" isLoggedIn={isLoggedIn} />

      <section className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
        <p className="text-xs font-bold tracking-widest uppercase text-teal-700 mb-4">Pricing</p>
        <h1 className="text-5xl sm:text-6xl font-black text-gray-900 leading-tight mb-4">
          Simple, honest pricing.
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed">
          Pay only for what you use. No setup fees, no contracts. Start with a 14-day free trial — no card required.
        </p>
      </section>

      <div className="flex justify-center mb-10">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 text-sm font-medium px-4 py-2 rounded-full">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          14-day free trial included — up to 5 invoices, no card needed
        </div>
      </div>

      <PricingCards plans={plans} isLoggedIn={isLoggedIn} userCurrency={userCurrency} rates={rates} paypalClientId={process.env.PAYPAL_CLIENT_ID ?? ""} />

      <section className="max-w-2xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-black text-gray-900 text-center mb-8">Common questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Can I switch plans?",
              a: "Yes — upgrade or downgrade any time. Changes take effect immediately and billing is prorated.",
            },
            {
              q: "What happens when I hit the invoice limit?",
              a: "You'll be notified and can either upgrade your plan or pay a small overage fee per additional invoice.",
            },
            {
              q: "Is there a free trial?",
              a: "All new accounts get a 14-day free trial with up to 5 invoices — no credit card required.",
            },
            {
              q: "How does billing work?",
              a: "Indian users are billed in ₹ via Razorpay (UPI, cards, net banking). International users are billed in $ via PayPal. Cancel anytime from your account settings.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-200 rounded-2xl px-6 py-4">
              <p className="font-semibold text-gray-900 mb-1">{q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
