"use client";

import { useState } from "react";
import type { TemplateData } from "./SettingsClient";

const TONES = ["FRIENDLY", "FIRM", "FINAL"] as const;
const STEPS: Record<number, { label: string; desc: string }> = {
  1: { label: "Day 1", desc: "First reminder — invoice just overdue" },
  2: { label: "Day 7", desc: "Follow-up — second reminder" },
  3: { label: "Day 14", desc: "Final notice — last attempt" },
};

const TONE_CONFIG: Record<string, { label: string; color: string; badge: string }> = {
  FRIENDLY: { label: "Friendly", color: "border-green-300 bg-green-50",  badge: "bg-green-100 text-green-700" },
  FIRM:     { label: "Firm",     color: "border-amber-300 bg-amber-50",  badge: "bg-amber-100 text-amber-700" },
  FINAL:    { label: "Final",    color: "border-red-300 bg-red-50",      badge: "bg-red-100 text-red-700" },
};

const TEMPLATE_VARS = [
  { var: "{{clientName}}",   desc: "Client's name" },
  { var: "{{businessName}}", desc: "Your business name" },
  { var: "{{amount}}",       desc: "Invoice amount with currency symbol" },
  { var: "{{dueDate}}",      desc: "Invoice due date" },
  { var: "{{paymentLink}}", desc: "Payment link URL" },
  { var: "{{ownerName}}",   desc: "Your name / business name (signature)" },
];

export default function TemplateEditor({ templates }: { templates: TemplateData[] }) {
  const [activeTone, setActiveTone] = useState<string>("FRIENDLY");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedBodies, setEditedBodies] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [showVars, setShowVars] = useState(false);

  function getTemplate(step: number, tone: string) {
    return templates.find((t) => t.step === step && t.tone === tone);
  }

  function getBody(step: number, tone: string): string {
    const key = `${step}:${tone}`;
    if (editedBodies[key] !== undefined) return editedBodies[key];
    return getTemplate(step, tone)?.body ?? "";
  }

  async function handleSave(step: number, tone: string) {
    const key = `${step}:${tone}`;
    const body = editedBodies[key];
    if (!body?.trim()) return;

    setSaving(key);
    const res = await fetch("/api/templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step, tone, channel: "BOTH", body: body.trim() }),
    });

    setSaving(null);
    if (res.ok) {
      setEditingKey(null);
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    }
  }

  async function handleReset(step: number, tone: string) {
    const key = `${step}:${tone}`;
    await fetch("/api/templates", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step, tone, channel: "BOTH" }),
    });
    // Clear local edit
    setEditedBodies((p) => { const n = { ...p }; delete n[key]; return n; });
    setEditingKey(null);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Message templates</h2>
            <p className="text-sm text-gray-500 mt-1">
              9 templates — 3 tones × 3 steps. Edits here become your defaults for all new invoices.
              You can still edit individual messages in the sequence preview screen.
            </p>
          </div>
          <button
            onClick={() => setShowVars((v) => !v)}
            className="text-xs text-blue-600 hover:underline flex-shrink-0 ml-4"
          >
            {showVars ? "Hide variables" : "Variables →"}
          </button>
        </div>

        {showVars && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-600 mb-2">Available variables</p>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATE_VARS.map(({ var: v, desc }) => (
                <div key={v} className="flex items-start gap-2">
                  <code className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5 text-blue-700 font-mono flex-shrink-0">
                    {v}
                  </code>
                  <span className="text-xs text-gray-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tone tabs */}
      <div className="flex gap-2">
        {TONES.map((tone) => {
          const cfg = TONE_CONFIG[tone];
          return (
            <button
              key={tone}
              onClick={() => setActiveTone(tone)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border-2 transition-all ${
                activeTone === tone ? cfg.color + " border-current" : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              {cfg.label}
            </button>
          );
        })}
      </div>

      {/* Step cards */}
      <div className="space-y-3">
        {[1, 2, 3].map((step) => {
          const key = `${step}:${activeTone}`;
          const template = getTemplate(step, activeTone);
          const body = getBody(step, activeTone);
          const isEditing = editingKey === key;
          const isSaving = saving === key;
          const isSaved = saved === key;
          const isCustomised = template?.isCustomised ?? false;
          const stepInfo = STEPS[step];
          const toneCfg = TONE_CONFIG[activeTone];

          return (
            <div key={key} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700">{stepInfo.label}</span>
                  <span className="text-xs text-gray-400">{stepInfo.desc}</span>
                  {isCustomised && (
                    <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-1.5 py-0.5 rounded-full">
                      Customised
                    </span>
                  )}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${toneCfg.badge}`}>
                  {toneCfg.label}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      value={body}
                      onChange={(e) => setEditedBodies((p) => ({ ...p, [key]: e.target.value }))}
                      rows={7}
                      className="w-full border border-blue-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono leading-relaxed"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSave(step, activeTone)}
                        disabled={isSaving}
                        className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isSaving ? "Saving…" : "Save template"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingKey(null);
                          setEditedBodies((p) => { const n = { ...p }; delete n[key]; return n; });
                        }}
                        className="text-sm text-gray-400 hover:text-gray-600 px-2 py-1.5"
                      >
                        Cancel
                      </button>
                      {isCustomised && (
                        <button
                          onClick={() => handleReset(step, activeTone)}
                          className="ml-auto text-xs text-gray-400 hover:text-red-500"
                        >
                          Reset to default
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl px-4 py-3">
                      {body}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <button
                        onClick={() => { setEditingKey(key); setEditedBodies((p) => ({ ...p, [key]: body })); }}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      {isSaved && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Saved
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final notice warning */}
      {activeTone === "FINAL" && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-sm text-amber-800">
            <strong>Required:</strong> Every Final notice template must include the phrase{" "}
            <em>&ldquo;reply if you&apos;d like to discuss&rdquo;</em> or equivalent. This preserves
            the client relationship and converts confrontation into negotiation.
          </p>
        </div>
      )}
    </div>
  );
}
