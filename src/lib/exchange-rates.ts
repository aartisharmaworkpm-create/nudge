/**
 * Fetch live INR → X exchange rates from frankfurter.app (free, no API key).
 * Cached for 1 hour via Next.js ISR.
 */

export type ExchangeRates = Record<string, number>;

const SUPPORTED = ["USD", "GBP", "EUR", "AED", "AUD", "CAD"];

export async function getINRRates(): Promise<ExchangeRates> {
  try {
    const res = await fetch(
      `https://api.frankfurter.app/latest?from=INR&to=${SUPPORTED.join(",")}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return {};
    const data = await res.json();
    return (data.rates ?? {}) as ExchangeRates;
  } catch {
    return {};
  }
}

/**
 * Convert an INR amount to the target currency and format it.
 * Returns null if the currency is INR or rates are unavailable.
 */
export function convertFromINR(
  amountINR: number,
  targetCurrency: string,
  rates: ExchangeRates
): string | null {
  if (!targetCurrency || targetCurrency === "INR") return null;
  const rate = rates[targetCurrency];
  if (!rate) return null;
  const converted = amountINR * rate;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: targetCurrency,
      maximumFractionDigits: 0,
    }).format(converted);
  } catch {
    return null;
  }
}
