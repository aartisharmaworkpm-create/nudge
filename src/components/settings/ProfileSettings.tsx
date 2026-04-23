"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

export default function ProfileSettings({
  user,
}: {
  user: { name: string | null; email: string; hasPassword: boolean };
}) {
  const { showToast, toastNode } = useToast();

  const [name, setName] = useState(user.name ?? "");
  const [email, setEmail] = useState(user.email);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function handleProfileSave() {
    setProfileError("");
    setProfileLoading(true);
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();
    setProfileLoading(false);
    if (!res.ok) { setProfileError(data.error); return; }
    showToast("Profile updated.");
  }

  async function handlePasswordSave() {
    setPwError("");
    if (newPassword !== confirmPassword) { setPwError("New passwords do not match."); return; }
    setPwLoading(true);
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    setPwLoading(false);
    if (!res.ok) { setPwError(data.error); return; }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Password changed successfully.");
  }

  return (
    <div className="space-y-4">
      {toastNode}

      {/* Profile info */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
              placeholder="you@example.com"
            />
          </div>
          {profileError && <p className="text-xs text-red-600">{profileError}</p>}
          <button
            onClick={handleProfileSave}
            disabled={profileLoading}
            className="bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-900 disabled:opacity-50 transition-colors"
          >
            {profileLoading ? "Saving…" : "Save profile"}
          </button>
        </div>
      </div>

      {/* Password */}
      {user.hasPassword && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Change password</h2>
          <p className="text-sm text-gray-500 mb-4">Choose a strong password of at least 8 characters.</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Current password</label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">New password</label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-teal-600"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowNew(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew
                    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Confirm new password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="••••••••"
              />
            </div>
            {pwError && <p className="text-xs text-red-600">{pwError}</p>}
            <button
              onClick={handlePasswordSave}
              disabled={pwLoading || !currentPassword || !newPassword || !confirmPassword}
              className="bg-teal-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-900 disabled:opacity-50 transition-colors"
            >
              {pwLoading ? "Changing…" : "Change password"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
