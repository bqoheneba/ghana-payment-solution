"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Field, Input } from "@/components/ui";
import { ThemeSwitch } from "@/components/theme/ThemeSwitch";

interface Prefs {
  phone: string;
  failedAlerts: boolean;
  queueAlerts: boolean;
}

const defaults: Prefs = {
  phone: "+233 24 000 0000",
  failedAlerts: true,
  queueAlerts: true,
};

function prefsKey(userId: string) {
  return `gdd.prefs.${userId}`;
}

function readPrefs(userId: string): Prefs {
  if (typeof window === "undefined") return defaults;
  const raw = window.localStorage.getItem(prefsKey(userId));
  if (!raw) return defaults;
  try {
    return { ...defaults, ...(JSON.parse(raw) as Partial<Prefs>) };
  } catch {
    return defaults;
  }
}

export function SettingsPage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [phone, setPhone] = useState(defaults.phone);
  const [failedAlerts, setFailedAlerts] = useState(defaults.failedAlerts);
  const [queueAlerts, setQueueAlerts] = useState(defaults.queueAlerts);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const prefs = readPrefs(user.id);
    setPhone(prefs.phone);
    setFailedAlerts(prefs.failedAlerts);
    setQueueAlerts(prefs.queueAlerts);
  }, [user]);

  const onSave = () => {
    if (user) {
      window.localStorage.setItem(prefsKey(user.id), JSON.stringify({ phone, failedAlerts, queueAlerts }));
    }
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 720 }}>
      <section className="card card-pad">
        <div className="card-title" style={{ marginBottom: 18 }}>Profile</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-grid">
            <Field label="Full name">
              <Input value={user?.name ?? ""} readOnly />
            </Field>
            <Field label="Work email">
              <Input type="email" value={user?.email ?? ""} readOnly />
            </Field>
          </div>
          <Field label="Phone">
            <Input value={phone} onChange={e => setPhone(e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="card card-pad">
        <div className="card-title" style={{ marginBottom: 18 }}>Appearance</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-mid)", marginTop: 4 }}>
              {theme === "dark" ? "Use a lighter canvas for the dashboard" : "Use a darker canvas for the dashboard"}
            </div>
          </div>
          <ThemeSwitch />
        </div>
      </section>

      <section className="card card-pad">
        <div className="card-title" style={{ marginBottom: 18 }}>Notifications</div>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text)", marginBottom: 12, cursor: "pointer" }}>
          <input type="checkbox" checked={queueAlerts} onChange={e => setQueueAlerts(e.target.checked)} />
          Email when a mandate is queued for validation
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text)", cursor: "pointer" }}>
          <input type="checkbox" checked={failedAlerts} onChange={e => setFailedAlerts(e.target.checked)} />
          Email when a bank honour instruction fails
        </label>
      </section>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button type="button" className="btn-primary" onClick={onSave}>
          Save changes
        </button>
        {saved && <span style={{ fontSize: 13, color: "var(--green)", fontWeight: 600 }}>Settings saved</span>}
      </div>
    </div>
  );
}
