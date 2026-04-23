import { PrismaClient, Tone, Channel } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// 12 global default templates: 3 tones × 4 steps
// Variables: {{clientName}}, {{businessName}}, {{amount}}, {{currency}}, {{dueDate}}, {{paymentLink}}, {{ownerName}}
const templates = [
  // ── FRIENDLY ──────────────────────────────────────────────────────────────
  {
    step: 1, tone: Tone.FRIENDLY, channel: Channel.BOTH,
    body: `Hi {{clientName}}, hope you're well — just a quick note that invoice #{{invoiceRef}} for {{currency}}{{amount}} from {{businessName}} is now due. You can pay directly here: {{paymentLink}}. Any questions, just reply. — {{ownerName}}`,
  },
  {
    step: 2, tone: Tone.FRIENDLY, channel: Channel.BOTH,
    body: `Hi {{clientName}}, following up on our invoice for {{currency}}{{amount}} — I know things get busy. If there's anything you need from our side to process payment, just let me know. Pay here: {{paymentLink}}. Thanks, {{ownerName}}`,
  },
  {
    step: 3, tone: Tone.FRIENDLY, channel: Channel.BOTH,
    body: `Hi {{clientName}}, this is my final note on invoice #{{invoiceRef}} for {{currency}}{{amount}}. I'd really like to get this resolved — if there's a problem, please just reply and we can sort it out. Payment link: {{paymentLink}}. Thanks, {{ownerName}}`,
  },
  {
    step: 4, tone: Tone.FRIENDLY, channel: Channel.BOTH,
    body: `Hi {{clientName}}, just one last follow-up on the invoice for {{currency}}{{amount}} from {{businessName}}. We'd love to resolve this amicably — please pay here: {{paymentLink}} or simply reply and let us know what's happening. Thanks, {{ownerName}}`,
  },

  // ── FIRM ──────────────────────────────────────────────────────────────────
  {
    step: 1, tone: Tone.FIRM, channel: Channel.BOTH,
    body: `Hi {{clientName}}, invoice #{{invoiceRef}} for {{currency}}{{amount}} from {{businessName}} is now overdue. Please arrange payment at your earliest convenience: {{paymentLink}}. — {{ownerName}}`,
  },
  {
    step: 2, tone: Tone.FIRM, channel: Channel.BOTH,
    body: `{{clientName}}, this is a second reminder that invoice #{{invoiceRef}} for {{currency}}{{amount}} remains unpaid. Please pay immediately here: {{paymentLink}}. If you have already paid, please confirm by replying to this message. — {{ownerName}}`,
  },
  {
    step: 3, tone: Tone.FIRM, channel: Channel.BOTH,
    body: `{{clientName}}, invoice #{{invoiceRef}} for {{currency}}{{amount}} is now significantly overdue. This requires your immediate attention. Please pay here: {{paymentLink}}, or reply to discuss next steps. — {{ownerName}}`,
  },
  {
    step: 4, tone: Tone.FIRM, channel: Channel.BOTH,
    body: `{{clientName}}, this is a final firm reminder — invoice #{{invoiceRef}} for {{currency}}{{amount}} is well overdue. Please pay immediately via {{paymentLink}}. If payment is not received, we will be forced to consider further action. — {{ownerName}}`,
  },

  // ── FINAL ─────────────────────────────────────────────────────────────────
  {
    step: 1, tone: Tone.FINAL, channel: Channel.BOTH,
    body: `{{clientName}}, this is a final notice for invoice #{{invoiceRef}} — {{currency}}{{amount}} now overdue from {{businessName}}. Please pay via {{paymentLink}} or reply if you'd like to discuss. Thank you. — {{ownerName}}`,
  },
  {
    step: 2, tone: Tone.FINAL, channel: Channel.BOTH,
    body: `{{clientName}}, invoice #{{invoiceRef}} for {{currency}}{{amount}} remains unpaid. This is a final reminder before we take further steps. Pay here: {{paymentLink}}. If you're having difficulty, please reply to this message and we can work something out. — {{ownerName}}`,
  },
  {
    step: 3, tone: Tone.FINAL, channel: Channel.BOTH,
    body: `{{clientName}}, this is our final message regarding invoice #{{invoiceRef}} — {{currency}}{{amount}} now {{daysOverdue}} days overdue. Please pay via {{paymentLink}} or reply if you'd like to discuss. Thank you. — {{ownerName}}`,
  },
  {
    step: 4, tone: Tone.FINAL, channel: Channel.BOTH,
    body: `{{clientName}}, invoice #{{invoiceRef}} for {{currency}}{{amount}} remains unpaid after 21 days. This is our last attempt to resolve this directly. Pay here: {{paymentLink}}. Failure to respond may result in formal recovery action. — {{ownerName}}`,
  },
];

async function main() {
  console.log("Seeding default message templates…");

  // Delete existing global templates (businessId IS NULL) and recreate —
  // upsert can't match NULL in a unique index in Prisma 7
  await prisma.messageTemplate.deleteMany({ where: { businessId: null } });
  await prisma.messageTemplate.createMany({
    data: templates.map((t) => ({ ...t, businessId: null })),
  });

  console.log(`✓ ${templates.length} templates seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
