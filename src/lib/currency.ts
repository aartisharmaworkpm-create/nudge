export const CURRENCY_SYMBOLS: Record<string, string> = {
  GBP: "£",
  USD: "$",
  EUR: "€",
  AED: "د.إ",
  INR: "₹",
  AUD: "A$",
  CAD: "C$",
};

export function formatCurrency(amount: number | string, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${symbol}${num.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function daysOverdue(dueDate: Date | string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
