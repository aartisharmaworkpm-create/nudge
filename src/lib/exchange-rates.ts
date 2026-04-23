/**
 * Fetch live INR → X exchange rates from frankfurter.app (free, no API key).
 * Cached for 1 hour via Next.js ISR.
 */

export type ExchangeRates = Record<string, number>;

const SUPPORTED = ["USD", "GBP", "EUR", "AED", "AUD", "CAD"];

/**
 * Map a 2-letter country code to the most appropriate display currency.
 * Falls back to "USD" for unmapped countries.
 */
export function currencyFromCountry(countryCode: string): string {
  const map: Record<string, string> = {
    // INR
    IN: "INR",
    // GBP
    GB: "GBP",
    // EUR
    DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR", BE: "EUR",
    AT: "EUR", PT: "EUR", FI: "EUR", IE: "EUR", GR: "EUR", PL: "EUR",
    SE: "EUR", DK: "EUR", NO: "EUR", CH: "EUR", CZ: "EUR", HU: "EUR",
    // AED
    AE: "AED", SA: "AED", QA: "AED", KW: "AED", BH: "AED", OM: "AED",
    // AUD
    AU: "AUD", NZ: "AUD",
    // CAD
    CA: "CAD",
    // USD (explicit)
    US: "USD", SG: "USD", HK: "USD", JP: "USD", KR: "USD",
    MY: "USD", PH: "USD", TH: "USD", ID: "USD", VN: "USD",
    ZA: "USD", NG: "USD", KE: "USD", GH: "USD", EG: "USD",
    BR: "USD", MX: "USD", AR: "USD", CO: "USD",
  };
  return map[countryCode.toUpperCase()] ?? "USD";
}

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
