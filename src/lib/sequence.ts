import type { Tone, Channel, SequenceStep } from "@/types";

// Day offsets from invoice due date
export const STEP_OFFSETS: Record<number, number> = {
  1: 1,   // Day 1 after due date
  2: 7,   // Day 7
  3: 14,  // Day 14
  4: 21,  // Day 21
};

export const STEP_LABELS: Record<number, string> = {
  1: "Day 1 — First reminder",
  2: "Day 7 — Follow-up",
  3: "Day 14 — Final notice",
  4: "Day 21 — Extended follow-up",
};

export function suggestTone(daysOverdue: number): { tone: Tone; reason: string } {
  if (daysOverdue <= 3) {
    return { tone: "FRIENDLY", reason: "Invoice is recently overdue — a friendly reminder is appropriate." };
  }
  if (daysOverdue <= 14) {
    return { tone: "FIRM", reason: `${daysOverdue} days overdue — your client has likely seen a friendly reminder already.` };
  }
  return { tone: "FINAL", reason: `${daysOverdue} days overdue — a firm final notice is appropriate.` };
}

export function suggestEntryStep(daysOverdue: number): number {
  if (daysOverdue <= 3) return 1;
  if (daysOverdue <= 10) return 2;
  return 3;
}

export function buildSequenceSteps(
  tone: Tone,
  channel: Channel,
  entryStep: number,
  dueDate: Date,
  templates: { step: number; tone: Tone; channel: Channel; body: string }[]
): SequenceStep[] {
  const steps: SequenceStep[] = [];
  const now = new Date();

  // If the entry step's natural date is already in the past, shift the whole
  // schedule forward so step 1 fires in 5 minutes — preserving relative spacing.
  const entryNatural = new Date(dueDate);
  entryNatural.setDate(entryNatural.getDate() + STEP_OFFSETS[entryStep]);
  const shiftMs = entryNatural < now
    ? now.getTime() + 5 * 60 * 1000 - entryNatural.getTime()
    : 0;

  for (let step = entryStep; step <= 4; step++) {
    const template = templates.find(
      (t) => t.step === step && t.tone === tone && (t.channel === channel || t.channel === "BOTH")
    );

    if (!template) continue;

    const scheduledAt = new Date(dueDate);
    scheduledAt.setDate(scheduledAt.getDate() + STEP_OFFSETS[step]);
    const finalScheduledAt = new Date(scheduledAt.getTime() + shiftMs);

    steps.push({
      step,
      dayOffset: STEP_OFFSETS[step],
      label: STEP_LABELS[step],
      tone,
      channel,
      body: template.body,
      scheduledAt: finalScheduledAt,
    });
  }

  return steps;
}

export function interpolateTemplate(
  body: string,
  vars: {
    clientName: string;
    businessName: string;
    amount: string;
    currency: string;
    dueDate: string;
    paymentLink: string;
    ownerName?: string;
  }
): string {
  return body
    .replace(/\{\{clientName\}\}/g, vars.clientName)
    .replace(/\{\{businessName\}\}/g, vars.businessName)
    .replace(/\{\{amount\}\}/g, vars.amount)
    .replace(/\{\{currency\}\}/g, vars.currency)
    .replace(/\{\{dueDate\}\}/g, vars.dueDate)
    .replace(/\{\{paymentLink\}\}/g, vars.paymentLink)
    .replace(/\{\{ownerName\}\}/g, vars.ownerName ?? vars.businessName);
}
