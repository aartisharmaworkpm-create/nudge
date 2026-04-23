-- Insert step 4 (Day 21) global default message templates
-- Uses INSERT WHERE NOT EXISTS to avoid duplicates on re-run

INSERT INTO "MessageTemplate" (id, "businessId", step, tone, channel, body, "createdAt", "updatedAt")
SELECT gen_random_uuid(), NULL, 4, 'FRIENDLY', 'BOTH',
  'Hi {{clientName}}, just one last follow-up on the invoice for {{currency}}{{amount}} from {{businessName}}. We''d love to resolve this amicably — please pay here: {{paymentLink}} or simply reply and let us know what''s happening. Thanks, {{ownerName}}',
  now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM "MessageTemplate" WHERE "businessId" IS NULL AND step = 4 AND tone = 'FRIENDLY' AND channel = 'BOTH'
);

INSERT INTO "MessageTemplate" (id, "businessId", step, tone, channel, body, "createdAt", "updatedAt")
SELECT gen_random_uuid(), NULL, 4, 'FIRM', 'BOTH',
  '{{clientName}}, this is a final firm reminder — invoice #{{invoiceRef}} for {{currency}}{{amount}} is well overdue. Please pay immediately via {{paymentLink}}. If payment is not received, we will be forced to consider further action. — {{ownerName}}',
  now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM "MessageTemplate" WHERE "businessId" IS NULL AND step = 4 AND tone = 'FIRM' AND channel = 'BOTH'
);

INSERT INTO "MessageTemplate" (id, "businessId", step, tone, channel, body, "createdAt", "updatedAt")
SELECT gen_random_uuid(), NULL, 4, 'FINAL', 'BOTH',
  '{{clientName}}, invoice #{{invoiceRef}} for {{currency}}{{amount}} remains unpaid after 21 days. This is our last attempt to resolve this directly. Pay here: {{paymentLink}}. Failure to respond may result in formal recovery action. — {{ownerName}}',
  now(), now()
WHERE NOT EXISTS (
  SELECT 1 FROM "MessageTemplate" WHERE "businessId" IS NULL AND step = 4 AND tone = 'FINAL' AND channel = 'BOTH'
);
