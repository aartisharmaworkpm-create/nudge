import type {
  Business,
  Client,
  Invoice,
  Message,
  Reply,
  Sequence,
  InvoiceStatus,
  SequenceStatus,
  MessageStatus,
  Channel,
  Tone,
  ReplyAction,
} from "@/generated/prisma/client";

export type {
  Business,
  Client,
  Invoice,
  Message,
  Reply,
  Sequence,
  InvoiceStatus,
  SequenceStatus,
  MessageStatus,
  Channel,
  Tone,
  ReplyAction,
};

export type InvoiceWithRelations = Invoice & {
  client: Client;
  sequence:
    | (Sequence & {
        messages: (Message & { reply: Reply | null })[];
      })
    | null;
};

export type DashboardStats = {
  outstanding: number;
  overdue: number;
  resolvedThisMonth: number;
  totalRecovered: number;
  currency: string;
};

export type SequenceStep = {
  step: number;        // 1=Day1, 2=Day7, 3=Day14
  dayOffset: number;   // days after invoice due date
  label: string;       // "Day 1", "Day 7", "Day 14"
  tone: Tone;
  channel: Channel;
  body: string;
  scheduledAt: Date;
};

export type CreateInvoiceInput = {
  clientName: string;
  clientEmail?: string;
  clientWhatsapp?: string;
  amount: number;
  currency: string;
  dueDate: string;
  paymentLink: string;
  notes?: string;
  tone: Tone;
  entryStep: number;
  channel: Channel;
};
